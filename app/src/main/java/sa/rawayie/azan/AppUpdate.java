package sa.rawayie.azan;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageInstaller;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.widget.Toast;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * تحديث تطبيق أندرويد بأمر من لوحة الإدارة وضغطة واحدة في المسجد.
 * لوحة ووردبريس ترسل أمر «تحديث التطبيق» ← الجهاز ينزّل آخر نسخة موقّعة من الموقع في الخلفية ← يتحقق أنها
 * نفس التطبيق وأحدث من المثبّت ← يظهر طلب التثبيت من النظام، فيوافق عليه مشرف المسجد بضغطة «تثبيت».
 * الإعدادات والترخيص يبقيان كما هما، والتطبيق يعود للشاشة وحده بعد التثبيت (BootReceiver: MY_PACKAGE_REPLACED).
 * أندرويد لا يسمح بالتثبيت الصامت، لذلك الموافقة في الجهاز ضرورية.
 */
public class AppUpdate extends BroadcastReceiver {
    static volatile String state = "";      // "" | dl:<نسبة> | same:<إصدار> | perm | wait | done | cancel | err:<سبب>
    static volatile long stateAt = 0;
    private static volatile boolean busy = false;
    private static volatile boolean askedOverlay = false;
    private static volatile File pending = null; // نسخة منزّلة تنتظر إذن «تثبيت التطبيقات غير المعروفة»
    static final long WAIT_MS = 30 * 60000L;  // حارس الشاشة لا يغطي طلب التثبيت خلال هذه المدة

    private static void set(Context c, String s) {
        state = s; stateAt = System.currentTimeMillis();
        try {
            c.getSharedPreferences(KeepAlive.P, Context.MODE_PRIVATE).edit()
             .putLong("updWaitUntil", ("wait".equals(s) || "perm".equals(s)) ? stateAt + WAIT_MS : 0).apply();
        } catch (Throwable ignored) { }
    }

    static String json() {
        return "{\"st\":\"" + state.replace("\"", "'") + "\",\"at\":" + stateAt + ",\"code\":" + BuildConfig.VERSION_CODE + "}";
    }

    /** يبدأ التنزيل في الخلفية ثم يطلب الموافقة على التثبيت */
    static void start(final Activity a, final String url) {
        if (busy || url == null || !url.startsWith("http")) return;
        busy = true;
        final Context app = a.getApplicationContext();
        set(app, "dl:0");
        new Thread(() -> {
            try {
                File f = new File(app.getCacheDir(), "rawayie-update.apk");
                if (!download(app, url, f)) { busy = false; return; }
                PackageManager pm = app.getPackageManager();
                PackageInfo pi = pm.getPackageArchiveInfo(f.getAbsolutePath(), 0);
                if (pi == null || !app.getPackageName().equals(pi.packageName)) { f.delete(); set(app, "err:bad-file"); busy = false; return; }
                long newCode = Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
                if (newCode <= BuildConfig.VERSION_CODE) { f.delete(); set(app, "same:" + BuildConfig.VERSION_NAME); busy = false; return; }
                pending = f;
                a.runOnUiThread(() -> resume(a));
            } catch (Throwable t) {
                set(app, "err:" + t.getClass().getSimpleName()); busy = false;
            }
        }, "rawayie-appupdate").start();
    }

