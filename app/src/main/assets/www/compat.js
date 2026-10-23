/* روائع الأذان: التوافق مع الأجهزة والمتصفحات القديمة
   يُحمَّل قبل باقي الملفات. يضيف ما ينقص المتصفحات القديمة (أندرويد 4.4 فما فوق، شاشات التلفاز الذكية، سفاري القديم)
   ويضع علامات على الصفحة تستعملها الأنماط البديلة. مكتوب بـ ES5 فقط. */
(function(){
"use strict";
var W = window, D = document, H = D.documentElement;

/* وضع المعاينة: لوحة المدير تفتح شاشة مسجد في صفحة جديدة لعرضها كما هي، بدون حفظ أي شيء في هذا الجهاز */
/* وضع الإدارة من الموقع (manage=1): نفس واجهة الإعدادات في التطبيق، والحفظ يذهب لإعدادات الشاشة في الموقع.
   يعمل مثل المعاينة (لا يحفظ في هذا المتصفح ولا يفعّل هذا الجهاز) مع فتح الإعدادات */
W.RAWAYIE_MANAGE = /[?&]manage=1(&|$)/.test(location.search);
W.RAWAYIE_PREVIEW = W.RAWAYIE_MANAGE || /[?&]preview=1(&|$)/.test(location.search);
if (W.RAWAYIE_PREVIEW) H.className += (H.className ? " " : "") + (W.RAWAYIE_MANAGE ? "preview manage" : "preview");

// آخر خطأ في الصفحة يُرسل مع حالة الشاشة للوحة المدير، للتشخيص عن بعد
W.__lastErr = ""; W.addEventListener("error", function(e){ try { W.__lastErr = String(e.message || e.error || "") + (e.filename ? " @" + String(e.filename).split("/").pop().split("?")[0] + ":" + e.lineno : ""); } catch(x){} });

/* ===== دوال ناقصة ===== */
if (typeof Object.assign !== "function") {
  Object.assign = function(t){ if (t == null) throw new TypeError("assign"); var o = Object(t);
    for (var i = 1; i < arguments.length; i++) { var s = arguments[i]; if (s != null) for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) o[k] = s[k]; }
    return o; };
}
if (W.NodeList && !NodeList.prototype.forEach) NodeList.prototype.forEach = Array.prototype.forEach;
var EP = W.Element && Element.prototype;
if (EP && !EP.matches) EP.matches = EP.msMatchesSelector || EP.webkitMatchesSelector || EP.mozMatchesSelector;
if (EP && !EP.closest) EP.closest = function(s){ var el = this; while (el && el.nodeType === 1) { if (el.matches(s)) return el; el = el.parentElement || el.parentNode; } return null; };
if (EP && !EP.remove) EP.remove = function(){ if (this.parentNode) this.parentNode.removeChild(this); };
if (!Array.prototype.find) Array.prototype.find = function(f, t){ for (var i = 0; i < this.length; i++) if (f.call(t, this[i], i, this)) return this[i]; };
if (!String.prototype.trim) String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g, ""); };
if (!Date.now) Date.now = function(){ return new Date().getTime(); };
if (!W.requestAnimationFrame) W.requestAnimationFrame = W.webkitRequestAnimationFrame || function(f){ return setTimeout(function(){ f(Date.now()); }, 16); };

