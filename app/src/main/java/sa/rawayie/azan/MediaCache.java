package sa.rawayie.azan;

import android.net.Uri;
import android.webkit.WebResourceResponse;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/* ===== حفظ صور الشاشة وأصواتها على الجهاز للعمل بدون إنترنت =====
   أغلب المساجد بلا إنترنت: الشاشة تتصل وقت الإعداد فقط، ثم يُفصل الإنترنت.
   الصور والأصوات المرفوعة من لوحة الإدارة (الإعلانات، الخلفية، الشعار، صوت الأذان) روابط من الموقع،
   فكل ملف منها يُنزَّل مرة واحدة ويُحفظ هنا، ثم يُعرض من الجهاز دائماً حتى بدون إنترنت.
   إذا كان الإنترنت متاحاً يُتحقق من الملف المحفوظ في الخلفية مرة كل يوم. */
final class MediaCache {
    private static final long MAX_FILE = 40L * 1024 * 1024, MAX_TOTAL = 400L * 1024 * 1024, RECHECK = 24L * 3600 * 1000;
    private static final Map<String, String> MIME = new HashMap<>();
    static {
        MIME.put("jpg", "image/jpeg"); MIME.put("jpeg", "image/jpeg"); MIME.put("png", "image/png"); MIME.put("webp", "image/webp");
        MIME.put("gif", "image/gif"); MIME.put("svg", "image/svg+xml"); MIME.put("bmp", "image/bmp");
        MIME.put("mp3", "audio/mpeg"); MIME.put("m4a", "audio/mp4"); MIME.put("aac", "audio/aac"); MIME.put("ogg", "audio/ogg"); MIME.put("wav", "audio/wav");
        MIME.put("ttf", "font/ttf"); MIME.put("otf", "font/otf"); MIME.put("woff", "font/woff"); MIME.put("woff2", "font/woff2");
    }
    private final File dir;
    private final Map<String, Long> checking = new HashMap<>();

    MediaCache(File filesDir) { dir = new File(filesDir, "media"); dir.mkdirs(); }

    /** ملف صورة أو صوت من الإنترنت يمكن حفظه (وليس صفحات أو واجهة REST) */
    static String mimeOf(Uri u, String method) {
        if (u == null || method == null || !"GET".equalsIgnoreCase(method)) return null;
        String sc = u.getScheme(); if (!"https".equals(sc) && !"http".equals(sc)) return null;
        if (u.getQueryParameter("rest_route") != null) return null;
        String p = u.getPath(); if (p == null || p.contains("/wp-json/")) return null;
        int i = p.lastIndexOf('.'); if (i < 0) return null;
        return MIME.get(p.substring(i + 1).toLowerCase(Locale.ROOT));
    }