    /** بعد التنزيل، أو عند عودة الشاشة من إعداد «تثبيت التطبيقات غير المعروفة» */
    static void resume(Activity a) {
        final File f = pending;
        if (f == null) return;
        final Context app = a.getApplicationContext();
        if (Build.VERSION.SDK_INT >= 26 && !app.getPackageManager().canRequestPackageInstalls()) {
            if (!"perm".equals(state)) {
                set(app, "perm");
                try {
                    Toast.makeText(a, "للتحديث: اسمح لتطبيق روائع الأذان بتثبيت التحديثات، ثم ارجع للشاشة", Toast.LENGTH_LONG).show();
                    a.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + app.getPackageName())));
                } catch (Throwable ignored) { }
            }
            return;
        }
        // حتى يعود التطبيق وحده بعد التثبيت: أندرويد 10 فما فوق يحتاج إذن «الظهور فوق التطبيقات الأخرى» (يُطلب مرة واحدة، والتحديث يكمل ولو رُفض)
        if (Build.VERSION.SDK_INT >= 29 && !Settings.canDrawOverlays(app) && !askedOverlay) {
            askedOverlay = true; set(app, "perm");
            try {
                Toast.makeText(a, "حتى تعود الشاشة وحدها بعد التحديث: اسمح بالظهور فوق التطبيقات الأخرى، ثم ارجع للشاشة", Toast.LENGTH_LONG).show();
                a.startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + app.getPackageName())));
                return;
            } catch (Throwable ignored) { }
        }
        pending = null;
        new Thread(() -> install(app, f), "rawayie-appinstall").start();
    }

    private static void install(Context app, File f) {
        try {
            PackageInstaller pi = app.getPackageManager().getPackageInstaller();
            PackageInstaller.SessionParams p = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
            p.setAppPackageName(app.getPackageName());
            p.setSize(f.length());
            int id = pi.createSession(p);
            PackageInstaller.Session s = pi.openSession(id);
            InputStream in = new FileInputStream(f);
            OutputStream out = s.openWrite("rawayie", 0, f.length());
            byte[] buf = new byte[65536]; int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            s.fsync(out); out.close(); in.close();
            int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? 0x02000000 /* FLAG_MUTABLE */ : 0);
            PendingIntent cb = PendingIntent.getBroadcast(app, 7702, new Intent(app, AppUpdate.class), fl);
            app.getSharedPreferences(KeepAlive.P, Context.MODE_PRIVATE).edit().putBoolean("fg", true).putBoolean("userExit", false).commit(); // بعد التثبيت يُعاد فتح الشاشة
            s.commit(cb.getIntentSender());
            s.close();
            set(app, "wait");
        } catch (Throwable t) {
            set(app, "err:install-" + t.getClass().getSimpleName());
        } finally {
            busy = false;
        }
    }

    private static boolean download(Context app, String url, File f) {
        HttpURLConnection c = null;
        try {
            String u = url;
            for (int hop = 0; hop < 6; hop++) {
                c = (HttpURLConnection) new URL(u).openConnection();
                c.setInstanceFollowRedirects(false);
                c.setConnectTimeout(20000); c.setReadTimeout(60000);
                c.setRequestProperty("User-Agent", Ota.userAgent);
                c.setRequestProperty("Cache-Control", "no-cache");
                int code = c.getResponseCode();
                if (code >= 300 && code < 400 && c.getHeaderField("Location") != null) { // تحويل (مثلاً إلى GitHub)
                    u = new URL(new URL(u), c.getHeaderField("Location")).toString(); c.disconnect(); c = null; continue;
                }
                if (code != 200) { set(app, "err:http-" + code); return false; }
                break;
            }
            if (c == null) { set(app, "err:redirects"); return false; }
            long len = c.getContentLength();
            InputStream in = c.getInputStream();
            OutputStream out = new FileOutputStream(f);
            byte[] buf = new byte[65536]; int n; long got = 0; int last = -1;
            while ((n = in.read(buf)) > 0) {
                out.write(buf, 0, n); got += n;
                if (len > 0) { int pc = (int) (got * 100 / len); if (pc / 5 != last) { last = pc / 5; set(app, "dl:" + pc); } }
            }
            out.close(); in.close();
            if (got < 1000000) { f.delete(); set(app, "err:small-file"); return false; }
            return true;
        } catch (Throwable t) {
            f.delete(); set(app, "err:dl-" + t.getClass().getSimpleName()); return false;
        } finally {
            if (c != null) c.disconnect();
        }
    }

    /** نتيجة جلسة التثبيت من النظام */
    @Override
    @SuppressWarnings("deprecation")
    public void onReceive(Context ctx, Intent intent) {
        int st = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE);
        if (st == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            Intent confirm = intent.getParcelableExtra(Intent.EXTRA_INTENT);
            if (confirm != null) {
                confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                set(ctx, "wait");
                try {
                    MainActivity a = MainActivity.current;
                    if (a != null) a.startActivity(confirm); else ctx.startActivity(confirm);
                } catch (Throwable t) { set(ctx, "err:confirm"); }
            }
        } else if (st == PackageInstaller.STATUS_SUCCESS) {
            set(ctx, "done");
        } else if (st == PackageInstaller.STATUS_FAILURE_ABORTED) {
            set(ctx, "cancel");
        } else {
            String m = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE);
            set(ctx, "err:" + st + (m != null ? ":" + m.replaceAll("[^A-Za-z0-9 _.:-]", "").trim() : ""));
        }
    }
}
