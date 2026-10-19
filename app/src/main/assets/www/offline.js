/* روائع الأذان: تجهيز الشاشة للعمل بدون إنترنت */
(function(){
"use strict";
var A = window.APP, S = A.S;
var FONT_FILES = {"Cairo":["Cairo-Regular.ttf","Cairo-Bold.ttf"],"Tajawal":["Tajawal-Regular.ttf","Tajawal-Bold.ttf"],"Noto Sans Arabic":["NotoSansArabic-Bold.ttf"],
  "Noto Naskh Arabic":["NotoNaskhArabic-Bold.ttf"],"Amiri":["AmiriBold.ttf"],"Scheherazade New":["ScheherazadeNew-Bold.ttf"],"UthmanicHafs":["UthmanicHafs_V22.ttf"],
  "UthmanTaha":["KFGQPCUthmanTaha.ttf"],"MadinahHafs":["uthmanic_hafs_v20.ttf"],"UthmanTN":["UthmanTNB_v2-0.ttf"],"Othmani":["Othmani-Regular.ttf"],
  "Sultan":["SFSultan-Black.ttf"],"BaradaReqa":["BaradaReqa.ttf"],"MohammadArt":["mohammadboldart1.ttf"],"KSA":["KSARegular.ttf"],"Foda":["FodaFreeFont.ttf"]};
var st = {supported:false, ready:false, busy:false, done:0, total:0, fail:0, at:0, err:""};
try { var sv = JSON.parse(localStorage.getItem("rawayie-offline") || "null"); if (sv) { st.at = sv.at; st.done = sv.done; st.total = sv.total; st.fail = sv.fail; } } catch(e){}

// الملفات التي تحتاجها الشاشة حسب إعداداتها الحالية
function needed(){
  var u = [], add = function(x){ if (x && u.indexOf(x) < 0) u.push(x); }, L = S.look;
  if (!S.custom.on && S.city) add("uq/" + S.city + ".js");
  [L.fontText, L.fontNum, L.fontZekr].forEach(function(f){ (FONT_FILES[f] || []).forEach(function(x){ add("fonts/" + x); }); });
  (S.boards.items || []).forEach(function(b){ [b.tFont, b.bFont].forEach(function(f){ (FONT_FILES[f] || []).forEach(function(x){ add("fonts/" + x); }); }); });
  (S.slides.items || []).forEach(function(s){ [s.tFont, s.bFont].forEach(function(f){ (FONT_FILES[f] || []).forEach(function(x){ add("fonts/" + x); }); }); });
  // الخلفيات: كلها إذا كانت تتغير تلقائياً، وإلا الحالية فقط
  var all = (L.bgMode && L.bgMode !== "manual") || S.offlineAllBg;
  (all ? (A.bgList ? A.bgList("P").concat(A.bgList("L")) : window.BG_P.concat(window.BG_L)) : [[L.bgP], [L.bgL]]).forEach(function(b){ if (b[0]) add("bg/" + b[0]); });
  // الأصوات المختارة
  if (S.snd.azan === "long") add("snd/azan_long.mp3");
  // صور من الخادم (مكتبة الوسائط في ووردبريس)
  var url = function(x){ return /^(https?:)?\/\//.test(String(x || "")) || /^\/[^/]/.test(String(x || "")); };
  [L.customBg, L.logoId, S.snd.azanId, S.snd.iqamaId].forEach(function(x){ if (url(x)) add(x); });
  (S.slides.items || []).forEach(function(s){ if (url(s.img)) add(s.img); });
  (S.boards.items || []).forEach(function(b){ if (url(b.img)) add(b.img); });
  if (S.weather.on) ["clear_day","clear_night","cloudy","fog","haze","rain","thunder","thunder_rain","unknown"].forEach(function(w){ add("img/" + w + ".png"); });
  return u;
}
function prepare(){
  if (!st.supported || !navigator.serviceWorker.controller) return Promise.resolve(st);
  var urls = needed(); st.busy = true; st.total = urls.length;
  return new Promise(function(res){
    var ch = new MessageChannel();
    ch.port1.onmessage = function(e){ var d = e.data || {}; st.busy = false; st.done = d.done; st.fail = d.fail; st.total = d.total; st.at = Date.now(); st.ready = !d.fail;
      try { localStorage.setItem("rawayie-offline", JSON.stringify({at:st.at, done:st.done, total:st.total, fail:st.fail})); } catch(err){}
      res(st); };
    navigator.serviceWorker.controller.postMessage({type:"prepare", urls:urls}, [ch.port2]);
    setTimeout(function(){ if (st.busy) { st.busy = false; res(st); } }, 120000);
  });
}
var prepT = null;
function schedule(){ clearTimeout(prepT); prepT = setTimeout(prepare, 4000); }

function start(){
  if (window.RAWAYIE_PREVIEW) { st.err = "preview"; return; }
  if (window.RawayieAndroid) { st.err = "apk"; return; } // تطبيق أندرويد: كل الملفات داخل التطبيق
  // يحتاج رابط https أو localhost. لا يعمل من ملف محلي (والنسخة المحلية تعمل بدون إنترنت أصلاً)
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) { st.err = location.protocol === "file:" ? "file" : "unsupported"; return; }
  try {
    // نسخة جديدة من البرنامج (بعد تحديث الإضافة): تُعاد تحميل الشاشة مرة واحدة لتعمل بالتحديث مباشرة
    var hadCtrl = !!navigator.serviceWorker.controller, reloaded = false;
    // إذا كانت الشاشة بملء الشاشة لا تُعاد تحميلها (إعادة التحميل تخرجها من ملء الشاشة)؛ التحديث يعمل عند التشغيل التالي.
    // الإعدادات والإعلانات والرسائل تصل مباشرة بدون إعادة تحميل في كل الأحوال
    navigator.serviceWorker.addEventListener("controllerchange", function(){ if (hadCtrl && !reloaded && !(window.isFS && window.isFS())) { reloaded = true; setTimeout(function(){ location.reload(); }, 800); } });
    navigator.serviceWorker.register("sw.js").then(function(reg){ st.supported = true;
      setInterval(function(){ try { reg.update(); } catch(e){} }, 30*60000);
      return navigator.serviceWorker.ready; }).then(function(){
      if (navigator.serviceWorker.controller) schedule();
      else navigator.serviceWorker.addEventListener("controllerchange", schedule, {once:true});
    }).catch(function(e){ st.err = String(e && e.message || e); });
  } catch(e){ st.err = "unsupported"; }
}
// كل حفظ للإعدادات يحدّث الملفات المحفوظة
var prevSave = A.save;
A.save = function(){ prevSave(); if (st.supported) schedule(); };

/* ===== المتصفح والتثبيت والحفظ الدائم ===== */
// اسم المتصفح وإصداره، وهل يدعم العمل بدون إنترنت
function browser(){
  var u = navigator.userAgent, m, n = "متصفح غير معروف", v = "";
  if ((m = u.match(/FullyKiosk|Fully/))) n = "Fully Kiosk Browser";
  else if ((m = u.match(/SamsungBrowser\/([\d.]+)/))) { n = "Samsung Internet"; v = m[1]; }
  else if ((m = u.match(/Edg(?:e|A|iOS)?\/([\d.]+)/))) { n = "Microsoft Edge"; v = m[1]; }
  else if ((m = u.match(/OPR\/([\d.]+)/))) { n = "Opera"; v = m[1]; }
  else if ((m = u.match(/(?:Firefox|FxiOS)\/([\d.]+)/))) { n = "Firefox"; v = m[1]; }
  else if (/; wv\)/.test(u) && (m = u.match(/Chrome\/([\d.]+)/))) { n = "Android WebView"; v = m[1]; }
  else if ((m = u.match(/(?:Chrome|CriOS)\/([\d.]+)/))) { n = "Google Chrome"; v = m[1]; }
  else if ((m = u.match(/Version\/([\d.]+).*Safari/))) { n = "Safari"; v = m[1]; }
  var os = /Android/.test(u) ? "android" : /iPhone|iPad|iPod/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1) ? "ios" : /Windows/.test(u) ? "win" : /Mac OS/.test(u) ? "mac" : /CrOS/.test(u) ? "chromeos" : /Linux/.test(u) ? "linux" : "other";
  return {name:n, ver:v.split(".")[0], os:os, sw:"serviceWorker" in navigator, file:location.protocol === "file:"};
}
st.browser = browser();
st.standalone = !!((window.matchMedia && (matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches)) || navigator.standalone);
st.canInstall = false; st.persisted = null; st.usage = 0; st.quota = 0;
var installEvt = null;
window.addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); installEvt = e; st.canInstall = true; });
window.addEventListener("appinstalled", function(){ installEvt = null; st.canInstall = false; st.installed = true; });
function install(){
  if (!installEvt) return Promise.resolve(false);
  installEvt.prompt();
  return (installEvt.userChoice || Promise.resolve({})).then(function(c){ var ok = c && c.outcome === "accepted"; if (ok) { installEvt = null; st.canInstall = false; st.installed = true; } return ok; });
}
// الحفظ الدائم: يمنع المتصفح من حذف ملفات الشاشة وصورها عند امتلاء الذاكرة
function persist(ask){
  var sm = navigator.storage;
  if (!sm || !sm.persisted) { st.persisted = null; return Promise.resolve(null); }
  return sm.persisted().then(function(p){
    if (p || !ask || !sm.persist) return p;
    return sm.persist();
  }).then(function(p){ st.persisted = !!p; return st.persisted; }).catch(function(){ return null; });
}
function estimate(){
  var sm = navigator.storage; if (!sm || !sm.estimate) return Promise.resolve(st);
  return sm.estimate().then(function(e){ st.usage = e.usage || 0; st.quota = e.quota || 0; return st; }).catch(function(){ return st; });
}
// كروم وإيدج يمنحان الحفظ الدائم بدون سؤال للمواقع المثبتة أو المستخدمة كثيراً. فايرفوكس يسأل، فيُطلب منه بزر فقط
setTimeout(function(){ persist(!/Firefox/.test(navigator.userAgent)); estimate(); }, 3000);

window.OFFLINE = {state:st, prepare:prepare, needed:needed, install:install, persist:persist, estimate:estimate, browser:browser};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
