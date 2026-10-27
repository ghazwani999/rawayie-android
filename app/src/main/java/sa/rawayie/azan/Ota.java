package sa.rawayie.azan;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * تحديث ملفات الشاشة من الموقع بدون تثبيت APK جديد.
 *
 * الإضافة تنشر قائمة بملفات الشاشة (app/) مع بصمة كل ملف:  /?rest_route=/rawayie/v1/app/manifest
 * التطبيق يقارنها بالملفات المضمّنة فيه، وينزّل المختلف فقط إلى مجلد داخلي (files/ota/v-<الإصدار>)،
 * ويتحقق من بصمة كل ملف، ثم يعتمد الإصدار الجديد دفعة واحدة. بعدها تُقدَّم الملفات من هذا المجلد أولاً
 * ثم من الملفات المضمّنة، على نفس العنوان الداخلي، فتبقى إعدادات الشاشة كما هي وتعمل بدون إنترنت.
 *
 * لا يستخدم أي مكتبة أندرويد، حتى يمكن اختباره بجافا عادية.
 */
final class Ota {
    interface Assets { InputStream open(String path) throws IOException; }

    private static final Charset UTF8 = Charset.forName("UTF-8");
    private static final long MAX_TOTAL = 80L * 1024 * 1024; // حد أعلى للتنزيل في التحديث الواحد

    private final File root;
    private final Assets assets;
    private final String bundledVer;
    private final int apkCode;
    static volatile int lastCode = 0; // آخر رمز HTTP (0 = لا اتصال)
    static volatile String userAgent = "Mozilla/5.0 (Linux; Android) RawayieAndroid";
    private volatile File activeDir;
    private volatile String activeVer;

    Ota(File filesDir, Assets assets, String bundledVer, int apkCode) {
        this.root = new File(filesDir, "ota");
        this.assets = assets;
        this.bundledVer = bundledVer == null ? "0" : bundledVer;
        this.apkCode = apkCode;
        load();
    }

    /** الإصدار المعتمد حالياً (المنزّل، أو المضمّن في التطبيق) */
    String version() { return activeVer != null ? activeVer : bundledVer; }

    /** ملف من التحديث المنزّل إن وُجد، وإلا null فيُقدَّم الملف المضمّن */
    File find(String path) {
        File d = activeDir;
        if (d == null || path == null || path.contains("..")) return null;
        File f = new File(d, path);
        return f.isFile() ? f : null;
    }

    /** يقرأ الإصدار المعتمد. إصدار منزّل أقدم من المضمّن (بعد تثبيت APK أحدث) يُحذف */
    private void load() {
        activeDir = null; activeVer = null;
        String v = readText(new File(root, "active.txt"));
        if (v == null || v.isEmpty()) return;
        File d = new File(root, "v-" + v);
        if (cmp(v, bundledVer) <= 0 || !new File(d, ".ok").isFile()) { wipe(root); return; }
        activeDir = d; activeVer = v;
    }

    /* نتيجة آخر تحقق، تُرسل للموقع مع حالة الشاشة: ok | none | err:<السبب> | wait-apk, ووقتها */
    volatile String status = "";
    volatile long statusAt = 0;
    private String done(String st, String ret) { status = st; statusAt = System.currentTimeMillis(); return ret; }