    private File fileFor(String url) {
        try {
            byte[] h = MessageDigest.getInstance("SHA-1").digest(url.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder(); for (byte b : h) sb.append(String.format("%02x", b));
            return new File(dir, sb.toString());
        } catch (Exception e) { return null; }
    }

    /** يُستدعى من shouldInterceptRequest: يعيد الملف المحفوظ، أو ينزّله ويحفظه، أو null ليتصرف المتصفح كالمعتاد */
    WebResourceResponse serve(Uri u, String method) {
        String mime = mimeOf(u, method); if (mime == null) return null;
        String url = u.toString(); File f = fileFor(url); if (f == null) return null;
        if (f.isFile() && f.length() > 0) {
            if (System.currentTimeMillis() - f.lastModified() > RECHECK) recheckLater(url, f);
            return open(f, mime);
        }
        if (download(url, f)) return open(f, mime);
        return null; // بدون إنترنت ولم يُحفظ من قبل
    }

    private WebResourceResponse open(File f, String mime) {
        try {
            Map<String, String> h = new HashMap<>();
            h.put("Access-Control-Allow-Origin", "*");
            h.put("Cache-Control", "no-cache");
            h.put("Content-Length", String.valueOf(f.length()));
            InputStream in = new FileInputStream(f);
            return new WebResourceResponse(mime, mime.startsWith("image/svg") ? "utf-8" : null, 200, "OK", h, in);
        } catch (Exception e) { return null; }
    }

    private boolean download(String url, File f) {
        HttpURLConnection c = null; File tmp = new File(f.getPath() + ".part");
        try {
            String cur = url;
            for (int hop = 0; hop < 4; hop++) {
                c = (HttpURLConnection) new URL(cur).openConnection();
                c.setConnectTimeout(8000); c.setReadTimeout(20000); c.setInstanceFollowRedirects(false);
                if (Ota.userAgent != null) c.setRequestProperty("User-Agent", Ota.userAgent);
                int code = c.getResponseCode();
                if (code >= 300 && code < 400 && c.getHeaderField("Location") != null) { cur = new URL(new URL(cur), c.getHeaderField("Location")).toString(); c.disconnect(); c = null; continue; }
                if (code != 200) return false;
                long len = c.getContentLengthLong(); if (len > MAX_FILE) return false;
                long total = 0;
                try (InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(tmp)) {
                    byte[] buf = new byte[32768]; int n;
                    while ((n = in.read(buf)) > 0) { total += n; if (total > MAX_FILE) throw new java.io.IOException("too big"); out.write(buf, 0, n); }
                }
                if (total == 0 || (len > 0 && total != len)) { tmp.delete(); return false; }
                if (f.exists()) f.delete();
                if (!tmp.renameTo(f)) { tmp.delete(); return false; }
                prune();
                return true;
            }
            return false;
        } catch (Throwable t) { tmp.delete(); return false; }
        finally { if (c != null) c.disconnect(); }
    }

    /** تحقق في الخلفية: إن تغيّر الملف في الموقع يُستبدل، وإن لم يتوفر الإنترنت يبقى المحفوظ كما هو */
    private void recheckLater(final String url, final File f) {
        synchronized (checking) {
            Long t = checking.get(url); long now = System.currentTimeMillis();
            if (t != null && now - t < 3600000L) return;
            checking.put(url, now);
        }
        Thread th = new Thread(() -> {
            File n = new File(f.getPath() + ".new");
            if (download(url, n)) { if (n.length() != f.length() || !same(n, f)) { f.delete(); n.renameTo(f); } else { n.delete(); } }
            f.setLastModified(System.currentTimeMillis());
        }, "rawayie-media");
        th.setDaemon(true); th.setPriority(Thread.MIN_PRIORITY); th.start();
    }

    private static boolean same(File a, File b) {
        try (InputStream x = new FileInputStream(a); InputStream y = new FileInputStream(b)) {
            byte[] p = new byte[32768], q = new byte[32768];
            while (true) { int n = x.read(p), m = y.read(q); if (n != m) return false; if (n <= 0) return true; for (int i = 0; i < n; i++) if (p[i] != q[i]) return false; }
        } catch (Exception e) { return false; }
    }

    /** حد أعلى للمساحة: يُحذف الأقدم استخداماً */
    private void prune() {
        File[] l = dir.listFiles(); if (l == null) return;
        long sum = 0; for (File x : l) sum += x.length();
        if (sum <= MAX_TOTAL) return;
        Arrays.sort(l, (a, b) -> Long.compare(a.lastModified(), b.lastModified()));
        for (File x : l) { if (sum <= MAX_TOTAL * 0.8) break; sum -= x.length(); x.delete(); }
    }

    /** عدد الملفات المحفوظة وحجمها (لصفحة الحالة) */
    String info() {
        File[] l = dir.listFiles(); long sum = 0; int n = 0;
        if (l != null) for (File x : l) if (!x.getName().endsWith(".part") && !x.getName().endsWith(".new")) { n++; sum += x.length(); }
        return "{\"n\":" + n + ",\"bytes\":" + sum + "}";
    }
}
