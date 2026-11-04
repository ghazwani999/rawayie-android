package sa.rawayie.azan;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.PowerManager;
import android.os.SystemClock;

/**
 * حارس الشاشة: يعيد فتح التطبيق إذا خرج منه الجهاز بدون قصد.
 * - توقف التطبيق أو أغلقه النظام وهو ظاهر (نقص الذاكرة في أجهزة TV Box مثلاً): يعود خلال دقيقة.
 * - خرج إلى شاشة الجهاز الرئيسية أو تطبيق آخر: يعود بعد 5 دقائق (مهلة لضبط إعدادات الجهاز).
 * لا يعمل إذا خرج المستخدم بنفسه (زر الرجوع مرتين أو كلمة سر المدير)، ولا أثناء إطفاء الشاشة وقت الصلاة أو السكون.
 */
public class KeepAlive extends BroadcastReceiver {
    static final String P = "rawayie";
    static final long EVERY = 60000L, BG_GRACE = 5 * 60000L;
    static volatile boolean visible = false;

    private static PendingIntent pi(Context c) {
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        return PendingIntent.getBroadcast(c, 7701, new Intent(c, KeepAlive.class), fl);
    }

    static void schedule(Context c, long inMs) {
        try {
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            long at = SystemClock.elapsedRealtime() + inMs;
            if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, at, pi(c));
            else am.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, at, pi(c));
        } catch (Throwable ignored) { }
    }

    static void cancel(Context c) {
        try { AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE); if (am != null) am.cancel(pi(c)); } catch (Throwable ignored) { }
    }

    /** التطبيق ظاهر الآن */
    static void shown(Context c) {
        visible = true;
        c.getSharedPreferences(P, Context.MODE_PRIVATE).edit().putBoolean("fg", true).putBoolean("userExit", false).commit();
        schedule(c, EVERY);
    }

    /** التطبيق اختفى (شاشة الجهاز الرئيسية، تطبيق آخر، أو إطفاء الشاشة) */
    static void hidden(Context c) {
        visible = false;
        c.getSharedPreferences(P, Context.MODE_PRIVATE).edit().putBoolean("fg", false).putLong("bgAt", System.currentTimeMillis()).apply();
    }

    /** خروج مقصود من المستخدم: لا يعاد فتح التطبيق */
    static void userExit(Context c) {
        visible = false;
        c.getSharedPreferences(P, Context.MODE_PRIVATE).edit().putBoolean("userExit", true).putBoolean("fg", false).commit();
        cancel(c);
    }

    @Override
    public void onReceive(Context c, Intent intent) {
        SharedPreferences sp = c.getSharedPreferences(P, Context.MODE_PRIVATE);
        if (sp.getBoolean("userExit", false)) return;
        schedule(c, EVERY);
        if (visible) return;
        long now = System.currentTimeMillis();
        if (sp.getLong("offUntil", 0) > now) return; // الشاشة مطفأة عمداً وقت الصلاة أو السكون
        try {
            PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
            if (pm != null && !(Build.VERSION.SDK_INT >= 20 ? pm.isInteractive() : pm.isScreenOn())) return;
        } catch (Throwable ignored) { }
        boolean crashed = sp.getBoolean("fg", false); // كان ظاهراً ثم اختفى بدون onStop: توقف أو أغلقه النظام
        if (!crashed && now - sp.getLong("bgAt", 0) < BG_GRACE) return;
        try {
            Intent i = new Intent(c, MainActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            c.startActivity(i);
        } catch (Throwable ignored) { }
    }
}