    /**
     * يتحقق من الموقع وينزّل إصداراً أحدث إن وُجد.
     * @return رقم الإصدار الجديد إذا اعتُمد، وإلا null
     */
    String check(String site) {
        if (site == null || site.isEmpty()) return done("err:site", null);
        String cur = "";
        try {
            String man = httpText(site.replaceAll("/+$", "") + "/?rest_route=/rawayie/v1/app/manifest&apk=" + apkCode);
            if (man == null) return done("err:manifest:" + lastCode, null);
            String[] lines = man.split("\n");
            // السطر الأول:  RWSAPP <TAB> الإصدار <TAB> رابط مجلد الملفات <TAB> أقل versionCode مطلوب
            String[] head = lines[0].trim().split("\t");
            if (head.length < 3 || !"RWSAPP".equals(head[0])) return done("err:manifest-format", null);
            String ver = head[1].trim(), base = head[2].trim();
            int minApk = head.length > 3 ? parseInt(head[3].trim()) : 0;
            if (!ver.matches("[0-9]+(\\.[0-9]+)*") || !base.startsWith("http")) return done("err:manifest-format", null);
            if (cmp(ver, version()) <= 0) return done("none", null);   // لا جديد
            if (minApk > apkCode) return done("wait-apk:" + ver, null); // يحتاج تطبيقاً أحدث: يُنتظر تحديث APK
            if (!base.endsWith("/")) base += "/";

            List<String[]> files = new ArrayList<>();
            for (int i = 1; i < lines.length; i++) {
                String[] p = lines[i].trim().split("\t");
                if (p.length < 2 || p[0].isEmpty() || p[0].contains("..") || p[0].startsWith("/")) continue;
                files.add(p);
            }
            if (files.isEmpty()) return done("err:empty", null);

            File tmp = new File(root, "tmp-" + ver);
            wipe(tmp); tmp.mkdirs();
            long total = 0;
            for (String[] p : files) {
                String path = p[0], sha = p[1].toLowerCase(); cur = path;
                boolean index = "index.html".equals(path);
                if (!index) {
                    if (sha.equals(assetSha(path))) continue;                       // مطابق للمضمّن
                    File prev = find(path);
                    if (prev != null && sha.equals(sha1(new FileInputStream(prev)))) { copy(new FileInputStream(prev), new File(tmp, path)); continue; }
                }
                byte[] b = httpBytes(base + encPath(path));
                if (b == null) { wipe(tmp); return done("err:download:" + lastCode + ":" + path, null); }
                if (!sha.equals(hex(MessageDigest.getInstance("SHA-1").digest(b)))) { wipe(tmp); return done("err:hash:" + path, null); }
                total += b.length;
                if (total > MAX_TOTAL) { wipe(tmp); return done("err:too-big", null); }
                if (index) b = patchIndex(new String(b, UTF8), site).getBytes(UTF8);
                File o = new File(tmp, path); o.getParentFile().mkdirs();
                OutputStream os = new FileOutputStream(o); try { os.write(b); } finally { os.close(); }
            }
            new File(tmp, ".ok").createNewFile();

            // اعتماد الإصدار دفعة واحدة، ثم حذف الإصدارات القديمة
            File dst = new File(root, "v-" + ver);
            wipe(dst);
            if (!tmp.renameTo(dst)) { wipe(tmp); return done("err:disk", null); }
            File at = new File(root, "active.tmp");
            writeText(at, ver);
            if (!at.renameTo(new File(root, "active.txt"))) { writeText(new File(root, "active.txt"), ver); at.delete(); }
            File old = activeDir;
            activeDir = dst; activeVer = ver;
            File[] ls = root.listFiles();
            if (ls != null) for (File f : ls) if (f.isDirectory() && !f.equals(dst)) wipe(f);
            if (old != null && !old.equals(dst)) wipe(old);
            return done("ok:" + ver, ver);
        } catch (Throwable t) {
            return done("err:" + t.getClass().getSimpleName() + (cur.isEmpty() ? "" : ":" + cur), null);
        }
    }

    /** نفس تعديل tools/prepare_www.py على index.html */
    static String patchIndex(String s, String site) {
        String tag = "<meta charset=\"utf-8\">";
        String inj = tag + "\n<script>window.RAWAYIE_SITE = \"" + site.replaceAll("/+$", "").replace("\"", "") + "\"; window.RAWAYIE_APK = 1;</script>";
        int i = s.indexOf(tag);
        if (i >= 0 && s.indexOf("window.RAWAYIE_APK") < 0) s = s.substring(0, i) + inj + s.substring(i + tag.length());
        return s.replace("<link rel=\"manifest\" href=\"manifest.webmanifest\">\n", "");
    }

    /** رابط الموقع من index.html المضمّن (window.RAWAYIE_SITE) */
    static String siteFrom(InputStream in) {
        try {
            String s = new String(readAll(in), UTF8);
            Matcher m = Pattern.compile("RAWAYIE_SITE\\s*=\\s*\"([^\"]+)\"").matcher(s);
            return m.find() ? m.group(1) : null;
        } catch (Exception e) { return null; }
    }

    /** رقم الإصدار من version.js */
    static String verFrom(InputStream in) {
        try {
            String s = new String(readAll(in), UTF8);
            Matcher m = Pattern.compile("RWS_VERSION\\s*=\\s*\"([^\"]+)\"").matcher(s);
            return m.find() ? m.group(1) : null;
        } catch (Exception e) { return null; }
    }