/* وعود (Promise) مبسطة للمتصفحات التي لا تدعمها */
if (typeof W.Promise !== "function") (function(){
  function P(fn){ var self = this; self._s = 0; self._v = undefined; self._q = [];
    function settle(st, v){ if (self._s) return; if (st === 1 && v && (typeof v === "object" || typeof v === "function")) { var th; try { th = v.then; } catch(e){ return settle(2, e); }
        if (typeof th === "function") { var done = false; try { th.call(v, function(x){ if (!done) { done = true; settle(1, x); } }, function(x){ if (!done) { done = true; settle(2, x); } }); } catch(e){ if (!done) { done = true; settle(2, e); } } return; } }
      self._s = st; self._v = v; setTimeout(flush, 0); }
    function flush(){ var q = self._q; self._q = []; for (var i = 0; i < q.length; i++) run(q[i]); }
    function run(h){ var cb = self._s === 1 ? h.f : h.r; if (typeof cb !== "function") { (self._s === 1 ? h.res : h.rej)(self._v); return; }
      try { h.res(cb(self._v)); } catch(e){ h.rej(e); } }
    self._add = function(h){ if (self._s) setTimeout(function(){ run(h); }, 0); else self._q.push(h); };
    try { fn(function(v){ settle(1, v); }, function(e){ settle(2, e); }); } catch(e){ settle(2, e); }
  }
  P.prototype.then = function(f, r){ var me = this; return new P(function(res, rej){ me._add({f:f, r:r, res:res, rej:rej}); }); };
  P.prototype["catch"] = function(r){ return this.then(null, r); };
  P.resolve = function(v){ return v instanceof P ? v : new P(function(res){ res(v); }); };
  P.reject = function(e){ return new P(function(res, rej){ rej(e); }); };
  P.all = function(a){ return new P(function(res, rej){ var n = a.length, out = []; if (!n) return res(out);
    a.forEach(function(x, i){ P.resolve(x).then(function(v){ out[i] = v; if (--n === 0) res(out); }, rej); }); }); };
  W.Promise = P;
})();

/* fetch مبسط فوق XMLHttpRequest */
if (typeof W.fetch !== "function") W.fetch = function(url, o){
  o = o || {};
  return new Promise(function(res, rej){
    var x = new XMLHttpRequest(); x.open(o.method || "GET", url, true);
    var hd = o.headers || {}; for (var k in hd) x.setRequestHeader(k, hd[k]);
    try { x.responseType = "blob"; } catch(e){}
    x.onload = function(){
      var b = x.response, txt = function(){ return typeof b === "string" ? Promise.resolve(b) : new Promise(function(r2){ var fr = new FileReader(); fr.onload = function(){ r2(fr.result); }; fr.readAsText(b); }); };
      res({ok: x.status >= 200 && x.status < 300 || (x.status === 0 && /^(file|data):/.test(url)), status: x.status, type: "basic",
        text: txt, json: function(){ return txt().then(JSON.parse); }, blob: function(){ return Promise.resolve(b instanceof Blob ? b : new Blob([b])); },
        clone: function(){ return this; }});
    };
    x.onerror = function(){ rej(new TypeError("Network request failed")); };
    x.send(o.body || null);
  });
};
if (typeof W.URLSearchParams !== "function") W.URLSearchParams = function(q){
  var m = {}; String(q || "").replace(/^\?/, "").split("&").forEach(function(p){ if (!p) return; var i = p.indexOf("="), k = decodeURIComponent((i < 0 ? p : p.slice(0, i)).replace(/\+/g, " "));
    m[k] = i < 0 ? "" : decodeURIComponent(p.slice(i + 1).replace(/\+/g, " ")); });
  this.get = function(k){ return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; };
  this.has = function(k){ return Object.prototype.hasOwnProperty.call(m, k); };
};

/* ===== فحص دعم الأنماط وإضافة علامات بديلة ===== */
function sup(p, v){ try { return !!(W.CSS && CSS.supports && CSS.supports(p, v)); } catch(e){ return false; } }
var flags = [];
if (!sup("--a", "0")) flags.push("novar");                 // متصفح قديم جداً (أقدم من كروم 49)
if (!sup("aspect-ratio", "1/1")) flags.push("noar");
if (!sup("container-type", "size")) flags.push("nocq");
if (!sup("inset", "0")) flags.push("noinset");
if (!sup("width", "min(1px,2px)")) flags.push("nominmax");
// المسافة بين عناصر flex (gap) غير مدعومة قبل كروم 84 وسفاري 14.1
(function(){ try {
  var f = D.createElement("div"); f.style.cssText = "display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden";
  f.appendChild(D.createElement("div")); f.appendChild(D.createElement("div"));
  (D.body || H).appendChild(f); var ok = f.scrollHeight === 1; f.parentNode.removeChild(f);
  if (!ok) flags.push("nofg");
} catch(e){ flags.push("nofg"); } })();
if (flags.length) H.className += (H.className ? " " : "") + flags.join(" ");
W.COMPAT = {flags: flags};

