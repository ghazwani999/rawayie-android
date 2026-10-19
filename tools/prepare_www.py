#!/usr/bin/env python3
"""ينسخ ملفات تطبيق روائع الأذان إلى داخل تطبيق أندرويد (app/src/main/assets/www).
الاستخدام:  python3 tools/prepare_www.py  مسار_مجلد_التطبيق   [رابط_الموقع]
مثال:       python3 tools/prepare_www.py ../rawayie-screen https://rawayie.sa
"""
import os, re, shutil, sys
src = sys.argv[1] if len(sys.argv) > 1 else "../rawayie-screen"
site = (sys.argv[2] if len(sys.argv) > 2 else "https://rawayie.sa").rstrip("/")
dst = os.path.join(os.path.dirname(__file__), "..", "app", "src", "main", "assets", "www")
if not os.path.isfile(os.path.join(src, "index.html")): sys.exit("لم أجد index.html في: " + src)
if os.path.isdir(dst): shutil.rmtree(dst)
skip = re.compile(r"(\.(bat|txt|md|zip|php)$)|^(admin\.html|sw\.js)$")
for root, dirs, files in os.walk(src):
    rel = os.path.relpath(root, src)
    for f in files:
        if skip.search(f): continue
        o = os.path.join(dst, rel, f); os.makedirs(os.path.dirname(o), exist_ok=True)
        shutil.copy2(os.path.join(root, f), o)
p = os.path.join(dst, "index.html"); s = open(p, encoding="utf-8").read()
s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<script>window.RAWAYIE_SITE = "%s"; window.RAWAYIE_APK = 1;</script>' % site, 1)
s = s.replace('<link rel="manifest" href="manifest.webmanifest">\n', "")
open(p, "w", encoding="utf-8").write(s)
n = sum(len(f) for _, _, f in os.walk(dst)); print("تم نسخ", n, "ملف إلى", os.path.normpath(dst))
