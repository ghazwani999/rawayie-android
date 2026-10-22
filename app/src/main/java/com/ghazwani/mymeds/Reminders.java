package com.ghazwani.mymeds;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

/**
 * تنبيهات مواعيد الأدوية اليومية. كل موعد يُضبط لأقرب وقت قادم، وبعد ظهوره يُعاد ضبطه لليوم التالي.
 * يُعاد الضبط أيضاً بعد إعادة تشغيل الجهاز أو تغيير الوقت.
 */
public class Reminders extends BroadcastReceiver {
    static final String ACTION = "com.ghazwani.mymeds.REMIND";
    static final String CHANNEL = "meds";
    static final String PREFS = "mymeds";
    static final int MAX = 20;

    static void save(Context c, String json) {
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString("slots", json).apply();
    }

    static int flags() {
        return PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
    }

    static PendingIntent pending(Context c, int id, String title, String body) {
        Intent it = new Intent(c, Reminders.class).setAction(ACTION);
        it.putExtra("id", id);
        if (title != null) it.putExtra("title", title);
        if (body != null) it.putExtra("body", body);
        return PendingIntent.getBroadcast(c, id, it, flags());
    }

    static void scheduleAll(Context c) {
        try {
            String json = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("slots", "[]");
            JSONArray a = new JSONArray(json);
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            for (int i = 0; i < MAX; i++) am.cancel(pending(c, i, null, null));
            for (int i = 0; i < a.length() && i < MAX; i++) {
                JSONObject o = a.getJSONObject(i);
                scheduleOne(c, am, i, o.getInt("h"), o.getInt("m"), o.optString("title", "MyMeds"), o.optString("body", ""));
            }
        } catch (Exception ignored) { }
    }

    static void scheduleOne(Context c, AlarmManager am, int id, int h, int m, String title, String body) {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, h);
        cal.set(Calendar.MINUTE, m);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis() + 1000) cal.add(Calendar.DAY_OF_YEAR, 1);
        long t = cal.getTimeInMillis();
        PendingIntent pi = pending(c, id, title, body);
        try {
            if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
            } else if (Build.VERSION.SDK_INT >= 23) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
            } else {
                am.setExact(AlarmManager.RTC_WAKEUP, t, pi);
            }
        } catch (SecurityException e) {
            if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
            else am.set(AlarmManager.RTC_WAKEUP, t, pi);
        }
    }

    @Override
    public void onReceive(Context c, Intent i) {
        if (ACTION.equals(i.getAction())) {
            show(c, i.getIntExtra("id", 0), i.getStringExtra("title"), i.getStringExtra("body"));
        }
        scheduleAll(c);
    }

    @SuppressWarnings("deprecation")
    static void show(Context c, int id, String title, String body) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (title == null) title = "MyMeds";
        if (body == null) body = "";
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "تذكير الأدوية", NotificationManager.IMPORTANCE_HIGH);
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
            b = new Notification.Builder(c, CHANNEL);
        } else {
            b = new Notification.Builder(c);
            b.setPriority(Notification.PRIORITY_HIGH);
            b.setDefaults(Notification.DEFAULT_ALL);
        }
        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 100 + id, open, flags());
        b.setSmallIcon(R.drawable.ic_notify)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(pi);
        if (Build.VERSION.SDK_INT >= 21) b.setColor(0xFF0E4F78);
        nm.notify(id, b.build());
    }
}
