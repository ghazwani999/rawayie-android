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
  var MG = !!window.RAWAYIE_MANAGE, dirty = false, saving = null, saveT = null, media = {}, first = true;
  var bar = document.createElement("div"); bar.className = "pvbar"; bar.textContent = (MG ? "إدارة: " : "معاينة: ") + cd; document.body.appendChild(bar);
  var sep = function(u){ return u.indexOf("?") >= 0 ? "&" : "?"; };
  var cfgUrl = sv + "/screens/" + encodeURIComponent(cd) + "/config";
  var say = function(t, bad){ bar.textContent = t; bar.classList.toggle("bad", !!bad); };
  var load = function(){
    if (MG && (dirty || saving)) return; // تعديلات لم تُحفظ بعد: لا تُستبدل
    fetch(cfgUrl + sep(cfgUrl) + "_=" + Date.now(), {credentials:"same-origin", cache:"no-store", headers:{"X-WP-Nonce":nonce}})
      .then(function(r){ if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? "انتهت الجلسة، افتح الشاشة من لوحة المدير مرة أخرى" : "HTTP " + r.status); return r.json(); })
      .then(function(c){ if (!c) { say(MG ? "لم ترسل هذه الشاشة إعداداتها بعد. يمكنك ضبطها هنا وتصلها عند تشغيلها" : "لم ترسل هذه الشاشة إعداداتها بعد"); if (MG && first) { first = false; open1(); } return; }
        if (c.rev === rev || (MG && (dirty || saving))) return; rev = c.rev;
        var cfg = JSON.parse(JSON.stringify(c)); delete cfg.rev; delete cfg.by; cfg.remote = {on:false}; cfg.pass = ""; if (cfg.sup) cfg.sup.pass = ""; applying = true; A.setAll(cfg); applying = false;
        say((MG ? "إدارة: " : "معاينة: ") + (c.mosque || cd) + (MG ? " · التعديلات تُحفظ في الموقع تلقائياً" : " · تتحدث تلقائياً"));
        if (MG) { if (first) { first = false; open1(); } else if (window.SETTINGS && window.SETTINGS.refresh) window.SETTINGS.refresh(); } })
      .catch(function(e){ say((MG ? "إدارة: " : "معاينة: ") + (e.message || e), true); });
  };
  // الإدارة من الموقع: تُعرض الشاشة أولاً للمعاينة، والإعدادات بزر «إعدادات الشاشة» (أو مباشرة مع ‎&open=1)
  var open1 = function(){ if (/[?&]open=1(&|$)/.test(location.search)) setTimeout(function(){ try { if (window.SETTINGS) window.SETTINGS.open(); } catch(e){} }, 300); };
  if (MG) { var mgb = document.createElement("button"); mgb.type = "button"; mgb.className = "mgbtn"; mgb.textContent = "⚙ إعدادات الشاشة";
    mgb.addEventListener("click", function(){ try { if (window.SETTINGS) window.SETTINGS.open(); } catch(e){} }); document.body.appendChild(mgb); }
  /* الحفظ في الموقع: الوسائط المضافة هنا (صور وأصوات) تُرفع أولاً ثم تُحفظ الإعدادات باسم المدير */
  var MID = /^m[0-9a-z]{6,16}$/, applying = false;
  var walk = function(o, fn){ if (!o || typeof o !== "object") return; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) { var v = o[k]; if (typeof v === "string") { var n = fn(v); if (n !== v) o[k] = n; } else walk(v, fn); } };
  var upload = function(c){ var ids = [];
    walk(c, function(v){ if (MID.test(v) && !media[v] && ids.indexOf(v) < 0) ids.push(v); return v; });
    var chain = Promise.resolve();
    ids.forEach(function(id){ chain = chain.then(function(){ return A.IDB.get(id).then(function(b){ if (!b || !b.size) return;
      var u = sv + "/screens/" + encodeURIComponent(cd) + "/media"; u += sep(u) + "id=" + encodeURIComponent(id);
      return fetch(u, {method:"POST", credentials:"same-origin", cache:"no-store", headers:{"Content-Type":b.type || "application/octet-stream", "X-WP-Nonce":nonce}, body:b})
        .then(function(r){ return r.ok ? r.json() : r.json().then(function(j){ throw new Error(j && j.message || "تعذر رفع الملف"); }, function(){ throw new Error("تعذر رفع الملف (" + r.status + ")"); }); })
        .then(function(j){ if (j && j.url) media[id] = j.url; }); }); }); });
    return chain.then(function(){ walk(c, function(v){ return MID.test(v) && media[v] ? media[v] : v; }); return c; }); };
  var push = function(){
    if (!MG) return Promise.resolve();
    if (saving) { dirty = true; return saving; }
    clearTimeout(saveT); dirty = false; say("جارٍ الحفظ في الموقع...");
    var c = JSON.parse(JSON.stringify(A.S)); ["pass", "remote", "lookV"].forEach(function(k){ delete c[k]; }); if (c.sup) delete c.sup.pass; if (c.look) delete c.look.bgKey;
    saving = upload(c).then(function(c2){
      var u = function(v){ return /^(https?:)?\/\//.test(String(v || "")); };
      if (c2.look) { if (!u(c2.look.customBg)) delete c2.look.customBg; if (!u(c2.look.logoId)) delete c2.look.logoId; if (!u(c2.look.wmImg)) delete c2.look.wmImg; }
      if (c2.snd) { if (!u(c2.snd.azanId)) delete c2.snd.azanId; if (!u(c2.snd.iqamaId)) delete c2.snd.iqamaId; }
      c2.rev = Date.now(); c2.by = "admin";
      return fetch(cfgUrl, {method:"POST", credentials:"same-origin", cache:"no-store", headers:{"Content-Type":"application/json", "X-WP-Nonce":nonce, "X-HTTP-Method-Override":"PUT"}, body:JSON.stringify(c2)})
        .then(function(r){ return r.text().then(function(t){ var j = null; try { j = t ? JSON.parse(t) : null; } catch(e){}
          if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? "لا تملك صلاحية الحفظ أو انتهت الجلسة. حدّث الصفحة" : (j && j.message) || "HTTP " + r.status);
          rev = j && j.rev || c2.rev; }); });
    }).then(function(){ saving = null; say("تم الحفظ في الموقع ✓ يصل للشاشة خلال دقيقة"); if (dirty) { saveT = setTimeout(push, 800); } },
      function(e){ saving = null; dirty = true; say("لم يُحفظ: " + (e.message || e) + " · سيُعاد المحاولة", true); saveT = setTimeout(push, 15000); });
    return saving;
  };
  if (MG) {
    var s0 = A.save; A.save = function(){ s0(); if (applying) return; dirty = true; say("تعديلات غير محفوظة..."); clearTimeout(saveT); saveT = setTimeout(push, 1200); };
    addEventListener("beforeunload", function(e){ if (dirty || saving) { e.preventDefault(); e.returnValue = ""; return ""; } });
    try { parent.postMessage({rws:"manage", code:cd}, location.origin); } catch(e){}
  }
  load(); setInterval(load, MG ? 30000 : 20000);
  // أمر للشاشة من صفحة الإدارة (مثل ضبط كلمات سر الإعدادات)
  var cmdSend = function(c){ c.at = Date.now(); var u = sv + "/screens/" + encodeURIComponent(cd) + "/cmd";
    return fetch(u, {method:"POST", credentials:"same-origin", cache:"no-store", headers:{"Content-Type":"application/json", "X-WP-Nonce":nonce, "X-HTTP-Method-Override":"PUT"}, body:JSON.stringify(c)})
      .then(function(r){ if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? "لا تملك صلاحية هذا الإجراء" : "تعذر الإرسال (" + r.status + ")"); }); };
  window.REMOTE = {cmd:cmdSend, start:function(){}, poll:load, push:push, state:{status:"off"}, url:function(){ return ""; }, activate:function(){ return Promise.reject(new Error("معاينة")); }, wpSite:function(){ return ""; }, test:function(){ return Promise.resolve(true); }, dirty:function(){ return dirty || !!saving; }};
})(); return; }
var DEF_R = {on:false, server:"", key:"", code:"", poll:60, lastCmd:0, rev:0, allowLocal:true};
S.remote = Object.assign({}, DEF_R, S.remote || {});
if (!S.remote.pollV2) { if (+S.remote.poll < 60) S.remote.poll = 60; S.remote.pollV2 = 1; } // مزامنة خفيفة كل دقيقة: أقل ضغطاً على الموقع، والرسائل العاجلة تصل خلال دقيقة
// الربط التلقائي من رابط التشغيل: index.html?server=...&code=...&token=...
(function(){ try {
  var q = new URLSearchParams(location.search), sv = q.get("server"), cd = q.get("code");
  // الرابط الجديد يحمل «مفتاح ربط» (pair) بدل رمز الشاشة، فيُستبدل بالرمز داخلياً ولا يظهر في أي رابط
  if (sv && cd) { var pr = q.get("pair") || ""; if (S.remote.code !== cd || S.remote.server !== sv) { S.remote.rev = 0; S.remote.media = {}; } if (pr || S.remote.code !== cd || S.remote.server !== sv) S.remote.key = "";
    S.remote.on = true; S.remote.server = sv; S.remote.code = cd; S.remote.pair = pr; S.remote.key = q.get("token") || S.remote.key || ""; A.save();
    if (history.replaceState) history.replaceState(null, "", location.pathname); }
} catch(e){} })();
if (!S.remote.code) { S.remote.code = "MSJ-" + Math.random().toString(36).slice(2, 8).toUpperCase(); A.save(); }

