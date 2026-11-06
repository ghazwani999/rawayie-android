package sa.rawayie.azan;

import android.app.ActivityManager;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.media.AudioManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Environment;
import android.os.StatFs;
import android.os.SystemClock;
import android.provider.Settings;
import android.util.Base64;
import android.view.View;
import android.view.WindowManager;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;
import java.util.TimeZone;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * إعدادات جهاز أندرويد من لوحة الإدارة في الموقع.
 * يعمل على كل الأجهزة: معلومات الجهاز، الصوت، الإضاءة، لقطة الشاشة، فتح صفحة من إعدادات النظام.
 * وفي وضع «مالك الجهاز» (Device Owner، يُفعَّل مرة واحدة بأمر adb): إعادة تشغيل الجهاز، شبكة الواي فاي،
 * الوقت والمنطقة الزمنية، قفل الجهاز على تطبيق روائع، والتحديث بدون ضغط «تثبيت».
 */
final class DevCtl {
    private DevCtl() { }
    static final String P = "rawayie-dev";

    static ComponentName admin(Context c) { return new ComponentName(c, AdminReceiver.class); }
    static DevicePolicyManager dpm(Context c) { return (DevicePolicyManager) c.getSystemService(Context.DEVICE_POLICY_SERVICE); }

    static boolean owner(Context c) {
        try { DevicePolicyManager d = dpm(c); return d != null && d.isDeviceOwnerApp(c.getPackageName()); } catch (Throwable t) { return false; }
    }

    private static SharedPreferences prefs(Context c) { return c.getSharedPreferences(P, Context.MODE_PRIVATE); }

    /** عند فتح الشاشة: الإضاءة المحفوظة، وفي وضع مالك الجهاز: إذن الموقع (لاسم شبكة الواي فاي) والقفل على التطبيق */
    static void onResume(MainActivity a) {
        applyBright(a);
        if (!owner(a)) return;
        try {
            if (Build.VERSION.SDK_INT >= 23) {
                dpm(a).setPermissionGrantState(admin(a), a.getPackageName(), android.Manifest.permission.ACCESS_FINE_LOCATION, DevicePolicyManager.PERMISSION_GRANT_STATE_GRANTED);
            }
        } catch (Throwable ignored) { }
        if (prefs(a).getBoolean("lock", false) && !inLock(a)) startLock(a);
    }

    static void applyBright(MainActivity a) {
        float v = prefs(a).getFloat("bright", -1f);
        try {
            WindowManager.LayoutParams lp = a.getWindow().getAttributes();
            lp.screenBrightness = v < 0 ? WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE : Math.max(0.02f, Math.min(1f, v));
            a.getWindow().setAttributes(lp);
        } catch (Throwable ignored) { }
    }

    static boolean inLock(Context c) {
        try {
            ActivityManager am = (ActivityManager) c.getSystemService(Context.ACTIVITY_SERVICE);
            if (Build.VERSION.SDK_INT >= 23) return am.getLockTaskModeState() != ActivityManager.LOCK_TASK_MODE_NONE;
            return am.isInLockTaskMode();
        } catch (Throwable t) { return false; }
    }

    private static void startLock(MainActivity a) {
        try {
            dpm(a).setLockTaskPackages(admin(a), new String[]{a.getPackageName()});
            a.startLockTask();
        } catch (Throwable ignored) { }
    }

