package sa.rawayie.azan;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.os.Handler;
import android.os.Looper;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.content.res.Configuration;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.os.SystemClock;
import android.view.Display;
import android.view.InputDevice;
import android.view.MotionEvent;
import android.widget.FrameLayout;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * شاشة روائع الأذان - تطبيق أندرويد.
 * يعرض ملفات التطبيق المضمّنة (assets/www) من عنوان https داخلي ثابت، فتعمل بدون إنترنت
 * وتبقى الإعدادات محفوظة، مع ملء الشاشة ومنع السكون وتشغيل صوت الأذان بدون لمس.
 */
public class MainActivity extends Activity {
    static final String HOST = "app.rawayie.local";
    static final String START = "https://" + HOST + "/index.html";
    static final int REQ_FILE = 11;
    static final int REQ_OVERLAY = 12;

    private WebView web;
    static final int REQ_GEO = 14, REQ_SAVE = 13;
    private android.webkit.GeolocationPermissions.Callback geoCb; private String geoOrigin;
    private String saveText, saveMime;
    private volatile boolean imeBlock = true;

    private FrameLayout splashView;
    private void hideSplash() {
        final View v = splashView; if (v == null) return; splashView = null;
        v.animate().alpha(0f).setDuration(250).withEndAction(() -> {
            try { ((android.view.ViewGroup) v.getParent()).removeView(v); } catch (Exception ignored) { }
            try { getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(Color.BLACK)); } catch (Exception ignored) { }
        }).start();
    }

    /* عميل SNTP بسيط: يرجع الوقت بالملّي ثانية أو 0 */
    static long sntp(String host) {
        java.net.DatagramSocket sock = null;
        try {
            sock = new java.net.DatagramSocket(); sock.setSoTimeout(3000);
            java.net.InetAddress addr = java.net.InetAddress.getByName(host);
            byte[] b = new byte[48]; b[0] = 0x1B; // LI=0, VN=3, Mode=3 (client)
            long t0 = SystemClock.elapsedRealtime();
            sock.send(new java.net.DatagramPacket(b, b.length, addr, 123));
            java.net.DatagramPacket resp = new java.net.DatagramPacket(b, b.length); sock.receive(resp);
            long rtt = SystemClock.elapsedRealtime() - t0;
            long sec = 0, frac = 0; for (int i = 40; i < 44; i++) sec = (sec << 8) | (b[i] & 0xff); for (int i = 44; i < 48; i++) frac = (frac << 8) | (b[i] & 0xff);
            if (sec == 0) return 0;
            long ms = (sec - 2208988800L) * 1000L + (frac * 1000L >>> 32);
            return ms + rtt / 2;
        } catch (Exception e) { return 0; }
        finally { if (sock != null) sock.close(); }
    }

    private boolean dimmed = false;
    boolean screenOff(long until) {
        long now = System.currentTimeMillis();
        if (until <= now + 15000 || until > now + 6 * 3600000L) return false; // مدة معقولة فقط
        getSharedPreferences("rawayie", MODE_PRIVATE).edit().putLong("offUntil", until).apply();
        // منبّه بالنظام يعيد الشاشة حتى لو نام المعالج، ومؤقت داخلي احتياطي
        try {
            android.app.AlarmManager am = (android.app.AlarmManager) getSystemService(ALARM_SERVICE);
            int fl = android.app.PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? android.app.PendingIntent.FLAG_IMMUTABLE : 0);
            android.app.PendingIntent pi = android.app.PendingIntent.getBroadcast(this, 7, new Intent(this, WakeReceiver.class), fl);
            boolean exact = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
            if (exact && Build.VERSION.SDK_INT >= 23) am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, until, pi);
            else if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, until, pi);
            else am.setExact(android.app.AlarmManager.RTC_WAKEUP, until, pi);
        } catch (Exception ignored) { }
        ui.removeCallbacks(wakeTask); ui.postDelayed(wakeTask, until - now);
        runOnUiThread(() -> {
            boolean locked = false;
            try {
                android.app.admin.DevicePolicyManager dpm = (android.app.admin.DevicePolicyManager) getSystemService(DEVICE_POLICY_SERVICE);
                android.content.ComponentName cn = new android.content.ComponentName(this, AdminReceiver.class);
                if (dpm != null && dpm.isAdminActive(cn)) { dpm.lockNow(); locked = true; }
            } catch (Exception ignored) { }
            if (!locked) { // بدون الصلاحية: أقل إضاءة ممكنة (الجوال والجهاز اللوحي) مع الشاشة السوداء
                WindowManager.LayoutParams lp = getWindow().getAttributes(); lp.screenBrightness = 0.0f; getWindow().setAttributes(lp); dimmed = true;
            }
        });
        return true;
    }
    private final Runnable wakeTask = () -> screenOnNow();
    void screenOnNow() {
        ui.removeCallbacks(wakeTask);
        if (dimmed) { WindowManager.LayoutParams lp = getWindow().getAttributes(); lp.screenBrightness = WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE; getWindow().setAttributes(lp); dimmed = false; }
        long u = getSharedPreferences("rawayie", MODE_PRIVATE).getLong("offUntil", 0);
        if (u > 0) WakeReceiver.wake(this);
        if (Build.VERSION.SDK_INT >= 27) { try { setTurnScreenOn(true); setShowWhenLocked(true); } catch (Exception ignored) { } }
    }

    private boolean imeVisible() {
        try {
            View d = getWindow().getDecorView();
            if (Build.VERSION.SDK_INT >= 30) { android.view.WindowInsets wi = d.getRootWindowInsets(); if (wi != null) return wi.isVisible(android.view.WindowInsets.Type.ime()); }
            android.graphics.Rect r = new android.graphics.Rect(); d.getWindowVisibleDisplayFrame(r);
            int h = d.getRootView().getHeight(); return h > 0 && h - r.bottom > h * 0.15;
        } catch (Exception e) { return false; }
    }

    private void hideIme() {
        try {
            android.view.inputmethod.InputMethodManager im = (android.view.inputmethod.InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
            if (im != null && web != null) im.hideSoftInputFromWindow(web.getWindowToken(), 0);
        } catch (Exception ignored) { }
    }
    private ValueCallback<Uri[]> fileCb;
    private long lastBack = 0;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_FULLSCREEN
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
        // الجوال: شريط الحالة ظاهر وشفاف فوق الخلفية، والخلفية تمتد خلفه وخلف الكاميرا
        if (Build.VERSION.SDK_INT >= 21) {
            w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            w.setStatusBarColor(Color.TRANSPARENT);
        }
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp0 = w.getAttributes();
            lp0.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            w.setAttributes(lp0);
        }
        statusBar = isPhone() && getSharedPreferences("rawayie", MODE_PRIVATE).getBoolean("statusBar", true);
        if (statusBar) w.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        imeBlock = getSharedPreferences("rawayie", MODE_PRIVATE).getBoolean("imeBlock", true);
        if (imeBlock) w.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);

        // بعض الأجهزة يكون فيها «Android System WebView» معطلاً أو قيد التحديث: بدل أن يُغلق التطبيق تظهر رسالة وإعادة محاولة
        try {
            web = new WebView(this) {
                // لوحة مفاتيح التطبيق مفعّلة: لا يُسمح للوحة النظام بالظهور فوقها (التلفاز المدوّر خاصة)
                @Override public boolean onCheckIsTextEditor() { return !imeBlock && super.onCheckIsTextEditor(); }
                @Override public android.view.inputmethod.InputConnection onCreateInputConnection(android.view.inputmethod.EditorInfo o) {
                    if (imeBlock) { hideIme(); return null; }
                    return super.onCreateInputConnection(o);
                }
            };
        } catch (Throwable t) {
            web = null;
            showWebViewError();
            return;
        }
        web.setBackgroundColor(Color.BLACK);
        web.setKeepScreenOn(true);
        FrameLayout root = new FrameLayout(this);
        root.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        cursor = new CursorView(this);
        cursor.setVisibility(View.GONE);
        int cs = Math.round(26 * getResources().getDisplayMetrics().density);
        root.addView(cursor, new FrameLayout.LayoutParams(cs, cs));
        // شاشة البداية (الشعار ومؤشر تحميل) فوق الصفحة حتى ترسم الصفحة أول إطار: لا شاشة سوداء عند التشغيل
        splashView = new FrameLayout(this);
        splashView.setBackgroundResource(R.drawable.splash);
        splashView.setClickable(true);
        android.widget.ProgressBar pb = new android.widget.ProgressBar(this);
        pb.setIndeterminate(true);
        int ps = Math.round(34 * getResources().getDisplayMetrics().density);
        FrameLayout.LayoutParams plp = new FrameLayout.LayoutParams(ps, ps, android.view.Gravity.CENTER_HORIZONTAL | android.view.Gravity.BOTTOM);
        plp.bottomMargin = Math.round(56 * getResources().getDisplayMetrics().density);
        splashView.addView(pb, plp);
        root.addView(splashView, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        ui.postDelayed(this::hideSplash, 12000); // احتياط: لا تبقى شاشة البداية أبداً
        setContentView(root);
        // احتياط: إذا ظهرت لوحة مفاتيح النظام رغم تفعيل لوحة التطبيق (الفأرة أو نسخ WebView القديمة) تُغلق فوراً
        root.getViewTreeObserver().addOnGlobalLayoutListener(() -> { if (imeBlock && imeVisible()) hideIme(); });
        if (Build.VERSION.SDK_INT >= 26) web.setOnCapturedPointerListener((v, ev) -> onVMouse(ev));

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setGeolocationEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // صوت الأذان والإقامة بدون لمس الشاشة
        s.setTextZoom(100);
        // الوضع الداكن في الجهاز لا يغيّر ألوان التطبيق (كان يجعل بعض النصوص غير ظاهرة)؛ التطبيق له وضعه الداكن والفاتح
        try {
            if (Build.VERSION.SDK_INT >= 33) s.setAlgorithmicDarkeningAllowed(false);
            else if (Build.VERSION.SDK_INT >= 29) s.setForceDark(WebSettings.FORCE_DARK_OFF);
        } catch (Throwable ignored) { }                             // حجم خط النظام لا يغيّر تصميم الشاشة
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setAllowFileAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " RawayieAndroid/" + BuildConfig.VERSION_NAME);

        web.addJavascriptInterface(new Bridge(), "RawayieAndroid");
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) { ui.postDelayed(MainActivity.this::hideSplash, 2500); }
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                WebResourceResponse r = serve(req.getUrl());
                if (r != null) return r;
                MediaCache mc = media; // صور وأصوات من الموقع: تُحفظ على الجهاز وتُعرض منه بدون إنترنت
                return mc != null ? mc.serve(req.getUrl(), req.getMethod()) : null;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                return false; // كل الصفحات تفتح داخل التطبيق
            }

            @Override
            public boolean onRenderProcessGone(WebView view, android.webkit.RenderProcessGoneDetail d) {
                recreate(); // إذا توقف محرك العرض لأي سبب تُعاد الشاشة تلقائياً
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            // الموقع الحالي (GPS أو الشبكة) لمنشئ المواقيت: يُطلب الإذن مرة واحدة
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, android.webkit.GeolocationPermissions.Callback cb) {
                if (Build.VERSION.SDK_INT < 23 || checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED) { cb.invoke(origin, true, false); return; }
                geoCb = cb; geoOrigin = origin;
                requestPermissions(new String[]{android.Manifest.permission.ACCESS_COARSE_LOCATION, android.Manifest.permission.ACCESS_FINE_LOCATION}, REQ_GEO);
            }
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                String type = "*/*";
                String[] acc = p.getAcceptTypes();
                if (acc != null && acc.length > 0 && acc[0] != null && acc[0].length() > 0) type = acc[0];
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType(type);
                if (p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(Intent.createChooser(i, "اختيار ملف"), REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    fileCb = null;
                    Toast.makeText(MainActivity.this, "لا يوجد تطبيق لاختيار الملفات على هذا الجهاز", Toast.LENGTH_LONG).show();
                    return false;
                }
                return true;
            }
        });

        initOta();
        applyDisplayMode();
        if (saved != null) web.restoreState(saved);
        else web.loadUrl(START);
        hideBars();
        askAutostartOnce();
    }

    private void showWebViewError() {
        android.widget.TextView tv = new android.widget.TextView(this);
        tv.setText("تعذّر تشغيل محرك العرض (Android System WebView) على هذا الجهاز.\n\nحدّث أو فعّل «Android System WebView» من متجر التطبيقات أو إعدادات الجهاز ← التطبيقات، ثم أعد فتح التطبيق.\n\nستتم إعادة المحاولة تلقائياً خلال 30 ثانية.");
        tv.setTextColor(Color.WHITE); tv.setTextSize(22); tv.setGravity(android.view.Gravity.CENTER);
        tv.setBackgroundColor(Color.BLACK); int p = Math.round(32 * getResources().getDisplayMetrics().density); tv.setPadding(p, p, p, p);
        setContentView(tv);
        ui.postDelayed(this::recreate, 30000);
    }

    /* ===== تحديث ملفات الشاشة من الموقع (Ota.java) =====
       بعد 20 ثانية من التشغيل، ثم كل 30 دقيقة، وعند عودة الشاشة للواجهة (مرة كل 5 دقائق على الأكثر):
       إذا كان في الموقع إصدار أحدث من ملفات الشاشة يُنزَّل المختلف فقط،
       ثم تُبلَّغ الشاشة فتعيد التحميل خارج أوقات الأذان والإقامة والصلاة (نفس آلية checkVersion في app.js) */
    private static volatile Ota ota;
    private static final java.util.concurrent.atomic.AtomicBoolean otaLoop = new java.util.concurrent.atomic.AtomicBoolean(false);
    private static volatile MainActivity current;
    private static final Object otaLock = new Object();
    private static volatile boolean otaKicked = false;
    private static volatile long otaLast = 0;
    static final long OTA_EVERY = 30 * 60000L, OTA_MIN_GAP = 5 * 60000L;

    /** طلب تحقق مبكر (عند عودة الشاشة للواجهة) */
    static void otaKick() { synchronized (otaLock) { otaKicked = true; otaLock.notifyAll(); } }
    private static volatile boolean otaForce = false;
    /** تحقق عاجل (عودة الإنترنت أو طلب الشاشة): خلال ثوانٍ، بدون انتظار مهلة الخمس دقائق */
    static void otaNow() { synchronized (otaLock) { otaKicked = true; otaForce = true; otaLock.notifyAll(); } }
    static volatile MediaCache media;
    private static volatile boolean netCb = false;
    /* عودة الإنترنت (المساجد بلا إنترنت: يُوصل دقائق عند الزيارة): تحقق فوري من التحديث، وتُبلَّغ الشاشة لتزامن فوراً */
    private void watchNetwork() {
        if (netCb || Build.VERSION.SDK_INT < 21) return;
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getApplicationContext().getSystemService(CONNECTIVITY_SERVICE);
            if (cm == null) return;
            android.net.NetworkRequest rq = new android.net.NetworkRequest.Builder().addCapability(android.net.NetworkCapabilities.NET_CAPABILITY_INTERNET).build();
            cm.registerNetworkCallback(rq, new android.net.ConnectivityManager.NetworkCallback() {
                @Override public void onAvailable(android.net.Network n) {
                    final MainActivity a = current;
                    if (a != null) a.ui.postDelayed(() -> { otaNow(); try { if (a.web != null) a.web.evaluateJavascript("try{window.REMOTE&&REMOTE.netUp&&REMOTE.netUp()}catch(e){}", null); } catch (Throwable ignored) { } }, 4000);
                }
            });
            netCb = true;
        } catch (Throwable ignored) { }
    }

    private void initOta() {
        current = this;
        if (media == null) { try { media = new MediaCache(getApplicationContext().getFilesDir()); } catch (Throwable ignored) { } }
        watchNetwork();
        try {
            if (ota == null) {
                String bv = Ota.verFrom(getAssets().open("www/version.js"));
                final android.content.res.AssetManager am = getApplicationContext().getAssets();
                ota = new Ota(getApplicationContext().getFilesDir(), p -> am.open(p), bv, BuildConfig.VERSION_CODE);
                Ota.userAgent = "Mozilla/5.0 (Linux; Android " + Build.VERSION.RELEASE + ") RawayieAndroid/" + BuildConfig.VERSION_NAME;
            }
        } catch (Throwable t) { ota = null; return; }
        if (!otaLoop.compareAndSet(false, true)) return;
        final android.content.Context app = getApplicationContext();
        Thread th = new Thread(() -> {
            String site = null;
            try { site = Ota.siteFrom(app.getAssets().open("www/index.html")); } catch (Throwable ignored) { }
            if (site == null) site = "https://rawayie.sa";
            try { Thread.sleep(20000); } catch (InterruptedException e) { return; }
            while (true) {
                otaLast = System.currentTimeMillis();
                String v = null;
                try { v = ota.check(site); } catch (Throwable ignored) { }
                if (v != null) notifyWeb();
                long due = otaLast + OTA_EVERY;
                try {
                    synchronized (otaLock) {
                        while (true) {
                            long now = System.currentTimeMillis();
                            if (now >= due) break;
                            if (otaKicked) { otaKicked = false;
                                if (otaForce) { otaForce = false; due = Math.min(due, otaLast + 15000L); continue; } // عاجل: بعد 15 ثانية على الأقل من آخر محاولة
                                if (now - otaLast >= OTA_MIN_GAP) break; }
                            otaLock.wait(Math.min(due - now, 60000L));
                        }
                    }
                } catch (InterruptedException e) { return; }
            }
        }, "rawayie-ota");
        th.setDaemon(true); th.setPriority(Thread.MIN_PRIORITY);
        th.start();
    }

    /** الشاشة تقرأ version.js الجديد وتعيد التحميل في وقت مناسب */
    private static void notifyWeb() {
        final MainActivity a = current;
        if (a == null) return;
        a.ui.post(() -> { try { if (a.web != null) a.web.evaluateJavascript("try{window.APP&&APP.checkVersion&&APP.checkVersion()}catch(e){}", null); } catch (Throwable ignored) { } });
    }

    /* ===== تقديم ملفات التطبيق من assets/www ===== */
    private static final Map<String, String> MIME = new HashMap<>();
    static {
        MIME.put("html", "text/html"); MIME.put("js", "application/javascript"); MIME.put("css", "text/css");
        MIME.put("json", "application/json"); MIME.put("webmanifest", "application/manifest+json"); MIME.put("txt", "text/plain");
        MIME.put("svg", "image/svg+xml"); MIME.put("png", "image/png"); MIME.put("jpg", "image/jpeg"); MIME.put("jpeg", "image/jpeg");
        MIME.put("webp", "image/webp"); MIME.put("gif", "image/gif"); MIME.put("ico", "image/x-icon");
        MIME.put("mp3", "audio/mpeg"); MIME.put("ogg", "audio/ogg"); MIME.put("wav", "audio/wav"); MIME.put("m4a", "audio/mp4");
        MIME.put("mp4", "video/mp4"); MIME.put("webm", "video/webm");
        MIME.put("ttf", "font/ttf"); MIME.put("otf", "font/otf"); MIME.put("woff", "font/woff"); MIME.put("woff2", "font/woff2");
    }

    private WebResourceResponse serve(Uri u) {
        if (u == null || !HOST.equals(u.getHost())) return null; // روابط الإنترنت (لوحة المدير والطقس) تمر عادي
        String path = u.getPath();
        if (path == null || path.length() <= 1) path = "/index.html";
        path = path.substring(1);
        if (path.endsWith("/")) path += "index.html";
        if (path.contains("..")) return notFound();
        String ext = path.lastIndexOf('.') >= 0 ? path.substring(path.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT) : "";
        String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
        boolean text = mime.startsWith("text/") || mime.endsWith("javascript") || mime.endsWith("json") || mime.endsWith("+xml");
        try {
            java.io.File of = ota != null ? ota.find(path) : null; // تحديث منزّل من الموقع أولاً، ثم الملفات المضمّنة
            InputStream in = of != null ? new java.io.FileInputStream(of) : getAssets().open("www/" + path);
            Map<String, String> h = new HashMap<>();
            h.put("Access-Control-Allow-Origin", "*");
            h.put("Cache-Control", "no-cache");
            return new WebResourceResponse(mime, text ? "utf-8" : null, 200, "OK", h, in);
        } catch (IOException e) {
            return notFound();
        }
    }

    private WebResourceResponse notFound() {
        Map<String, String> h = new HashMap<>();
        h.put("Access-Control-Allow-Origin", "*");
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", h, new ByteArrayInputStream(new byte[0]));
    }

    /* ===== ملء الشاشة الكامل بدون أشرطة النظام ===== */
    @SuppressWarnings("deprecation")
    private void hideBars() {
        View d = getWindow().getDecorView();
        int f = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
        if (!statusBar) f |= View.SYSTEM_UI_FLAG_FULLSCREEN;
        d.setSystemUiVisibility(f);
    }

    private boolean statusBar = false;

    // جوال (وليس تلفازاً أو جهازاً لوحياً كبيراً)
    private boolean isPhone() {
        try {
            android.app.UiModeManager um = (android.app.UiModeManager) getSystemService(UI_MODE_SERVICE);
            if (um != null && um.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION) return false;
            return getResources().getConfiguration().smallestScreenWidthDp < 600;
        } catch (Exception e) { return false; }
    }

    @SuppressWarnings("deprecation")
    private void setStatusBar(boolean on) {
        boolean v = on && isPhone();
        getSharedPreferences("rawayie", MODE_PRIVATE).edit().putBoolean("statusBar", on).apply();
        if (v == statusBar) return;
        statusBar = v;
        if (v) getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN); else getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        hideBars(); notifyRotation();
    }

    @Override
    public void onWindowFocusChanged(boolean has) {
        super.onWindowFocusChanged(has);
        if (has) hideBars();
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] res) {
        super.onRequestPermissionsResult(req, perms, res);
        if (req == REQ_GEO && geoCb != null) { boolean ok = res.length > 0 && res[0] == android.content.pm.PackageManager.PERMISSION_GRANTED; geoCb.invoke(geoOrigin, ok, false); geoCb = null; }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) { web.onResume(); web.resumeTimers(); }
        otaKick(); // الشاشة عادت للواجهة: تحقق من تحديث ملفات الشاشة
        hideBars();
        // رجوع بعد إطفاء الشاشة (بالمنبّه أو بالريموت): الإضاءة الطبيعية
        if (dimmed && getSharedPreferences("rawayie", MODE_PRIVATE).getLong("offUntil", 0) < System.currentTimeMillis()) screenOnNow();
    }

    // لا نوقف المؤقتات عند الخروج المؤقت حتى تبقى المواقيت والأذان تعمل

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    @Override
    protected void onDestroy() {
        ui.removeCallbacksAndMessages(null);
        if (current == this) current = null;
        if (web != null) { try { ((android.view.ViewGroup) web.getParent()).removeView(web); } catch (Exception ignored) { } web.destroy(); web = null; }
        super.onDestroy();
    }

    /* ===== زر الرجوع: يغلق الإعدادات، والخروج يحتاج ضغطتين حتى لا تُغلق الشاشة بالخطأ ===== */
    @Override
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        web.evaluateJavascript("(function(){if(window.SETTINGS&&SETTINGS.back&&SETTINGS.back())return 1;var s=document.getElementById('set');if(s&&!s.hidden&&window.SETTINGS){SETTINGS.close();return 1}return 0})()",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String v) {
                        if ("1".equals(v)) return;
                        long now = System.currentTimeMillis();
                        if (now - lastBack < 2500) { lastBack = 0; askExit(); return; }
                        lastBack = now;
                        Toast.makeText(MainActivity.this, "اضغط رجوع مرة أخرى للخروج من الشاشة", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    /* الخروج: الشاشة المرتبطة بالموقع لا تُغلق إلا بكلمة سر المدير (RWS_EXIT في settings.js يطلبها ثم يستدعي exit).
       ملفات شاشة قديمة بدون RWS_EXIT: يخرج كما كان */
    private void askExit() {
        if (web == null) { finish(); return; }
        web.evaluateJavascript("(function(){try{return window.RWS_EXIT?RWS_EXIT():'go'}catch(e){return 'go'}})()", v -> { if (v == null || "\"go\"".equals(v) || "null".equals(v)) finish(); });
    }

    // زر القائمة في الريموت يفتح الإعدادات
    @Override
    public boolean onKeyDown(int code, KeyEvent e) {
        if (code == KeyEvent.KEYCODE_MENU || code == KeyEvent.KEYCODE_SETTINGS) {
            if (web != null) web.evaluateJavascript("window.SETTINGS&&SETTINGS.open()", null);
            return true;
        }
        return super.onKeyDown(code, e);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == REQ_SAVE) { // حفظ ملف (المواقيت السنوية أو نسخة الإعدادات) في المكان الذي اختاره المستخدم
            boolean ok = false;
            if (res == RESULT_OK && data != null && data.getData() != null && saveText != null) {
                try (java.io.OutputStream os = getContentResolver().openOutputStream(data.getData())) { if (os != null) { os.write(saveText.getBytes("UTF-8")); ok = true; } } catch (Exception ignored) { }
            }
            saveText = null;
            Toast.makeText(this, ok ? "تم حفظ الملف" : "لم يُحفظ الملف", Toast.LENGTH_SHORT).show();
            return;
        }
        if (req == REQ_FILE && fileCb != null) {
            Uri[] r = null;
            if (res == RESULT_OK && data != null) {
                if (data.getClipData() != null) {
                    int n = data.getClipData().getItemCount();
                    r = new Uri[n];
                    for (int i = 0; i < n; i++) r[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    r = new Uri[]{data.getData()};
                }
            }
            fileCb.onReceiveValue(r);
            fileCb = null;
        }
    }

    /* ===== دقة مخرج HDMI =====
       يطلب من الجهاز أعلى دقة يدعمها مخرج الشاشة (مثل 4K) بنفس معدل التحديث الحالي.
       ملاحظة: كثير من أجهزة التلفاز ترسم واجهة التطبيقات بدقة 1080p ثم تكبّرها إلى 4K، وهذا من نظام الجهاز */
    private boolean prefer4k() { return getSharedPreferences("rawayie", MODE_PRIVATE).getBoolean("prefer4k", true); }

    private void applyDisplayMode() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;
        try {
            Display d = getWindowManager().getDefaultDisplay();
            Display.Mode cur = d.getMode(), best = cur;
            if (prefer4k()) {
                for (Display.Mode m : d.getSupportedModes()) {
                    long px = (long) m.getPhysicalWidth() * m.getPhysicalHeight(), bp = (long) best.getPhysicalWidth() * best.getPhysicalHeight();
                    boolean sameRate = Math.abs(m.getRefreshRate() - cur.getRefreshRate()) < 1.5f;
                    if (sameRate && px > bp) best = m;
                }
            }
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            int want = prefer4k() ? best.getModeId() : 0;
            if (lp.preferredDisplayModeId != want) { lp.preferredDisplayModeId = want; getWindow().setAttributes(lp); }
        } catch (Exception ignored) { }
    }

    @SuppressWarnings("deprecation")
    private String displayInfo() {
        StringBuilder j = new StringBuilder("{");
        try {
            DisplayMetrics dm = new DisplayMetrics();
            Display d = getWindowManager().getDefaultDisplay();
            d.getRealMetrics(dm);
            j.append("\"uiW\":").append(dm.widthPixels).append(",\"uiH\":").append(dm.heightPixels)
             .append(",\"dpi\":").append(dm.densityDpi).append(",\"density\":").append(dm.density);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Display.Mode m = d.getMode();
                j.append(",\"outW\":").append(m.getPhysicalWidth()).append(",\"outH\":").append(m.getPhysicalHeight())
                 .append(",\"hz\":").append(Math.round(m.getRefreshRate()));
                int mw = 0, mh = 0;
                for (Display.Mode x : d.getSupportedModes()) if ((long) x.getPhysicalWidth() * x.getPhysicalHeight() > (long) mw * mh) { mw = x.getPhysicalWidth(); mh = x.getPhysicalHeight(); }
                j.append(",\"maxW\":").append(mw).append(",\"maxH\":").append(mh);
            }
            j.append(",\"prefer4k\":").append(prefer4k());
            j.append(",\"model\":\"").append((Build.MANUFACTURER + " " + Build.MODEL).replace("\"", "")).append("\"");
            j.append(",\"android\":\"").append(Build.VERSION.RELEASE).append("\"");
        } catch (Exception e) { j.append("\"err\":\"").append(String.valueOf(e.getMessage()).replace("\"", "")).append("\""); }
        return j.append("}").toString();
    }

    /* ===== التشغيل التلقائي بعد إعادة تشغيل الجهاز =====
       من أندرويد 10 يحتاج التطبيق إذن «الظهور فوق التطبيقات الأخرى» حتى يفتح نفسه بعد التشغيل */
    static boolean canAutostart(Activity a) {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(a);
    }

    private void openOverlaySettings() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;
        try {
            startActivityForResult(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName())), REQ_OVERLAY);
        } catch (Exception e) {
            try {
                startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName())));
            } catch (Exception e2) {
                Toast.makeText(this, "افتح إعدادات الجهاز ← التطبيقات ← روائع الأذان، واسمح بالظهور فوق التطبيقات الأخرى", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void askAutostartOnce() {
        if (canAutostart(this)) return;
        final SharedPreferences p = getSharedPreferences("rawayie", MODE_PRIVATE);
        if (p.getBoolean("askedAutostart", false)) return;
        p.edit().putBoolean("askedAutostart", true).apply();
        new AlertDialog.Builder(this)
                .setTitle("التشغيل التلقائي")
                .setMessage("حتى تفتح الشاشة وحدها بعد إعادة تشغيل الجهاز أو انقطاع الكهرباء، اسمح للتطبيق بـ«الظهور فوق التطبيقات الأخرى».")
                .setPositiveButton("السماح", (d, i) -> openOverlaySettings())
                .setNegativeButton("لاحقاً", null)
                .show();
    }

    /* ===== تدوير الشاشة من النظام =====
       بدل رسم الصفحة مدوّرة (فتتحرك الفأرة وأزرار الريموت بعكس الاتجاه)، يطلب التطبيق من أندرويد تدوير الشاشة نفسها.
       deg: زاوية التدوير المطلوبة باتجاه عقارب الساعة (0، 90، 180، 270)، أو -1 لإيقاف التدوير من النظام */
    private final Handler ui = new Handler(Looper.getMainLooper());
    private int rotWant = -2, rotTry = 0, rotFailed = -1;

    @SuppressWarnings("deprecation")
    private int nativeRotDeg() {
        // زاوية دوران الرسم على الشاشة باتجاه عقارب الساعة (عكس قيمة النظام)
        try { return (360 - getWindowManager().getDefaultDisplay().getRotation() * 90) % 360; } catch (Exception e) { return 0; }
    }

    @SuppressWarnings("deprecation")
    private boolean naturalLandscape() {
        try {
            Display d = getWindowManager().getDefaultDisplay(); DisplayMetrics dm = new DisplayMetrics(); d.getRealMetrics(dm);
            boolean wide = dm.widthPixels >= dm.heightPixels; int r = d.getRotation();
            return (r % 2 == 0) == wide;
        } catch (Exception e) { return true; }
    }

    /* هل نافذة التطبيق تملأ الشاشة؟ بعض أجهزة التلفاز (أندرويد 12 فما فوق) لا تدوّر الشاشة لتطبيق رأسي،
       بل تعرضه في صندوق ضيق وسط الشاشة بأشرطة سوداء. نقارن شكل النافذة بشكل مخرج الشاشة الحقيقي */
    @SuppressWarnings("deprecation")
    private boolean fillsScreen() {
        try {
            View dv = getWindow().getDecorView(); int w = dv.getWidth(), h = dv.getHeight();
            if (w <= 0 || h <= 0) return true;
            Display d = getWindowManager().getDefaultDisplay(); int pw, ph;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) { Display.Mode m = d.getMode(); pw = m.getPhysicalWidth(); ph = m.getPhysicalHeight(); }
            else { DisplayMetrics dm = new DisplayMetrics(); d.getRealMetrics(dm); pw = dm.widthPixels; ph = dm.heightPixels; }
            if (d.getRotation() % 2 == 1) { int t = pw; pw = ph; ph = t; }
            double a1 = (double) w / h, a2 = (double) pw / ph;
            return Math.abs(a1 - a2) / a2 < 0.12;
        } catch (Exception e) { return true; }
    }

    private boolean rotOk(int deg) { return nativeRotDeg() == deg && fillsScreen(); }

    private void applyRotation(int deg) {
        if (deg == rotWant) return;
        rotWant = deg; rotTry++;
        final int token = rotTry;
        if (deg < 0) { setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED); notifyRotation(); return; }
        boolean side = deg == 90 || deg == 270, nat = naturalLandscape();
        // الاتجاهان المحتملان لهذه الزاوية؛ يُجرَّب الأول ثم الثاني إذا لم تطابق النتيجة الزاوية المطلوبة
        final int[] c = (side == nat)
                ? new int[]{ActivityInfo.SCREEN_ORIENTATION_PORTRAIT, ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT}
                : new int[]{ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE, ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE};
        if (deg == 0 || deg == 180) {
            if (nat) { c[0] = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE; c[1] = ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE; }
            else { c[0] = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT; c[1] = ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT; }
            if (deg == 180) { int t = c[0]; c[0] = c[1]; c[1] = t; }
        }
        if (nativeRotDeg() == deg && fillsScreen()) { setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LOCKED); notifyRotation(); return; }
        setRequestedOrientation(c[0]);
        ui.postDelayed(() -> {
            if (token != rotTry) return;
            if (!rotOk(deg)) {
                setRequestedOrientation(c[1]);
                ui.postDelayed(() -> {
                    if (token != rotTry) return;
                    // الجهاز لا يدعم هذا الاتجاه: يرجع لوضعه الطبيعي ويكمل التطبيق التدوير برسم الصفحة
                    // الجهاز لا يدعم هذا الاتجاه أو يعرضه في صندوق صغير: يرجع لوضعه الطبيعي ويكمل التطبيق التدوير برسم الصفحة
                    if (!rotOk(deg)) { setRequestedOrientation(nat ? ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT); rotFailed = deg; }
                    notifyRotation();
                }, 1200);
            } else notifyRotation();
        }, 1200);
        notifyRotation();
    }

    private void notifyRotation() {
        Runnable r = () -> { hideBars(); if (web != null) web.evaluateJavascript("try{dispatchEvent(new Event('resize'))}catch(e){}", null); };
        ui.postDelayed(r, 250); ui.postDelayed(r, 1500); ui.postDelayed(r, 3000);
    }

    @Override
    public void onConfigurationChanged(Configuration c) {
        super.onConfigurationChanged(c);
        hideBars();
        notifyRotation();
    }

    /* ===== فأرة افتراضية للشاشة المرسومة مدوّرة =====
       إذا لم يسمح الجهاز بتدوير الشاشة من النظام، تُرسم الصفحة مدوّرة ويبقى مؤشر النظام بالاتجاه الأصلي.
       هنا يمسك التطبيق حركة الفأرة نفسها ويحرك مؤشراً خاصاً بالاتجاه الذي يراه المستخدم، والضغط يصبح لمسة في مكانه */
    private CursorView cursor;
    private int cssRot = 0;
    private float vx = -1, vy = -1;
    private boolean vDown = false;
    private long vDownT = 0;

    private void setCssRot(int r) {
        cssRot = ((r % 360) + 360) % 360;
        if (cursor != null) cursor.setRotation(cssRot);
        if (cssRot == 0 && Build.VERSION.SDK_INT >= 26 && web != null && web.hasPointerCapture()) web.releasePointerCapture();
        if (cssRot == 0 && cursor != null) cursor.setVisibility(View.GONE);
    }

    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent ev) {
        if (cssRot != 0 && Build.VERSION.SDK_INT >= 26 && web != null && ev.isFromSource(InputDevice.SOURCE_MOUSE) && !web.hasPointerCapture()) {
            if (vx < 0) { vx = ev.getX(); vy = ev.getY(); }
            web.requestFocus(); web.requestPointerCapture();
            showCursor();
            return true;
        }
        return super.dispatchGenericMotionEvent(ev);
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        // ضغطة الفأرة الأولى قبل الإمساك بها: تمسك الفأرة بدل الضغط في المكان الخطأ
        if (cssRot != 0 && Build.VERSION.SDK_INT >= 26 && web != null && ev.isFromSource(InputDevice.SOURCE_MOUSE) && !web.hasPointerCapture()) {
            if (ev.getActionMasked() == MotionEvent.ACTION_DOWN) { if (vx < 0) { vx = ev.getX(); vy = ev.getY(); } web.requestFocus(); web.requestPointerCapture(); showCursor(); }
            return true;
        }
        return super.dispatchTouchEvent(ev);
    }

    private void showCursor() {
        if (cursor == null || web == null) return;
        if (vx < 0) { vx = web.getWidth() / 2f; vy = web.getHeight() / 2f; }
        cursor.setVisibility(View.VISIBLE); cursor.setX(vx); cursor.setY(vy); cursor.bringToFront();
    }

    private boolean onVMouse(MotionEvent ev) {
        if (web == null) return false;
        int a = ev.getActionMasked();
        // الزر الأيمن وزر الرجوع في الفأرة: خطوة للخلف (مثل زر الرجوع في الريموت)
        int sec = MotionEvent.BUTTON_SECONDARY | MotionEvent.BUTTON_BACK;
        if (Build.VERSION.SDK_INT >= 23 && a == MotionEvent.ACTION_BUTTON_PRESS && (ev.getActionButton() & sec) != 0) { onBackPressed(); return true; }
        if ((a == MotionEvent.ACTION_DOWN || a == MotionEvent.ACTION_UP || a == MotionEvent.ACTION_BUTTON_RELEASE) && (ev.getButtonState() & sec) != 0 && !vDown) return true;
        if (a == MotionEvent.ACTION_MOVE || a == MotionEvent.ACTION_HOVER_MOVE || a == MotionEvent.ACTION_DOWN || a == MotionEvent.ACTION_UP) {
            float dx = ev.getX(), dy = ev.getY();
            if (a == MotionEvent.ACTION_MOVE || a == MotionEvent.ACTION_HOVER_MOVE) {
                double t = Math.toRadians(cssRot);
                float k = 1.4f;
                vx += (float) (dx * Math.cos(t) - dy * Math.sin(t)) * k;
                vy += (float) (dx * Math.sin(t) + dy * Math.cos(t)) * k;
                vx = Math.max(0, Math.min(web.getWidth() - 1, vx));
                vy = Math.max(0, Math.min(web.getHeight() - 1, vy));
                showCursor();
                if (vDown) touch(MotionEvent.ACTION_MOVE);
            }
            if (a == MotionEvent.ACTION_DOWN && !vDown) { vDown = true; vDownT = SystemClock.uptimeMillis(); touch(MotionEvent.ACTION_DOWN); }
            if (a == MotionEvent.ACTION_UP && vDown) { touch(MotionEvent.ACTION_UP); vDown = false; }
            return true;
        }
        if (a == MotionEvent.ACTION_BUTTON_PRESS && !vDown) { vDown = true; vDownT = SystemClock.uptimeMillis(); touch(MotionEvent.ACTION_DOWN); return true; }
        if (a == MotionEvent.ACTION_BUTTON_RELEASE && vDown) { touch(MotionEvent.ACTION_UP); vDown = false; return true; }
        if (a == MotionEvent.ACTION_SCROLL) {
            float s = ev.getAxisValue(MotionEvent.AXIS_VSCROLL);
            web.evaluateJavascript("window.__vwheel&&__vwheel(" + (vx / web.getWidth()) + "," + (vy / web.getHeight()) + "," + (-s) + ")", null);
            return true;
        }
        return true;
    }

    private void touch(int action) {
        long now = SystemClock.uptimeMillis();
        MotionEvent t = MotionEvent.obtain(vDownT, now, action, vx, vy, 0);
        t.setSource(InputDevice.SOURCE_TOUCHSCREEN);
        web.dispatchTouchEvent(t);
        t.recycle();
    }

    /* مؤشر سهم أبيض بحد أسود، رأسه في أعلى اليسار ويدور مع الشاشة */
    static class CursorView extends View {
        private final Paint fill = new Paint(Paint.ANTI_ALIAS_FLAG), line = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Path p = new Path();
        CursorView(android.content.Context c) {
            super(c); fill.setColor(Color.WHITE); line.setColor(Color.BLACK); line.setStyle(Paint.Style.STROKE); line.setStrokeWidth(2.5f);
            setPivotX(0); setPivotY(0); setElevation(1000f);
        }
        @Override protected void onDraw(Canvas c) {
            float w = getWidth(), h = getHeight();
            p.reset(); p.moveTo(1, 1); p.lineTo(1, h * .82f); p.lineTo(w * .28f, h * .62f); p.lineTo(w * .45f, h * .98f);
            p.lineTo(w * .6f, h * .9f); p.lineTo(w * .43f, h * .56f); p.lineTo(w * .78f, h * .56f); p.close();
            c.drawPath(p, fill); c.drawPath(p, line);
        }
    }

    /* ===== واجهة يستخدمها التطبيق من داخل الصفحة ===== */
    class Bridge {
        @JavascriptInterface public String version() { return BuildConfig.VERSION_NAME; }
        @JavascriptInterface public boolean canAutostart() { return MainActivity.canAutostart(MainActivity.this); }
        @JavascriptInterface public void requestAutostart() { runOnUiThread(MainActivity.this::openOverlaySettings); }
        @JavascriptInterface public void reload() { runOnUiThread(() -> { if (web != null) web.reload(); }); }
        @JavascriptInterface public void exit() { runOnUiThread(MainActivity.this::finish); }
        // نسخة من بيانات الفترة التجريبية والتفعيل داخل التطبيق نفسه
        // معرّف ثابت للجهاز (لا يتغير بحذف التطبيق وإعادة تثبيته) حتى يبقى «رقم الجهاز» وكود التفعيل صالحين
        @JavascriptInterface public String deviceId() {
            try { String v = Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID); return v == null ? "" : v; } catch (Exception e) { return ""; }
        }
        @JavascriptInterface public String licGet() { return getSharedPreferences("rawayie", MODE_PRIVATE).getString("lic", ""); }
        @JavascriptInterface public void licSet(String v) { getSharedPreferences("rawayie", MODE_PRIVATE).edit().putString("lic", v).apply(); }
        // الصفحة تخبر التطبيق هل لوحة مفاتيح التطبيق مفعّلة: عندها تُمنع لوحة النظام تماماً
        @JavascriptInterface public void setImeBlock(boolean on) {
            getSharedPreferences("rawayie", MODE_PRIVATE).edit().putBoolean("imeBlock", on).apply();
            runOnUiThread(() -> {
                boolean ch = imeBlock != on; imeBlock = on;
                getWindow().setSoftInputMode(on ? WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN : WindowManager.LayoutParams.SOFT_INPUT_STATE_UNSPECIFIED);
                if (on) hideIme();
                if (ch && web != null) { try { android.view.inputmethod.InputMethodManager im = (android.view.inputmethod.InputMethodManager) getSystemService(INPUT_METHOD_SERVICE); if (im != null) im.restartInput(web); } catch (Exception ignored) { } }
            });
        }
        // الصفحة رسمت أول إطار: تُخفى شاشة البداية
        @JavascriptInterface public void ready() { runOnUiThread(MainActivity.this::hideSplash); }
        // ساعة احتياطية: مدة التشغيل منذ الإقلاع (لا تتأثر بضياع الساعة عند انقطاع الكهرباء)
        @JavascriptInterface public long uptime() { return SystemClock.elapsedRealtime(); }
        // وقت الإنترنت من خوادم NTP مباشرة (UDP)، يعمل حتى لو كان تاريخ الجهاز خاطئاً فتفشل اتصالات HTTPS
        @JavascriptInterface public void requestNetTime() {
            new Thread(() -> {
                long t = 0;
                for (String h : new String[]{"time.google.com", "pool.ntp.org", "time.cloudflare.com", "time.windows.com"}) { t = sntp(h); if (t > 0) break; }
                final long ms = t;
                if (ms > 0) runOnUiThread(() -> { if (web != null) web.evaluateJavascript("window.__rwsNetTime&&window.__rwsNetTime(" + ms + ")", null); });
            }).start();
        }
        @JavascriptInterface public void openDateSettings() {
            runOnUiThread(() -> { try { startActivity(new Intent(Settings.ACTION_DATE_SETTINGS)); } catch (Exception e) { try { startActivity(new Intent(Settings.ACTION_SETTINGS)); } catch (Exception ignored) { } } });
        }
        /* ===== إطفاء الشاشة فعلياً وقت الصلاة ثم إعادتها ===== */
        @JavascriptInterface public String offInfo() {
            boolean adm = false;
            try { android.app.admin.DevicePolicyManager dpm = (android.app.admin.DevicePolicyManager) getSystemService(DEVICE_POLICY_SERVICE);
                adm = dpm != null && dpm.isAdminActive(new android.content.ComponentName(MainActivity.this, AdminReceiver.class)); } catch (Exception ignored) { }
            return "{\"admin\":" + adm + ",\"until\":" + getSharedPreferences("rawayie", MODE_PRIVATE).getLong("offUntil", 0) + "}";
        }
        @JavascriptInterface public void requestAdmin() {
            runOnUiThread(() -> { try {
                Intent i = new Intent(android.app.admin.DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
                i.putExtra(android.app.admin.DevicePolicyManager.EXTRA_DEVICE_ADMIN, new android.content.ComponentName(MainActivity.this, AdminReceiver.class));
                i.putExtra(android.app.admin.DevicePolicyManager.EXTRA_ADD_EXPLANATION, "يسمح لتطبيق روائع الأذان بإطفاء الشاشة وقت الصلاة فقط، ثم يعيد تشغيلها تلقائياً بعد انتهائها.");
                startActivity(i);
            } catch (Exception e) { Toast.makeText(MainActivity.this, "هذا الجهاز لا يدعم صلاحية إطفاء الشاشة", Toast.LENGTH_LONG).show(); } });
        }
        // until: وقت إعادة التشغيل بساعة الجهاز (ملّي ثانية)
        @JavascriptInterface public boolean screenOff(long until) { return MainActivity.this.screenOff(until); }
        @JavascriptInterface public void screenOn() { runOnUiThread(MainActivity.this::screenOnNow); }
        // حفظ ملف نصي: يختار المستخدم مكان الحفظ (التنزيلات أو ذاكرة USB)
        /** حالة التحديث التلقائي لملفات الشاشة: الإصدار المعتمد ونتيجة آخر تحقق ووقته (JSON) */
        /** الشاشة تطلب تحققاً فورياً من تحديث ملفاتها (بعد عودة الاتصال بالموقع) */
        @JavascriptInterface public void otaCheck() { otaNow(); }
        @JavascriptInterface public String mediaInfo() { MediaCache m = media; return m != null ? m.info() : "{}"; }
        @JavascriptInterface public String otaInfo() {
            Ota o = ota; if (o == null) return "{}";
            return "{\"ver\":\"" + o.version() + "\",\"st\":\"" + o.status.replace("\"", "'") + "\",\"at\":" + o.statusAt + ",\"apk\":" + BuildConfig.VERSION_CODE + "}";
        }
        @JavascriptInterface public void saveText(String name, String text, String mime) {
            runOnUiThread(() -> { try {
                saveText = text; saveMime = mime == null || mime.isEmpty() ? "text/plain" : mime;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT); i.addCategory(Intent.CATEGORY_OPENABLE); i.setType(saveMime); i.putExtra(Intent.EXTRA_TITLE, name);
                startActivityForResult(i, REQ_SAVE);
            } catch (Exception e) { saveText = null; Toast.makeText(MainActivity.this, "هذا الجهاز لا يدعم حفظ الملفات", Toast.LENGTH_LONG).show(); } });
        }
        @JavascriptInterface public void hideKeyboard() { runOnUiThread(MainActivity.this::hideIme); }
        @JavascriptInterface public String displayInfo() { return MainActivity.this.displayInfo(); }
        @JavascriptInterface public void setRotation(int deg) { runOnUiThread(() -> applyRotation(deg)); }
        // مساحة الكاميرا الأمامية (النوتش) بوحدات الصفحة: حتى لا يغطيها اسم المسجد أو أي نص
        @JavascriptInterface public String safeInsets() {
            int t = 0, l = 0, r = 0, b = 0;
            try {
                if (Build.VERSION.SDK_INT >= 23) {
                    android.view.WindowInsets wi = getWindow().getDecorView().getRootWindowInsets();
                    if (wi != null) {
                        // شريط الحالة الظاهر في الجوال فقط (أشرطة النظام المخفية لا تُحسب)
                        if (statusBar) { int id = getResources().getIdentifier("status_bar_height", "dimen", "android"); t = Math.max(wi.getSystemWindowInsetTop() > 0 && id == 0 ? wi.getSystemWindowInsetTop() : 0, id > 0 ? getResources().getDimensionPixelSize(id) : 0);
                            if (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE) t = Math.max(t, 0); }
                        if (Build.VERSION.SDK_INT >= 28 && wi.getDisplayCutout() != null) { android.view.DisplayCutout c = wi.getDisplayCutout();
                            t = Math.max(t, c.getSafeInsetTop()); l = Math.max(l, c.getSafeInsetLeft()); r = Math.max(r, c.getSafeInsetRight()); b = Math.max(b, c.getSafeInsetBottom()); }
                    }
                }
            } catch (Exception ignored) { }
            float d = getResources().getDisplayMetrics().density; if (d <= 0) d = 1;
            return "{\"top\":" + Math.round(t / d) + ",\"left\":" + Math.round(l / d) + ",\"right\":" + Math.round(r / d) + ",\"bottom\":" + Math.round(b / d) + "}";
        }
        @JavascriptInterface public void setStatusBar(boolean on) { runOnUiThread(() -> MainActivity.this.setStatusBar(on)); }
        @JavascriptInterface public boolean isPhone() { return MainActivity.this.isPhone(); }
        @JavascriptInterface public int nativeRot() { return fillsScreen() ? nativeRotDeg() : 0; }
        @JavascriptInterface public String rotInfo() {
            View dv = getWindow().getDecorView();
            return "{\"win\":\"" + dv.getWidth() + "x" + dv.getHeight() + "\",\"rot\":" + nativeRotDeg() + ",\"fill\":" + fillsScreen() + ",\"failed\":" + rotFailed + "}";
        }
        @JavascriptInterface public void setCssRot(int r) { runOnUiThread(() -> MainActivity.this.setCssRot(r)); }
        @JavascriptInterface public void setPrefer4k(boolean on) {
            getSharedPreferences("rawayie", MODE_PRIVATE).edit().putBoolean("prefer4k", on).apply();
            runOnUiThread(MainActivity.this::applyDisplayMode);
        }
    }
}