/* متصفح قديم جداً لا يستطيع رسم الشاشة: رسالة واضحة بدل شاشة مكسورة */
if (flags.indexOf("novar") >= 0) {
  var showOld = function(){
    var m = D.createElement("div");
    m.setAttribute("style", "position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:#4a080a;color:#EBD1A0;font:24px/1.8 Tahoma,Arial,sans-serif;text-align:center;padding:40px;direction:rtl");
    m.innerHTML = "<p style='font-size:34px;font-weight:bold;margin:0 0 20px'>روائع الأذان</p><p>متصفح هذا الجهاز قديم ولا يدعم عرض الشاشة.</p>" +
      "<p>الحل: ثبّت متصفح Google Chrome أو حدّث «Android System WebView» من متجر Google Play، ثم افتح الشاشة منه.</p>" +
      "<p style='font-size:18px;opacity:.75'>This browser is too old. Please install or update Google Chrome / Android System WebView.</p>";
    D.body.appendChild(m);
  };
  if (D.body) showOld(); else D.addEventListener("DOMContentLoaded", showOld);
}

/* ===== بدائل تشغيلية ===== */
// نسبة أبعاد الشعار للمتصفحات التي لا تدعم aspect-ratio
function fixAR(){
  if (flags.indexOf("noar") < 0) return;
  var els = D.querySelectorAll(".lgw");
  for (var i = 0; i < els.length; i++) { var el = els[i], r = /\bsq\b/.test(el.className) ? 1 : 262/420, h = el.offsetHeight;
    if (h) { var w = Math.round(h * r) + "px"; if (el.style.width !== w) el.style.width = w; } }
}
// استعلامات الحاوية (@container) البديلة: تُحسب من عرض منطقة الإعدادات بعد التدوير
function fixCQ(){
  if (flags.indexOf("nocq") < 0) return;
  var ui = D.getElementById("ui"); if (!ui) return;
  var w = ui.offsetWidth, c = ui.className.replace(/\s*\bcq(\d+|w)\b/g, "");
  if (w && w >= 1100) c += " cqw"; if (w && w <= 760) c += " cq760"; if (w && w <= 560) c += " cq560";
  if (ui.className !== c) ui.className = c;
}
function tick(){ try { fixAR(); fixCQ(); } catch(e){} }
W.addEventListener("resize", function(){ setTimeout(tick, 60); });
setInterval(tick, 1500);
D.addEventListener("DOMContentLoaded", tick);

/* هل الصفحة بملء الشاشة الآن (كل المتصفحات، ووضع الكشك والتطبيق المثبت) */
W.isFS = function(){ var d = D;
  if (W.RawayieAndroid) return true; // تطبيق أندرويد يعمل بملء الشاشة دائماً
  if (d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement) return true;
  try { if (W.matchMedia && (matchMedia("(display-mode: fullscreen)").matches || matchMedia("(display-mode: standalone)").matches)) return true; } catch(e){}
  return !!navigator.standalone;
};

/* ===== منع السكون: يبقي الشاشة والجهاز يعملان طوال الوقت =====
   1) Wake Lock في المتصفحات الحديثة. 2) بديل للمتصفحات القديمة والتلفزيونات: فيديو صغير صامت يعمل باستمرار
   فيمنع الجهاز من اعتبار الصفحة خاملة. يُعاد تفعيله كل دقيقة وعند العودة للصفحة وبعد أي لمسة */
