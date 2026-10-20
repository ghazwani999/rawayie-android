/* روائع الأذان: الفترة التجريبية والتفعيل
   - فترة تجريبية 3 أيام تبدأ من أول تشغيل على الجهاز.
   - لكل جهاز «رقم جهاز» ثابت، وكود التفعيل خاص بهذا الرقم (يصدره المدير من لوحة ووردبريس أو مولّد الأكواد).
   - بعد انتهاء التجربة بدون تفعيل تظهر رسالة التواصل للتفعيل فوق الشاشة. */
(function(){
"use strict";
var A = window.APP; if (!A) return;
var S = A.S;
var TRIAL_DAYS = 3, WA = "0540450400", WA_INTL = "966540450400", DAY = 864e5;
var LSK = "rawayie-lic", SECRET = "rw-1448-ghz-azan";

/* ===== كود التفعيل: FNV-1a بـ32 بت (نفس الحساب في لوحة ووردبريس) ===== */
function mul32(a, b){ return (((a & 0xffff) * b) + ((((a >>> 16) * b) & 0xffff) << 16)) >>> 0; }
function h32(str, seed){ var h = seed >>> 0; for (var i = 0; i < str.length; i++) { h = (h ^ str.charCodeAt(i)) >>> 0; h = mul32(h, 16777619); } return h >>> 0; }
function codeFor(id){
  id = normId(id); if (!id) return "";
  var a = h32(SECRET + "|" + id, 2166136261), b = h32(id + "|" + SECRET, 84696351);
  var s = String((a % 10000) * 10000 + (b % 10000)); while (s.length < 8) s = "0" + s;
  return s;
}
function normId(x){ return String(x || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function normCode(x){ return String(x || "").replace(/[٠-٩]/g, function(d){ return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/\D/g, ""); }
function newId(){ var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = ""; for (var i = 0; i < 8; i++) s += c.charAt(Math.floor(Math.random() * c.length)); return s; }
function fmtId(id){ id = normId(id); return id.slice(0, 4) + "-" + id.slice(4); }

/* ===== الحفظ في أكثر من مكان حتى لا تضيع بداية التجربة بسهولة ===== */
var AN = window.RawayieAndroid;
function readAll(){
  var list = [];
  try { list.push(JSON.parse(localStorage.getItem(LSK) || "null")); } catch(e){}
  try { var m = document.cookie.match(/(?:^|; )rwlic=([^;]*)/); if (m) list.push(JSON.parse(decodeURIComponent(m[1]))); } catch(e){}
  try { if (AN && AN.licGet) list.push(JSON.parse(AN.licGet() || "null")); } catch(e){}
  return list.filter(function(x){ return x && typeof x === "object"; });
}
function merge(list){
  var r = {id:"", start:0, last:0, code:"", link:null};
  list.forEach(function(x){
    if (!r.id && normId(x.id).length === 8) r.id = normId(x.id);
    if (+x.start > 0 && (!r.start || +x.start < r.start)) r.start = +x.start;
    if (+x.last > r.last) r.last = +x.last;
    if (!r.link && x.link && x.link.server && x.link.code) r.link = x.link; // نسخة احتياطية من ربط الشاشة بلوحة المدير
  });
  list.forEach(function(x){ if (!r.code && x.code && r.id && normCode(x.code) === codeFor(r.id)) r.code = normCode(x.code); });
  return r;
}
var st = merge(readAll());
function save(){
  var j = JSON.stringify(st);
  try { localStorage.setItem(LSK, j); } catch(e){}
  try { document.cookie = "rwlic=" + encodeURIComponent(j) + "; max-age=315360000; path=/; SameSite=Lax"; } catch(e){}
  try { if (AN && AN.licSet) AN.licSet(j); } catch(e){}
  try { A.IDB.put("__lic", j); } catch(e){}
}
if (!st.id) st.id = newId();
if (!st.start) st.start = Date.now();
// نسخة احتياطية في قاعدة بيانات المتصفح: تُكمل البيانات إذا مُسح التخزين المحلي فقط
try { A.IDB.get("__lic").then(function(v){ if (!v) return; var r = merge([st, JSON.parse(v)]); if (r.start !== st.start || r.id !== st.id || r.code !== st.code || (!st.link && r.link)) { st = r; save(); if (restoreLink() && window.REMOTE && window.REMOTE.start) window.REMOTE.start(); refresh(); } }).catch(function(){}); } catch(e){}
save();
/* الشاشة المرتبطة سابقاً بلوحة المدير لا تطلب كود الربط مرة أخرى: إذا ضاعت إعداداتها (مسح بيانات المتصفح جزئياً
   أو تحديث) يُعاد ربطها تلقائياً من النسخة الاحتياطية */
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

function status(){
  var now = Date.now();
  if (now > st.last) { st.last = now; if (!status.t || now - status.t > 600000) { status.t = now; save(); } }
  var ref = Math.max(now, st.last); // إرجاع ساعة الجهاز للخلف لا يطيل التجربة
  var remoteOk = S.lic && normCode(S.lic) === codeFor(st.id);
  if (remoteOk && st.code !== normCode(S.lic)) { st.code = normCode(S.lic); save(); }
  var active = !!st.code && st.code === codeFor(st.id);
  var left = st.start + TRIAL_DAYS * DAY - ref;
  return {id:st.id, idText:fmtId(st.id), active:active, trial:!active && left > 0, expired:!active && left <= 0,
    leftMs:Math.max(0, left), leftDays:Math.max(0, Math.ceil(left / DAY)), start:st.start, wa:WA, waLink:"https://wa.me/" + WA_INTL};
}
function activate(code){
  code = normCode(code);
  if (code && code === codeFor(st.id)) { st.code = code; save(); refresh(); return true; }
  return false;
}

/* ===== العرض على الشاشة ===== */
var ov = null, badge = null;
function stage(){ return document.getElementById("stage"); }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function daysText(n){ return n <= 1 ? "يوم واحد" : n === 2 ? "يومان" : n + " أيام"; }
function render(){
  var s = status(), sg = stage(); if (!sg) return;
  if (badge && !sg.contains(badge)) badge = null; // أُعيد بناء الشاشة
  if (ov && !sg.contains(ov)) ov = null;
  document.body.classList.toggle("licon", s.expired);
  // شريط صغير أثناء التجربة
  if (s.trial) {
    if (!badge) { badge = document.createElement("div"); badge.className = "licbadge"; sg.appendChild(badge); }
    var bt = "نسخة تجريبية · متبقي " + daysText(s.leftDays) + " · رقم الجهاز " + s.idText + " · للتفعيل واتساب " + WA;
    if (badge.textContent !== bt) badge.textContent = bt;
  } else if (badge) { badge.parentNode.removeChild(badge); badge = null; }
  // رسالة انتهاء التجربة
  if (s.expired) {
    if (!ov) {
      ov = document.createElement("div"); ov.className = "licov";
      ov.innerHTML = '<div class="licbox"><img class="liclogo" src="img/mark.png" alt="">' +
        '<div class="lict">انتهت الفترة التجريبية لمدة ' + TRIAL_DAYS + ' أيام</div>' +
        '<div class="licm">يرجى التواصل لتفعيل تطبيق روائع الأذان</div>' +
        '<a class="licwa" href="' + s.waLink + '" target="_blank" rel="noopener"><span>واتساب</span><b dir="ltr">' + WA + '</b></a>' +
        '<div class="licid">رقم الجهاز: <b dir="ltr">' + esc(s.idText) + '</b><small>أرسل رقم الجهاز مع طلب التفعيل</small></div>' +
        '<form class="licf"><input inputmode="none" autocomplete="off" maxlength="12" placeholder="كود التفعيل" aria-label="كود التفعيل"><button type="submit">تفعيل</button></form>' +
        '<div class="licnum">' + ["1","2","3","4","5","6","7","8","9","del","0"].map(function(k){ return '<button type="button" data-k="' + k + '">' + (k === "del" ? "⌫" : k) + '</button>'; }).join("") + '</div>' +
        '<div class="licerr" hidden>الكود غير صحيح لهذا الجهاز</div></div>';
      sg.appendChild(ov);
      ov.querySelector(".licnum").addEventListener("click", function(e){ var b = e.target.closest ? e.target.closest("[data-k]") : null; if (!b) return; var inp = ov.querySelector("input"), d = inp.value.replace(/\D/g, "");
        d = b.getAttribute("data-k") === "del" ? d.slice(0, -1) : (d + b.getAttribute("data-k")).slice(0, 8); inp.value = d; });
      ov.querySelector("form").addEventListener("submit", function(e){ e.preventDefault();
        var box = ov, inp = box.querySelector("input"), er = box.querySelector(".licerr"), ok = activate(inp.value);
        er.hidden = ok; if (!ok) inp.select(); });
    }
  } else if (ov) { ov.parentNode.removeChild(ov); ov = null; }
}
function refresh(){ try { render(); } catch(e){} }
window.LICENSE = {status:status, activate:activate, setLink:setLink, codeFor:null, refresh:refresh, info:function(){ var s = status(); return {id:s.id, state:s.active ? "active" : s.trial ? "trial" : "expired", left:s.leftDays, start:s.start}; }};
if (window.RAWAYIE_PREVIEW) { window.LICENSE.status = function(){ var s = status(); s.expired = false; s.trial = false; return s; }; return; } // معاينة المدير: بدون رسائل
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(refresh, 300); }); else setTimeout(refresh, 300);
setInterval(refresh, 20000);
})();
