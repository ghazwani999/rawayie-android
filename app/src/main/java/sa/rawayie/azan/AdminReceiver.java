package sa.rawayie.azan;

import android.app.admin.DeviceAdminReceiver;

/** صلاحية «إطفاء الشاشة» وقت الصلاة، وهو نفسه مستقبل وضع «مالك الجهاز»:
 *  adb shell dpm set-device-owner sa.rawayie.azan/.AdminReceiver */
public class AdminReceiver extends DeviceAdminReceiver { }
