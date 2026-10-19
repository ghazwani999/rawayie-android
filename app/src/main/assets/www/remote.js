/* روائع الأذان: الإدارة عن بعد (جهة شاشة المسجد)
   يعمل مع Firebase Realtime Database أو أي خادم يدعم نفس واجهة REST:
   GET/PUT  {server}/screens/{code}/config.json   إعدادات الشاشة (يكتبها المدير أو الشاشة)
   PUT      {server}/screens/{code}/status.json   حالة الشاشة (تكتبها الشاشة كل دقيقة)
   GET      {server}/screens/{code}/cmd.json      أوامر المدير (إعادة تحميل، رسالة عاجلة) */
(function(){
"use strict";
var A = window.APP, S = A.S;
/* ===== وضع المعاينة من لوحة ووردبريس (صفحة جديدة) =====
   يقرأ إعدادات الشاشة من الخادم بصلاحية المدير المسجّل، ويعرضها كما تظهر في المسجد. لا يرسل حالة ولا يحفظ ولا يربط هذا الجهاز */
if (window.RAWAYIE_PREVIEW) { (function(){
  var q = new URLSearchParams(location.search), sv = String(q.get("server") || "").replace(/\/+$/, ""), cd = q.get("code") || "", nonce = q.get("nonce") || "", rev = -1;
  var bar = document.createElement("div"); bar.className = "pvbar"; bar.textContent = "معاينة: " + cd; document.body.appendChild(bar);
  var load = function(){
    fetch(sv + "/screens/" + encodeURIComponent(cd) + "/config" + (sv.indexOf("?") >= 0 ? "&" : "?") + "_=" + Date.now(), {credentials:"same-origin", cache:"no-store", headers:{"X-WP-Nonce":nonce}})
      .then(function(r){ if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? "انتهت الجلسة، افتح المعاينة من لوحة المدير مرة أخرى" : "HTTP " + r.status); return r.json(); })
      .then(function(c){ if (!c) { bar.textContent = "لم ترسل هذه الشاشة إعداداتها بعد"; return; } if (c.rev === rev) return; rev = c.rev;
        var cfg = JSON.parse(JSON.stringify(c)); delete cfg.rev; delete cfg.by; cfg.remote = {on:false}; A.setAll(cfg);
        bar.textContent = "معاينة: " + (c.mosque || cd) + " · تتحدث تلقائياً"; })
      .catch(function(e){ bar.textContent = "معاينة: " + (e.message || e); bar.classList.add("bad"); });
  };
  load(); setInterval(load, 20000);
  window.REMOTE = {start:function(){}, poll:load, push:function(){ return Promise.resolve(); }, state:{status:"off"}, url:function(){ return ""; }, activate:function(){ return Promise.reject(new Error("معاينة")); }, wpSite:function(){ return ""; }, test:function(){ return Promise.resolve(); }};
})(); return; }
var DEF_R = {on:false, server:"", key:"", code:"", poll:30, lastCmd:0, rev:0, allowLocal:true};
S.remote = Object.assign({}, DEF_R, S.remote || {});
if (+S.remote.poll === 60 && !S.remote.pollSet) { S.remote.poll = 30; S.remote.pollSet = 1; } // الرسائل العاجلة تصل خلال نصف دقيقة
// الربط التلقائي من رابط التشغيل: index.html?server=...&code=...&token=...
(function(){ try {
  var q = new URLSearchParams(location.search), sv = q.get("server"), cd = q.get("code");
  if (sv && cd) { S.remote.on = true; S.remote.server = sv; S.remote.code = cd; S.remote.key = q.get("token") || S.remote.key || ""; A.save();
    if (history.replaceState) history.replaceState(null, "", location.pathname); }
} catch(e){} })();
if (!S.remote.code) { S.remote.code = "MSJ-" + Math.random().toString(36).slice(2, 8).toUpperCase(); A.save(); }

var LOCAL_ONLY = ["pass", "remote", "lookV"];
var state = {status:"off", at:0, err:"", applying:false, pushT:null, timer:null};

function base(){ return String(S.remote.server || "").trim().replace(/\/+$/, ""); }
function isWP(b){ return /\/wp-json\/|[?&]rest_route=/.test(b); }
function url(path){ var b = base(), u = b + "/screens/" + encodeURIComponent(S.remote.code) + path + (isWP(b) ? "" : ".json"); /* ووردبريس بدون .json */
  return S.remote.key ? u + (u.indexOf("?") >= 0 ? "&" : "?") + "auth=" + encodeURIComponent(S.remote.key) : u; }
function req(method, path, body){
  var u = url(path), m = method;
  if (isWP(base())) {
    // ووردبريس: بعض الاستضافات وجدران الحماية تمنع PUT، فيُرسل POST مع _method=PUT (تدعمه واجهة ووردبريس)
    if (m === "PUT") { m = "POST"; u += (u.indexOf("?") >= 0 ? "&" : "?") + "_method=PUT"; }
    if (m === "GET") u += (u.indexOf("?") >= 0 ? "&" : "?") + "_=" + Date.now(); // تجاوز الكاش
  }
  return fetch(u, {method:m, cache:"no-store", headers: body ? {"Content-Type":"application/json"} : {}, body: body ? JSON.stringify(body) : undefined})
    .then(function(r){ if (!r.ok) throw new Error((m === "GET" ? "القراءة" : "الإرسال") + " HTTP " + r.status + (r.status === 401 ? " (رمز الشاشة غير صحيح، فعّلها بكود جديد)" : r.status === 403 || r.status === 405 ? " (منعه جدار الحماية في الاستضافة)" : "")); return r.text(); }).then(function(t){ return t ? JSON.parse(t) : null; });
}
// نسخة الإعدادات التي تُرسل: بدون كلمات السر وبدون معرفات الصور المحفوظة في الجهاز
function exportCfg(){
  var c = JSON.parse(JSON.stringify(S));
  LOCAL_ONLY.forEach(function(k){ delete c[k]; });
  if (c.sup) delete c.sup.pass;
  var url = function(v){ return /^(https?:)?\/\//.test(String(v || "")); };
  if (c.look) { if (!url(c.look.customBg)) delete c.look.customBg; if (!url(c.look.logoId)) delete c.look.logoId; delete c.look.bgKey; }
  if (c.snd) { if (!url(c.snd.azanId)) delete c.snd.azanId; if (!url(c.snd.iqamaId)) delete c.snd.iqamaId; }
  return c;
}
function applyCfg(cfg){
  var keep = {pass:S.pass, remote:S.remote, lookV:S.lookV, supPass:(S.sup || {}).pass,
    customBg:S.look.customBg, logoId:S.look.logoId, azanId:S.snd.azanId, iqamaId:S.snd.iqamaId};
  var c = JSON.parse(JSON.stringify(cfg)); delete c.rev; delete c.by;
  state.applying = true;
  A.setAll(c);
  S.pass = keep.pass; S.remote = keep.remote; S.lookV = keep.lookV; S.sup = S.sup || {}; S.sup.pass = keep.supPass || "";
  // الوسائط القادمة من الخادم (روابط) لها الأولوية، وإلا تبقى الوسائط المحلية
  var L = cfg.look || {}, N = cfg.snd || {};
  var loc = function(v){ return v && !/^(https?:)?\/\//.test(String(v)) ? v : ""; };
  S.look.customBg = L.customBg || loc(keep.customBg); S.look.logoId = L.logoId || loc(keep.logoId);
  S.snd.azanId = N.azanId || loc(keep.azanId); S.snd.iqamaId = N.iqamaId || loc(keep.iqamaId);
  S.remote.rev = cfg.rev || Date.now();
  A.save(); A.rebuild();
  state.applying = false;
  // إعدادات ناقصة (شاشة جديدة من اللوحة): ترفع الشاشة نسختها الكاملة لتظهر كل الخيارات في اللوحة
  var L0 = cfg.look || {};
  if (!cfg.iq || !L0.fontText || L0.autoColor === undefined) setTimeout(push, 1000);
}
function push(){
  if (!S.remote.on || !base()) return Promise.resolve();
  // إذا عدّل المدير الإعدادات بعد آخر مزامنة، تُعتمد نسخة المدير ولا تُستبدل
  return req("GET", "/config").then(function(cur){
    if (cur && cur.by === "admin" && (cur.rev || 0) !== (S.remote.rev || 0)) { applyCfg(cur); ok(); return; }
    var c = exportCfg(); c.rev = Math.max(Date.now(), (cur && cur.rev || 0) + 1); c.by = "screen";
    return req("PUT", "/config", c).then(function(res){ S.remote.rev = (res && res.rev) || c.rev; origSave(); ok(); }); // الخادم يرقّم بساعته
  }).catch(fail);
}
function schedulePush(){ if (!S.remote.on || state.applying || !S.remote.allowLocal) return; clearTimeout(state.pushT); state.pushT = setTimeout(push, 1500); }
function ok(){ state.status = "ok"; state.at = Date.now(); state.err = ""; }
function fail(e){ state.status = "fail"; state.err = String(e && e.message || e); }

function sendStatus(){
  var ci = A.cityInfo(), z = A.zp(Date.now());
  return req("PUT", "/status", {name:S.mosque, city:ci.name, code:S.remote.code, lastSeen:Date.now(),
    version:A.VERSION, rev:S.remote.rev, orient:A.orient() === "P" ? "رأسي" : "أفقي", rot:+(S.look.rot || 0),
    screen:innerWidth + "×" + innerHeight, time:A.two(z.h) + ":" + A.two(z.m),
    err:(A.lastErr ? A.lastErr() : "").slice(0, 200), ua:navigator.userAgent.slice(0, 160)});
}
function poll(){
  if (!S.remote.on || !base()) { state.status = "off"; return; }
  req("GET", "/config").then(function(cfg){
    if (!cfg) return push();                                   // أول ربط: ارفع إعدادات الشاشة الحالية
    if ((cfg.rev || 0) !== (S.remote.rev || 0)) applyCfg(cfg); // نسخة مختلفة عما طبّقته الشاشة: من المدير (لا تعتمد على ساعة الجهاز)
  }).then(function(){ return req("GET", "/cmd"); }).then(function(cmd){
    if (!cmd || !cmd.at) return;
    // المدة المتبقية بساعة الخادم إن توفرت، فلا تتأثر بساعة جهاز الشاشة
    var left = cmd.exp && cmd.now ? cmd.exp - cmd.now : (cmd.until ? cmd.until - Date.now() : 0), age = cmd.now ? cmd.now - cmd.at : Date.now() - cmd.at;
    if (cmd.at !== (S.remote.lastCmd || 0)) { S.remote.lastCmd = cmd.at; origSave(); if (cmd.type === "msg" || age < 180000) runCmd(cmd, left); }
    else if (cmd.type === "msg" && left > 0 && !msgOn()) showMsg(cmd, left); // بعد إعادة تشغيل الشاشة تعود الرسالة ما دامت مدتها باقية
  }).then(sendStatus).then(ok).catch(fail);
}
function runCmd(c, left){
  if (c.type === "reload") {
    // بملء الشاشة: تحديث كامل للعرض بدون إعادة تحميل الصفحة، فتبقى الشاشة بملء الشاشة
    if (window.isFS && window.isFS()) { A.rebuild(); setTimeout(poll, 1500); return; }
    setTimeout(function(){ location.reload(); }, 500); return; }
  if (c.type === "msg") showMsg(c, left);
  if (c.type === "clear") hideMsg();
}

/* رسالة عاجلة من المدير: تغطي الشاشة حتى انتهاء مدتها */
var msgT = null;
function msgOn(){ var el = document.getElementById("rmsg"); return !!(el && !el.hidden); }
function showMsg(c, left){
  if (left == null) left = c.until ? c.until - Date.now() : (c.minutes || 5)*60000;
  if (!(left > 0)) return; var until = Date.now() + left;
  var stage = document.getElementById("stage"), el = document.getElementById("rmsg");
  if (!el) { el = document.createElement("div"); el.id = "rmsg"; el.className = "slide full"; stage.appendChild(el); }
  A.renderSlide(el, {title:c.title || "", body:c.text || "", tSize:c.tSize || 130, bSize:c.bSize || 80, tColor:c.tColor || "#EBD1A0", bColor:"#ffffff", bg:c.bg || "#000000", bgOp:c.bgOp == null ? .94 : c.bgOp, full:true, radius:0, align:"center", valign:"center", lineH:1.7, gap:40, pad:90});
  el.hidden = false; el.style.zIndex = 8; stage.classList.add("rmsgon");
  clearTimeout(msgT); msgT = setTimeout(hideMsg, until - Date.now());
}
function hideMsg(){ var el = document.getElementById("rmsg"); if (el) el.hidden = true; var sg = document.getElementById("stage"); if (sg) sg.classList.remove("rmsgon"); clearTimeout(msgT); }

function start(){
  clearInterval(state.timer);
  if (S.remote.on && base()) { poll(); state.timer = setInterval(poll, Math.max(15, +S.remote.poll || 60)*1000); }
  else state.status = "off";
}
// كل حفظ من الإعدادات على الشاشة يُرسل للخادم
var origSave = A.save;
A.save = function(){ origSave(); schedulePush(); };

/* ===== التفعيل بكود من لوحة المدير =====
   شاشة المسجد ترسل كود 6 أرقام إلى موقع ووردبريس، فتحصل على بيانات ربطها (الخادم ورمز الشاشة ومفتاحها) */
// عنوان الموقع إذا كان التطبيق يعمل من داخل إضافة ووردبريس نفسها
function wpSite(){ if (window.RAWAYIE_SITE) return String(window.RAWAYIE_SITE).replace(/\/+$/, ""); var m = location.href.match(/^(https?:\/\/[^?#]*?)\/wp-content\/plugins\/[^/]+\/app\//); return m ? m[1] : ""; }
function siteCandidates(site){
  var s = String(site || "").trim().replace(/\s+/g, ""); if (!s) return [];
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  s = s.replace(/[?#].*$/, "").replace(/\/+$/, "");
  var m = s.match(/^(.*?)\/wp-json(\/.*)?$/); if (m) s = m[1];
  return [s + "/wp-json/rawayie/v1/activate", s + "/?rest_route=/rawayie/v1/activate"];
}
function activate(site, act){
  var urls = siteCandidates(site), code = String(act || "").replace(/\D/g, "");
  if (!urls.length) return Promise.reject(new Error("اكتب عنوان الموقع"));
  if (code.length !== 6) return Promise.reject(new Error("الكود 6 أرقام"));
  var tryAt = function(i){
    return fetch(urls[i], {method:"POST", cache:"no-store", headers:{"Content-Type":"application/json"}, body:JSON.stringify({act:code})})
      .then(function(res){ return res.text().then(function(t){ var j = null; try { j = t ? JSON.parse(t) : null; } catch(e){}
        if (res.ok && j && j.code) return j;
        if (j && j.message && (j.code === "rws_bad" || j.code === "rws_wait")) throw new Error(j.message);
        if (i + 1 < urls.length) return tryAt(i + 1);
        throw new Error(res.status === 404 ? "الكود غير صحيح أو انتهت صلاحيته" : "تعذر الوصول للموقع (" + res.status + ")"); }); },
      function(){ if (i + 1 < urls.length) return tryAt(i + 1); throw new Error("تعذر الوصول للموقع. تأكد من العنوان والإنترنت"); });
  };
  return tryAt(0).then(function(j){
    S.remote.on = true; S.remote.server = j.server; S.remote.code = j.code; S.remote.key = j.token || ""; S.remote.rev = 0; S.remote.site = urls[0].replace(/\/wp-json\/.*$/, "");
    if (j.name && (!S.mosque || S.mosque === A.DEF.mosque)) S.mosque = j.name;
    origSave(); start();
    return j;
  });
}

window.REMOTE = {activate:activate, wpSite:wpSite, start:start, poll:poll, push:push, state:state, url:url, test:function(){
  return req("GET", "/status").then(function(){ ok(); return true; }).catch(function(e){ fail(e); throw e; }); }};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
