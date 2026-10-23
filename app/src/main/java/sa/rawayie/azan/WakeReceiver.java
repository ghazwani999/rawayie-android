package sa.rawayie.azan;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;

/** منبّه نهاية الصلاة: يشغّل الشاشة ويعيد التطبيق إلى الواجهة */
public class WakeReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) { wake(ctx); }

    @SuppressWarnings("deprecation")
    static void wake(Context ctx) {
        try {
            PowerManager pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE, "rawayie:wake");
                wl.acquire(15000);
            }
        } catch (Exception ignored) { }
        try {
            Intent i = new Intent(ctx, MainActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            i.putExtra("rwsWake", true);
            ctx.startActivity(i);
        } catch (Exception ignored) { }
        ctx.getSharedPreferences("rawayie", Context.MODE_PRIVATE).edit().putLong("offUntil", 0).apply();
    }
}