var NOSLEEP = "data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAMsEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHWTbuMU6uEElTDZ1OsggEnTbuMU6uEHFO7a1OsggMW7AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmsCrXsYMPQkBNgIxMYXZmNjEuMS4xMDBXQYxMYXZmNjEuMS4xMDBEiYhAp3AAAAAAABZUrmvMrgEAAAAAAABD14EBc8WIPMJbl1jILaScgQAitZyDdW5kiIEAhoVWX1ZQOIOBASPjg4QL68IA4JSwgRC6gRCagQJVsIhVt4ECVbiBAhJUw2f6c3OfY8CAZ8iZRaOHRU5DT0RFUkSHjExhdmY2MS4xLjEwMHNz1WPAi2PFiDzCW5dYyC2kZ8igRaOHRU5DT0RFUkSHk0xhdmM2MS4zLjEwMCBsaWJ2cHhnyKFFo4hEVVJBVElPTkSHkzAwOjAwOjAzLjAwMDAwMDAwMAAfQ7Z1QWrngQCjo4EAAIAQAgCdASoQABAAAEcIhYWIhYSIAgIADA1gAP7/q1CAo5WBAMgAsQEAARAQABgAGFgv9AAIAACjlYEBkACxAQABEBAAGAAYWC/0AAgAAKOVgQJYALEBAAEQEAAYABhYL/QACAAAo5WBAyAAsQEAARAQABgAGFgv9AAIAACjlYED6ACxAQABEBAAGAAYWC/0AAgAAKOVgQSwALEBAAEQEAAYABhYL/QACAAAo5WBBXgAsQEAARAQFGAAYWC/0AAgAACjlYEGQACxAQABEBAAGAAYWC/0AAgAAKOVgQcIALEBAAEQEAAYABhYL/QACAAAo5WBB9AAsQEAARAQABgAGFgv9AAIAACjlYEImACxAQABEBAAGAAYWC/0AAgAAKOVgQlgALEBAAEQEAAYABhYL/QACAAAo5WBCigAsQEAARAQABgAGFgv9AAIAACjlYEK8ACxAQABEBAAGAAYWC/0AAgAABxTu2uRu4+zgQC3iveBAfGCAabwgQM=";
var AW = W.STAY_AWAKE = {method:"", lock:null, video:null};
function videoAwake(){
  // تطبيق أندرويد يبقي الشاشة تعمل من النظام نفسه: لا حاجة للفيديو (كان يجعل محتوى الشاشة يُرسم كطبقة منفصلة فيقل وضوحه في بعض الأجهزة)
  if (W.RawayieAndroid) return;
  try {
    var v = AW.video;
    if (!v) { v = AW.video = D.createElement("video"); v.setAttribute("muted", ""); v.muted = true; v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", ""); v.loop = true;
      v.setAttribute("aria-hidden", "true"); v.style.cssText = "position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:.01;pointer-events:none;z-index:2147483647";
      v.src = NOSLEEP; (D.body || H).appendChild(v); }
    var p = v.play(); if (p && p.then) p.then(function(){ if (AW.method !== "wakelock") AW.method = "video"; }, function(){ if (!AW.method) AW.method = "pending"; });
    else if (AW.method !== "wakelock") AW.method = "video";
  } catch(e){}
}
function wake(){
  if (D.hidden) return;
  if (navigator.wakeLock && navigator.wakeLock.request) {
    if (AW.lock) return;
    navigator.wakeLock.request("screen").then(function(l){ AW.lock = l; AW.method = "wakelock"; l.addEventListener("release", function(){ AW.lock = null; setTimeout(wake, 1000); }); }, function(){ videoAwake(); });
  } else videoAwake();
}
D.addEventListener("visibilitychange", function(){ if (!D.hidden) wake(); });
["click", "touchstart", "keydown", "pointerdown"].forEach(function(e){ D.addEventListener(e, function(){ wake(); if (AW.method !== "wakelock") videoAwake(); }, true); });
setInterval(wake, 60000);
if (D.body) wake(); else D.addEventListener("DOMContentLoaded", wake);
})();