var LOCAL_ONLY = ["pass", "remote", "lookV"];
var state = {status:"off", at:0, err:"", applying:false, pushT:null, timer:null};

function base(){ return String(S.remote.server || "").trim().replace(/\/+$/, ""); }
function isWP(b){ return /\/wp-json\/|[?&]rest_route=/.test(b); }
function devId(){ try { return window.LICENSE ? window.LICENSE.status().id || "" : ""; } catch(e){ return ""; } }
function url(path){ var b = base(), u = b + "/screens/" + encodeURIComponent(S.remote.code) + path + (isWP(b) ? "" : ".json"); /* ووردبريس بدون .json */
  // رقم الجهاز مع كل طلب: الموقع يسمح لكل شاشة بجهازين فقط
  return S.remote.key ? u + (u.indexOf("?") >= 0 ? "&" : "?") + "auth=" + encodeURIComponent(S.remote.key) + (isWP(b) ? "&dev=" + encodeURIComponent(devId()) : "") : u; }
// تبديل مفتاح الربط من الرابط برمز الشاشة (مرة واحدة)
var pairing = null;
function pairNow(){
  if (pairing) return pairing;
  var b = base(); if (!S.remote.pair || !isWP(b)) return Promise.resolve(false);
  pairing = fetch(b + "/screens/" + encodeURIComponent(S.remote.code) + "/pair", {method:"POST", cache:"no-store", headers:{"Content-Type":"application/json"}, body:JSON.stringify({pair:S.remote.pair, dev:devId()})})
    .then(function(r){ return r.text().then(function(t){ var j = null; try { j = t ? JSON.parse(t) : null; } catch(e){}
      if (r.ok && j && j.token) { S.remote.key = j.token; S.remote.pair = ""; if (j.name && (!S.mosque || S.mosque === A.DEF.mosque)) S.mosque = j.name; origSave();
        try { if (window.LICENSE && window.LICENSE.check) window.LICENSE.check(); } catch(e2){} return true; }
      throw new Error(j && j.message || "تعذر ربط الشاشة (" + r.status + ")"); }); })
    .then(function(v){ pairing = null; return v; }, function(e){ pairing = null; throw e; });
  return pairing;
}
function req(method, path, body){
  var u = url(path), m = method;
  if (isWP(base())) {
    // ووردبريس: بعض الاستضافات وجدران الحماية تمنع PUT، فيُرسل POST مع _method=PUT (تدعمه واجهة ووردبريس)
    if (m === "PUT") { m = "POST"; u += (u.indexOf("?") >= 0 ? "&" : "?") + "_method=PUT"; }
    if (m === "GET") u += (u.indexOf("?") >= 0 ? "&" : "?") + "_=" + Date.now(); // تجاوز الكاش
  }
  return fetch(u, {method:m, cache:"no-store", headers: body ? {"Content-Type":"application/json"} : {}, body: body ? JSON.stringify(body) : undefined})
    .then(function(r){ return r.text().then(function(t){
      if (!r.ok) { var j = null; try { j = t ? JSON.parse(t) : null; } catch(e){}
        if (j && j.code && /^rws_/.test(j.code) && j.code !== "rws_denied" && j.message) throw new Error(j.message); // رسالة الموقع (مثل حد الجهازين)
        if (r.status === 404 && j && j.code === "rest_no_route") { var e404 = new Error("no route"); e404.noRoute = true; throw e404; }
        throw new Error((m === "GET" ? "القراءة" : "الإرسال") + " HTTP " + r.status + (r.status === 401 ? " (رمز الشاشة غير صحيح، فعّلها بكود جديد)" : r.status === 403 || r.status === 405 ? " (منعه جدار الحماية في الاستضافة)" : "")); }
      return t ? JSON.parse(t) : null; }); });
}
// نسخة الإعدادات التي تُرسل: بدون كلمات السر وبدون معرفات الصور المحفوظة في الجهاز
function exportCfg(){
  var c = JSON.parse(JSON.stringify(S));
  LOCAL_ONLY.forEach(function(k){ delete c[k]; });
  if (c.sup) delete c.sup.pass;
  if (c.look) delete c.look.bgKey;
  return c;
}
// ما بقي محلياً بعد رفع الوسائط (لم يُرفع) لا يُرسل في الحقول الرئيسية
function stripLocal(c){
  var url = function(v){ return /^(https?:)?\/\//.test(String(v || "")); };
  if (c.look) { if (!url(c.look.customBg)) delete c.look.customBg; if (!url(c.look.logoId)) delete c.look.logoId; if (!url(c.look.wmImg)) delete c.look.wmImg; }
  if (c.snd) { if (!url(c.snd.azanId)) delete c.snd.azanId; if (!url(c.snd.iqamaId)) delete c.snd.iqamaId; }
  return c;
}
/* الوسائط المحفوظة في الجهاز (صورة الخلفية والشعار والعلامة المائية والشرائح وصوت الأذان والإقامة):
   تُرفع للموقع مرة واحدة، فتنتقل إعدادات الشاشة كما هي إلى الجهاز الثاني المرتبط بنفس الشاشة */
var MID = /^m[0-9a-z]{6,16}$/;
function walk(o, fn){ if (!o || typeof o !== "object") return;
  for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) { var v = o[k]; if (typeof v === "string") { var n = fn(v); if (n !== v) o[k] = n; } else walk(v, fn); } }
