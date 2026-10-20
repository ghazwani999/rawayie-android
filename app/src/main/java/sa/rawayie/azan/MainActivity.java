package sa.rawayie.azan;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.view.Display;
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

        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        web.setKeepScreenOn(true);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // صوت الأذان والإقامة بدون لمس الشاشة
        s.setTextZoom(100);                             // حجم خط النظام لا يغيّر تصميم الشاشة
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setAllowFileAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " RawayieAndroid/" + BuildConfig.VERSION_NAME);

        web.addJavascriptInterface(new Bridge(), "RawayieAndroid");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return serve(req.getUrl());
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

        applyDisplayMode();
        if (saved != null) web.restoreState(saved);
        else web.loadUrl(START);
        hideBars();
        askAutostartOnce();
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
            InputStream in = getAssets().open("www/" + path);
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
        d.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    @Override
    public void onWindowFocusChanged(boolean has) {
        super.onWindowFocusChanged(has);
        if (has) hideBars();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) { web.onResume(); web.resumeTimers(); }
        hideBars();
    }

    // لا نوقف المؤقتات عند الخروج المؤقت حتى تبقى المواقيت والأذان تعمل

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    @Override
    protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }

    /* ===== زر الرجوع: يغلق الإعدادات، والخروج يحتاج ضغطتين حتى لا تُغلق الشاشة بالخطأ ===== */
    @Override
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        web.evaluateJavascript("(function(){var s=document.getElementById('set');if(s&&!s.hidden&&window.SETTINGS){SETTINGS.close();return 1}return 0})()",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String v) {
                        if ("1".equals(v)) return;
                        long now = System.currentTimeMillis();
                        if (now - lastBack < 2500) { finish(); return; }
                        lastBack = now;
                        Toast.makeText(MainActivity.this, "اضغط رجوع مرة أخرى للخروج من الشاشة", Toast.LENGTH_SHORT).show();
                    }
                });
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

    /* ===== واجهة يستخدمها التطبيق من داخل الصفحة ===== */
    class Bridge {
        @JavascriptInterface public String version() { return BuildConfig.VERSION_NAME; }
        @JavascriptInterface public boolean canAutostart() { return MainActivity.canAutostart(MainActivity.this); }
        @JavascriptInterface public void requestAutostart() { runOnUiThread(MainActivity.this::openOverlaySettings); }
        @JavascriptInterface public void reload() { runOnUiThread(() -> { if (web != null) web.reload(); }); }
        @JavascriptInterface public void exit() { runOnUiThread(MainActivity.this::finish); }
        // نسخة من بيانات الفترة التجريبية والتفعيل داخل التطبيق نفسه
        @JavascriptInterface public String licGet() { return getSharedPreferences("rawayie", MODE_PRIVATE).getString("lic", ""); }
        @JavascriptInterface public void licSet(String v) { getSharedPreferences("rawayie", MODE_PRIVATE).edit().putString("lic", v).apply(); }
        @JavascriptInterface public String displayInfo() { return MainActivity.this.displayInfo(); }
        @JavascriptInterface public void setPrefer4k(boolean on) {
            getSharedPreferences("rawayie", MODE_PRIVATE).edit().putBoolean("prefer4k", on).apply();
            runOnUiThread(MainActivity.this::applyDisplayMode);
        }
    }
}