    /** مقارنة أرقام الإصدارات: 9.10 أحدث من 9.9 */
    static int cmp(String a, String b) {
        String[] x = a.split("\\."), y = b.split("\\.");
        for (int i = 0; i < Math.max(x.length, y.length); i++) {
            int p = i < x.length ? parseInt(x[i]) : 0, q = i < y.length ? parseInt(y[i]) : 0;
            if (p != q) return p < q ? -1 : 1;
        }
        return 0;
    }

    /* ===== أدوات ===== */
    private String assetSha(String path) {
        try { return sha1(assets.open("www/" + path)); } catch (Exception e) { return ""; }
    }
    private static int parseInt(String s) { try { return Integer.parseInt(s.replaceAll("[^0-9]", "")); } catch (Exception e) { return 0; } }
    private static String encPath(String p) throws IOException {
        StringBuilder b = new StringBuilder();
        for (String seg : p.split("/")) { if (b.length() > 0) b.append('/'); b.append(URLEncoder.encode(seg, "UTF-8").replace("+", "%20")); }
        return b.toString();
    }
    private static HttpURLConnection open(String u) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection();
        c.setConnectTimeout(15000); c.setReadTimeout(60000); c.setUseCaches(false);
        c.setRequestProperty("Cache-Control", "no-cache");
        c.setRequestProperty("User-Agent", userAgent); // بعض جدران الحماية في الاستضافات ترفض وكيل Dalvik الافتراضي
        c.setRequestProperty("Accept", "*/*");
        c.setInstanceFollowRedirects(false);
        return c;
    }
    /** التحويلات تُتبع يدوياً (ومنها http إلى https التي لا يتبعها أندرويد وحده)، حتى 5 مرات */
    private static byte[] httpBytes(String u) {
        for (int hop = 0; hop < 5; hop++) {
            HttpURLConnection c = null;
            try {
                c = open(u);
                int code = c.getResponseCode(); lastCode = code;
                if (code == 301 || code == 302 || code == 303 || code == 307 || code == 308) {
                    String loc = c.getHeaderField("Location");
                    if (loc == null || loc.isEmpty()) return null;
                    u = new URL(new URL(u), loc).toString();
                    continue;
                }
                if (code != 200) return null;
                return readAll(c.getInputStream());
            } catch (Exception e) { lastCode = 0; return null; }
            finally { if (c != null) c.disconnect(); }
        }
        return null;
    }
    private static String httpText(String u) { byte[] b = httpBytes(u); return b == null ? null : new String(b, UTF8); }
    private static byte[] readAll(InputStream in) throws IOException {
        try {
            ByteArrayOutputStream o = new ByteArrayOutputStream(); byte[] buf = new byte[16384]; int n;
            while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
            return o.toByteArray();
        } finally { in.close(); }
    }
    static String sha1(InputStream in) throws Exception {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1"); byte[] buf = new byte[16384]; int n;
            while ((n = in.read(buf)) > 0) md.update(buf, 0, n);
            return hex(md.digest());
        } finally { in.close(); }
    }
    private static String hex(byte[] d) { StringBuilder s = new StringBuilder(); for (byte x : d) s.append(String.format("%02x", x & 0xff)); return s.toString(); }
    private static void copy(InputStream in, File o) throws IOException {
        o.getParentFile().mkdirs();
        OutputStream os = new FileOutputStream(o);
        try { byte[] buf = new byte[16384]; int n; while ((n = in.read(buf)) > 0) os.write(buf, 0, n); } finally { os.close(); in.close(); }
    }
    private static String readText(File f) {
        try { return f.isFile() ? new String(readAll(new FileInputStream(f)), UTF8).trim() : null; } catch (Exception e) { return null; }
    }
    private static void writeText(File f, String s) throws IOException {
        f.getParentFile().mkdirs();
        OutputStream os = new FileOutputStream(f); try { os.write(s.getBytes(UTF8)); } finally { os.close(); }
    }
    static void wipe(File f) {
        if (f == null || !f.exists()) return;
        File[] ls = f.listFiles(); if (ls != null) for (File c : ls) wipe(c);
        f.delete();
    }
}