function mediaMap(){ if (!S.remote.media || typeof S.remote.media !== "object") S.remote.media = {}; return S.remote.media; }
function uploadMedia(c){
  if (!isWP(base()) || !S.remote.key) return Promise.resolve(c);
  var map = mediaMap(), ids = [];
  walk(c, function(v){ if (MID.test(v) && !map[v] && ids.indexOf(v) < 0) ids.push(v); return v; });
  var chain = Promise.resolve();
  ids.forEach(function(id){ chain = chain.then(function(){ return A.IDB.get(id).then(function(b){ if (!b || !b.size) return;
    var u = base() + "/screens/" + encodeURIComponent(S.remote.code) + "/media?auth=" + encodeURIComponent(S.remote.key) + "&dev=" + encodeURIComponent(devId()) + "&id=" + encodeURIComponent(id);
    return fetch(u, {method:"POST", cache:"no-store", headers:{"Content-Type":b.type || "application/octet-stream"}, body:b})
      .then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ if (j && j.url) { map[id] = j.url; origSave(); } }); }).catch(function(){}); }); });
  return chain.then(function(){ walk(c, function(v){ return MID.test(v) && map[v] ? map[v] : v; }); return c; });
}
function applyCfg(cfg){
  var keep = {pass:S.pass, remote:S.remote, lookV:S.lookV, supPass:(S.sup || {}).pass,
    customBg:S.look.customBg, logoId:S.look.logoId, wmImg:S.look.wmImg, azanId:S.snd.azanId, iqamaId:S.snd.iqamaId};
  var c = JSON.parse(JSON.stringify(cfg)); delete c.rev; delete c.by;
  // الجهاز الذي رفع الوسائط يبقى يستخدم نسخته المحلية، والجهاز الآخر يأخذها من الموقع
  var map = mediaMap(), back = {}; for (var mk in map) if (Object.prototype.hasOwnProperty.call(map, mk)) back[map[mk]] = mk;
  walk(c, function(v){ return back[v] || v; });
  state.applying = true;
  A.setAll(c);
  S.pass = keep.pass; S.remote = keep.remote; S.lookV = keep.lookV; S.sup = S.sup || {}; S.sup.pass = keep.supPass || "";
  // الوسائط القادمة من الخادم (روابط) لها الأولوية، وإلا تبقى الوسائط المحلية
  var L = c.look || {}, N = c.snd || {};
  var loc = function(v){ return v && !/^(https?:)?\/\//.test(String(v)) ? v : ""; };
  S.look.customBg = L.customBg || loc(keep.customBg); S.look.logoId = L.logoId || loc(keep.logoId); S.look.wmImg = L.wmImg || loc(keep.wmImg);
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
    // جهاز جديد على شاشة لها إعدادات (الجهاز الثاني بنفس الكود): يأخذ إعدادات الشاشة كما هي ولا يستبدلها بإعداداته
    if (cur && (cur.rev || 0) !== (S.remote.rev || 0) && (cur.by === "admin" || !S.remote.rev)) { applyCfg(cur); ok(); return; }
    return uploadMedia(exportCfg()).then(function(c){ stripLocal(c); c.rev = Math.max(Date.now(), (cur && cur.rev || 0) + 1); c.by = "screen";
      return req("PUT", "/config", c).then(function(res){ S.remote.rev = (res && res.rev) || c.rev; origSave(); ok(); }); }); // الخادم يرقّم بساعته
  }).catch(fail);
}
function schedulePush(){ if (!S.remote.on || state.applying || !S.remote.allowLocal) return; clearTimeout(state.pushT); state.pushT = setTimeout(push, 1500); }
function ok(){ state.status = "ok"; state.at = Date.now(); state.err = "";
  // ربط ناجح: تُحفظ نسخة احتياطية منه حتى لا تطلب الشاشة كود التفعيل مرة أخرى بعد إعادة التشغيل
  try { if (window.LICENSE && S.remote.on && base()) window.LICENSE.setLink({server:S.remote.server, code:S.remote.code, key:S.remote.key, site:S.remote.site}); } catch(e){} }