    /* ===== معلومات الجهاز ===== */
    static String info(MainActivity a) {
        JSONObject j = new JSONObject();
        try {
            j.put("model", (Build.MANUFACTURER + " " + Build.MODEL).trim());
            j.put("android", Build.VERSION.RELEASE);
            j.put("sdk", Build.VERSION.SDK_INT);
            j.put("apk", BuildConfig.VERSION_NAME);
            j.put("owner", owner(a));
            boolean adm = false;
            try { adm = dpm(a).isAdminActive(admin(a)); } catch (Throwable ignored) { }
            j.put("admin", adm);
            j.put("lock", inLock(a));
            j.put("uptime", SystemClock.elapsedRealtime());
            j.put("time", System.currentTimeMillis());
            j.put("tz", TimeZone.getDefault().getID());
            try { j.put("autoTime", Settings.Global.getInt(a.getContentResolver(), Settings.Global.AUTO_TIME, 1) == 1); } catch (Throwable ignored) { }
            try {
                StatFs s = new StatFs(Environment.getDataDirectory().getPath());
                j.put("diskFree", s.getAvailableBytes()); j.put("diskTotal", s.getTotalBytes());
            } catch (Throwable ignored) { }
            try {
                ActivityManager am = (ActivityManager) a.getSystemService(Context.ACTIVITY_SERVICE);
                ActivityManager.MemoryInfo mi = new ActivityManager.MemoryInfo(); am.getMemoryInfo(mi);
                j.put("ramFree", mi.availMem); j.put("ramTotal", mi.totalMem);
            } catch (Throwable ignored) { }
            try {
                AudioManager au = (AudioManager) a.getSystemService(Context.AUDIO_SERVICE);
                int mx = au.getStreamMaxVolume(AudioManager.STREAM_MUSIC), cv = au.getStreamVolume(AudioManager.STREAM_MUSIC);
                j.put("vol", mx > 0 ? Math.round(cv * 100f / mx) : 0);
            } catch (Throwable ignored) { }
            float b = prefs(a).getFloat("bright", -1f);
            j.put("bright", b < 0 ? -1 : Math.round(b * 100));
            net(a, j);
        } catch (Throwable ignored) { }
        return j.toString();
    }

