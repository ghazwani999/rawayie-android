/* روائع الأذان: ترخيص الشاشة
   - الترخيص يصدر من موقع الإدارة فقط، موقّعاً بتوقيع رقمي Ed25519. التطبيق فيه المفتاح العام فقط (lic-key.js)،
     فلا يمكن صنع ترخيص بقراءة ملفات التطبيق أو تعديلها.
   - الترخيص مرتبط برقم هذا الجهاز وبرمز الشاشة، ويجدده التطبيق تلقائياً من الموقع، ويبقى صالحاً 14 يوماً بدون إنترنت.
   - الشاشة غير المرتبطة بموقع الإدارة، أو الموقوفة من الإدارة، لا تعمل وتظهر رسالة التفعيل. */
(function(){
"use strict";
var A = window.APP; if (!A) return;
var S = A.S;
var WA = "0540450400", WA_INTL = "966540450400", DAY = 864e5;
var LSK = "rawayie-lic", WAIT_MS = 3 * DAY; // مهلة لمرة واحدة للشاشات المفعّلة بالإصدار السابق حتى تجلب ترخيصها الجديد بدون انقطاع
var bootAt = Date.now();

function normId(x){ return String(x || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function newId(){ var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
  var r = new Uint8Array(8); try { (window.crypto || window.msCrypto).getRandomValues(r); } catch(e){ for (var k = 0; k < 8; k++) r[k] = Math.floor(Math.random() * 256); }
  for (var i = 0; i < 8; i++) s += c.charAt(r[i] % 32); return s; }
function fmtId(id){ id = normId(id); return id.slice(0, 4) + "-" + id.slice(4); }
function mul32(a, b){ return (((a & 0xffff) * b) + ((((a >>> 16) * b) & 0xffff) << 16)) >>> 0; }
function h32(str, seed){ var h = seed >>> 0; for (var i = 0; i < str.length; i++) { h = (h ^ str.charCodeAt(i)) >>> 0; h = mul32(h, 16777619); } return h >>> 0; }

/* ===== التحقق من التوقيع ===== */
function b64(s){ var bin = atob(String(s || "")), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function pubKey(){ return window.RWS_PK || st.pk || ""; }
var vCache = {t:"", k:"", p:null};
function parse(tok){
  tok = String(tok || ""); var pk = pubKey();
  if (!tok || !pk || !window.nacl) return null;
  var ck = pk + "|" + st.id + "|" + (S.remote && S.remote.code || "");
  if (vCache.t === tok && vCache.k === ck) return vCache.p;
  var p = null;
  try {
    var parts = tok.split("."), msg = b64(parts[0]), sig = b64(parts[1]), key = b64(pk);
    if (parts.length === 2 && sig.length === 64 && key.length === 32 && window.nacl.sign.detached.verify(msg, sig, key)) {
      var j = JSON.parse(decodeURIComponent(escape(atob(parts[0]))));
      if (j && j.v === 1 && normId(j.dev) === st.id && (!S.remote || !S.remote.code || j.code === S.remote.code)) p = j;
    }
  } catch(e){ p = null; }
  vCache = {t:tok, k:ck, p:p};
  return p;
}

/* ===== الحفظ في أكثر من مكان حتى لا يضيع رقم الجهاز والترخيص بسهولة ===== */
var AN = window.RawayieAndroid;
function readAll(){
  var list = [];
  try { list.push(JSON.parse(localStorage.getItem(LSK) || "null")); } catch(e){}
  try { var m = document.cookie.match(/(?:^|; )rwlic=([^;]*)/); if (m) list.push(JSON.parse(decodeURIComponent(m[1]))); } catch(e){}
  try { if (AN && AN.licGet) list.push(JSON.parse(AN.licGet() || "null")); } catch(e){}
  return list.filter(function(x){ return x && typeof x === "object"; });
}
function merge(list){
  var r = {id:"", last:0, lic:"", pk:"", link:null, wait:0, waitUsed:0, denied:null, legacy:0, oldCode:""};
  list.forEach(function(x){
    if (!r.id && normId(x.id).length === 8) r.id = normId(x.id);
    if (+x.last > r.last) r.last = +x.last;
    if (!r.pk && x.pk) r.pk = String(x.pk);
    if (+x.wait > 0 && (!r.wait || +x.wait < r.wait)) r.wait = +x.wait;
    if (x.waitUsed) r.waitUsed = 1;
    if (x.legacy || x.code || +x.start > 0) r.legacy = 1; // جهاز كان يعمل بالإصدار السابق
    var oc = String(x.oldCode || x.code || "").replace(/\D/g, ""); if (!r.oldCode && oc.length === 8) r.oldCode = oc; // كود التفعيل القديم: يتحقق منه الموقع فقط
    if (!r.denied && x.denied && x.denied.code) r.denied = x.denied;
    if (!r.link && x.link && x.link.server && x.link.code) r.link = x.link; // نسخة احتياطية من ربط الشاشة بلوحة المدير
  });
  // أحدث ترخيص سليم التوقيع
  var best = null; st = r;
  list.forEach(function(x){ var p = x.lic ? parse(x.lic) : null; if (p && (!best || p.iat > best.p.iat)) best = {t:x.lic, p:p}; });
  if (best) r.lic = best.t;
  return r;
}
var st = {id:""};
st = merge(readAll());
function save(){
  var j = JSON.stringify(st);
  try { localStorage.setItem(LSK, j); } catch(e){}
  try { document.cookie = "rwlic=" + encodeURIComponent(j) + "; max-age=315360000; path=/; SameSite=Lax"; } catch(e){}
  try { if (AN && AN.licSet) AN.licSet(j); } catch(e){}
  try { A.IDB.put("__lic", j); } catch(e){}
}
// رقم الجهاز في تطبيق أندرويد مشتق من معرّف الجهاز الثابت: يبقى نفسه بعد حذف التطبيق وإعادة تثبيته
function stableId(){
  try { var d = AN && AN.deviceId ? String(AN.deviceId() || "") : ""; if (d.length < 6 || d === "9774d56d682e549c") return "";
    var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", h1 = h32("rw-dev|" + d, 2166136261), h2 = h32(d + "|rw-dev", 84696351), out = "";
    for (var i = 0; i < 4; i++) { out += c.charAt(h1 % 32); h1 = Math.floor(h1 / 32); }
    for (var j = 0; j < 4; j++) { out += c.charAt(h2 % 32); h2 = Math.floor(h2 / 32); }
    return out; } catch(e){ return ""; }
}
if (!st.id) st.id = stableId() || newId();
if (window.RWS_PK && st.pk !== window.RWS_PK) st.pk = window.RWS_PK; // المفتاح العام من الموقع له الأولوية ويُحفظ للعمل بدون إنترنت
// نسخة احتياطية في قاعدة بيانات المتصفح: تُكمل البيانات إذا مُسح التخزين المحلي فقط
try { A.IDB.get("__lic").then(function(v){ if (!v) return; var r = merge([st, JSON.parse(v)]); if (r.id !== st.id || r.lic !== st.lic || (!st.link && r.link)) { st = r; save(); if (restoreLink() && window.REMOTE && window.REMOTE.start) window.REMOTE.start(); refresh(); } else st = r; }).catch(function(){}); } catch(e){}
save();
/* الشاشة المرتبطة سابقاً بلوحة المدير لا تطلب كود الربط مرة أخرى: إذا ضاعت إعداداتها يُعاد ربطها تلقائياً من النسخة الاحتياطية */
function restoreLink(){
  var l = st.link, R = S.remote || {};
  if (window.RAWAYIE_PREVIEW || !l || !l.server || !l.code || (R.on && R.server)) return false;
  S.remote = R; R.on = true; R.server = l.server; R.code = l.code; R.key = l.key || ""; if (l.site) R.site = l.site;
  try { A.save(); } catch(e){}
  return true;
}
restoreLink();
function setLink(l){
  var n = l && l.server && l.code ? {server:l.server, code:l.code, key:l.key || "", site:l.site || ""} : null;
  if (JSON.stringify(n) === JSON.stringify(st.link || null)) return;
  st.link = n; save();
}
function linked(){ var R = S.remote || {}; return !!(R.on && R.server && R.code); }

function status(){
  var now = Date.now();
  if (now > st.last) { st.last = now; if (!status.t || now - status.t > 600000) { status.t = now; save(); } }
  var ref = Math.max(now, st.last); // إرجاع ساعة الجهاز للخلف لا يطيل الترخيص
  var p = parse(st.lic), valid = !!(p && p.exp * 1000 > ref);
  if (valid && !st.waitUsed) { st.waitUsed = 1; st.denied = null; save(); }
  var migr = !linked() && !!st.oldCode && !!siteKnown(); // مفعّلة سابقاً وغير مرتبطة: تُضاف للوحة الإدارة تلقائياً
  if (!valid && (linked() || migr) && !st.wait && !st.waitUsed) { st.wait = now; save(); }
  var pending = !valid && (linked() || migr) && !st.denied && ((!st.waitUsed && st.legacy && st.wait > 0 && ref - st.wait < WAIT_MS) || (!firstDone && now - bootAt < 15000));
  var active = valid && p.st === "active", trial = valid && p.st === "trial";
  var end = valid ? (p.until ? p.until * 1000 : 0) : 0, left = end ? end - ref : 0;
  return {id:st.id, idText:fmtId(st.id), active:active, trial:trial, pending:pending, expired:!valid && !pending,
    leftMs:Math.max(0, left), leftDays:Math.max(0, Math.ceil(left / DAY)), until:end,
    offlineDays:valid ? Math.max(0, Math.ceil((p.exp * 1000 - ref) / DAY)) : 0, renewedAt:valid ? p.iat * 1000 : 0,
    linked:linked(), msg:st.denied ? st.denied.msg : "", wa:WA, waLink:"https://wa.me/" + WA_INTL};
}

/* ===== جلب الترخيص من موقع الإدارة ===== */
var busy = false, firstDone = false;
function fetchLic(){
  var R = window.REMOTE;
  if (busy || window.RAWAYIE_PREVIEW || !R || !R.url || !linked()) return Promise.resolve(false);
  busy = true;
  var u = R.url("/license"); u += (u.indexOf("?") >= 0 ? "&" : "?") + "dev=" + encodeURIComponent(st.id) + "&_=" + Date.now();
  return fetch(u, {cache:"no-store"}).then(function(res){
    return res.text().then(function(t){ var j = null; try { j = t ? JSON.parse(t) : null; } catch(e){}
      if (res.ok && j && j.lic) {
        if (!window.RWS_PK && !st.pk && j.pk) st.pk = String(j.pk); // نسخة محلية بدون ملف المفتاح: يُعتمد مفتاح أول اتصال ناجح ويثبت بعده
        var p = parse(j.lic);
        if (p) { st.lic = j.lic; st.denied = null; save(); refresh(); return true; }
        return false;
      }
      // رفض صريح من الموقع (إيقاف، انتهاء، جهاز آخر، رمز غير صحيح): يتوقف الترخيص فوراً
      if (res.status === 401 || res.status === 403 || res.status === 404 || (j && /^rws_lic_/.test(j.code || ""))) {
        st.lic = ""; st.denied = {code:(j && j.code) || "http" + res.status, msg:(j && j.message && /^rws_lic_/.test(j.code || "")) ? j.message : "تعذر التحقق من هذه الشاشة في موقع الإدارة. تواصل مع إدارة التطبيق", at:Date.now()};
        save(); refresh();
      }
      return false;
    });
  }).catch(function(){ return false; }).then(function(r){ busy = false; if (!firstDone) { firstDone = true; refresh(); } return r; });
}
// التجديد: كل ساعة إن كان الترخيص سارياً، وكل دقيقة إن لم يكن (حتى يصل تفعيل المدير بسرعة)
var lastTry = 0;
var migBusy = false;
function migrate(site){
  var R = window.REMOTE; if (migBusy || !R || !R.activate || !st.oldCode || !site) return Promise.resolve(false);
  migBusy = true;
  return R.activate(site, "", st.oldCode).then(function(){ st.oldCode = ""; st.denied = null; save(); return fetchLic(); },
    function(e){ if (e && e.hard) { st.oldCode = ""; save(); refresh(); } return false; }) // كود قديم غير صحيح: لا يُعاد المحاولة
    .then(function(r){ migBusy = false; if (!firstDone) { firstDone = true; refresh(); } return r; });
}
function tick(){
  if (window.RAWAYIE_PREVIEW) return;
  if (!linked()) { if (st.oldCode && siteKnown() && Date.now() - lastTry > 6e4) { lastTry = Date.now(); migrate(siteKnown()); } return; }
  var p = parse(st.lic), now = Date.now(), ok = p && p.exp * 1000 > now;
  var age = ok ? now - p.iat * 1000 : Infinity, gap = now - lastTry;
  if ((ok && age > 36e5 && gap > 36e5) || (!ok && gap > 6e4)) { lastTry = now; fetchLic(); }
}

/* ===== العرض على الشاشة ===== */
var ov = null, badge = null, ovKey = "";
function stage(){ return document.getElementById("stage"); }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function daysText(n){ return n <= 1 ? "يوم واحد" : n === 2 ? "يومان" : n + " أيام"; }
function siteKnown(){ var R = window.REMOTE; return (R && R.wpSite && R.wpSite()) || (S.remote && S.remote.site) || ""; }
function render(){
  var s = status(), sg = stage(); if (!sg) return;
  if (badge && !sg.contains(badge)) badge = null; // أُعيد بناء الشاشة
  if (ov && !sg.contains(ov)) { if (ov._stop) ov._stop(); ov = null; }
  document.body.classList.toggle("licon", s.expired);
  // شريط صغير: تجربة، أو تحقق أول مرة، أو قرب انتهاء مدة العمل بدون إنترنت
  var bt = s.trial ? "نسخة تجريبية · متبقي " + daysText(s.leftDays) + " · رقم الجهاز " + s.idText + " · للتفعيل واتساب " + WA
    : s.pending ? "جارٍ التحقق من ترخيص الشاشة من موقع الإدارة..."
    : s.active && s.until && s.leftDays <= 7 ? "ينتهي ترخيص الشاشة بعد " + daysText(s.leftDays) + " · للتجديد واتساب " + WA
    : (s.active || s.trial) && s.offlineDays <= 3 ? "تعذر الاتصال بموقع الإدارة · تعمل الشاشة " + daysText(s.offlineDays) + " أخرى بدون إنترنت" : "";
  if (bt) {
    if (!badge) { badge = document.createElement("div"); badge.className = "licbadge"; sg.appendChild(badge); }
    if (badge.textContent !== bt) badge.textContent = bt;
  } else if (badge) { badge.parentNode.removeChild(badge); badge = null; }
  // الشاشة غير مفعّلة: رسالة التواصل وربط الشاشة بكود من لوحة الإدارة
  if (s.expired) {
    var site = siteKnown(), key = s.msg + "|" + (site ? 1 : 0);
    if (ov && ovKey !== key) { if (ov._stop) ov._stop(); ov.parentNode.removeChild(ov); ov = null; }
    if (!ov) {
      ovKey = key;
      ov = document.createElement("div"); ov.className = "licov";
      var oldOnly = st.oldCode && !site;
      ov.innerHTML = '<div class="licbox"><div class="licinfo"><img class="liclogo" src="img/mark.png" alt="">' +
        '<div class="lict">' + esc(s.msg || (s.linked ? "هذه الشاشة غير مفعّلة" : "هذه الشاشة غير مرتبطة بموقع الإدارة")) + '</div>' +
        '<div class="licm">' + (oldOnly ? "هذه الشاشة كانت مفعّلة سابقاً: اكتب عنوان موقع الإدارة واضغط «تفعيل» بدون كود" : "تواصل معنا لتفعيل تطبيق روائع الأذان، ثم أدخل كود التفعيل (6 أرقام) الذي يصلك") + '</div>' +
        '<a class="licwa" href="https://wa.me/' + WA_INTL + '" target="_blank" rel="noopener"><span>واتساب</span><b dir="ltr">' + WA + '</b></a>' +
        '<div class="licid"><span>رقم الجهاز</span><b dir="ltr">' + esc(s.idText) + '</b><small>أرسله مع طلب التفعيل</small></div></div>' +
        '<form class="licf" autocomplete="off">' + (site && window.REMOTE && window.REMOTE.linkSession ? '<div class="lqtabs" role="tablist"><button type="button" data-m="qr" class="on">ربط بالجوال (QR)</button><button type="button" data-m="code">كود التفعيل</button></div><div class="licqr"></div>' : "") + '<div class="licman">' + (site ? "" : '<input class="licsite" type="url" dir="ltr" autocomplete="url" placeholder="عنوان موقع الإدارة" aria-label="عنوان موقع الإدارة">') +
        '<div class="licdl">كود التفعيل</div>' +
        '<div class="licdig" dir="ltr">' + [0,1,2,3,4,5].map(function(){ return "<span></span>"; }).join("") +
        '<input class="liccode" inputmode="none" autocomplete="off" maxlength="6" aria-label="كود التفعيل"></div>' +
        '<div class="licnum">' + ["1","2","3","4","5","6","7","8","9","del","0","clr"].map(function(k){ return '<button type="button" data-k="' + k + '"' + (k === "del" || k === "clr" ? ' class="fn"' : "") + '>' + (k === "del" ? "⌫" : k === "clr" ? "مسح" : k) + '</button>'; }).join("") + '</div>' +
        '<button type="submit" class="licgo">تفعيل الشاشة</button><div class="licerr" hidden></div></div></form></div>';
      sg.appendChild(ov);
      // الربط برمز QR هو الطريقة الأولى، وكود التفعيل بديل
      var lqH = ov.querySelector(".licqr"), lqS = null, man = ov.querySelector(".licman");
      var setM = function(m){ if (!lqH) return; var tb = ov.querySelectorAll(".lqtabs button");
        for (var i = 0; i < tb.length; i++) tb[i].className = tb[i].getAttribute("data-m") === m ? "on" : "";
        lqH.hidden = m !== "qr"; man.hidden = m === "qr";
        if (m === "qr" && !lqS) lqS = qrPanel(lqH, site, function(){ st.denied = null; st.waitUsed = 0; st.wait = 0; save(); fetchLic().then(refresh, refresh); });
        if (m !== "qr" && lqS) { lqS.stop(); lqS = null; } };
      ov._stop = function(){ if (lqS) lqS.stop(); lqS = null; };
      if (lqH) { ov.querySelector(".lqtabs").addEventListener("click", function(e){ var b = e.target.closest ? e.target.closest("[data-m]") : null; if (b) setM(b.getAttribute("data-m")); }); setM("qr"); }
      var inp = ov.querySelector(".liccode"), er = ov.querySelector(".licerr"), cells = ov.querySelectorAll(".licdig span"), frm = ov.querySelector("form");
      // خانات الكود الست: كل رقم في خانة، والخانة التالية مميزة
      var upd = function(){ var d = inp.value.replace(/\D/g, "").slice(0, 6); if (inp.value !== d) inp.value = d;
        for (var i = 0; i < cells.length; i++) { cells[i].textContent = d.charAt(i); cells[i].className = (i < d.length ? "f" : "") + (i === Math.min(d.length, 5) ? " cur" : ""); }
        ov.querySelector(".licgo").className = "licgo" + (d.length === 6 || (oldOnly && !d) ? " ready" : ""); };
      var put = function(k){ var d = inp.value.replace(/\D/g, ""); d = k === "del" ? d.slice(0, -1) : k === "clr" ? "" : (d + k).slice(0, 6); inp.value = d; er.hidden = true; upd(); };
      ov.querySelector(".licnum").addEventListener("click", function(e){ var b = e.target.closest ? e.target.closest("[data-k]") : null; if (b) put(b.getAttribute("data-k")); });
      ov.querySelector(".licdig").addEventListener("click", function(){ try { inp.focus(); } catch (e2) {} });
      inp.addEventListener("input", upd);
      // أرقام لوحة المفاتيح أو الريموت تُكتب في الكود مباشرة، وEnter للتفعيل
      ov.addEventListener("keydown", function(e){ var t = e.target; if (t && t.className === "licsite") return; var k = e.key || "";
        if (/^[0-9]$/.test(k) && t !== inp) { e.preventDefault(); if (lqH && !lqH.hidden) setM("code"); put(k); }
        else if (k === "Backspace" && t !== inp) { e.preventDefault(); put("del"); } });
      upd();
      frm.addEventListener("submit", function(e){ e.preventDefault();
        var R = window.REMOTE, si = ov.querySelector(".licsite"), st0 = siteKnown() || (si ? si.value : "");
        var show = function(t, bad){ er.hidden = false; er.textContent = t; er.className = "licerr" + (bad ? "" : " ok"); };
        if (!R || !R.activate) return show("تعذر الربط في هذه النسخة", true);
        if (!inp.value && st.oldCode && st0) { show("جارٍ التفعيل..."); migrate(st0).then(function(ok){ if (ok) { show("تمت إضافة الشاشة إلى لوحة الإدارة"); refresh(); } else show("تعذر التحقق من التفعيل السابق. تواصل مع الإدارة", true); }); return; }
        if (inp.value.replace(/\D/g, "").length !== 6) return show("كود التفعيل 6 أرقام", true);
        show("جارٍ التفعيل...");
        R.activate(st0, inp.value).then(function(){ st.denied = null; st.waitUsed = 0; st.wait = 0; save(); return fetchLic(); })
          .then(function(ok){ if (ok) { show("تم تفعيل الشاشة، شكراً لكم"); refresh(); } else show(status().msg || "تم الربط، لكن الشاشة غير مفعّلة بعد من الإدارة", true); },
            function(err){ show(err && err.message || String(err), true); });
      });
      setTimeout(function(){ try { var f0 = ov && (lqH && !lqH.hidden ? ov.querySelector(".lqtabs button") : ov.querySelector(".licnum button")); if (f0 && !(document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) f0.focus(); } catch (e3) {} }, 400);
    }
  } else if (ov) { if (ov._stop) ov._stop(); ov.parentNode.removeChild(ov); ov = null; }
}
/* لوحة الربط برمز QR: تُستخدم في شاشة التفعيل وفي نافذة «ربط الشاشة» */
function qrPanel(host, site, onDone){
  var R = window.REMOTE; if (!R || !R.linkSession || !window.QRSvg) return null;
  host.innerHTML = '<div class="lq"><div class="lqqr" aria-hidden="true"></div><div class="lqside">' +
    '<div class="lqt">امسح الرمز بكاميرا الجوال</div>' +
    '<ol class="lqsteps"><li>وجّه كاميرا الجوال إلى الرمز وافتح الرابط</li><li>سجّل دخولك في موقع الإدارة إن طُلب منك</li><li>اختر المسجد ثم اضغط «ربط الجهاز»</li></ol>' +
    '<div class="lqcode">أو من لوحة الإدارة ← «ربط جهاز» اكتب الرمز<b dir="ltr">······</b></div>' +
    '<div class="lqst" role="status">جارٍ تجهيز الرمز...</div><button type="button" class="lqnew" hidden>رمز جديد</button></div></div>';
  var qr = host.querySelector(".lqqr"), cd = host.querySelector(".lqcode b"), stx = host.querySelector(".lqst"), nb = host.querySelector(".lqnew"), cur = null, tk = null;
  var left = function(){ if (!cur) return ""; var t = Math.max(0, Math.round((cur.until - Date.now()) / 1000)); return Math.floor(t / 60) + ":" + ("0" + t % 60).slice(-2); };
  var tick = function(){ if (cur && stx.className === "lqst wait") stx.textContent = "بانتظار الموافقة من الموقع · ينتهي الرمز بعد " + left(); };
  var sess = R.linkSession(site, function(t, d){
    if (t === "busy") { stx.className = "lqst"; stx.textContent = "جارٍ تجهيز الرمز..."; }
    else if (t === "code") { cur = d; qr.innerHTML = window.QRSvg(d.url); qr.className = "lqqr on"; cd.textContent = d.code.slice(0, 3) + " " + d.code.slice(3);
      stx.className = "lqst wait"; nb.hidden = false; tick(); }
    else if (t === "error") { stx.className = "lqst bad"; stx.textContent = d && d.message || String(d); nb.hidden = false; }
    else if (t === "done") { clearInterval(tk); stx.className = "lqst ok"; stx.textContent = "تم ربط الشاشة" + (d && d.name ? ": " + d.name : "") + " ✓"; nb.hidden = true;
      if (onDone) setTimeout(function(){ onDone(d); }, 1200); }
  });
  tk = setInterval(tick, 1000);
  nb.addEventListener("click", function(){ cur = null; qr.className = "lqqr"; sess.renew(); });
  return {stop:function(){ clearInterval(tk); sess.stop(); }};
}
function refresh(){ try { render(); } catch(e){} }
window.LICENSE = {status:status, setLink:setLink, qrPanel:qrPanel, check:function(){ lastTry = Date.now(); return fetchLic(); }, refresh:refresh,
  activate:function(){ return false; }, // أكواد التفعيل القديمة (8 أرقام) لم تعد مقبولة
  info:function(){ var s = status(); return {id:s.id, state:s.active ? "active" : s.trial ? "trial" : s.pending ? "pending" : "expired", left:s.leftDays, until:s.until, renewed:s.renewedAt}; }};
if (window.RAWAYIE_PREVIEW) { window.LICENSE.status = function(){ var s = status(); s.expired = false; s.trial = false; s.pending = false; return s; }; return; } // معاينة المدير: بدون رسائل
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(refresh, 300); }); else setTimeout(refresh, 300);
setTimeout(tick, 1500);
setInterval(function(){ tick(); refresh(); }, 20000);
})();