function fail(e){ state.status = "fail"; state.err = String(e && e.message || e); }

function sendStatus(){
  var ci = A.cityInfo(), z = A.zp(Date.now());
  return req("PUT", "/status", {name:S.mosque, city:ci.name, code:S.remote.code, lastSeen:Date.now(),
    version:A.VERSION, rev:S.remote.rev, orient:A.orient() === "P" ? "رأسي" : "أفقي", rot:+(S.look.rot || 0),
    screen:innerWidth + "×" + innerHeight, time:A.two(z.h) + ":" + A.two(z.m),
    err:(A.lastErr ? A.lastErr() : "").slice(0, 200), lic:(window.LICENSE ? window.LICENSE.info() : null), ua:navigator.userAgent.slice(0, 160)});
}
function poll(){
  if (!S.remote.on || !base()) { state.status = "off"; return; }
  if (isWP(base()) && !state.noSync) return pollSync();
  req("GET", "/config").then(function(cfg){
    if (!cfg) return push();                                   // أول ربط: ارفع إعدادات الشاشة الحالية
    if ((cfg.rev || 0) !== (S.remote.rev || 0)) applyCfg(cfg); // نسخة مختلفة عما طبّقته الشاشة: من المدير (لا تعتمد على ساعة الجهاز)
  }).then(function(){ return req("GET", "/cmd"); }).then(handleCmd).then(sendStatus).then(ok).catch(fail);
}
/* ووردبريس: طلب واحد للمزامنة (الإعدادات عند تغيّرها فقط، والأوامر، والحالة كل 5 دقائق) */
function statusBody(){
  var ci = A.cityInfo(), z = A.zp(Date.now());
  return {name:S.mosque, city:ci.name, code:S.remote.code, lastSeen:Date.now(),
    version:A.VERSION, rev:S.remote.rev, orient:A.orient() === "P" ? "رأسي" : "أفقي", rot:+(S.look.rot || 0),
    screen:innerWidth + "×" + innerHeight, time:A.two(z.h) + ":" + A.two(z.m), dev:devId(),
    err:(A.lastErr ? A.lastErr() : "").slice(0, 200), lic:(window.LICENSE ? window.LICENSE.info() : null), ua:navigator.userAgent.slice(0, 160)};
}
function statusSig(b){ return [b.name, b.city, b.version, b.orient, b.rot, b.screen, b.err, b.lic && b.lic.state, b.lic && b.lic.left].join("|"); }
function pollSync(){
  var b = statusBody(), now = Date.now(), sendSt = !state.stAt || now - state.stAt > 5*60000 || statusSig(b) !== state.stSig;
  var body = {rev:S.remote.rev || 0, cmdAt:S.remote.lastCmd || 0}; if (sendSt) body.status = b;
  return req("POST", "/sync", body).then(function(j){
    if (!j) return;
    if (sendSt) { state.stAt = now; state.stSig = statusSig(b); }
    if (!j.has) return push();                                             // أول ربط: ترفع الشاشة إعداداتها
    if (j.config && (j.config.rev || 0) !== (S.remote.rev || 0)) applyCfg(j.config);
    return handleCmd(j.cmd);
  }).then(ok).catch(function(e){ if (e && e.noRoute) { state.noSync = true; return poll(); } fail(e); }); // موقع بإضافة قديمة: الطريقة السابقة
}
function handleCmd(cmd){
    if (!cmd || !cmd.at) return;
    // المدة المتبقية بساعة الخادم إن توفرت، فلا تتأثر بساعة جهاز الشاشة
    var left = cmd.exp && cmd.now ? cmd.exp - cmd.now : (cmd.until ? cmd.until - Date.now() : 0), age = cmd.now ? cmd.now - cmd.at : Date.now() - cmd.at;
    if (cmd.at !== (S.remote.lastCmd || 0)) { S.remote.lastCmd = cmd.at; origSave(); if (cmd.type === "msg" || cmd.type === "resetpass" || cmd.type === "setpass" || age < 180000) runCmd(cmd, left); }
    else if (cmd.type === "msg" && left > 0 && !msgOn()) showMsg(cmd, left); // بعد إعادة تشغيل الشاشة تعود الرسالة ما دامت مدتها باقية
}
function runCmd(c, left){
  if (c.type === "reload") {
    // بملء الشاشة: تحديث كامل للعرض بدون إعادة تحميل الصفحة، فتبقى الشاشة بملء الشاشة
    if (window.isFS && window.isFS()) { A.rebuild(); setTimeout(poll, 1500); return; }
    setTimeout(function(){ location.reload(); }, 500); return; }
  if (c.type === "msg") showMsg(c, left);
  // من لوحة الإدارة: إلغاء كلمة سر الإعدادات المنسية (المدير والمشرف) فيضبط المسؤول كلمة جديدة
  // من صفحة الإدارة: كلمات سر جديدة للإعدادات (الفارغ لا يغيّر)
  if (c.type === "setpass") { if (c.p) S.pass = String(c.p); if (c.sp && S.sup && c.sp !== S.pass) S.sup.pass = String(c.sp); origSave(); try { localStorage.removeItem("rws-unlock-keep"); sessionStorage.removeItem("rws-unlock"); } catch(e){} }
  if (c.type === "resetpass") { S.pass = ""; if (S.sup) S.sup.pass = ""; origSave(); try { localStorage.removeItem("rws-unlock-keep"); sessionStorage.removeItem("rws-unlock"); } catch(e){} }
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
  if (S.remote.on && base() && S.remote.pair && !S.remote.key) { state.status = "wait"; pairNow().then(function(){ start(); }, function(e){ fail(e); state.timer = setTimeout(start, 60000); }); return; }
  if (S.remote.on && base()) { poll(); state.timer = setInterval(poll, Math.max(15, +S.remote.poll || 60)*1000); }
  else state.status = "off";
}
// كل حفظ من الإعدادات على الشاشة يُرسل للخادم
var origSave = A.save;
A.save = function(){ origSave(); schedulePush(); try { if (window.LICENSE && !S.remote.on) window.LICENSE.setLink(null); } catch(e){} }; // إيقاف الإدارة عن بعد يدوياً يلغي النسخة الاحتياطية