    @SuppressWarnings("deprecation")
    private static void net(Context c, JSONObject j) {
        try {
            ConnectivityManager cm = (ConnectivityManager) c.getSystemService(Context.CONNECTIVITY_SERVICE);
            NetworkInfo ni = cm.getActiveNetworkInfo();
            j.put("net", ni == null || !ni.isConnected() ? "none" : ni.getType() == ConnectivityManager.TYPE_WIFI ? "wifi" : ni.getType() == ConnectivityManager.TYPE_ETHERNET ? "ethernet" : "other");
            WifiManager wm = (WifiManager) c.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null && ni != null && ni.getType() == ConnectivityManager.TYPE_WIFI) {
                WifiInfo wi = wm.getConnectionInfo();
                if (wi != null) {
                    String ss = wi.getSSID();
                    if (ss != null && !ss.contains("unknown")) j.put("ssid", ss.replace("\"", ""));
                    j.put("rssi", wi.getRssi());
                    j.put("signal", WifiManager.calculateSignalLevel(wi.getRssi(), 5)); // 0-4
                }
            }
            for (NetworkInterface nif : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                if (!nif.isUp() || nif.isLoopback()) continue;
                for (InetAddress ad : Collections.list(nif.getInetAddresses())) {
                    if (ad instanceof Inet4Address && !ad.isLoopbackAddress()) { j.put("ip", ad.getHostAddress()); return; }
                }
            }
        } catch (Throwable ignored) { }
    }

    /* ===== لقطة لما يظهر في التطبيق (بدون أي إذن) ===== */
    static String shot(final MainActivity a) {
        final String[] out = {""};
        final CountDownLatch done = new CountDownLatch(1);
        a.runOnUiThread(() -> {
            try {
                View v = a.getWindow().getDecorView().getRootView();
                int w = v.getWidth(), h = v.getHeight();
                if (w > 0 && h > 0) {
                    float k = Math.min(1f, 1280f / Math.max(w, h));
                    Bitmap bmp = Bitmap.createBitmap(Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k)), Bitmap.Config.RGB_565);
                    Canvas cv = new Canvas(bmp); cv.scale(k, k); v.draw(cv);
                    ByteArrayOutputStream bo = new ByteArrayOutputStream();
                    bmp.compress(Bitmap.CompressFormat.JPEG, 72, bo); bmp.recycle();
                    out[0] = Base64.encodeToString(bo.toByteArray(), Base64.NO_WRAP);
                }
            } catch (Throwable ignored) { }
            done.countDown();
        });
        try { done.await(6, TimeUnit.SECONDS); } catch (InterruptedException ignored) { }
        return out[0];
    }

    /* ===== الأوامر ===== */
    private static String res(boolean ok, String msg) {
        try { return new JSONObject().put("ok", ok).put("msg", msg).toString(); } catch (Throwable t) { return "{\"ok\":" + ok + "}"; }
    }
    private static String needOwner() { return res(false, "يحتاج وضع «مالك الجهاز»"); }

    static String run(final MainActivity a, String op, String args) {
        JSONObject g;
        try { g = new JSONObject(args == null || args.isEmpty() ? "{}" : args); } catch (Throwable t) { g = new JSONObject(); }
        try {
            switch (op == null ? "" : op) {
                case "info": return res(true, "");
                case "volume": {
                    AudioManager au = (AudioManager) a.getSystemService(Context.AUDIO_SERVICE);
                    int mx = au.getStreamMaxVolume(AudioManager.STREAM_MUSIC), v = Math.max(0, Math.min(100, g.optInt("v", 50)));
                    au.setStreamVolume(AudioManager.STREAM_MUSIC, Math.round(v * mx / 100f), 0);
                    return res(true, "صوت الجهاز " + v + "%");
                }
                case "bright": {
                    int v = g.optInt("v", -1);
                    prefs(a).edit().putFloat("bright", v < 0 ? -1f : Math.max(2, Math.min(100, v)) / 100f).apply();
                    a.runOnUiThread(() -> applyBright(a));
                    return res(true, v < 0 ? "إضاءة النظام" : "الإضاءة " + v + "%");
                }
                case "settings": {
                    String p = g.optString("p", "all");
                    final String act = "wifi".equals(p) ? Settings.ACTION_WIFI_SETTINGS : "date".equals(p) ? Settings.ACTION_DATE_SETTINGS
                            : "display".equals(p) ? Settings.ACTION_DISPLAY_SETTINGS : "sound".equals(p) ? Settings.ACTION_SOUND_SETTINGS : Settings.ACTION_SETTINGS;
                    if (inLock(a)) return res(false, "الجهاز مقفل على تطبيق روائع: ألغِ القفل أولاً");
                    a.runOnUiThread(() -> {
                        try { a.startActivity(new Intent(act).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); }
                        catch (Throwable t) { try { a.startActivity(new Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); } catch (Throwable ignored) { } }
                    });
                    // لا تغطيها الشاشة: حارس الشاشة ينتظر 10 دقائق قبل إعادة التطبيق
                    try { a.getSharedPreferences(KeepAlive.P, Context.MODE_PRIVATE).edit().putLong("updWaitUntil", System.currentTimeMillis() + 10 * 60000L).apply(); } catch (Throwable ignored) { }
                    return res(true, "فُتحت صفحة الإعدادات على الجهاز");
                }
                case "reboot": {
                    if (!owner(a)) return needOwner();
                    if (Build.VERSION.SDK_INT < 24) return res(false, "يحتاج أندرويد 7 أو أحدث");
                    a.runOnUiThread(() -> { try { if (inLock(a)) a.stopLockTask(); } catch (Throwable ignored) { } });
                    new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                        try { dpm(a).reboot(admin(a)); } catch (Throwable ignored) { }
                    }, 3000);
                    return res(true, "يُعاد تشغيل الجهاز الآن");
                }
                case "wifi": return wifi(a, g);
                case "time": return time(a, g);
                case "lock": {
                    if (!owner(a)) return needOwner();
                    final boolean on = g.optBoolean("on", false);
                    prefs(a).edit().putBoolean("lock", on).apply();
                    a.runOnUiThread(() -> {
                        try {
                            if (on) startLock(a);
                            else { if (inLock(a)) a.stopLockTask(); dpm(a).setLockTaskPackages(admin(a), new String[0]); }
                        } catch (Throwable ignored) { }
                    });
                    return res(true, on ? "قُفل الجهاز على تطبيق روائع" : "أُلغي قفل الجهاز");
                }
                case "unown": {
                    if (!owner(a)) return res(true, "الجهاز ليس في وضع مالك الجهاز أصلاً");
                    prefs(a).edit().putBoolean("lock", false).apply();
                    a.runOnUiThread(() -> {
                        try { if (inLock(a)) a.stopLockTask(); } catch (Throwable ignored) { }
                        try { dpm(a).setLockTaskPackages(admin(a), new String[0]); } catch (Throwable ignored) { }
                        try { dpm(a).clearDeviceOwnerApp(a.getPackageName()); } catch (Throwable ignored) { }
                    });
                    return res(true, "أُلغي وضع مالك الجهاز");
                }
                default: return res(false, "أمر غير معروف");
            }
        } catch (Throwable t) {
            return res(false, "تعذّر التنفيذ: " + t.getClass().getSimpleName());
        }
    }

    @SuppressWarnings("deprecation")
    private static String wifi(Context c, JSONObject g) {
        if (!owner(c)) return needOwner();
        String ssid = g.optString("ssid", "").trim(), pass = g.optString("pass", "");
        if (ssid.isEmpty()) return res(false, "اكتب اسم الشبكة");
        if (!pass.isEmpty() && pass.length() < 8) return res(false, "كلمة سر الواي فاي 8 أحرف على الأقل");
        WifiManager wm = (WifiManager) c.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        if (wm == null) return res(false, "الجهاز بدون واي فاي");
        try { if (!wm.isWifiEnabled()) wm.setWifiEnabled(true); } catch (Throwable ignored) { }
        String q = "\"" + ssid + "\"";
        try { // شبكة بنفس الاسم أضافها التطبيق سابقاً: تُستبدل
            List<WifiConfiguration> old = wm.getConfiguredNetworks();
            if (old != null) for (WifiConfiguration o : old) if (q.equals(o.SSID)) wm.removeNetwork(o.networkId);
        } catch (Throwable ignored) { }
        WifiConfiguration w = new WifiConfiguration();
        w.SSID = q;
        if (pass.isEmpty()) w.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.NONE);
        else w.preSharedKey = "\"" + pass + "\"";
        int id = wm.addNetwork(w);
        if (id < 0) return res(false, "رفض الجهاز إضافة الشبكة");
        wm.enableNetwork(id, true);
        try { wm.reconnect(); } catch (Throwable ignored) { }
        return res(true, "أُضيفت شبكة «" + ssid + "» وجاري الاتصال بها");
    }

    private static String time(Context c, JSONObject g) {
        if (!owner(c)) return needOwner();
        if (Build.VERSION.SDK_INT < 28) return res(false, "يحتاج أندرويد 9 أو أحدث");
        DevicePolicyManager d = dpm(c); ComponentName ad = admin(c);
        String tz = g.optString("tz", "");
        if (g.optBoolean("auto", false)) {
            setAuto(d, ad, true);
            return res(true, "الوقت تلقائي من الشبكة");
        }
        setAuto(d, ad, false);
        if (!tz.isEmpty()) d.setTimeZone(ad, tz);
        long ms = g.optLong("ms", 0);
        if (ms > 1500000000000L) { if (!d.setTime(ad, ms)) return res(false, "رفض الجهاز ضبط الوقت"); }
        return res(true, "ضُبط الوقت" + (tz.isEmpty() ? "" : " والمنطقة " + tz));
    }

    @SuppressWarnings("deprecation")
    private static void setAuto(DevicePolicyManager d, ComponentName ad, boolean on) {
        try {
            if (Build.VERSION.SDK_INT >= 30) { d.setAutoTimeEnabled(ad, on); d.setAutoTimeZoneEnabled(ad, on); }
            else { d.setGlobalSetting(ad, Settings.Global.AUTO_TIME, on ? "1" : "0"); d.setGlobalSetting(ad, Settings.Global.AUTO_TIME_ZONE, on ? "1" : "0"); }
        } catch (Throwable ignored) { }
    }
}
