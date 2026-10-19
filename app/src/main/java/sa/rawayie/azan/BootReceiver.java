package sa.rawayie.azan;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;

/** يفتح الشاشة تلقائياً بعد تشغيل الجهاز أو بعد تحديث التطبيق */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(final Context ctx, Intent intent) {
        String a = intent == null ? null : intent.getAction();
        if (a == null) return;
        if (!a.equals(Intent.ACTION_BOOT_COMPLETED) && !a.equals("android.intent.action.QUICKBOOT_POWERON")
                && !a.equals("com.htc.intent.action.QUICKBOOT_POWERON") && !a.equals(Intent.ACTION_MY_PACKAGE_REPLACED)) return;
        final PendingResult pr = goAsync();
        // مهلة قصيرة حتى يكتمل تشغيل النظام والشبكة
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    Intent i = new Intent(ctx, MainActivity.class);
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                    ctx.startActivity(i);
                } catch (Exception ignored) {
                } finally {
                    pr.finish();
                }
            }
        }, 4000);
    }
}