/* ===== التفعيل بكود من لوحة المدير =====
   شاشة المسجد ترسل كود 6 أرقام إلى موقع ووردبريس، فتحصل على بيانات ربطها (الخادم ورمز الشاشة ومفتاحها) */
// عنوان الموقع إذا كان التطبيق يعمل من داخل إضافة ووردبريس نفسها
function wpSite(){ if (window.RAWAYIE_SITE) return String(window.RAWAYIE_SITE).replace(/\/+$/, ""); var m = location.href.match(/^(https?:\/\/[^?#]*?)\/wp-content\/plugins\/[^/]+\/app\//); return m ? m[1] : ""; }
function siteCandidates(site, path){
  var s = String(site || "").trim().replace(/\s+/g, ""); if (!s) return [];
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  s = s.replace(/[?#].*$/, "").replace(/\/+$/, "");
  var m = s.match(/^(.*?)\/wp-json(\/.*)?$/); if (m) s = m[1];
  path = path || "/activate";
  return [s + "/wp-json/rawayie/v1" + path, s + "/?rest_route=/rawayie/v1" + path];
}
// legacy: كود الإصدار السابق (8 أرقام) المحفوظ في الجهاز، فتُضاف الشاشة إلى لوحة الإدارة تلقائياً
function activate(site, act, legacy){
  var urls = siteCandidates(site), code = String(act || "").replace(/\D/g, "");
  if (!urls.length) return Promise.reject(new Error("اكتب عنوان الموقع"));
  if (!legacy && code.length !== 6) return Promise.reject(new Error("الكود 6 أرقام"));
  var dev = window.LICENSE ? window.LICENSE.status().id : "";
  var body = legacy ? {legacy:legacy, dev:dev, name:S.mosque || ""} : {act:code, dev:dev};
  var hard = function(m){ var e = new Error(m); e.hard = true; return e; }; // رفض صريح من الموقع (وليس انقطاع اتصال)
  var tryAt = function(i){
    return fetch(urls[i], {method:"POST", cache:"no-store", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)})
      .then(function(res){ return res.text().then(function(t){ var j = null; try { j = t ? JSON.parse(t) : null; } catch(e){}
        if (res.ok && j && j.code) return j;
        if (j && j.message && (j.code === "rws_bad" || j.code === "rws_wait" || j.code === "rws_bad_dev")) throw (j.code === "rws_wait" ? new Error(j.message) : hard(j.message));
        if (i + 1 < urls.length) return tryAt(i + 1);
        throw new Error(res.status === 404 ? "الكود غير صحيح أو انتهت صلاحيته" : "تعذر الوصول للموقع (" + res.status + ")"); }); },
      function(){ if (i + 1 < urls.length) return tryAt(i + 1); throw new Error("تعذر الوصول للموقع. تأكد من العنوان والإنترنت"); });
  };
  return tryAt(0).then(function(j){ return applyLink(j, urls[0]); });
}
// بيانات الربط من الموقع (بالكود أو برمز QR): تُحفظ في الشاشة وتبدأ المزامنة
function applyLink(j, url0){
  {
    if (S.remote.code !== j.code) S.remote.media = {}; S.remote.on = true; S.remote.server = j.server; S.remote.code = j.code; S.remote.key = j.token || ""; S.remote.rev = 0; S.remote.site = String(url0).replace(/\/wp-json\/.*$/, "").replace(/\/\?rest_route=.*$/, "");
    if (j.name && (!S.mosque || S.mosque === A.DEF.mosque)) S.mosque = j.name;
    origSave(); start();
    try { if (window.LICENSE && window.LICENSE.check) window.LICENSE.check(); } catch(e){}
    return j;
  }
}

/* ===== الربط برمز QR: الشاشة تطلب رمزاً قصيراً وتعرضه، والمشرف يعتمده من جواله =====
   السر (sec) يبقى داخل الجهاز ولا يظهر على الشاشة، فتصوير الرمز لا يكفي لأخذ بيانات الشاشة */
function postJSON(urls, body){
  var tryAt = function(i){
    return fetch(urls[i], {method:"POST", cache:"no-store", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)})
      .then(function(res){ return res.text().then(function(t){ var j = null; try { j = t ? JSON.parse(t) : null; } catch(e){}
        if (res.ok && j) return {j:j, url:urls[i]};
        if (j && j.code && j.message && res.status !== 404) { var e = new Error(j.message); e.code = j.code; e.status = res.status; throw e; }
        if (j && j.code === "rws_lk_gone") { var e2 = new Error(j.message); e2.code = j.code; throw e2; }
        if (i + 1 < urls.length) return tryAt(i + 1);
        var e3 = new Error(res.status === 404 ? "الموقع لا يدعم الربط برمز QR بعد. حدّث إضافة الموقع أو استخدم كود التفعيل" : "تعذر الوصول للموقع (" + res.status + ")"); e3.code = "rws_noqr"; throw e3; }); },
      function(){ if (i + 1 < urls.length) return tryAt(i + 1); var e = new Error("تعذر الوصول للموقع. تأكد من الإنترنت"); e.code = "net"; throw e; });
  };
  return tryAt(0);
}
function linkSession(site, cb){
  var dev = window.LICENSE ? window.LICENSE.status().id : "", alive = true, cur = null, timer = null, base = "";
  var emit = function(t, d){ if (alive) try { cb(t, d); } catch(e){} };
  var start = function(){
    clearTimeout(timer); emit("busy");
    postJSON(siteCandidates(site, "/link/start"), {dev:dev, name:S.mosque || ""}).then(function(r){ if (!alive) return;
      cur = r.j; base = r.url.replace(/link\/start$/, ""); cur.until = Date.now() + (cur.ttl || 600) * 1000; emit("code", cur); timer = setTimeout(poll, 3000); },
      function(e){ emit("error", e); if (e.code !== "rws_noqr" && e.status !== 400) timer = setTimeout(start, 15000); });
  };
  var poll = function(){ if (!alive || !cur) return;
    if (Date.now() > cur.until) { start(); return; }
    postJSON([base + "link/poll"], {code:cur.code, sec:cur.sec}).then(function(r){ if (!alive) return;
      if (r.j.status === "ok") { alive = false; applyLink(r.j, r.url); try { if (cb) cb("done", r.j); } catch(e){} return; }
      timer = setTimeout(poll, 3000); },
      function(e){ if (!alive) return; if (e.code === "rws_lk_gone") { start(); return; }
        if (e.code === "rws_dev_limit") { emit("error", e); timer = setTimeout(start, 20000); return; }
        timer = setTimeout(poll, 6000); });
  };
  start();
  return {stop:function(){ alive = false; clearTimeout(timer); }, renew:function(){ if (alive) start(); }};
}

window.REMOTE = {activate:activate, linkSession:linkSession, wpSite:wpSite, start:start, poll:poll, push:push, state:state, url:url, test:function(){
  return req("GET", "/status").then(function(){ ok(); return true; }).catch(function(e){ fail(e); throw e; }); }};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
