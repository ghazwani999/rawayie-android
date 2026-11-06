/* روائع الأذان - نسخة الويب: المحرك والشاشة */
(function(){
"use strict";
var VERSION = String(window.RWS_VERSION || "9.7"); // يُكتب تلقائياً من رقم إصدار الإضافة في version.js
var LS_KEY = "rawayie-screen-v1";
var PRAYERS = ["fajr","dhuhr","asr","maghrib","isha"];
var ALL = ["fajr","sunrise","dhuhr","asr","maghrib","isha"];

var DEF = {
  lang:"ar", mosque:"تطبيق روائع الأذان للمساجد", addr:"", alerts:[], ann:{on:true, azan:"حان الآن موعد أذان صلاة {الصلاة}، وذلك في {المسجد}", iqama:"حان الآن موعد إقامة صلاة {الصلاة}"}, splash:{on:true, sec:6, text:"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", name:true, sub:""}, city:"dammam",
  custom:{on:false, lat:26.4207, lng:50.0888, tz:180, tzName:"", method:"uq", name:"", country:"", fajr:18, isha:17, ishaMin:90, ishaBy:"angle", maghribMin:0, asr:"std", high:"angle", src:"calc", table:null},
  adj:{fajr:0,sunrise:0,dhuhr:0,asr:0,maghrib:0,isha:0}, shift:0, summer:false, ramadan30:false, hijriAdj:0,
  iq:{fajr:25,dhuhr:20,asr:20,maghrib:10,isha:20}, duha:15, overrides:{}, mtype:"jami",
  pd:{fajr:12,dhuhr:10,asr:10,maghrib:8,isha:10},
  hidePrayer:true, blackTime:true, blackDate:false, blackMsg:true, blackSize:1, hideSunrise:20, hideIsha:30, wakeBefore:20,
  offPrayer:false, offSleep:false, lockMin:15, devOpen:false, devSecs:["rotate","sounds"], sleepIsha:false, sleepSunrise:false, wakeFajr:20, wakeDhuhr:20, sleepLook:"black", sleepMsgOn:true, sleepMsgIsha:"", sleepMsgSunrise:"",
  azanScreen:true, azanDur:4, duaAfterAzan:true,
  lastMinOnly:false, noIqWait:false, lastMinBlack:false, iqNowOn:true, iqNowSec:30, circle:true, ringStyle:"clock", iqTimes:false, red90:true, nm:{size:1, frame:false, frameW:2, frameColor:"#8C7552", bg:0.35, shadow:0.4}, notifyOn:true, notifyAll:true, notifyMsg:"من فضلك اغلق الهاتف",
  hadithOn:true, hadithSec:60, hadithText:"قال رسول الله ﷺ: «من صلى علي واحدة صلى الله عليه عشرا»",
  snd:{azan:"none", iqama:"none", tone:"none", beep:true, beepFile:"beep_07a", fajrLong:true, vol:1, mute:false, v2:1, preA:{on:false, file:"beep_04", min:1}, preI:{on:true, file:"beep_07a", min:1}},
  sndRem:{items:[]},
  ayat:{on:false, sec:20, mode:"default", list:"", pos:"mid"},
  fri:{on:true, adhanTime:"", khutbah:30, dur:15, hide:true, showHijri:true, showGreg:true},
  eid:{fitrOn:false, fitr:"06:00", adhaOn:false, adha:"05:45"},
  zk:{after:true, afterMin:7, morning:true, morningMin:15, evening:true, eveningMin:15, itemSec:25,
    afterOn:{fajr:true, dhuhr:true, asr:true, maghrib:true, isha:true}, afterSec:25, morningSec:25, eveningSec:25,
    afterRounds:1, morningRounds:1, eveningRounds:1, afterPage:"", morningPage:"", eveningPage:"", afterImg:"", morningImg:"", eveningImg:"", autoSec:false, noRepeat:true, rotate:true},
  news:[
    {id:"n1", text:"سبحان الله وبحمده، سبحان الله العظيم", type:"none", days:[], date:""},
    {id:"n2", text:"نرجو المحافظة على نظافة المسجد وإغلاق الجوال قبل الصلاة", type:"none", days:[], date:""},
    {id:"n3", text:"درس أسبوعي في تفسير القرآن الكريم بعد صلاة المغرب كل إثنين", type:"week", days:[1], date:""}
  ],
  tickerOn:true, marquee:true, newsSec:12, speed:120,
  fixedOn:true, fixedZekr:"اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي",
  slides:{on:false, random:false, sec:15, every:60, items:[], pos:"zone", move:"ltr", speed:160},
  multi:{mode:"single", role:"main", adsSlot:2, sec:20, boards:true, slides:true, remind:true, adhkar:true, news:true, hadith:true},
  remind:{on:true, white:true, ashura:true, fri:true, friHour:true, show:"both"},
  boards:{on:false, rot:20, items:[]},
  look:{tpl:"std", decor:"none", decorOp:0.85, cardShape:"round", orient:"auto", oriLock:true, rot:0, bgP:"vr07.jpg", bgL:"hr00.jpg", bgHidden:[], customBg:"", tone:"auto", accent:"#EBD1A0",
        fontText:"Amiri", fontNum:"Amiri", fontZekr:"Amiri",
        h24:false, seconds:true, arabicDigits:false, dimPast:true, shadow:true,
        centerP:true, centerL:true, bigL:false, homeClock:false, bigCounter:false, nextSec:false, showCount:true, bigIqCnt:false, iqClock:false, ovGlass:true, nightTimes:true, nightShow:"maghrib", nightAfter:0, nightFrom:"21:00", nightTo:"04:00", nightMid:true, nightThird:true, netStar:false, dateSide:false, dateStyle:"badges", dayEn:true, dateTag:true, bigP:true, badgeShape:"dome", badgeShadow:false, badgeBorder:3,
        iqColorOn:false, iqColor:"#F4D58D", hiCustom:false, hiColor:"#1F5A8A", hiOpacity:0.85, hiTextOn:false, hiTextColor:"#ffffff", hiFrame:false, hiOn:true, hiZoom:false, ovClock:true, ovClkWait:true, ovSec:true, ovClkSize:1, tblStyle:"cards", tcName:"#FFD54A", tcAdhan:"#FFFFFF", tcIqama:"#FFD54A", tcHi:"#3B93E3", nbCustom:false, nbSize:1, nbShadow:0.3, nbBlur:18, nbRadius:26, nbBgOp:0.3, sysRot:false, safeArea:true, phoneBar:true, wm:true, wmOp:0.12, wmSize:0.85, wmImg:"", flag:false, rowColor:"#000000", rowOpacity:0.3, newsShade:true, newsShadeOp:0, rowAuto:true, rowShadow:0.22, rowRadius:26, rowGap:10, scMode:"move", menuBtn:true, bgMode:"manual", bgEvery:30, bgShuffle:false, bgKey:"", bgPickP:[], bgPickL:[], fs:{ts:1, ns:1, name:1, date:1, clock:1, count:1, pname:1, ptime:1, fixed:1, news:1, zk:1}, showName:true, showDay:true, showDate:true, fullClock:false, zeroH:"off", thead:true, iqFmt:"time", logoColor:"silver", logoCustom:"#EBD1A0", autoColor:true, logoOp:1, embSize:0.7, logo:true, hideVersion:false, showLoc:true, footSite:"rawayie.sa", footVer:true, showSite:true, fitMode:"fill", autoFS:true, shortcuts:true},
  dateMode:"alt", dateSec:8, offlineAllBg:false, vkb:"on", textEditor:true, blackLight:0.08, blackStyle:"bg", blackColor:"#3a2a12", blackImg:"",
  sleepBg:{isha:{style:"black", color:"#0b1a2e", light:0.2, img:""}, sunrise:{style:"black", color:"#0b1a2e", light:0.2, img:""}},
  weather:{on:true, src:"auto", lat:"", lng:"", pos:"mid"},
  texts:{after:[], morning:[], evening:[], dua:""},
  pass:"", sup:{pass:"", name:"مشرف المسجد", sections:["news","texts","slides","boards","adhkar"], fajrBg:true, rotate:false, preview:true}
};

function clone(o){ return JSON.parse(JSON.stringify(o)); }
function merge(def, v){
  if (v === undefined || v === null) return clone(def);
  if (typeof def !== "object" || def === null || Array.isArray(def)) return v;
  var o = {}; for (var k in def) o[k] = merge(def[k], v[k]);
  for (var k2 in v) if (!(k2 in def)) o[k2] = v[k2];
  return o;
}
var S;
/* 17.87: «نغمة التطبيق» عند الأذان والإقامة. الإعدادات المحفوظة قبلها تبقى بدون نغمة، فلا يتغير صوت مسجد اختار الصمت */
function sndFix(o){ if (o && o.snd && typeof o.snd === "object" && o.snd.tone === undefined) o.snd.tone = "none";
  /* 17.94: المساجد فيها مؤذن، فالأصوات نغمتا تنبيه فقط: قبل الأذان وقبل الإقامة. يتوقف صوت الأذان والإقامة،
     ويبقى التنبيه قبل الإقامة كما كان (مع رسالة الجوال سابقاً) بنغمته المختارة */
  if (o && o.snd && typeof o.snd === "object" && !o.snd.v2) { var T = o.snd;
    T.preI = {on: o.notifyOn !== false && T.beep !== false, file: T.beepFile || "beep_07a", min: 1};
    T.preA = {on: false, file: "beep_04", min: 1};
    T.azan = "none"; T.iqama = "none"; T.tone = "none"; T.v2 = 1; }
  return o; }
try { S = merge(DEF, sndFix(JSON.parse(localStorage.getItem(LS_KEY) || "null"))); } catch(e){ S = clone(DEF); }
// تشغيل أول مرة: الإعدادات الافتراضية هي أحدث تصميم، فلا تُطبَّق عليها تحويلات الإصدارات القديمة
// (كانت تفعّل إخفاء الشاشة ليلاً وضحى تلقائياً في الأجهزة الجديدة)
try { if (!localStorage.getItem(LS_KEY) && !S.lookV) S.lookV = 13; } catch(e){}
/* 17.63: شاشة «الصلاة قائمة» أثناء الصلاة صار لها خيار. من اختار سابقاً «الشاشة الرئيسية دائماً» (بدون أذان ولا انتظار ولا إقامة) تُوقف عنده تلقائياً */
/* مدة الصلاة بالدقائق: إذا كانت فارغة أو صفراً في الإعدادات (مثلاً قالب من الموقع بدون مدد) تُستخدم المدة الافتراضية،
   وإلا بدأت الأذكار بعد الإقامة مباشرة */
function pdOf(k){ var v = +((S.pd || {})[k]); return v >= 1 ? v : (+DEF.pd[k] || 10); }
function prayScreenFix(o){ if (o && o.prayScreen === undefined) o.prayScreen = !(o.azanScreen === false && o.noIqWait === true && o.iqNowOn === false && o.hidePrayer === false); return o; }
function mvFix(o){ prayScreenFix(o); if (o && o.slides && !o.slides.mv2) { o.slides.move = "ltr"; o.slides.mv2 = 1; } if (o && !o.nmV) { o.nm = o.nm || {}; o.nm.frame = false; o.nmV = 1; } return o; } // 13.8: الشرائح النصية سطر واحد متحرك تحت الساعة افتراضياً
mvFix(S);
S.slides.items = S.slides.items.map(function(x){ return typeof x === "string" ? {id:"s" + x, img:x, imgMode:"contain", active:true} : x; });
if ((S.lookV || 0) < 3) { // تصميم التطبيق الجديد: يعيد المظهر والذكر الثابت للافتراضي مرة واحدة
  S.look = clone(DEF.look); S.fixedZekr = DEF.fixedZekr; S.marquee = DEF.marquee; S.lookV = 3;
}
if (S.lookV < 4) { S.marquee = true; S.look.autoColor = true; S.look.logoOp = 1; S.lookV = 4; }
if (!S.notifyMsg || S.notifyMsg === "يرجى إغلاق الجوال أو وضعه على الصامت، تعظيمًا لحرمة المسجد وخشوع المصلين.") S.notifyMsg = DEF.notifyMsg; // العودة للعبارة القصيرة الواضحة لكبار السن
mvFix(S); // 17.24: رسالة الجوال بدون إطار (مرة واحدة، ويمكن إعادته من الإعدادات)
if (S.speed % 60) S.speed = Math.max(60, Math.min(300, Math.round(S.speed / 60) * 60)); // السرعة القديمة (مثل 110) إلى أقرب سرعة ناعمة
if (S.lookV < 5) { S.look.iqFmt = "time"; S.look.thead = true; S.look.homeClock = false; S.weather.on = true; S.lookV = 5; }
if (S.lookV < 6) { S.lastMinOnly = false; S.circle = true; S.lookV = 6; }
if (S.lookV < 7) { S.fixedOn = true; if (!String(S.fixedZekr || "").trim()) S.fixedZekr = DEF.fixedZekr; S.lookV = 7; }
if (S.lookV < 8) { // الإخفاء صار بمفتاح تفعيل مستقل ووقت عودة لكل صلاة
  var wb = +S.wakeBefore || 20; S.wakeFajr = wb; S.wakeDhuhr = wb;
  S.sleepIsha = +S.hideIsha > 0; if (!(+S.hideIsha > 0)) S.hideIsha = 30;
  S.sleepSunrise = +S.hideSunrise > 0; if (!(+S.hideSunrise > 0)) S.hideSunrise = 20;
  S.lookV = 8; }
if (S.lookV < 9) { // خلفية شاشة السكون صارت مستقلة: من كان يختار «مثل شاشة الإخفاء» تبقى خلفيته كما هي
  if (S.sleepLook === "same") { S.sleepBg.isha.style = "prayer"; S.sleepBg.sunrise.style = "prayer"; }
  S.lookV = 9; }
if (S.lookV < 10) { // استُبدلت خلفيات الصور بنسخة أعلى جودة بأسماء جديدة
  if (/^p\d\d\.jpg$/.test(S.look.bgP)) S.look.bgP = DEF.look.bgP;
  if (/^l\d\d\.jpg$/.test(S.look.bgL)) S.look.bgL = DEF.look.bgL;
  S.look.bgHidden = (S.look.bgHidden || []).filter(function(f){ return !/^[pl]\d\d\.jpg$/.test(f); });
  S.lookV = 10; }
if (S.lookV < 11) { // الشعار الفضي الشفاف صار الشكل الافتراضي (يبقى الذهبي أو اللون المخصص إن اختاره المستخدم)
  if (!S.look.logoColor || S.look.logoColor === "auto") S.look.logoColor = "silver";
  S.lookV = 11; }
if (S.lookV < 12) { // التدوير بالرسم هو الافتراضي (يعمل على كل الأجهزة ويملأ الشاشة)، مع مؤشر فأرة بالاتجاه الصحيح
  S.look.sysRot = false; S.lookV = 12; }
if (S.lookV < 13) { // محرر التطبيق ولوحته صارا المفضلين في كل الأجهزة والمتصفحات
  S.vkb = "on"; S.textEditor = true; S.lookV = 13; }
if (S.lookV < 14) { // الموقع ورقم الإصدار يظهران أسفل الشاشة في كل الشاشات: rawayie.sa 2.5.9
  S.lookV = 14; }
if (S.lookV < 15) { // أوقات الليل (منتصف الليل والثلث الأخير) تظهر افتراضياً
  S.look.nightTimes = true; S.lookV = 15; }
if (S.lookV < 16) { // جدول المواقيت بشكل بطاقات بإطار وتمييز أزرق
  S.look.tblStyle = "cards"; S.lookV = 16; }
if (S.lookV < 17) { // أسماء الصلوات وعنوان عمودها في المنتصف (رأسي وأفقي)
  S.look.centerP = true; S.look.centerL = true; S.lookV = 17; }
if (S.lookV < 18) { // ساعة شاشة انتظار الإقامة تظهر فوق العداد مباشرة
  S.look.ovClkWait = true; S.lookV = 18; }
function save(){ if (window.RAWAYIE_PREVIEW) return; try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch(e){} }

/* ===== التخزين المحلي للصور والأصوات ===== */
var IDB = (function(){
  var dbp = null;
  function open(){
    if (dbp) return dbp;
    dbp = new Promise(function(res, rej){
      try {
        var r = indexedDB.open("rawayie-media", 1);
        r.onupgradeneeded = function(){ r.result.createObjectStore("m"); };
        r.onsuccess = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); };
      } catch(e){ rej(e); }
    });
    return dbp;
  }
  function tx(mode, fn){ return open().then(function(db){ return new Promise(function(res, rej){
    var t = db.transaction("m", mode), st = t.objectStore("m"), q = fn(st);
    t.oncomplete = function(){ res(q && q.result); }; t.onerror = function(){ rej(t.error); };
  }); }); }
  return {
    put: function(id, blob){ return tx("readwrite", function(s){ return s.put(blob, id); }); },
    get: function(id){ return tx("readonly", function(s){ return s.get(id); }); },
    del: function(id){ delete urls[id]; return tx("readwrite", function(s){ return s.delete(id); }); }
  };
})();
var urls = {};
function isUrl(id){ return /^(https?:)?\/\//.test(String(id)) || /^\/[^/]/.test(String(id)); }
function mediaURL(id){
  if (!id) return Promise.resolve("");
  if (isUrl(id)) return Promise.resolve(id); // صورة من مكتبة الوسائط على الخادم
  if (urls[id]) return Promise.resolve(urls[id]);
  return IDB.get(id).then(function(b){ if (!b) return ""; urls[id] = URL.createObjectURL(b); return urls[id]; }).catch(function(){ return ""; });
}
function uid(){ return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* ===== اللغة والأرقام ===== */
function t(k){ var L = window.I18N || {}; return (L[S.lang] && L[S.lang][k]) || (L.ar && L.ar[k]) || k; }
function num(s){ s = String(s); return S.look.arabicDigits ? s.replace(/[0-9]/g, function(d){ return "٠١٢٣٤٥٦٧٨٩"[d]; }) : s; }
function two(n){ return (n < 10 ? "0" : "") + n; }
function locale(){ return S.lang === "en" ? "en" : S.lang === "bn" ? "bn" : "ar"; }

/* ===== المنطقة الزمنية ===== */
/* المنطقة الزمنية: السعودية +3، أو موقع مخصص بمنطقته الزمنية (مع التوقيت الصيفي تلقائياً إن وُجد) */
var tzFmt = {}, tzCache = {};
function tzOffset(name, ms){
  var hk = name + "|" + Math.floor(ms/3600000); if (tzCache[hk] !== undefined) return tzCache[hk];
  var v = null;
  try { var f = tzFmt[name] || (tzFmt[name] = new Intl.DateTimeFormat("en-US", {timeZone:name, hour12:false, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"}));
    var p = {}; f.formatToParts(new Date(ms)).forEach(function(x){ p[x.type] = x.value; });
    v = Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute) - Math.floor(ms/60000)*60000)/60000);
  } catch(e){ v = null; }
  if (v === null || isNaN(v)) v = +S.custom.tz || 0;
  tzCache[hk] = v; return v;
}
function tz(ms){ if (!S.custom.on) return 180; if (S.custom.tzName) return tzOffset(S.custom.tzName, ms === undefined ? Date.now() : ms); return +S.custom.tz; }
function zp(ms){ var d = new Date(ms + tz(ms)*60000);
  return {Y:d.getUTCFullYear(), M:d.getUTCMonth(), D:d.getUTCDate(), h:d.getUTCHours(), m:d.getUTCMinutes(), s:d.getUTCSeconds(), dow:d.getUTCDay()}; }
function zms(Y, M, D, h, m){ var u = Date.UTC(Y, M, D, h, m); return u - tz(u - tz(u)*60000)*60000; }
function dkey(Y, M, D){ var d = new Date(Date.UTC(Y, M, D)); return d.getUTCFullYear() + "-" + two(d.getUTCMonth()+1) + "-" + two(d.getUTCDate()); }
function hm(str){ var p = String(str).split(":"); return (+p[0])*60 + (+p[1] || 0); }

/* ===== التاريخ الهجري =====
   جدول تقويم أم القرى (1400-1500هـ) مضمّن في البرنامج، فيظهر التاريخ نفسه في كل المتصفحات والأجهزة القديمة
   بدون الاعتماد على دعم المتصفح للتقويم الهجري. خارج الجدول: الحساب الهجري الجدولي */
var HQ = {start:3611, y0:1400, bits:"a55d25e92ec96d4ae996b4aba93d49da4db2ab94baa5b52ba95b2ab5555c4bd23d91da95b4ab5a56d2b693b49b6556a9754b6a56caad555b29b92ba95d4ada55aaab595749764baa5b52b6a56e4db25b52b6a5ad2ae92f49764b6a56acad655d49da4dd16d955aa5b52da95b4ad5956ca6e4aea4f52b6956aaab54bd25d92ea96d4ada95b4aba55b29b54d6a97547693749b5556aa6b52b"};
var DN = {"ar": {"h": ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"], "g": ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"], "w": ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]}, "en": {"h": ["Muharram", "Safar", "Rabiʻ I", "Rabiʻ II", "Jumada I", "Jumada II", "Rajab", "Shaʻban", "Ramadan", "Shawwal", "Dhuʻl-Qiʻdah", "Dhuʻl-Hijjah"], "g": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], "w": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]}, "bn": {"h": ["মহররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জমাদিউল আউয়াল", "জমাদিউস সানি", "রজব", "শা‘বান", "রমজান", "শাওয়াল", "জ্বিলকদ", "জ্বিলহজ্জ"], "g": ["জানুয়ারী", "ফেব্রুয়ারী", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"], "w": ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"]}};
function names(){ return DN[locale()] || DN.ar; }
function hijriCalc(dn){
  var d = dn - HQ.start, n = HQ.bits.length / 3;
  if (d >= 0) for (var y = 0; y < n; y++) { var b = parseInt(HQ.bits.substr(y*3, 3), 16);
    for (var m = 0; m < 12; m++) { var len = (b >> (11 - m)) & 1 ? 30 : 29; if (d < len) return {year:HQ.y0 + y, month:m + 1, day:d + 1}; d -= len; } }
  // الحساب الجدولي (احتياطي خارج نطاق الجدول)
  var jd = dn + 2440588, l = jd - 1948440 + 10632, k = Math.floor((l - 1)/10631); l = l - 10631*k + 354;
  var j = Math.floor((10985 - l)/5316)*Math.floor(50*l/17719) + Math.floor(l/5670)*Math.floor(43*l/15238);
  l = l - Math.floor((30 - j)/15)*Math.floor(17719*j/50) - Math.floor(j/16)*Math.floor(15238*j/43) + 29;
  var mo = Math.floor(24*l/709), da = l - Math.floor(709*mo/24); return {year:30*k + j - 30, month:mo, day:da};
}
function hijri(Y, M, D){
  var ms = Date.UTC(Y, M, D, 12) + (+S.hijriAdj || 0)*86400000, o = hijriCalc(Math.floor(ms/86400000));
  o.monthName = names().h[o.month - 1]; o.ms = ms;
  return o;
}
function hijriText(Y, M, D){ var h = hijri(Y, M, D); return num(h.day) + " " + h.monthName + " " + num(h.year) + " " + t("hijri_year_suffix"); }
function gregText(Y, M, D){
  var g = names().g[M], l = locale();
  if (l === "en") return g + " " + num(D) + ", " + num(Y);
  if (l === "bn") return num(D) + " " + g + ", " + num(Y);
  return num(D) + " " + g + " " + num(Y) + " " + t("gregorian_year_suffix");
}
function dayName(Y, M, D){ return names().w[new Date(Date.UTC(Y, M, D, 12)).getUTCDay()]; }

/* ===== جداول أم القرى الرسمية ===== */
var UQD = {}, uqWait = {};
window.UQ = function(id, g0, h0, rows){
  var p = g0.split("-");
  UQD[id] = {start: Date.UTC(+p[0], +p[1]-1, +p[2]), rows: rows.split(" ")};
  if (uqWait[id]) uqWait[id].forEach(function(f){ f(); }); delete uqWait[id];
  dayCache = {};
};
function loadCity(id, cb){
  if (!id || UQD[id]) { if (cb) cb(); return; }
  if (uqWait[id]) { if (cb) uqWait[id].push(cb); return; }
  uqWait[id] = cb ? [cb] : [];
  var s = document.createElement("script"); s.src = "uq/" + id + ".js"; s.async = true;
  s.onerror = function(){ var w = uqWait[id] || []; delete uqWait[id]; if (s.parentNode) s.parentNode.removeChild(s); // لم يُحمَّل الجدول: محاولة أخرى بعد دقيقة
    setTimeout(function(){ loadCity(id, function(){ dayCache = {}; lastRowKey = ""; lastDay = ""; w.forEach(function(f){ try { f(); } catch(e){} }); }); }, 60000); };
  document.head.appendChild(s);
}
/* أي جدول أم القرى يُستخدم: المدينة المختارة، أو أقرب مدينة سعودية (حتى 15 كم) للموقع المخصص بطريقة أم القرى،
   فلا يختلف الفجر دقيقة بين جهاز اختار «الدمام» من القائمة وجهاز حدّد موقعه بالخريطة أو GPS داخل الدمام */
var uqNearK = "", uqNearV = "";
function uqCityId(){
  if (!S.custom.on) return S.city;
  var C = S.custom; if ((C.method && C.method !== "uq") || C.src === "table" || C.noUq) return "";
  var k = (+C.lat).toFixed(3) + "," + (+C.lng).toFixed(3); if (k === uqNearK) return uqNearV;
  var best = "", bd = 15, ids = window.UQ_IDS || [], R = Math.PI / 180;
  ids.forEach(function(id){ var c = window.CITIES && window.CITIES[id]; if (!c) return;
    var dl = (c[2] - C.lat) * R, dg = (c[3] - C.lng) * R, a = Math.sin(dl/2)*Math.sin(dl/2) + Math.cos(C.lat*R)*Math.cos(c[2]*R)*Math.sin(dg/2)*Math.sin(dg/2);
    var d = 12742 * Math.asin(Math.min(1, Math.sqrt(a))); if (d < bd) { bd = d; best = id; } });
  uqNearK = k; uqNearV = best; return best;
}
function uqRow(Y, M, D){
  var id = uqCityId(); if (!id) return null;
  var c = UQD[id]; if (!c) return null;
  var i = Math.round((Date.UTC(Y, M, D) - c.start)/86400000);
  var r = c.rows[i]; if (!r) return null;
  var o = []; for (var j = 0; j < 6; j++) o.push((+r.substr(j*4, 2))*60 + (+r.substr(j*4+2, 2)));
  return o;
}

/* ===== الحساب الفلكي (احتياطي، أو لموقع مخصص) ===== */
/* طرق الحساب: [زاوية الفجر، زاوية العشاء أو دقائقها بعد المغرب (60 فأكثر = دقائق)، زاوية المغرب إن وُجدت] */
var METHODS = {uq:[18.5, 90], mwl:[18, 17], egypt:[19.5, 17.5], isna:[15, 15], karachi:[18, 18], gulf:[19.5, 90], kuwait:[18, 17.5], qatar:[18, 90],
  dubai:[18.2, 18.2], jordan:[18, 18], morocco:[19, 17], algeria:[18, 17], tunisia:[18, 18], turkey:[18, 17], france:[12, 12], russia:[16, 15],
  singapore:[20, 18], jakim:[20, 18], kemenag:[20, 18], tehran:[17.7, 14, 4.5], jafari:[16, 14, 4]};
/* الحساب الفلكي (طريقة PrayTimes): الزوايا، والعصر (شافعي أو حنفي)، والعروض العالية، والمغرب بزاوية أو بدقائق */
function astro(Y, M, D, lat, lng, tzMin, method, isRam, o){
  o = o || {};
  var R = Math.PI/180, sin = function(d){ return Math.sin(d*R); }, cos = function(d){ return Math.cos(d*R); }, tan = function(d){ return Math.tan(d*R); };
  var asin = function(x){ return Math.asin(x)/R; }, acos = function(x){ return Math.acos(Math.max(-1, Math.min(1, x)))/R; };
  var fix = function(a, b){ return a - b*Math.floor(a/b); };
  var Dd = Date.UTC(Y, M, D, 12)/86400000 + 2440587.5 - 2451545;
  var g = fix(357.529 + 0.98560028*Dd, 360), q = fix(280.459 + 0.98564736*Dd, 360);
  var L = fix(q + 1.915*sin(g) + 0.020*sin(2*g), 360), e = 23.439 - 0.00000036*Dd;
  var RA = fix(Math.atan2(cos(e)*sin(L), cos(L))/R, 360)/15;
  var eqt = q/15 - RA; if (eqt > 12) eqt -= 24; if (eqt < -12) eqt += 24;
  var dec = asin(sin(e)*sin(L)), noon = 12 + tzMin/60 - lng/15 - eqt;
  var T = function(a){ var c = (-sin(a) - sin(lat)*sin(dec))/(cos(lat)*cos(dec)); return Math.abs(c) > 1 ? NaN : Math.acos(c)/R/15; };
  var asrF = o.asr === "hanafi" ? 2 : 1;
  var altA = Math.atan2(1, asrF + tan(Math.abs(lat - dec)))/R;
  var asr = noon + acos((sin(altA) - sin(lat)*sin(dec))/(cos(lat)*cos(dec)))/15;
  var m = method === "custom" ? [+o.fajr || 18, o.ishaBy === "min" ? Math.max(60, +o.ishaMin || 90) : (+o.isha || 17)] : (METHODS[method] || METHODS.uq);
  var tSun = T(0.833), sunrise = noon - tSun, sunset = noon + tSun;
  var maghrib = m[2] ? noon + T(m[2]) : sunset + (+o.maghribMin || 0)/60;
  var fajr = noon - T(m[0]);
  var isha = m[1] >= 60 ? maghrib + (m[1] + (isRam ? 30 : 0))/60 : noon + T(m[1]);
  // العروض العالية: إذا لم تصل الشمس للزاوية أو طال الوقت عن جزء الليل المسموح
  if (!isNaN(sunrise) && !isNaN(sunset)) {
    var night = 24 - (sunset - sunrise), hl = o.high || "angle";
    var part = function(ang){ return hl === "mid" ? 0.5 : hl === "seventh" ? 1/7 : ang/60; };
    if (hl === "none") hl = "angle"; // «بدون» تطبق فقط عندما تصل الشمس للزاوية، وإلا يُستخدم جزء الليل حتى لا يضيع الوقت
    var pf = part(m[0])*night; if (isNaN(fajr) || (o.high !== "none" && sunrise - fajr > pf)) fajr = sunrise - pf;
    if (m[1] < 60) { var pi = part(m[1])*night; if (isNaN(isha) || (o.high !== "none" && isha - sunset > pi)) isha = sunset + pi; }
  }
  return [fajr, sunrise, noon + 1/60, asr, maghrib, isha].map(function(h){ return isNaN(h) ? 0 : Math.round(h*60); });
}
function cityInfo(){ if (S.custom.on) return {name:S.custom.name || "", lat:+S.custom.lat, lng:+S.custom.lng};
  var c = window.CITIES[S.city] || window.CITIES.dammam; return {name:c[0], lat:c[2], lng:c[3]}; }

/* ===== مواقيت اليوم ===== */
var dayCache = {};
function dayTimes(Y, M, D){
  var key = dkey(Y, M, D); if (dayCache[key]) return dayCache[key];
  var nd = new Date(Date.UTC(Y, M, D)); Y = nd.getUTCFullYear(); M = nd.getUTCMonth(); D = nd.getUTCDate();
  var h = hijri(Y, M, D), isRam = h.month === 9, dow = nd.getUTCDay();
  var base = uqRow(Y, M, D), src = "uq";
  if (!base) { var ci = cityInfo(); src = "astro";
    var tb = S.custom.on && S.custom.src === "table" && S.custom.table ? S.custom.table[two(M + 1) + "-" + two(D)] : null;
    if (tb && tb.length >= 6) { base = tb.slice(0, 6); src = "table"; }
    else base = astro(Y, M, D, ci.lat, ci.lng, tz(Date.UTC(Y, M, D, 12)), S.custom.on ? S.custom.method : "uq", isRam && (S.ramadan30 || !S.custom.on || S.custom.method === "uq"), S.custom.on ? S.custom : null); }
  var ov = S.overrides[key] || {};
  var fri = S.fri.on && dow === 5;
  var list = ALL.map(function(k, i){
    var min = ov[k] ? hm(ov[k]) : base[i] + (+S.adj[k] || 0) + (+S.shift || 0) + (S.summer ? 60 : 0);
    if (k === "dhuhr" && fri && S.fri.adhanTime) min = hm(S.fri.adhanTime);
    var A = zms(Y, M, D, 0, min), iqMin;
    if (k === "sunrise") iqMin = +S.duha;
    else if (k === "dhuhr" && fri) iqMin = (+S.azanDur) + (+S.fri.khutbah);
    else iqMin = +S.iq[k];
    return {k:k, name: (k === "dhuhr" && fri) ? t("friday") : t(k), A:A, I:A + iqMin*60000, fri: k === "dhuhr" && fri,
            pd: (k === "dhuhr" && fri) ? (+S.fri.dur || 15) : pdOf(k), edited: !!ov[k]};
  });
  var eid = null;
  if (S.eid.fitrOn && h.month === 10 && h.day === 1) eid = {k:"eid", name:t("eid_al_fitr"), A:zms(Y, M, D, 0, hm(S.eid.fitr))};
  if (S.eid.adhaOn && h.month === 12 && h.day === 10) eid = {k:"eid", name:t("eid_al_adha"), A:zms(Y, M, D, 0, hm(S.eid.adha))};
  if (eid) eid.I = eid.A;
  var r = {Y:Y, M:M, D:D, key:key, list:list, src:src, eid:eid, hijri:h, dow:dow};
  dayCache[key] = r; return r;
}
function byK(day, k){ for (var i = 0; i < day.list.length; i++) if (day.list[i].k === k) return day.list[i]; }

/* ===== الحالة الحالية ===== */
var zkPrev = null;
function zkPreview(kind, sec, tpl){ var n0 = Date.now(); zkPrev = kind ? {kind:kind, start:n0, until:n0 + (sec || 40) * 1000, tpl:tpl || ""} : null; zkPlans = {}; ovKey = ""; try { tick(true); } catch(e){} }
function phase(now){
  var z = zp(now), today = dayTimes(z.Y, z.M, z.D), yest = dayTimes(z.Y, z.M, z.D - 1), tom = dayTimes(z.Y, z.M, z.D + 1);
  var M60 = 60000, res = {today:today, tom:tom, mode:"", p:null};
  var cands = today.list.filter(function(x){ return x.k !== "sunrise"; }).reverse();
  var cur = null; for (var i = 0; i < cands.length; i++) if (now >= cands[i].A) { cur = cands[i]; break; }
  if (!cur) cur = byK(yest, "isha");
  res.cur = cur;
  var p = cur, A = p.A, I = p.I, az = (+S.azanDur)*M60;
  res.p = p;
  if (now < A + az && S.azanScreen && now < I) res.mode = "azan";
  else if (p.fri && now < I) res.mode = "khutbah";
  else if (S.duaAfterAzan && now < A + az + M60 && now < I) res.mode = "dua";
  // بدون شاشة انتظار الإقامة إطلاقاً (رغبة بعض المؤذنين): تبقى الشاشة الرئيسية ظاهرة حتى وقت الإقامة
  else if (now < I) res.mode = S.noIqWait === true ? "" : (S.lastMinOnly !== true || I - now <= M60) ? "iqcount" : "";
  else if (S.iqNowOn !== false && now < I + Math.max(5, +S.iqNowSec || 30)*1000) res.mode = "iqnow"; // شاشة الإقامة قبل الشاشة السوداء
  else if (now < I + p.pd*M60) { res.inPrayer = true; res.mode = ((p.fri ? S.fri.hide : S.hidePrayer) ? "black" : S.prayScreen === false ? "" : "praying"); } // بدون شاشة «الصلاة قائمة»: تبقى الشاشة الرئيسية
  else {
    var tt = I + p.pd*M60, Z = S.zk, aOn = Z.after && (!Z.afterOn || Z.afterOn[p.k === "jumuah" ? "dhuhr" : p.k] !== false);
    var pa = aOn ? zkPlan("after", tt) : null;
    if (pa && now < tt + pa.total) res.mode = "zk-after", res.zkStart = tt, res.zkPlan = pa;
    else {
      if (pa) tt += pa.total;
      var kind = p.k === "fajr" && Z.morning ? "morning" : p.k === "asr" && Z.evening ? "evening" : "", pm = kind ? zkPlan(kind, tt) : null;
      if (pm && now < tt + pm.total) res.mode = "zk-" + kind, res.zkStart = tt, res.zkPlan = pm;
    }
  }
  // وضع السكون: إخفاء الشاشة بعد العشاء حتى قبل الفجر، وبعد الشروق حتى قبل الظهر (الجهاز يبقى يعمل)
  if (!res.mode && S.sleepIsha && p.k === "isha") {
    var st = I + p.pd*M60 + (+S.hideIsha || 0)*M60, nf = (p === byK(today, "isha")) ? byK(tom, "fajr") : byK(today, "fajr");
    if (now >= st && now < nf.A - (+S.wakeFajr || 0)*M60) res.mode = "black", res.sleep = true, res.sleepKind = "isha", res.wakeAt = nf.A - (+S.wakeFajr || 0)*M60;
  }
  if (!res.mode && S.sleepSunrise) {
    var sr = byK(today, "sunrise"), dh = byK(today, "dhuhr");
    if (now >= sr.A + (+S.hideSunrise || 0)*M60 && now < dh.A - (+S.wakeDhuhr || 0)*M60) res.mode = "black", res.sleep = true, res.sleepKind = "sunrise", res.wakeAt = dh.A - (+S.wakeDhuhr || 0)*M60;
  }
  // الصلاة القادمة
  var P = today.list.filter(function(x){ return x.k !== "sunrise"; });
  if (today.eid) P = P.concat([today.eid]).sort(function(a, b){ return a.A - b.A; });
  var nx = null; for (var j = 0; j < P.length; j++) if (P[j].A > now) { nx = P[j]; break; }
  res.next = nx || byK(tom, "fajr");
  res.inIqama = now >= p.A && now < p.I && p.k !== "eid";
  if (zkPrev && now < zkPrev.until && !res.mode) { // معاينة لوحة الأذكار من الإعدادات (لا تُعرض فوق الأذان أو الإقامة)
    var zp0 = zkPlan(zkPrev.kind, zkPrev.start, zkPrev.tpl); if (zp0) { res.mode = "zk-" + zkPrev.kind; res.zkStart = zkPrev.start; res.zkPlan = zp0; res.zkPrev = true; } }
  else if (zkPrev && now >= zkPrev.until) zkPrev = null;
  res.hi = res.inIqama ? p.k : (nx ? nx.k : "fajr");
  return res;
}

/* ===== التنسيق ===== */
// كل رقم في خانة ثابتة العرض حتى لا تهتز الساعة مع تغيّر الثواني
function digits(el, str){
  if (!el) return; str = String(str);
  if (el._dv === str) return; el._dv = str;
  // bdo يفرض ترتيب الأرقام من اليسار لليمين دائماً (الدقائق ثم الثواني)، حتى لو كان اتجاه الصفحة عربياً في أي متصفح أو تلفاز
  el.innerHTML = '<bdo dir="ltr">' + str.replace(/[\s\S]/g, function(ch){
    if (/[0-9\u0660-\u0669]/.test(ch)) return '<span class="dg">' + ch + '</span>';
    if (ch === ":") return '<span class="dc">:</span>';
    return ch === "<" ? "&lt;" : ch === "&" ? "&amp;" : ch;
  }) + '</bdo>';
}
function fmtT(ms, sec, clk){
  var z = zp(ms), h = z.h, zr = S.look.zeroH === "all" || (clk && S.look.zeroH === "clock");
  if (!S.look.h24) h = h % 12 || 12;
  return num((S.look.h24 || zr ? two(h) : h) + ":" + two(z.m) + (sec ? ":" + two(z.s) : ""));
}
// صباحاً/مساءً مع الأرقام العربية، وAM/PM مع الأرقام الإنجليزية
function ampm(ms){ if (S.look.h24) return ""; var pm = zp(ms).h >= 12; return S.look.arabicDigits ? (pm ? "مساءً" : "صباحاً") : (pm ? "PM" : "AM"); }
function dur(sec, withSec){
  sec = Math.max(0, sec); var h = Math.floor(sec/3600), m = Math.floor(sec%3600/60), s = sec%60;
  return num((h ? h + ":" + two(m) : m) + (withSec !== false ? ":" + two(s) : ""));
}
function leftFor(name){
  if (S.lang === "ar") return /^ال/.test(name) ? "المتبقي لل" + name.slice(2) : "المتبقي ل" + name;
  return t("left_for") + " " + name;
}

// الاسم الافتراضي القديم «مسجد الحي» في شاشة لم تُفعَّل بعد: يصبح اسم التطبيق حتى يأتي اسم المسجد من التفعيل
if (S.mosque === "مسجد الحي" && !(S.remote && S.remote.on && S.remote.server)) { S.mosque = DEF.mosque; try { save(); } catch(e){} }

/* ===== العرض ===== */
var $ = function(s, r){ return (r || document).querySelector(s); };
var stage, ovEl, mainEl, layout = "", ui = {};
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

/* تدوير الشاشة: في تطبيق أندرويد يُطلب التدوير من النظام نفسه، فتتحرك الفأرة وأزرار الريموت بالاتجاه الصحيح.
   إذا لم يستجب الجهاز (أو في المتصفح) يكمل التطبيق الدوران المتبقي برسم الشاشة مدوّرة كما كان */
var natKey = "";
function rotCSS(){
  var r = (((+S.look.rot || 0) % 360) + 360) % 360, AN = window.RawayieAndroid;
  // القفل: شاشة طولية فعلياً لا تُدوَّر 90° فتصبح أفقية (التدوير 90° فقط للتلفاز العرضي المركّب عمودياً)
  if (S.look.oriLock !== false && S.look.sysRot !== true && innerHeight > innerWidth && (r === 90 || r === 270)) r = 0;
  // المعاينة والإدارة من الموقع: تُعرض الشاشة معتدلة كما يراها المصلون، لا مدوّرة كما تُرسل لجهاز مركّب بالعرض
  if (window.RAWAYIE_PREVIEW && !AN) return 0;
  if (!AN || !AN.setRotation || window.RAWAYIE_PREVIEW) return r;
  var want = S.look.sysRot === true ? r : -1;
  if (AN.setStatusBar) { var sb = S.look.phoneBar !== false; if (rotCSS.sb !== sb) { rotCSS.sb = sb; try { AN.setStatusBar(sb); } catch(e){} } }
  if (natKey !== String(want)) { natKey = String(want); try { AN.setRotation(want); } catch(e){} }
  // بدون تدوير النظام: الجهاز يتصرف كعادته (الجوال يدور مع الحساس) والتدوير المختار يُرسم فوقه
  var n = 0; if (want >= 0) try { n = +AN.nativeRot() || 0; } catch(e){}
  var res = (((r - n) % 360) + 360) % 360;
  // الدوران المتبقي بالرسم: يخبر التطبيق ليحرك مؤشر فأرة خاص بالاتجاه الصحيح
  if (AN.setCssRot && rotCSS.last !== res) { rotCSS.last = res; try { AN.setCssRot(res); } catch(e){} }
  return res;
}
// عجلة الفأرة مع المؤشر الخاص: تمرير أقرب قائمة تحت المؤشر
window.__vwheel = function(fx, fy, d){
  var el = document.elementFromPoint(fx * innerWidth, fy * innerHeight);
  while (el && el !== document.body) { var cs = getComputedStyle(el);
    if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) { el.scrollTop += d * 90; return; }
    el = el.parentElement; }
};
/* مساحة الكاميرا الأمامية (النوتش) وحواف الشاشة المنحنية: تُترك فارغة حتى لا يغطي الكاميرا أي نص */
var insProbe = null;
function safeIns(){
  var o = {t:0, l:0, r:0, b:0}, AN = window.RawayieAndroid;
  try { if (AN && AN.safeInsets) { var j = JSON.parse(AN.safeInsets()); o = {t:+j.top || 0, l:+j.left || 0, r:+j.right || 0, b:+j.bottom || 0}; } } catch(e){}
  try {
    if (!insProbe) { insProbe = document.createElement("div"); insProbe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)"; document.body.appendChild(insProbe); }
    var cs = getComputedStyle(insProbe);
    o.t = Math.max(o.t, parseFloat(cs.paddingTop) || 0); o.r = Math.max(o.r, parseFloat(cs.paddingRight) || 0);
    o.b = Math.max(o.b, parseFloat(cs.paddingBottom) || 0); o.l = Math.max(o.l, parseFloat(cs.paddingLeft) || 0);
  } catch(e){}
  var mw = innerWidth * .2, mh = innerHeight * .2;
  o.t = Math.min(o.t, mh); o.b = Math.min(o.b, mh); o.l = Math.min(o.l, mw); o.r = Math.min(o.r, mw);
  if (S.look.safeArea === false) o = {t:0, l:0, r:0, b:0};
  return o;
}
/* قفل الاتجاه: التدوير المعتمد من الإعدادات يُحفظ في rotOk، وأي تدوير يدوي آخر (زر الاختصار أو الريموت) يرجع تلقائياً بعد دقيقة */
var rotGuardT = 0;
function rotGuard(){
  var L0 = S.look; if (L0.oriLock === false) return;
  if (L0.rotOk === undefined) { L0.rotOk = +L0.rot || 0; save(); return; }
  if ((+L0.rot || 0) === (+L0.rotOk || 0)) { rotGuardT = 0; return; }
  if (!rotGuardT) { rotGuardT = Date.now() + 60000; return; }
  if (Date.now() >= rotGuardT) { rotGuardT = 0; L0.rot = +L0.rotOk || 0; save(); rebuild(); try { scrMsg("رجعت الشاشة لاتجاهها الصحيح"); } catch(e){} }
}
function orient(){
  var r = rotCSS(), w = innerWidth, h = innerHeight;
  if (r === 90 || r === 270) { var x = w; w = h; h = x; }
  if (S.look.oriLock === false && S.look.orient === "portrait") return "P"; // القفل: الاتجاه دائماً حسب الشاشة الفعلية
  if (S.look.oriLock === false && S.look.orient === "landscape") return "L";
  if (window.RAWAYIE_PREVIEW && !window.RawayieAndroid) { var r0 = (((+S.look.rot || 0) % 360) + 360) % 360; if (r0 === 90 || r0 === 270) return "P"; }
  return h >= w ? "P" : "L";
}
/* هل يُعرض المسرح بـ zoom (حاد) أم بـ scale (الطريقة القديمة)؟ */
function rwsZoomOK(){
  try { if (localStorage.getItem("rawayie-render") === "scale") return false; } catch(e){}
  try { return !window.CSS || !CSS.supports || CSS.supports("zoom", "2"); } catch(e){ return true; }
}
function fit(){
  if (!stage) return; // الإعدادات وصلت من الموقع قبل تجهيز الصفحة (لوحة التعديل تُفتح مخفية): يُرسم عند بدء التشغيل
  var o = orient(), W = o === "P" ? 1080 : 1920, H = o === "P" ? 1920 : 1080, r = rotCSS();
  var si = safeIns(), vw = innerWidth, vh = innerHeight, RW = vw, RH = vh;
  var rs = document.documentElement.style; rs.setProperty("--sat", si.t + "px"); rs.setProperty("--sab", si.b + "px"); rs.setProperty("--sal", si.l + "px"); rs.setProperty("--sar", si.r + "px");
  if (r === 90 || r === 270) { var x = vw; vw = vh; vh = x; }
  // ملء الشاشة بالكامل: يتمدد ارتفاع التصميم حسب نسبة الجهاز (جوال، تابلت، تلفاز 4:3 أو 21:9) فلا تظهر أشرطة سوداء
  // اتجاه التصميم عكس اتجاه النافذة (معاينة شاشة مدوّرة في الموقع، أو رأسي مفروض على شاشة عرضية): تُؤخذ نسبة الشاشة المقلوبة فلا تنضغط الصفوف
  var av = vw, ah = vh; if (vw && vh && (o === "P") !== (vh >= vw)) { av = vh; ah = vw; }
  if ((S.look.fitMode || "fill") === "fill" && vw && vh) H = o === "P" ? Math.min(2600, Math.max(1440, W*ah/av)) : Math.min(1440, Math.max(800, W*ah/av)); // بدون تقريب: يملأ الشاشة تماماً حتى آخر بكسل
  var sc = Math.min(vw/W, vh/H);
  // مساحة الكاميرا وشريط الحالة داخل الشاشة (بوحدات التصميم) حسب اتجاه التدوير
  var q = r === 180 ? [si.b, si.l, si.t, si.r] : r === 90 ? [si.l, si.b, si.r, si.t] : r === 270 ? [si.r, si.t, si.l, si.b] : [si.t, si.r, si.b, si.l];
  ["--it", "--ir", "--ib", "--il"].forEach(function(k, i){ stage.style.setProperty(k, (q[i] / sc).toFixed(1) + "px"); });
  stage.style.width = W + "px"; stage.style.height = H + "px"; stage.style.setProperty("--xz", Math.max(1, Math.min(1.25, H / (o === "P" ? 1920 : 1080))).toFixed(3)); // شاشة أطول من التصميم (جوال): تكبير عناصر شاشات الأذان والإقامة لملء المساحة
  // التموضع على بكسلات كاملة في الجهاز: الإزاحة بأنصاف البكسل تجعل النصوص والخطوط والصور ضبابية
  var dpr = window.devicePixelRatio || 1, px = function(v){ return Math.round(v*dpr)/dpr; };
  window.RWS_PXK = sc * dpr; // بكسلات الجهاز لكل بكسل في التصميم: لضبط سرعة الشريط على بكسلات كاملة
  var side = r === 90 || r === 270, bw = (side ? H : W)*sc, bh = (side ? W : H)*sc, x0 = (RW - bw)/2, y0 = (RH - bh)/2;
  var tx = r === 90 || r === 180 ? x0 + bw : x0, ty = r === 180 || r === 270 ? y0 + bh : y0;
  /* الرسم الحاد: كان التصميم (1080×1920 أو 1920×1080) يُرسم بمقاسه ثم يُصغَّر أو يُكبَّر بـ transform: scale()،
     فتقع النصوص وحواف الصفوف والبطاقات على أجزاء من البكسل وتظهر ناعمة ومشوشة، خاصة على أجهزة 720p.
     الآن يُعرض المسرح بـ zoom: المتصفح يعيد تخطيط كل شيء بمقاسه الحقيقي على الشاشة ويثبّت الحواف على بكسلات كاملة.
     التدوير والتموضع في غلاف خارجي (#stagebox) بلا تكبير، فلا يختلف السلوك بين نسخ WebView القديمة والحديثة.
     التصميم نفسه لم يتغير: نفس المقاسات بوحدات التصميم. للمقارنة: localStorage «rawayie-render» = «scale» يعيد الطريقة القديمة */
  var useZoom = rwsZoomOK();
  var box = stage.parentNode && stage.parentNode.id === "stagebox" ? stage.parentNode : null;
  if (useZoom && !box) { box = document.createElement("div"); box.id = "stagebox"; stage.parentNode.insertBefore(box, stage); box.appendChild(stage); }
  stage.style.left = "0"; stage.style.top = "0"; stage.style.transformOrigin = "0 0";
  if (useZoom) {
    box.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;transform:translate(" + px(tx) + "px," + px(ty) + "px) rotate(" + r + "deg)";
    stage.style.transform = "none"; stage.style.zoom = String(sc);
  } else {
    if (box) box.style.transform = "none";
    stage.style.zoom = "";
    stage.style.transform = "translate(" + px(tx) + "px," + px(ty) + "px) rotate(" + r + "deg) scale(" + sc + ")";
  }
  // طبقة الإعدادات ولوحة المفاتيح: كانت تتوسط الشاشة بـ translate(-50%,-50%) فتقع على نصف بكسل في كثير من الأجهزة
  // (الجوالات والأجهزة اللوحية خاصة مع التدوير) فتظهر كل النصوص ضبابية. الآن تُثبّت من الزاوية على بكسلات كاملة
  var uiL = document.getElementById("ui");
  if (uiL) { var uw = side ? RH : RW, uh = side ? RW : RH, ux = r === 90 || r === 180 ? RW : 0, uy = r === 180 || r === 270 ? RH : 0;
    uiL.style.left = "0"; uiL.style.top = "0"; uiL.style.width = uw + "px"; uiL.style.height = uh + "px"; uiL.style.transformOrigin = "0 0";
    uiL.style.transform = "translate(" + px(ux) + "px," + px(uy) + "px) rotate(" + r + "deg)"; }
  var mb = document.getElementById("menu"); if (mb) mb.hidden = S.look.menuBtn === false;
  document.documentElement.setAttribute("data-rot", String(((r % 360) + 360) % 360));
  // حجم لوحة الإعدادات حسب دقة الشاشة: 1 حتى 1080p، ويكبر تدريجياً حتى 2.2 في شاشات 4K وما فوق
  var uiz = Math.max(1, Math.min(2.2, Math.min(vw, vh) / 1100)); document.documentElement.style.setProperty("--uiz", uiz.toFixed(2));
  if (o !== layout) build();
}

/* الخلفيات المتاحة بعد استبعاد ما حذفه المستخدم (تبقى خلفية واحدة على الأقل) */
function bgList(o){
  var all = o === "P" ? window.BG_P : window.BG_L, hid = S.look.bgHidden || [];
  var l = all.filter(function(b){ return hid.indexOf(b[0]) < 0; });
  return l.length ? l : all;
}
function bgInfo(){
  var o = orient(), list = o === "P" ? window.BG_P : window.BG_L, f = o === "P" ? S.look.bgP : S.look.bgL, it = null;
  for (var i = 0; i < list.length; i++) if (list[i][0] === f) it = list[i];
  if (!it) { var df = o === "P" ? DEF.look.bgP : DEF.look.bgL; for (var j = 0; j < list.length; j++) if (list[j][0] === df) it = list[j]; } // خلفية قديمة لم تعد موجودة
  if (!it) it = list[0];
  return {file:it[0], lum:it[1], arch:!!it[2]};
}
function hex2hsl(hex){ var n = parseInt(hex.slice(1), 16), r = (n >> 16)/255, g = (n >> 8 & 255)/255, b = (n & 255)/255;
  var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn)/2, h = 0, s = 0, d = mx - mn;
  if (d) { s = l > .5 ? d/(2 - mx - mn) : d/(mx + mn); h = mx === r ? (g - b)/d + (g < b ? 6 : 0) : mx === g ? (b - r)/d + 2 : (r - g)/d + 4; h *= 60; }
  return [h, s, l]; }
function hsl(h, s, l){ s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
  var c = (1 - Math.abs(2*l - 1))*s, x = c*(1 - Math.abs((h/60)%2 - 1)), m = l - c/2, r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  var hx = function(v){ v = Math.round((v + m)*255).toString(16); return v.length < 2 ? "0" + v : v; };
  return "#" + hx(r) + hx(g) + hx(b); }
function mixHex(a, b, t){ var A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), o = "#";
  [16, 8, 0].forEach(function(sh){ var v = Math.round(((A >> sh) & 255)*(1 - t) + ((B >> sh) & 255)*t).toString(16); o += v.length < 2 ? "0" + v : v; }); return o; }
function applyLook(){
  var b = bgInfo(), light = S.look.tone === "light" ? true : S.look.tone === "dark" ? false : b.lum > 150;
  if (S.look.customBg) light = S.look.tone === "light";
  var st = stage.style, L = S.look, auto = L.autoColor && !L.customBg && window.BG_COLOR && window.BG_COLOR[b.file];
  var fg, fg2, acc, accRaw, row, hi;
  if (auto) {
    var c = hex2hsl(window.BG_COLOR[b.file]), h = c[0], neutral = c[1] < .12;
    var tintDark = neutral ? "#EBD1A0" : mixHex("#EBD1A0", hsl(h, .65, .82), .45);
    accRaw = tintDark;
    if (light) { fg = hsl(h, neutral ? .1 : .45, .14); fg2 = hsl(h, .3, .32); acc = neutral ? "#6b4c14" : hsl(h, .6, .28); row = hexA("#ffffff", +L.rowOpacity + .15); hi = hexA(hsl(h, .5, .2), .82); }
    else { fg = neutral ? "#ffffff" : hsl(h, .35, .97); fg2 = hsl(h, .2, .82); acc = tintDark; row = hexA(hsl(h, neutral ? .1 : .7, .1), +L.rowOpacity + .1); hi = hexA(hsl(h, .4, .92), .18); }
  } else {
    fg = light ? "#1d1a16" : "#ffffff"; fg2 = light ? "rgba(29,26,22,.72)" : "rgba(255,255,255,.78)";
    acc = light ? shade(L.accent) : L.accent; accRaw = L.accent; row = hexA(L.rowColor || "#000000", +L.rowOpacity);
    hi = hexA(L.hiCustom ? L.hiColor : (light ? "#1d1a16" : "#ffffff"), L.hiCustom ? +L.hiOpacity : (light ? .8 : .14));
  }
  if (L.hiCustom) hi = hexA(L.hiColor, +L.hiOpacity);
  st.setProperty("--fg", fg); st.setProperty("--fg2", fg2); st.setProperty("--acc", acc); st.setProperty("--accraw", accRaw);
  st.setProperty("--panel", light ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.3)");
  st.setProperty("--line", light ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.14)");
  // تمييز الصلاة القادمة: لون الخلفية وشفافيتها، ولون نصوصها، أو إطار فقط بدل التعبئة
  var hiTx = L.hiTextOn && L.hiTextColor ? L.hiTextColor : "";
  st.setProperty("--hi", hi); st.setProperty("--hifg", hiTx || "#fff");
  st.setProperty("--hiline", L.hiCustom ? L.hiColor : acc);
  stage.classList.toggle("hitxt", !!hiTx); stage.classList.toggle("hiframe", !!L.hiFrame); stage.classList.toggle("hizoom", !!L.hiZoom);
  // شكل جدول المواقيت: بطاقات بإطار رفيع، والصلاة القادمة بتعبئة ملوّنة
  // شريط أوقات الليل: الحجم والظل والاستدارة وشفافية الخلفية
  st.setProperty("--nbs", Math.max(.5, Math.min(1.8, +L.nbSize || 1)));
  if (L.nbCustom) { var nsh = +L.nbShadow, nbl = +L.nbBlur;
    st.setProperty("--nbrad", (+L.nbRadius) + "px"); st.setProperty("--nbbg", hexA(L.rowColor || "#000000", +L.nbBgOp));
    st.setProperty("--nbsh", nsh > 0 ? "0 " + Math.round(nbl/3) + "px " + nbl + "px rgba(0,0,0," + nsh + ")" : "none"); }
  else { st.removeProperty("--nbrad"); st.removeProperty("--nbbg"); st.removeProperty("--nbsh"); }
  var tc = L.tblStyle === "cards"; stage.classList.toggle("tcards", tc); setTimeout(fitRows, 60);
  if (tc) { st.setProperty("--tcn", L.tcName || "#FFD54A"); st.setProperty("--tca", L.tcAdhan || "#FFFFFF"); st.setProperty("--tci", L.tcIqama || "#FFD54A");
    st.setProperty("--tch", L.hiCustom ? hexA(L.hiColor, Math.max(+L.hiOpacity, .6)) : (L.tcHi || "#3B93E3")); }
  // علامة مائية شفافة خلف جدول المواقيت (الهلال والمسجد)
  stage.classList.toggle("wmon", L.wm !== false); st.setProperty("--wmop", +L.wmOp || .12); st.setProperty("--wmh", Math.round((+L.wmSize || .85) * 100) + "%");
  if (L.wmImg) { var wid = L.wmImg; mediaURL(wid).then(function(u){ if (S.look.wmImg === wid && u) stage.style.setProperty("--wmimg", 'url("' + u + '")'); }); } else st.removeProperty("--wmimg");
  if (!(auto && L.rowAuto)) row = hexA(L.rowColor || "#000000", +L.rowOpacity);
  st.setProperty("--rowbg", row);
  // ظل شريط الإعلانات أسفل الشاشة: تلقائي مثل جدول المواقيت، أو بدرجة مخصصة، أو بدون ظل
  st.setProperty("--newsbg", L.newsShade === false ? "transparent" : (+L.newsShadeOp > 0 ? hexA(light ? "#ffffff" : "#000000", +L.newsShadeOp) : row));
  stage.classList.toggle("nonewsbg", L.newsShade === false);
  st.setProperty("--rowsh", "0 6px 18px rgba(0,0,0," + (+L.rowShadow) + ")");
  st.setProperty("--rowrad", (+L.rowRadius) + "px"); st.setProperty("--rowgap", (+L.rowGap) + "px");
  var fs = L.fs || {}; ["ts","ns"].forEach(function(k){ st.setProperty("--" + k, +(fs[k] || 1)); });
  var NM = S.nm || {}; st.setProperty("--nms", String(Math.max(.5, Math.min(1.8, +NM.size || 1)))); st.setProperty("--nmsh", String(Math.max(0, Math.min(1, NM.shadow == null ? .4 : +NM.shadow)))); // رسالة إغلاق الجوال: الحجم والظل والإطار
  st.setProperty("--nmbc", NM.frameColor ? NM.frameColor : "rgba(255,217,160,.35)"); st.setProperty("--nmbw", Math.max(0, Math.min(8, NM.frameW == null ? 2 : +NM.frameW)) + "px"); st.setProperty("--nmbg", String(Math.max(0, Math.min(.9, NM.bg == null ? .35 : +NM.bg))));
  stage.classList.toggle("nmnofr", NM.frame === false);
  ["name","date","clock","count","pname","ptime","iq","fixed","news"].forEach(function(k){ st.setProperty("--s-" + k, +(fs[k] || 1)); });
  st.setProperty("--logoop", L.logoOp == null ? 1 : +L.logoOp);
  st.setProperty("--emb", L.embSize == null ? .7 : +L.embSize);
  var lc = L.logoColor === "custom" ? (L.logoCustom || "#EBD1A0") : (light ? (auto ? acc : shade(L.accent)) : (auto ? accRaw : L.accent));
  if (lc.indexOf("rgb") === 0) { var m3 = lc.match(/\d+/g); lc = "#" + m3.slice(0, 3).map(function(v){ v = (+v).toString(16); return v.length < 2 ? "0" + v : v; }).join(""); }
  // لون الشعار حسب إضاءة الخلفية خلفه تحديداً (وليس متوسط الصورة كلها) ليبقى بأعلى تباين على كل الخلفيات
  var bl = window.BG_LOGO && !L.customBg ? window.BG_LOGO[b.file] : null, logoDark = bl != null ? bl > 234 : light;
  stage.classList.toggle("logodk", logoDark); stage.classList.toggle("logolt", !logoDark);
  st.setProperty("--logog", L.logoColor === "silver" && logoDark
    // على الخلفيات الفاتحة يصبح الفضي رمادياً داكناً (جرافيت) ليبقى الشعار واضحاً بتباين عالٍ
    ? "repeating-linear-gradient(180deg,rgba(255,255,255,0) 0,rgba(255,255,255,0) 3px,rgba(255,255,255,.06) 3px,rgba(255,255,255,.06) 4px),linear-gradient(180deg,#34373c 0%,#1d1f22 55%,#0d0e10 100%)"
    : L.logoColor === "silver"
    // فضي شفاف بخطوط أفقية ناعمة (مثل الشعارات الزجاجية)
    ? "repeating-linear-gradient(180deg,rgba(255,255,255,0) 0,rgba(255,255,255,0) 3px,rgba(0,0,0,.07) 3px,rgba(0,0,0,.07) 4px),linear-gradient(180deg,#ffffff 0%,#e9e9e9 50%,#cfcfcf 100%)"
    : "linear-gradient(165deg," + mixHex(lc, "#ffffff", light ? .25 : .45) + " 0%," + lc + " 45%," + mixHex(lc, "#000000", light ? .25 : .35) + " 100%)");
  // رسالة البداية فوقها تعتيم داكن دائماً، فيبقى الشعار الفضي فيها فاتحاً
  if (L.logoColor === "silver") st.setProperty("--logosv", "linear-gradient(180deg,#f2f2f2 0%,#d2d2d2 50%,#b9b9b9 100%)"); else st.removeProperty("--logosv");
  if (S.look.logoId && customLogo) st.setProperty("--logom", "url(" + customLogo + ")"); else if (window.LOGO_DATA) st.setProperty("--logom", "url(" + window.LOGO_DATA + ")");
  stage.classList.toggle("lightbg", !!light);
  var tl = window.BG_TOP && !L.customBg ? window.BG_TOP[b.file] : null, topLight = tl == null ? light : tl > 150;
  st.setProperty("--namefg", topLight === light ? acc : (topLight ? "#3a2a10" : (auto ? accRaw : L.accent)));
  st.setProperty("--menufg", topLight ? "#222" : "#fff");
  var bw = +S.look.badgeBorder; st.setProperty("--dbw", (isFinite(bw) ? Math.max(0, Math.min(10, bw)) : 3) + "px"); // سمك إطار شارة الرقم
  st.setProperty("--ft", "'" + S.look.fontText + "', 'Cairo', Tahoma, sans-serif");
  st.setProperty("--fn", "'" + S.look.fontNum + "', 'Cairo', Tahoma, sans-serif");
  st.setProperty("--fz", "'" + S.look.fontZekr + "', 'Amiri', serif");
  stage.classList.toggle("shadow", !!S.look.shadow);
  stage.classList.toggle("iqc", !!S.look.iqColorOn); st.setProperty("--iqc", S.look.iqColor || "#F4D58D");
  stage.classList.toggle("arch", b.arch && !S.look.customBg);
  // تغيّرت الخلفية بين محراب وغيره (تلقائياً أو يدوياً): يُعاد بناء رأس التاريخ بالشكل المناسب
  if (!inBuild && builtDB !== null && builtDB !== wantDB()) setTimeout(build, 0);
  stage.style.backgroundColor = (!S.look.customBg && window.BG_COLOR && window.BG_COLOR[b.file]) || "";
  stage.dir = S.lang === "ar" ? "rtl" : "ltr";
  stage.classList.toggle("apar", !!S.look.arabicDigits && !S.look.h24); // صباحاً/مساءً يسار الوقت (اتجاه العربية)، وAM/PM يمينه
  document.documentElement.lang = S.lang;
  if (S.look.customBg) mediaURL(S.look.customBg).then(function(u){ setStageBg(u); });
  else { setStageBg("bg/" + b.file); preloadNextBg(); }
}
function shade(hex){ // يغمق لون التمييز على الخلفيات الفاتحة
  var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
  var f = .62; return "rgb(" + Math.round(r*f) + "," + Math.round(g*f) + "," + Math.round(b*f) + ")";
}
function hexA(hex, a){ var n = parseInt(String(hex).slice(1), 16); return "rgba(" + (n >> 16) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")"; }

var customLogo = "", customLogoId = "";
function loadCustomLogo(){
  var id = S.look.logoId || "";
  if (id === customLogoId) return; customLogoId = id; customLogo = "";
  if (!id) { applyLook(); return; }
  if (isUrl(id)) { customLogo = id; layout = ""; fit(); return; }
  IDB.get(id).then(function(b){ if (!b) return; var r = new FileReader();
    r.onload = function(){ if (customLogoId === id) { customLogo = r.result; layout = ""; fit(); } }; r.readAsDataURL(b); }).catch(function(){});
}
function logoHTML(cls){
  if (S.look.logo === false || S.look.logo === "none") return "";
  var c = cls || "logo";
  if (S.look.logoId && !customLogo) return "";
  if ((S.look.logoColor || "auto") === "gold") return '<img class="' + c + '" src="' + (S.look.logoId ? customLogo : "img/mark.png") + '" alt="">';
  return '<div class="' + c + ' lgw' + (S.look.logoId ? " sq" : "") + (S.look.logoColor === "silver" ? " silver" : "") + '"><div class="lgm"></div></div>';
}
var builtDB = null, inBuild = false; // شكل التاريخ المبني حالياً (شارات أو سطر)
function wantDB(){ return layout === "P" && S.look.dateStyle !== "line" && !stage.classList.contains("arch"); } // الشارات مع الخلفيات بدون محراب فقط
function build(){
  layout = orient();
  var P = layout === "P";
  stage.className = "stage " + layout + (S.look.ovGlass === false ? " noglass" : "") + (S.look.bigIqCnt ? " bigiq" : "");
  inBuild = true; applyLook(); inBuild = false;
  var SEC = isSecond();
  var boards = !SEC && S.boards.on && S.boards.items.some(function(b){ return b.active; });
  var flag = "";
  var html;
  if (SEC) {
    // الشاشة الثانية في المسجد: محتوى كبير متناوب (لوحات، شرائح، تذكيرات، أذكار، إعلانات) مع شريط علوي بالساعة والصلاة القادمة
    html = '<div class="s2h"><div class="s2n"><div class="mname"></div><div class="s2d"><span class="dayn"></span> <span class="hij"></span></div></div>' +
      '<div class="clk"><i class="ap apl"></i><span class="tm"></span><span class="sx"><b class="ss"></b><i class="ap"></i></span></div>' +
      '<div class="s2c cnt"><div class="cv"></div><div class="cl"></div></div></div>' +
      (s2Band() ? '<div class="smbar s2bar"></div>' : "") + '<div class="s2box"><div class="s2in"></div><div class="s2dots"></div></div><div class="cards"></div>' +
      (S.tickerOn ? '<div class="news"><div class="tick"></div></div>' : "") + '<div class="foot"></div>';
  } else if (boards) {
    var clock0 = '<div class="clk"><span class="tm"></span><span class="ap"></span></div>';
    html = '<div class="hdr">' + logoHTML() + '<div class="mname"></div></div>' +
      '<div class="board"><img class="bimg" alt="" hidden><div class="bt"></div><div class="bb"></div></div>' +
      '<div class="bstrip"><div class="bclk">' + clock0 + '<div class="bdate"></div></div><div class="cards"></div></div>' +
      ((S.fixedOn || (S.ayat && S.ayat.on)) ? '<div class="fixed"></div>' : "") + (S.tickerOn ? '<div class="news"><div class="tick"></div></div>' : "") + '<div class="foot"></div>' + flag;
  } else if (S.look.tpl === "cards" && !P) { // البطاقات للعرض الأفقي فقط، والرأسي يبقى بالجدول
    // نمط البطاقات: الساعة في المنتصف بين الشعار والعد التنازلي، والآية بعرض الشاشة، وبطاقات الصلوات بالأسفل (الأذان والإقامة)
    var wxk = '<div class="wx" hidden><span></span><img alt=""></div>';
    html = '<div class="tkh"><div class="tks"></div><div class="tkd"><div class="tkdl"><span class="dayn"></span><span class="hij"></span><span class="tkdot">·</span><span class="gre"></span></div><div class="mname"></div></div><div class="tkw">' + wxk + '</div></div>' +
      '<div class="zone tkz"><div class="tkm"><div class="tkc cnt"><div class="cv"></div><div class="cl"></div></div>' +
      '<div class="center"><div class="cpan"><div class="clk"><i class="ap apl"></i><span class="tm"></span><span class="sx"><b class="ss"></b><i class="ap"></i></span></div>' + (S.look.iqClock && !S.look.homeClock ? '<div class="iqclk"></div>' : "") + '</div></div>' +
      '<div class="emb tke">' + logoHTML("elogo") + '</div></div><div class="slide" hidden></div></div>' +
      ((S.fixedOn || (S.ayat && S.ayat.on)) ? '<div class="fixed"></div>' : "") + '<div class="cards"></div>' +
      "" +
      (S.tickerOn ? '<div class="news"><div class="tick"></div></div>' : "") + '<div class="foot"></div>' + flag;
  } else {
    var wp = S.weather.pos || "mid", wxh = '<div class="wx" hidden><span></span><img alt=""></div>';
    var LH = !P && !!S.look.dateSide, IQC = !!S.look.iqClock && !S.look.homeClock; // التاريخ يميناً واسم المسجد يساراً في العرض الأفقي
    var DB = wantDB(); // شارات التاريخ في العرض الرأسي: الهجري يميناً واليوم في الوسط والميلادي يساراً (خلفيات المحراب تبقى بسطر التاريخ)
    var dbc = '<div class="dbn"></div><div class="dbtx"><div class="dbm"></div><div class="dby"></div></div>';
    var top = (LH ? "" : DB ? '<div class="dbx"><div class="dbc dbh">' + dbc + '</div><div class="dbc dbd"><div class="dbr1"><div class="dayn"></div></div><div class="dbr3"><div class="dbe"></div><div class="dbt" hidden></div></div></div><div class="dbc dbg">' + dbc + '</div></div>' : '<div class="dayn"></div><div class="hij"></div>') + '<div class="zone">' +
      '<div class="mid"><div class="ms wcol">' + (wp === "mid" ? wxh : "") + '<div class="gre"></div></div>' +
      '<div class="emb">' + logoHTML("elogo") + '</div>' +
      '<div class="ms cnt"><div class="cv"></div><div class="cl"></div></div></div>' +
      '<div class="center"><div class="cpan"><div class="clk"><i class="ap apl"></i><span class="tm"></span><span class="sx"><b class="ss"></b><i class="ap"></i></span>' + (wp === "clock" ? wxh : "") + '</div>' + (IQC ? '<div class="iqclk"></div>' : "") + '</div></div>' +
      (S.slides.pos === "below" ? "" : '<div class="slide" hidden></div>') + '</div>' +
      (S.slides.pos === "below" ? '<div class="slide sbelow" hidden></div>' : ""); // الشرائح تحت الساعة وفوق جدول الصلوات
    var rows = (S.look.thead ? '<div class="thead"><div class="c1">' + esc(t("prayer")) + '</div><div class="c2">' + esc(t("adhan_time")) + '</div>' +
      (S.look.homeClock ? "" : '<div class="c3">' + esc(S.look.iqFmt === "time" ? t("iqama_time") : "الإقامة بعد") + '</div>') + '</div>' : "") + '<div class="rows"></div>';
    var nb = ""; // شريط منتصف الليل والثلث الأخير حُذف من الشاشة
    var AYM = !!(S.ayat && S.ayat.on && S.ayat.pos !== "bottom"); // الآية تحت الساعة وفوق جدول الصلوات
    var BND = !!(S.slides.on && S.slides.move && S.slides.move !== "none"), AYB = !!(S.ayat && S.ayat.on && !AYM);
    // ترتيب أنظف: مع شريط الشرائح يظهر الدعاء الثابت داخله تحت الساعة (بدل سطر مستقل أسفل الجدول) ويتبادل مع الشرائح المتحركة
    var fx = ((S.fixedOn && !BND) || AYB) ? '<div class="fixed"></div>' : "";
    if (AYM) top += '<div class="ayah"></div>';
    if (BND) top += '<div class="smbar"></div>'; // شريط الشرائح المتحركة تحت الساعة بمساحة ثابتة
    html = (LH ? '<div class="lhdr"><div class="ldate"><div class="dayn"></div><div class="hij"></div></div><div class="mname"></div></div>' : '<div class="mname"></div>') + (P ? top + rows : '<div class="lcols"><div class="lc1">' + top + '</div><div class="lc2">' + rows + '</div></div>') +
      nb + fx + (S.tickerOn ? '<div class="news"><div class="tick"></div></div>' : "") + '<div class="foot"></div>' + flag +
      (wp === "top" || wp === "bottom" ? wxh.replace('class="wx"', 'class="wx wx-' + wp + '"') : "");
  }
  if (S.look.netStar) html += '<i class="nstar net" aria-hidden="true">★</i>'; // نجمة الاتصال: خضراء متصل، حمراء منقطع
  mainEl.innerHTML = html;
  decorate();
  var TK = !SEC && !boards && !P && S.look.tpl === "cards";
  mainEl.className = "main" + (SEC ? " sec2" : "") + (boards ? " boards" : "") + (TK ? " tk" : "") + (S.look.menuBtn === false ? " nomenu" : "") + (TK && S.look.thead ? " thd" : "") + (S.look.cardShape === "dome" ? " dome" : "") + (S.look.homeClock ? " home" : "") + (S.look.bigCounter ? " bigcnt" : "") +
    (P ? (S.look.centerP ? " ctr" : "") + (S.look.bigP ? " bigp" : "") : (S.look.centerL ? " ctr" : "")) + (!P && S.look.bigL ? " bigl" : "") + (S.dateMode === "both" ? "" : " dalt") + (S.look.fullClock ? " fullclk" : "") + (S.look.showName === false ? " noname" : "") + (S.look.showDay === false ? " noday" : "") + (S.look.showDate === false ? " nodate" : "") +
    (S.look.showCount === false ? " nocnt" : "") + (!boards && S.look.iqClock && !S.look.homeClock ? " iqc" : "") + (!boards && !P && S.look.dateSide ? " lhd" : "") + ($(".dbx", mainEl) ? " dbs" + (S.look.badgeShape === "soft" ? " dbsoft" : "") + (S.look.badgeShadow ? " dbshd" : "") : ""); builtDB = !!$(".dbx", mainEl) || (boards || SEC || TK ? null : false);
  ui = {
    mname: $(".mname", mainEl), dayn: $(".dayn", mainEl), hij: $(".hij", mainEl), gre: $(".gre", mainEl), bdate: $(".bdate", mainEl), dbg: $(".dbg", mainEl), dbh: $(".dbh", mainEl), dbe: $(".dbe", mainEl), dbt: $(".dbt", mainEl),
    tm: $(".tm", mainEl), ap: $(".ap", mainEl), aps: mainEl.querySelectorAll(".ap"), ss: $(".ss", mainEl), cl: $(".cl", mainEl), cv: $(".cv", mainEl), cnt: $(".cnt", mainEl),
    rows: $(".rows", mainEl), cards: $(".cards", mainEl), fixed: $(".fixed", mainEl), ayah: $(".ayah", mainEl), tick: $(".tick", mainEl), foot: $(".foot", mainEl),
    s2: $(".s2in", mainEl), s2dots: $(".s2dots", mainEl), tks: $(".tks", mainEl), cpan: $(".cpan", mainEl), iqclk: $(".iqclk", mainEl), night: $(".nightbar", mainEl), slide: $(".slide", mainEl), mqbar: $(".smbar", mainEl), zone: $(".zone", mainEl), wx: $(".wx", mainEl), board: $(".board", mainEl)
  };
  ui.mname.textContent = S.mosque; fitText(ui.mname, .5);
  if (ui.fixed) ui.fixed.textContent = String(S.fixedZekr || "").trim() || DEF.fixedZekr; // إذا كان فارغاً يظهر الدعاء الافتراضي
  bandIdle();
  lastRowKey = ""; lastDay = ""; tickerKey = ""; nightKey = ""; slideState = {i:-1, until:0, show:false, next: Date.now() + S.slides.every*1000}; var fs0 = $("#fslide"); if (fs0) fs0.hidden = true; boardState = {i:-1, until:0};
  renderWeather(); tick(true);
}

/* ===== تبديل الخلفية بسلاسة =====
   تُحمَّل الصورة الجديدة وتُفك في الخلفية أولاً، ثم تظهر بتلاشٍ ناعم فوق القديمة، فلا تومض الشاشة ولا تتأخر.
   وتُجهَّز الخلفية التالية مسبقاً فيكون التبديل بالضغط على الفجر أو التغيير التلقائي فورياً */
var bgCur = null, bgPre = {};
function loadImg(url, cb){
  var done = false, fin = function(ok){ if (!done) { done = true; cb(ok !== false); } }, img = new Image();
  img.onload = function(){ if (img.decode) img.decode().then(fin, fin); else fin(); };
  img.onerror = function(){ fin(false); }; setTimeout(fin, 4000); img.src = url; return img;
}
// ملف خلفية غير موجود (حُذف من مجلد التطبيق أو الخادم): تُستبعد وتُعرض التالية تلقائياً
function bgMissing(url){
  var f = String(url).replace(/^bg\//, "").split("?")[0]; if (!/^bg\//.test(url) || f.indexOf("/") >= 0) return;
  var H = S.look.bgHidden = S.look.bgHidden || []; if (H.indexOf(f) < 0) H.push(f);
  if (navigator.onLine === false) return; // بدون إنترنت قد يكون الملف غير محفوظ فقط، فلا يُبدَّل
  save(); nextBg(false, true);
}
function setStageBg(url){
  url = url || ""; if (url === bgCur) return;
  var first = bgCur === null; bgCur = url;
  var css = url ? 'url("' + url + '")' : "";
  if (first || !url) { stage.style.backgroundImage = css; if (url) loadImg(url, function(ok){ if (!ok && bgCur === url) bgMissing(url); }); return; }
  loadImg(url, function(ok){
    if (!ok && bgCur === url) { bgMissing(url); return; }
    if (bgCur !== url) return;
    var old = stage.querySelectorAll(".bglay"); for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
    var lay = document.createElement("div"); lay.className = "bglay"; lay.style.backgroundImage = css;
    stage.insertBefore(lay, stage.firstChild);
    void lay.offsetWidth; lay.classList.add("in");
    setTimeout(function(){ if (bgCur === url) stage.style.backgroundImage = css; if (lay.parentNode) lay.parentNode.removeChild(lay); }, 700);
  });
}
function preloadNextBg(){
  try { var o = orient(), list = bgList(o), cur = o === "P" ? S.look.bgP : S.look.bgL;
    for (var j = 0; j < list.length; j++) if (list[j][0] === cur) { var nx = "bg/" + list[(j + 1) % list.length][0]; if (!bgPre[nx]) { for (var k in bgPre) { try { bgPre[k].src = ""; } catch(e){} } bgPre = {}; bgPre[nx] = loadImg(nx, function(){}); } break; } /* صورة واحدة فقط مجهزة مسبقاً: الأجهزة ضعيفة الذاكرة كانت تمتلئ ذاكرتها مع كثرة التبديل فيُغلق التطبيق */ } catch(e){}
}

/* الضغط على صلاة الفجر يغيّر الخلفية. ضغطة واحدة كل 0.8 ثانية على الأكثر: الضغط المتتابع السريع كان يفك صوراً كثيرة معاً
   في الأجهزة ضعيفة الذاكرة فتتأخر الشاشة ثم يُغلق التطبيق */
var bgTapAt = 0;
function bgTapOK(){ var n = Date.now(); if (n - bgTapAt < 800) return false; bgTapAt = n; return true; }
/* قائمة «كل يوم بشكل عشوائي من هذه القائمة»: الخلفيات المختارة بأرقامها، وبدون اختيار تُستخدم كل الخلفيات */
function bgPickList(o){
  var all = bgList(o), pk = S.look[o === "P" ? "bgPickP" : "bgPickL"] || [];
  var l = all.filter(function(b){ return pk.indexOf(b[0]) >= 0; });
  return l.length ? l : all;
}
function nextBg(random, keepCustom, back, pick){
  var o = orient(), list = pick ? bgPickList(o) : bgList(o), cur = o === "P" ? S.look.bgP : S.look.bgL, i = -1;
  for (var j = 0; j < list.length; j++) if (list[j][0] === cur) i = j;
  if (i < 0) { if (pick) i = list.length - 1; else i = 0; } // الحالية خارج القائمة: تبدأ من أولها
  var n = back ? (i - 1 + list.length) % list.length : (i + 1) % list.length; // للخلف بالضغط على وقت الفجر
  if (random && list.length > 1) { do { n = Math.floor(Math.random()*list.length); } while (n === i); }
  var f = list[n][0];
  if (o === "P") S.look.bgP = f; else S.look.bgL = f;
  if (S.look.customBg && !keepCustom) { IDB.del(S.look.customBg); S.look.customBg = ""; }
  save(); applyLook(); lastRowKey = "";
}
// تغيير الخلفية تلقائياً: عند كل صلاة، كل يوم، كل شهر، أو عشوائياً كل مدة
function autoBg(now, ph){
  var m = S.look.bgMode || "manual"; if (m === "manual" || S.look.customBg) return;
  var z = zp(now), key;
  if (m === "prayer") { if (!ph.cur) return; var zc = zp(ph.cur.A); key = ph.cur.k + "@" + dkey(zc.Y, zc.M, zc.D); }
  else if (m === "day" || m === "dayPick") key = dkey(z.Y, z.M, z.D);
  else if (m === "month") key = z.Y + "-" + z.M;
  else key = "r" + Math.floor(now/(Math.max(1, +S.look.bgEvery || 30)*60000));
  if (!key) return;
  if (!S.look.bgKey) { S.look.bgKey = key; save(); return; }
  if (key !== S.look.bgKey) { S.look.bgKey = key; nextBg(m === "random" || m === "dayPick" || !!S.look.bgShuffle, true, false, m === "dayPick"); }
}

/* وجه ساعة حائط واقعية داخل دائرة الإقامة (بدون عقارب حتى لا تتعارض مع العداد):
   إطار معدني، ميناء متدرج، مسار دقائق مزدوج، الرقمان 12 و6، وانعكاس زجاج */
function clockFace(){
  var h = '<svg class="face" viewBox="0 0 200 200" aria-hidden="true"><defs>' +
    '<linearGradient id="fcm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".28" stop-color="#b9b9b9"/><stop offset=".5" stop-color="#f2f2f2"/><stop offset=".74" stop-color="#7d7d7d"/><stop offset="1" stop-color="#d6d6d6"/></linearGradient>' +
    '<radialGradient id="fcd" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="#2a2a30"/><stop offset=".75" stop-color="#141418"/><stop offset="1" stop-color="#050506"/></radialGradient>' +
    '<radialGradient id="fcs" cx="50%" cy="50%" r="50%"><stop offset=".86" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>' +
    '<linearGradient id="fcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
    '<circle cx="100" cy="100" r="84" class="fbez"/>' +
    '<circle cx="100" cy="100" r="81.5" class="fdisc"/><circle cx="100" cy="100" r="81.5" class="fshade"/>' +
    '<circle cx="100" cy="100" r="77.5" class="ftrack"/><circle cx="100" cy="100" r="73" class="ftrack"/>';
  for (var i = 0; i < 60; i++) h += '<line x1="100" y1="22.5" x2="100" y2="' + (i % 5 ? 27 : 28.5) + '" class="' + (i % 5 ? "ftm" : "ftm f5") + '" transform="rotate(' + (i*6) + ' 100 100)"/>';
  // مسار الدقائق فقط، والعلامة كل 5 دقائق أطول قليلاً (بدون مؤشرات الساعات الكبيرة حتى لا تتعارض مع العداد)
  h += '<text x="100" y="38" class="fnum">' + num("12") + '</text><text x="100" y="151" class="fnum">' + num("6") + '</text>';
  return h + '<path d="M28 92 A72 72 0 0 1 172 92 Q100 70 28 92 Z" class="fglass"/></svg>';
}
/* ===== الزخارف الإسلامية فوق الخلفية (خلف النصوص): إطار ذهبي، أركان أرابيسك، فوانيس معلّقة، نجوم ثمانية ===== */
function star8(cx, cy, r, r2, cls){ var p = []; for (var i = 0; i < 16; i++) { var a = Math.PI/8*i - Math.PI/2, rr = i % 2 ? r2 : r; p.push((cx + rr*Math.cos(a)).toFixed(2) + "," + (cy + rr*Math.sin(a)).toFixed(2)); }
  return '<polygon points="' + p.join(" ") + '" class="' + (cls || "") + '"/>'; }
function rosette(sz){ // نجمة ثمانية (خاتم سليمان) مزخرفة
  return '<svg viewBox="0 0 100 100" width="' + sz + '" height="' + sz + '" aria-hidden="true"><g class="dk">' +
    '<rect x="22" y="22" width="56" height="56"/><rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)"/>' +
    '<circle cx="50" cy="50" r="16"/>' + star8(50, 50, 13, 6, "df") + '<circle cx="50" cy="50" r="3" class="df"/></g></svg>'; }
function arabesque(sz){ // ركن أرابيسك: أقواس ملتفة وأوراق ونجمة في الزاوية
  return '<svg viewBox="0 0 200 200" width="' + sz + '" height="' + sz + '" aria-hidden="true"><g class="dk">' +
    '<path d="M8 192 V40 Q8 8 40 8 H192"/><path d="M20 192 V52 Q20 20 52 20 H192"/>' +
    '<path d="M20 110 C60 110 70 70 60 50 C50 30 30 40 36 56 C40 66 54 62 52 52"/>' +
    '<path d="M110 20 C110 60 70 70 50 60 C30 50 40 30 56 36 C66 40 62 54 52 52"/>' +
    '<path d="M20 160 C45 150 50 130 40 120"/><path d="M160 20 C150 45 130 50 120 40"/>' +
    '<path d="M70 70 C95 80 110 110 100 140"/><path d="M70 70 C80 95 110 110 140 100"/>' +
    '<path d="M100 140 q6 -16 18 -10 q-6 14 -18 10z" class="df"/><path d="M140 100 q-16 6 -10 18 q14 -6 10 -18z" class="df"/>' +
    '</g>' + star8(30, 30, 16, 7, "df") + '</svg>'; }
function lantern(h){ // فانوس رمضاني معلّق
  return '<svg viewBox="0 0 60 200" height="' + h + '" aria-hidden="true"><g class="dk">' +
    '<line x1="30" y1="0" x2="30" y2="62"/><circle cx="30" cy="66" r="4"/>' +
    '<path d="M18 84 L30 70 L42 84 Z" class="df"/><rect x="14" y="84" width="32" height="6" rx="2" class="df"/>' +
    '<path d="M16 90 L10 112 L14 150 L46 150 L50 112 L44 90 Z"/><path d="M30 90 V150 M13 112 H47"/>' +
    '<path d="M20 96 L17 112 L19 144 M40 96 L43 112 L41 144"/>' +
    '<rect x="12" y="150" width="36" height="6" rx="2" class="df"/><path d="M18 156 L30 172 L42 156 Z" class="df"/><line x1="30" y1="172" x2="30" y2="184"/><circle cx="30" cy="187" r="3" class="df"/></g>' +
    '<ellipse cx="30" cy="122" rx="9" ry="16" class="dglow"/></svg>'; }
function decorate(){
  var old = document.getElementById("decor"); if (old) old.parentNode.removeChild(old);
  var d = S.look.decor || "none"; if (d === "none") return;
  var el = document.createElement("div"); el.id = "decor"; el.className = "decor d-" + d; el.setAttribute("aria-hidden", "true");
  el.style.setProperty("--dop", S.look.decorOp == null ? .85 : +S.look.decorOp);
  var c4 = function(f){ return ["tl", "tr", "bl", "br"].map(function(k){ return '<i class="dc4 ' + k + '">' + f + '</i>'; }).join(""); };
  if (d === "gold") el.innerHTML = '<i class="fr1"></i><i class="fr2"></i>' + c4(rosette(layout === "P" ? 110 : 96));
  else if (d === "arabesque") el.innerHTML = c4(arabesque(layout === "P" ? 230 : 210));
  else if (d === "lantern") el.innerHTML = '<i class="lt l1">' + lantern(layout === "P" ? 300 : 250) + '</i><i class="lt l3">' + lantern(layout === "P" ? 300 : 250) + '</i>';
  else if (d === "stars") { var h = ""; for (var i = 0; i < 9; i++) h += '<i class="st8 s' + i + '">' + rosette(40 + (i % 3)*22) + '</i>'; el.innerHTML = '<i class="fr2"></i>' + h; }
  stage.insertBefore(el, mainEl);
}
var lastRowKey = "", lastDay = "";
function renderTimes(ph){
  var day = ph.today, rows = day.list.slice();
  if (day.eid) rows.push(day.eid);
  var key = day.key + "|" + ph.hi + "|" + (S.look.hiOn !== false) + "|" + (S.look.dimPast ? Math.floor(Date.now()/60000) : "");
  if (key === lastRowKey) return; lastRowKey = key;
  var now = Date.now();
  if (ui.tks) rows = rows.filter(function(x){ return x.k !== "sunrise"; });
  var html = rows.map(function(x){
    var past = S.look.dimPast && x.k !== ph.hi && x.k !== "sunrise" && now > x.I + 60000 && !(ph.inIqama && x.k === ph.cur.k);
    if (x.k === "sunrise") past = S.look.dimPast && now > x.I && ph.hi !== "sunrise";
    var cls = (x.k === ph.hi && S.look.hiOn !== false ? " hi" : "") + (past ? " past" : "") + (x.k === "eid" ? " eid" : "");
    var off = x.k === "eid" ? "" : S.look.iqFmt === "time" ? fmtT(x.I) : num(Math.round((x.I - x.A)/60000)) + "’";
    if (ui.rows) return '<div class="row' + cls + '" data-k="' + x.k + '"><div class="c1">' + esc(x.name) + '</div><div class="c2">' + fmtT(x.A) + '</div>' +
      (S.look.homeClock ? "" : '<div class="c3">' + off + '</div>') + '</div>';
    return '<div class="card' + cls + '" data-k="' + x.k + '"><div class="n">' + esc(x.name) + '</div><div class="a">' + (ui.tks ? '<small class="thl">' + esc(t("adhan_time")) + '</small>' : "") + fmtT(x.A) + '</div>' +
      (S.look.homeClock || x.k === "eid" ? "" : '<div class="i">' + (ui.tks ? '<small class="thl">' + esc(S.look.iqFmt === "time" ? t("iqama_time") : "الإقامة بعد") + '</small>' : "") + off + '</div>') + '</div>';
  }).join("");
  if (ui.tks) { var sr = null; day.list.forEach(function(x){ if (x.k === "sunrise") sr = x; });
    ui.tks.innerHTML = sr ? '<div><b>' + esc(sr.name) + '</b><span>' + fmtT(sr.A) + '</span></div>' + (+S.duha ? '<div><b>' + esc(S.lang === "en" ? "Duha" : "الضحى") + '</b><span>' + fmtT(sr.I) + '</span></div>' : "") : ""; }
  if (ui.rows) ui.rows.innerHTML = html; if (ui.cards) ui.cards.innerHTML = html;
  fitRows();
}
var fitRowsAt = 0; addEventListener("resize", function(){ setTimeout(fitRows, 120); });
/* في نمط البطاقات: يصغر خط الصلاة داخل بطاقتها إذا كانت أقصر من الخط، فلا يخرج النص من الإطار */
function fitRows(){
  if (!ui.rows) return; var on = stage.classList.contains("tcards");
  var rs = ui.rows.querySelectorAll(".row > div");
  for (var i = 0; i < rs.length; i++) rs[i].style.fontSize = "";
  if (on) for (var j = 0; j < rs.length; j++) { var c = rs[j], h = c.parentNode.clientHeight, fs = parseFloat(getComputedStyle(c).fontSize) || 0, mx = (h - 10) / 1.18;
    if (h && fs > mx) c.style.fontSize = Math.max(12, mx).toFixed(1) + "px"; }
  // ضمان ظهور كل الصلوات: إن تجاوز الجدول مساحته (خط كبير، شاشة أقصر، اسم مسجد بسطرين) تصغر الخطوط معاً بنفس النسبة حتى يتسع
  var R = ui.rows, n = 0;
  while (n++ < 12 && R.clientHeight && R.scrollHeight > R.clientHeight + 1) {
    var k = Math.max(.82, Math.min(.97, R.clientHeight / R.scrollHeight));
    for (var q = 0; q < rs.length; q++) { var f0 = parseFloat(getComputedStyle(rs[q]).fontSize) || 0; if (f0) rs[q].style.fontSize = Math.max(12, f0 * k).toFixed(1) + "px"; }
  }
}
/* ===== أوقات الليل: منتصف الليل والثلث الأخير =====
   الليل من أذان المغرب إلى أذان الفجر التالي. تظهر في شريط أسفل الشاشة حسب «وقت الظهور» */
function nightTimes(day, ph, now){
  var fj = byK(day, "fajr"), d0 = day;
  if (now < fj.A) d0 = dayTimes(day.Y, day.M, day.D - 1); // بعد منتصف الليل: الليلة بدأت أمس
  var mg = byK(d0, "maghrib"), is = byK(d0, "isha"), fn = d0 === day ? byK(ph.tom || dayTimes(day.Y, day.M, day.D + 1), "fajr") : fj;
  if (!mg || !fn) return null;
  var len = fn.A - mg.A; return {mg:mg, isha:is, fajr:fn, mid: mg.A + len/2, third: mg.A + len*2/3};
}
function nightVisible(n0, now){
  var m = S.look.nightShow || "maghrib";
  if (m === "always") return true;
  if (m === "maghrib") return now >= n0.mg.A && now < n0.fajr.A;
  if (m === "isha") { var st = n0.isha ? n0.isha.I + (+n0.isha.pd || 0)*60000 + (+S.look.nightAfter || 0)*60000 : n0.mg.A; return now >= st && now < n0.fajr.A; }
  var z = zp(now), cur = z.h*60 + z.m, a = hm(S.look.nightFrom || "21:00"), b = hm(S.look.nightTo || "04:00"); // وقت محدد (يمكن أن يتجاوز منتصف الليل)
  return a <= b ? (cur >= a && cur < b) : (cur >= a || cur < b);
}
var NIGHT_IC = {
  mid:'<svg class="nb-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  third:'<svg class="nb-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 16.5A6 6 0 1 1 9 7.2a4.8 4.8 0 0 0 6.5 9.3z"/><path d="M18 3.5l.7 1.6 1.6.7-1.6.7L18 8.1l-.7-1.6-1.6-.7 1.6-.7zM20.5 10l.4.9.9.4-.9.4-.4.9-.4-.9-.9-.4.9-.4z"/></svg>'
};
var nightKey = "";
function renderNight(ph, now){
  if (!ui.night) return;
  var n0 = nightTimes(ph.today, ph, now), show = !!n0 && nightVisible(n0, now);
  if (ui.night.hidden === show) ui.night.hidden = !show;
  if (!show) return;
  var inThird = now >= n0.third && now < n0.fajr.A, en = S.lang === "en";
  var key = n0.mid + "|" + n0.third + "|" + inThird + "|" + layout + S.look.arabicDigits + S.look.h24 + S.look.zeroH;
  if (key === nightKey) return; nightKey = key;
  var it = function(k, lbl, ms, on){ return '<div class="nb-it' + (on ? " on" : "") + '">' + NIGHT_IC[k] + '<span class="nb-l">' + esc(lbl) + '</span>' +
    (on ? '<span class="nb-now">' + esc(en ? "Now" : "الآن") + '</span>' : "") +
    '<span class="nb-t"><b>' + fmtT(ms) + '</b><i>' + esc(ampm(ms)) + '</i></span></div>'; };
  ui.night.innerHTML = (S.look.nightMid !== false ? it("mid", en ? "Midnight" : "منتصف الليل", n0.mid, false) : "") +
    (S.look.nightThird !== false ? it("third", layout === "P" ? (en ? "Last third" : "الثلث الأخير") : (en ? "Last third of the night" : "الثلث الأخير من الليل"), n0.third, inThird) : "");
}

/* ===== الشريط السفلي ===== */
var tickerKey = "", newsIdx = 0, newsUntil = 0;
/* جدولة الإعلانات والرسائل: من تاريخ/إلى تاريخ (d1, d2)، من الساعة/إلى الساعة (t1, t2)، وأيام الأسبوع (days) */
function inSched(o, z){
  z = z || zp(Date.now()); var k = dkey(z.Y, z.M, z.D), hm = two(z.h) + ":" + two(z.m);
  if (o.d1 && k < o.d1) return false;
  if (o.d2 && k > o.d2) return false;
  if (o.wd && o.wd.length && o.wd.indexOf(z.dow) < 0) return false;
  if (o.t1 || o.t2) { var t1 = o.t1 || "00:00", t2 = o.t2 || "24:00"; if (t1 <= t2 ? (hm < t1 || hm >= t2) : (hm < t1 && hm >= t2)) return false; }
  return true;
}
function newsToday(){
  var z = zp(Date.now()), k = dkey(z.Y, z.M, z.D);
  var list = (S.gnews || []).concat(S.news || []).filter(function(n){ // أخبار عامة من إدارة الموقع لكل المساجد ثم أخبار المسجد
    if (!n.text || !inSched(n, z)) return false;
    if (n.type === "week") return (n.days || []).indexOf(z.dow) >= 0;
    if (n.type === "date") return n.date === k;
    return true;
  });
  var R0 = S.remind || {};
  if (R0.show !== "slide") remindList(Date.now()).forEach(function(r){ list.unshift({id:r.id, text:r.title + ": " + r.line}); });
  return list;
}
/* ===== التذكيرات التلقائية حسب التقويم الهجري =====
   الأيام البيض (13 و14 و15 من كل شهر)، تاسوعاء وعاشوراء، فضائل الجمعة (من مغرب الخميس إلى عصر الجمعة)، وآخر ساعة من الجمعة (من العصر إلى المغرب).
   تظهر في شريط الإعلانات و/أو كشريحة، وتعمل بدون إنترنت */
var remCache = {k:"", v:[]};
function remindList(now){
  var R0 = S.remind || {}; if (R0.on === false) return [];
  var z = zp(now), ck = dkey(z.Y, z.M, z.D) + "|" + z.h + "|" + Math.floor(z.m/5) + JSON.stringify(R0) + S.hijriAdj;
  if (remCache.k === ck) return remCache.v;
  var out = [], h = hijri(z.Y, z.M, z.D), d = h.day, mo = h.month, mn = h.monthName, day = dayTimes(z.Y, z.M, z.D), tm = {};
  day.list.forEach(function(x){ tm[x.k] = x; });
  var asrA = tm.asr ? tm.asr.A : 0, mgA = tm.maghrib ? tm.maghrib.A : 0;
  var add = function(id, title, line, body){ out.push({id:"rm-" + id, title:title, line:line, body:body || line}); };
  if (R0.white !== false) {
    var hw = "قال ﷺ: «صَوْمُ ثَلَاثَةِ أَيَّامٍ مِنْ كُلِّ شَهْرٍ صَوْمُ الدَّهْرِ كُلِّهِ» متفق عليه";
    if (mo === 9) {} // رمضان: الصيام فرض طوال الشهر فلا تذكير
    else if (mo === 12) { // 13 ذي الحجة من أيام التشريق ولا يُصام
      if (d === 12) add("w", "صيام الأيام البيض", "في ذي الحجة تُصام أيام 14 و15 فقط، لأن 13 من أيام التشريق ولا يُصام", "في ذي الحجة تُصام أيام 14 و15\nأما 13 ذي الحجة فمن أيام التشريق ولا يُصام\n" + hw);
      else if (d === 13) add("w", "صيام الأيام البيض", "يُصام غداً الرابع عشر من ذي الحجة، واليوم من أيام التشريق ولا يُصام", "يُصام غداً 14 ذي الحجة وبعده 15\nاليوم من أيام التشريق ولا يُصام\n" + hw);
      else if (d === 14) add("w", "صيام الأيام البيض", "اليوم الرابع عشر من ذي الحجة من الأيام البيض، وغداً آخرها", "اليوم 14 ذي الحجة، وغداً 15 آخر الأيام البيض\n" + hw);
      else if (d === 15) add("w", "صيام الأيام البيض", "اليوم آخر الأيام البيض", hw);
    } else if (d === 12) add("w", "صيام الأيام البيض", "تبدأ غداً: 13 و14 و15 من " + mn, "تبدأ غداً: 13 و14 و15 من " + mn + "\n" + hw);
    else if (d === 13) add("w", "صيام الأيام البيض", "اليوم أول الأيام البيض من " + mn + "، وغداً الثاني", "اليوم 13 " + mn + " أول الأيام البيض\n" + hw);
    else if (d === 14) add("w", "صيام الأيام البيض", "اليوم ثاني الأيام البيض، وغداً آخرها", "اليوم 14 " + mn + "، وغداً 15 آخر الأيام البيض\n" + hw);
    else if (d === 15) add("w", "صيام الأيام البيض", "اليوم آخر الأيام البيض من " + mn, hw);
  }
  if (R0.ashura !== false && mo === 1 && d >= 7 && d <= 10) {
    var ha = "قال ﷺ: «صِيَامُ يَوْمِ عَاشُورَاءَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ» رواه مسلم\nويُستحب صيام التاسع معه";
    var al = d === 7 ? "بعد غدٍ تاسوعاء، ثم يوم عاشوراء: يُستحب صيام التاسع والعاشر من محرم" : d === 8 ? "غداً تاسوعاء وبعده يوم عاشوراء: يُستحب صيام التاسع والعاشر من محرم" :
      d === 9 ? "اليوم تاسوعاء، وغداً يوم عاشوراء" : "اليوم يوم عاشوراء";
    add("a", "صيام يوم عاشوراء", al, al + "\n" + ha);
  }
  if (R0.fri !== false && ((z.dow === 4 && mgA && now >= mgA) || (z.dow === 5 && (!asrA || now < asrA)))) {
    add("f", "فضائل يوم الجمعة", "قراءة سورة الكهف، والإكثار من الصلاة على النبي ﷺ، والاغتسال والتطيّب والتبكير إلى الصلاة",
      "قراءة سورة الكهف\nالإكثار من الصلاة على النبي ﷺ\nالاغتسال والتطيّب والتبكير إلى الصلاة\nقال ﷺ: «أَكْثِرُوا عَلَيَّ مِنَ الصَّلَاةِ يَوْمَ الْجُمُعَةِ وَلَيْلَةَ الْجُمُعَةِ»");
  }
  if (R0.friHour !== false && z.dow === 5 && asrA && mgA && now >= asrA && now < mgA) {
    add("h", "آخر ساعة من يوم الجمعة", "ساعة إجابة، فأكثروا من الدعاء حتى غروب الشمس",
      "ساعة إجابة، فأكثروا من الدعاء\nقال ﷺ: «يَوْمُ الْجُمُعَةِ ثِنْتَا عَشْرَةَ سَاعَةً... فَالْتَمِسُوهَا آخِرَ سَاعَةٍ بَعْدَ الْعَصْرِ» رواه أبو داود والنسائي");
  }
  remCache = {k:ck, v:out}; return out;
}
/* ===== الآيات المتغيرة: سطر الدعاء أسفل الشاشة يعرض آية بعد آية بانتقال هادئ ===== */
var ayIdx = -1, ayNext = 0, ayKey = "";
function ayList(){ var A0 = S.ayat || {}, d = Math.max(5, +A0.sec || 20), own = [];
  if (A0.mode === "custom") own = A0.items ? A0.items.filter(function(q){ return q && String(q.t || "").trim(); }).map(function(q){ return {t:String(q.t).trim(), sec:Math.max(3, +q.sec || d)}; })
    : String(A0.list || "").split(/\n+/).map(function(x){ return x.trim(); }).filter(Boolean).map(function(x){ return {t:x, sec:d}; });
  return own.length ? own : (window.AYAT_LIST || []).map(function(x){ return {t:x, sec:d}; }); }
function ayHTML(x){ var m = String(x).match(/^([\s\S]*?)\s*[\[(]([^\[\]()]*\d[^\[\]()]*)[\])]\s*$/), tx = m ? m[1] : x;
  tx = tx.replace(/^\s*﴿\s*|\s*﴾\s*$/g, "");
  return '<span class="ayo">۞</span><span class="ayt">﴿ ' + esc(tx) + ' ﴾' + (m ? '<small class="ayr">' + esc(m[2]) + '</small>' : "") + '</span><span class="ayo">۞</span>'; }
function renderAyat(now){
  var A0 = S.ayat || {}, el = ui.ayah || ui.fixed; if (!el) return;
  if (!A0.on) { if (ayKey && ui.fixed) { ayKey = ""; ui.fixed.classList.remove("ayf"); ui.fixed.textContent = String(S.fixedZekr || "").trim() || DEF.fixedZekr; } return; }
  var L = ayList(); if (!L.length) return; var key = L.map(function(q){ return q.sec; }).join(",") + "|" + A0.mode + "|" + layout + "|" + (ui.ayah ? 1 : 0);
  if (key !== ayKey) { ayKey = key; ayNext = 0; }
  if (now < ayNext && el.textContent) return;
  ayIdx = (ayIdx + 1) % L.length; ayNext = now + L[ayIdx].sec * 1000; // لكل نص مدته الخاصة
  el.classList.remove("ayf"); void el.offsetWidth;
  if (el === ui.ayah) { el.innerHTML = ayHTML(L[ayIdx].t); var t0 = el.querySelector(".ayt"); t0.style.fontSize = ""; t0.style.whiteSpace = "nowrap"; // سطر واحد: يصغر الخط حتى تدخل الآية كاملة
    var fs0 = parseFloat(getComputedStyle(t0).fontSize) || 40, av = t0.clientWidth, sp0 = document.createElement("span"); sp0.innerHTML = t0.innerHTML; sp0.style.cssText = "visibility:hidden;position:absolute;white-space:nowrap"; t0.appendChild(sp0);
    var w0 = sp0.offsetWidth; t0.removeChild(sp0); if (av && w0 > av) { var k = Math.max(.55, av / w0 * .97); t0.style.fontSize = (fs0 * k).toFixed(1) + "px"; if (av / w0 < .55) t0.style.whiteSpace = "normal"; } } else el.textContent = L[ayIdx].t;
  el.classList.add("ayf");
}
/* الشريطان المتحركان بنفس الحركة والسرعة والاتجاه، ولا يتحركان معاً: العلوي ثم السفلي ثم العلوي... */
var tkAn = null, tkCoord = false;
/* سرعة الشريطين بعدد صحيح من البكسلات في كل إطار (الشاشة 60 إطاراً في الثانية): 60، 120، 180...
   السرعة الكسرية (مثل 110 = 1.83 بكسل/إطار) تجعل الحركة تتقطع وترتجف على شاشات التلفاز والأجهزة الضعيفة */
function mqSpeed(){ var sp = Math.max(60, Math.min(300, Math.round(Math.max(40, +S.speed || 120) / 60) * 60)), k = +window.RWS_PXK || 1;
  return Math.max(60, Math.round(sp * k / 60) * 60) / k; } // السرعة على الشاشة الفعلية بمضاعفات 60 بكسل جهاز/ث
/* تحريك أفقي على كرت الشاشة. المتصفح القديم الذي لا يدعم animate: حركة بديلة ببكسلات صحيحة بدل التوقف */
function mqAnim(el, x0, x1, dur, loop){
  x0 = Math.round(x0); x1 = Math.round(x1);
  if (el.animate) return el.animate([{transform:"translate3d(" + x0 + "px,0,0)"}, {transform:"translate3d(" + x1 + "px,0,0)"}], {duration:dur, easing:"linear", iterations:loop ? Infinity : 1, fill:"both"});
  var t0 = 0, live = true, raf = window.requestAnimationFrame || function(f){ return setTimeout(function(){ f(Date.now()); }, 16); };
  var step = function(ts){ if (!live) return; if (!t0) t0 = ts; var k = (ts - t0) / dur; if (k >= 1) { if (loop) { t0 = ts; k = 0; } else k = 1; }
    el.style.transform = "translate3d(" + Math.round(x0 + (x1 - x0) * k) + "px,0,0)"; if (k < 1 || loop) raf(step); };
  raf(step); return {cancel:function(){ live = false; }};
}
function tkDir(){ if (S.tickDir === "ltr" || S.tickDir === "rtl") return S.tickDir; var m = S.slides.move; return m === "rtl" ? "rtl" : m === "ltr" ? "ltr" : (S.lang === "ar" ? "ltr" : "rtl"); } // «ثابتة في شريط»: السفلي باتجاه العربية
function tkReady(){ return !!(ui.tick && S.tickerOn && S.marquee && ui.tick.parentNode && !ui.tick.parentNode.hidden && ui.tick.classList.contains("mqj") && ui.tick.textContent); }
function tkStop(){ if (tkAn) { try { tkAn.cancel(); } catch(e){} tkAn = null; } }
function tkPass(loop){ // مرور كامل للشريط السفلي، ويرجع مدته
  if (!tkReady()) return 0; tkStop();
  var W = ui.tick.parentNode.clientWidth, w = ui.tick.scrollWidth, ltr = tkDir() === "ltr", a = ltr ? [-w, W] : [W, -w];
  var dur = Math.round((W + w) / mqSpeed() * 1000);
  tkAn = mqAnim(ui.tick, a[0], a[1], dur, loop);
  return dur;
}
function renderTicker(){
  if (!ui.tick) return;
  var items = newsToday(), key = items.map(function(n){ return n.id + n.text; }).join("|") + S.marquee + S.speed + (S.tickDir || "");
  if (!items.length) { ui.tick.parentNode.hidden = true; tickerKey = key; return; }
  ui.tick.parentNode.hidden = false;
  if (S.marquee) {
    if (key === tickerKey) return; tickerKey = key;
    tkStop(); ui.tick.className = "tick mqj"; ui.tick.innerHTML = "";
    items.forEach(function(n, i){ if (i) { var b = document.createElement("b"); b.textContent = "۞"; ui.tick.appendChild(b); } ui.tick.appendChild(document.createTextNode(n.text)); });
    if (!tkCoord) requestAnimationFrame(function(){ tkPass(true); }); // بدون شرائح متحركة: الشريط السفلي يدور وحده باستمرار
  } else {
    var now = Date.now();
    if (key !== tickerKey) { tickerKey = key; newsIdx = -1; newsUntil = 0; ui.tick.className = "tick st"; ui.tick.style.animation = "none"; }
    if (now >= newsUntil) { newsIdx = (newsIdx + 1) % items.length; newsUntil = now + S.newsSec*1000;
      ui.tick.textContent = items[newsIdx].text; ui.tick.classList.remove("fade"); void ui.tick.offsetWidth; ui.tick.classList.add("fade"); }
  }
}

/* ===== شاشتان في المسجد: الأولى للمواقيت، والثانية للمحتوى =====
   كل جهاز يُضبط دوره من إعداداته (أو من صفحة تحرير شاشته في الموقع)، وشاشات الأذان والإقامة تظهر على الاثنتين */
/* شاشتان أو أكثر في المسجد بدورين: شاشة الإعلانات (المحتوى) والباقي للمواقيت.
   الجهاز المرتبط بالموقع يعرف رقمه (الشاشة 1، الشاشة 2...) فيأخذ دوره تلقائياً حسب «شاشة الإعلانات» (adsSlot)،
   فتبقى إعدادات المسجد واحدة لكل أجهزته. الجهاز غير المرتبط: الدور المختار يدوياً فيه (role) */
function mySlot(){ var R = S.remote || {}; return R.on && R.server && +R.slot > 0 ? +R.slot : 0; }
function s2Band(){ var M = S.multi || {}; return M.slides !== false && S.slides.move && S.slides.move !== "none" && S.slides.items.some(function(x){ return x && typeof x === "object" && !x.img && x.active !== false && (x.title || x.body); }); }
function s2Text(){ return S.slides.items.filter(function(x){ return x && typeof x === "object" && !x.img && x.active !== false && (x.title || x.body); }); }
/* شاشة الإعلانات مؤقتة: من وقت إلى وقت (بتوقيت المسجد). خارج المدة تعود لنفس محتوى الشاشات الأخرى */
function dualOn(){ var M = S.multi || {}; if (M.mode !== "dual") return false; if (!M.from && !M.until) return true;
  var z = zp(Date.now()), k = dkey(z.Y, z.M, z.D) + "T" + two(z.h) + ":" + two(z.m);
  if (M.from && k < String(M.from).slice(0, 16)) return false; if (M.until && k >= String(M.until).slice(0, 16)) return false; return true; }
var secBuilt = null;
function isSecond(){ var M = S.multi || {}; if (!dualOn()) return false; var n = mySlot();
  return n ? n === (+M.adsSlot || 2) : M.role === "second"; }
var s2State = {i:-1, until:0, key:""};
function secondItems(now){
  var M = S.multi || {}, out = [], z = zp(now);
  if (M.boards !== false) S.boards.items.forEach(function(b){ if (b.active) out.push({id:"b" + b.id, title:b.title || "", body:b.body || "", img:b.img || "", tSize:b.tSize || 110, bSize:b.bSize || 64, bg:"#000000", bgOp:0}); });
  var band = s2Band() && ui.mqbar; // الشرائح النصية تتحرك في شريط تحت الساعة، والصندوق للصور والأذكار
  if (M.slides !== false) S.slides.items.forEach(function(x){ if (typeof x === "string") x = {id:x, img:x}; if (band && !x.img) return; if (x.active !== false && (x.img || x.title || x.body)) { var c = {}; for (var k in x) c[k] = x[k]; c.full = false; c.bgOp = 0; out.push(c); } });
  if (M.remind !== false) remindList(now).forEach(function(r){ out.push({id:r.id, title:r.title, body:r.body, tSize:110, bSize:66, bgOp:0}); });
  if (M.adhkar !== false) { // أذكار الصباح من الفجر إلى الظهر، وأذكار المساء من العصر إلى العشاء
    var d = dayTimes(z.Y, z.M, z.D), tm = {}; d.list.forEach(function(x){ tm[x.k] = x.A; });
    var kind = now >= tm.fajr && now < tm.dhuhr ? "morning" : now >= tm.asr && now < tm.isha ? "evening" : "";
    if (kind) (zkListOf(kind) || []).slice(0, 12).forEach(function(tx, i){ out.push({id:"z" + kind + i, title:kind === "morning" ? "أذكار الصباح" : "أذكار المساء", body:tx, tSize:84, bSize:zkSize(tx)*1.15, bgOp:0, lineH:1.8}); });
  }
  if (M.hadith !== false && S.fixedZekr) out.push({id:"fz", title:"", body:String(S.fixedZekr || ""), bSize:96, bgOp:0, lineH:1.7});
  if (M.news !== false) newsToday().forEach(function(n){ if (String(n.id).indexOf("rm-") !== 0) out.push({id:"n" + n.id, title:"إعلان", body:n.text, tSize:84, bSize:80, bgOp:0}); });
  if (!out.length) out.push({id:"def", title:S.mosque || "", body:String(S.fixedZekr || DEF.fixedZekr), tSize:110, bSize:80, bgOp:0});
  return out;
}
// تصغير النص تلقائياً حتى يتسع المحتوى الطويل (مثل آية الكرسي) داخل المساحة
function s2Fit(){
  var box = ui.s2 && ui.s2.querySelector(".sbox"); if (!box) return;
  var st = box.querySelector(".st"), sb = box.querySelector(".sb"), im = box.querySelector("img");
  for (var n = 0; n < 40 && box.scrollHeight > box.clientHeight + 2; n++) {
    if (sb) { var f = parseFloat(sb.style.fontSize) || 60; if (f > 26) sb.style.fontSize = (f*0.93).toFixed(1) + "px"; }
    if (st) { var g = parseFloat(st.style.fontSize) || 90; if (g > 40 && (!sb || n % 2)) st.style.fontSize = (g*0.95).toFixed(1) + "px"; }
    if (im && n > 20) im.style.height = Math.max(20, (parseFloat(im.style.height) || 55) - 4) + "%";
  }
}
function secondScreen(now){
  if (!ui.s2) return;
  var items = secondItems(now), key = items.map(function(x){ return x.id; }).join("|");
  if (key !== s2State.key) { s2State.key = key; s2State.until = 0; if (s2State.i >= items.length) s2State.i = -1; }
  if (now < s2State.until && s2State.until - now < 200000) return; // تصحيح ساعة الجهاز للخلف لا يوقف التناوب
  s2State.i = (s2State.i + 1) % items.length; var it = items[s2State.i];
  s2State.until = now + Math.max(5, +(it.sec || (S.multi || {}).sec || 20))*1000;
  var sl = {}; for (var k in it) sl[k] = it[k]; sl.full = false; sl.radius = 28; sl.pad = 56; sl.gap = 30; if (sl.bg == null) sl.bg = "#000000";
  renderSlide(ui.s2, sl); s2Fit(); ui.s2.classList.remove("fade"); void ui.s2.offsetWidth; ui.s2.classList.add("fade");
  if (ui.s2dots) ui.s2dots.innerHTML = items.length > 1 && items.length <= 24 ? items.map(function(x, i){ return '<i' + (i === s2State.i ? ' class="on"' : "") + '></i>'; }).join("") : "";
}

/* ===== الشرائح ولوحات العرض ===== */
var slideState = {}, boardState = {};
function slideList(){
  var own = S.slides.on ? S.slides.items.map(function(x){ return typeof x === "string" ? {id:x, img:x, imgMode:"contain"} : x; })
    .filter(function(x){ return x.active !== false && (x.img || x.title || x.body); }) : [];
  (S.gslides || []).forEach(function(g){ if (g && (g.title || g.body) && inSched(g)) own.unshift(g); }); // إعلانات عامة من إدارة الموقع (محاضرة، استسقاء...) في موعدها
  var R0 = S.remind || {};
  if (R0.show !== "ticker") remindList(Date.now()).forEach(function(r){ own.unshift({id:r.id, title:r.title, body:r.body, tSize:92, bSize:52, lineH:1.7, bg:"#000000", bgOp:.55}); });
  return own;
}
var SLIDE_DEF = {title:"", body:"", img:"", imgMode:"contain", tSize:96, bSize:60, tFont:"", bFont:"", tColor:"#EBD1A0", bColor:"#ffffff",
  bg:"#000000", bgOp:0.35, align:"center", valign:"center", lineH:1.6, gap:24, pad:48, imgH:55, radius:24, full:false, sec:0, active:true};
function renderSlide(el, raw){
  var sl = {}; for (var k in SLIDE_DEF) sl[k] = (raw && raw[k] !== undefined && raw[k] !== "") ? raw[k] : SLIDE_DEF[k];
  if (raw && typeof raw === "string") sl.img = raw;
  var ai = sl.align === "right" ? "flex-start" : sl.align === "left" ? "flex-end" : "center";
  var jc = sl.valign === "top" ? "flex-start" : sl.valign === "bottom" ? "flex-end" : "center";
  el.innerHTML = "";
  el.style.borderRadius = sl.full ? "0" : sl.radius + "px";
  el.style.background = hexA(sl.bg, +sl.bgOp);
  var box = document.createElement("div"); box.className = "sbox";
  box.style.cssText = "justify-content:" + jc + ";align-items:" + ai + ";text-align:" + sl.align + ";padding:" + sl.pad + "px;gap:" + sl.gap + "px";
  var hasText = !!(sl.title || sl.body);
  if (sl.img) {
    if (sl.imgMode === "bg") {
      mediaURL(sl.img).then(function(u){ if (u) el.style.background = "linear-gradient(" + hexA(sl.bg, +sl.bgOp) + "," + hexA(sl.bg, +sl.bgOp) + "),url(" + u + ") center/cover no-repeat"; });
    } else {
      var im = document.createElement("img"); im.alt = "";
      im.style.cssText = "object-fit:" + sl.imgMode + ";max-width:100%;" + (sl.imgMode === "cover" ? "width:100%;" : "") + (hasText ? "height:" + sl.imgH + "%;" : "height:100%;") + "border-radius:" + Math.max(0, sl.radius - 8) + "px;flex:none;min-height:0";
      if (!hasText && sl.imgMode === "cover") { box.style.padding = "0"; im.style.borderRadius = "0"; }
      mediaURL(sl.img).then(function(u){ if (u) im.src = u; });
      box.appendChild(im);
    }
  }
  if (sl.title) { var t1 = document.createElement("div"); t1.className = "st"; t1.textContent = sl.title;
    t1.style.cssText = "font-size:" + sl.tSize + "px;color:" + sl.tColor + ";line-height:" + Math.max(1.1, sl.lineH - .3) + ";font-family:'" + (sl.tFont || S.look.fontText) + "',Amiri,serif"; box.appendChild(t1); }
  if (sl.body) { var t2 = document.createElement("div"); t2.className = "sb"; t2.textContent = sl.body;
    t2.style.cssText = "font-size:" + sl.bSize + "px;color:" + sl.bColor + ";line-height:" + sl.lineH + ";font-family:'" + (sl.bFont || S.look.fontText) + "',Amiri,serif"; box.appendChild(t2); }
  el.appendChild(box);
  return sl;
}
/* الرسائل العاجلة المجدولة من لوحة المدير: تغطي الشاشة في وقتها، وتعمل بدون إنترنت لأنها محفوظة في الإعدادات */
var alertKey = "";
function alerts(now, ph){
  var el = document.getElementById("salert"), z = zp(now), cur = null;
  if (ph.mode !== "praying" && ph.mode !== "black" && ph.mode !== "iqnow" && !ph.inPrayer)
    (S.galerts || []).concat(S.alerts || []).forEach(function(x){ if (!cur && x && x.on !== false && (x.text || x.title) && inSched(x, z)) cur = x; }); // الإعلانات العامة من إدارة الموقع أولاً
  if (!cur) { if (el && !el.hidden) { el.hidden = true; stage.classList.remove("salerton"); } alertKey = ""; return; }
  if (!el) { el = document.createElement("div"); el.id = "salert"; el.className = "slide full"; stage.appendChild(el); }
  var key = cur.id + "|" + cur.title + "|" + cur.text + "|" + layout;
  if (alertKey !== key) { alertKey = key;
    renderSlide(el, {title:cur.title || "", body:cur.text || "", tSize:cur.tSize || 130, bSize:cur.bSize || 80, tColor:cur.tColor || "#EBD1A0", bColor:"#ffffff", bg:cur.bg || "#000000", bgOp:cur.bgOp == null ? .94 : cur.bgOp, full:true, radius:0, align:"center", valign:"center", lineH:1.7, gap:40, pad:90}); }
  el.hidden = false; el.style.zIndex = 7; stage.classList.add("salerton");
  if (el._fitK !== alertKey) { el._fitK = alertKey; fitSlide(el); }
}
/* الرسالة الطويلة (عاجلة أو مجدولة): يصغر الخط تدريجياً حتى يظهر النص كاملاً داخل الشاشة */
function fitSlide(el){
  var run = function(){
    var box = el.querySelector(".sbox"); if (!box || el.hidden) return;
    var st = box.querySelector(".st"), sb = box.querySelector(".sb");
    var over = function(){ return el.scrollHeight > el.clientHeight + 2 || box.scrollHeight > box.clientHeight + 2 || box.offsetHeight > el.clientHeight * 0.9; }; // هامش حتى لا يلامس النص حافة الشاشة
    for (var n = 0; n < 60 && over(); n++) {
      if (sb) { var f = parseFloat(sb.style.fontSize) || 80; if (f > 22) sb.style.fontSize = (f*0.94).toFixed(1) + "px"; }
      if (st && (!sb || n % 2)) { var g = parseFloat(st.style.fontSize) || 130; if (g > 44) st.style.fontSize = (g*0.95).toFixed(1) + "px"; }
    }
  };
  run(); setTimeout(run, 700); // مرة أخرى بعد تحميل الخط
}
function scrMsg(txt){ var u = document.getElementById("ui") || document.body, m = document.createElement("div"); m.className = "fshint"; m.textContent = txt; u.appendChild(m);
  setTimeout(function(){ if (m.parentNode) m.parentNode.removeChild(m); }, 3500); }
var dhTaps = [];
function slideTap(e){ // المس الشريحة لإيقافها، واضغط 3 مرات على اسم الظهر لتجربة الشرائح
  if (slideState.show && e.target.closest(".slide,#fslide,.smbar")) { e.stopPropagation(); slideState.stopReq = true; tick(); return true; }
  if (e.target.closest('[data-k="dhuhr"],[data-k="jumuah"]') && !e.target.closest(".c2,.c3,.a,.i")) {
    var t0 = Date.now(); dhTaps = dhTaps.filter(function(x){ return t0 - x < 1500; }); dhTaps.push(t0);
    if (dhTaps.length >= 3) { dhTaps = []; slideState.testReq = true; tick(); } return true; }
  return false;
}
function bandIdle(){ // الشريط العلوي بين الشرائح: الدعاء الثابت في مكانه، فلا تبقى مساحة فارغة تحت الساعة
  var b = ui.mqbar; if (!b) return;
  if (!S.fixedOn || isSecond()) { b.innerHTML = ""; b.classList.remove("on", "idle"); return; }
  b.innerHTML = '<div class="smidle">' + esc(String(S.fixedZekr || "").trim() || DEF.fixedZekr) + '</div>'; b.classList.add("on", "idle");
  fitText(b.firstChild, .5);
}
function bandStatic(el, sl){ // الشريط تحت الساعة بدون حركة: الآية ثابتة لمدتها ثم التالية
  var tx = [sl.title, sl.body].filter(function(x){ return x && String(x).trim(); }).join(" ۞ ").replace(/\s*\n+\s*/g, " "); if (!tx) return 0;
  el.classList.remove("idle"); el.innerHTML = '<div class="smst"><span>' + esc(tx) + '</span></div>'; el.classList.add("on");
  var d = el.firstChild, sp = d.firstChild, fit0 = function(){ if (!d.parentNode) return; d.style.fontSize = ""; // قياس النص نفسه: لا يُقصّ طرف الآية
    var av = d.clientWidth - 36, w = sp.offsetWidth, f = parseFloat(getComputedStyle(d).fontSize) || 40;
    if (av > 0 && w > av) d.style.fontSize = Math.max(f * .45, f * av / w * .97).toFixed(1) + "px"; };
  fit0(); d.classList.add("fade"); setTimeout(fit0, 700); // مرة أخرى بعد تحميل الخط
  return Math.max(3, +sl.sec || +S.slides.sec || 15) * 1000;
}
function slideMove(el, sl){ // حركة بخط مستقيم من اليمين لليسار أو العكس، بسرعة ثابتة فيكون وقت النص الطويل أطول
  var mv = S.slides.move; if (!mv || mv === "none" || sl.img) return 0;
  var tx = [sl.title, sl.body].filter(function(x){ return x && String(x).trim(); }).join(" ۞ ").replace(/\s*\n+\s*/g, " "); if (!tx) return 0;
  var d = {}; for (var k in SLIDE_DEF) d[k] = (sl[k] !== undefined && sl[k] !== "") ? sl[k] : SLIDE_DEF[k];
  el.innerHTML = ""; var W0 = el.clientWidth, H0 = el.clientHeight; if (!W0) return 0;
  var line = document.createElement("div"); line.className = "smq"; line.textContent = tx;
  var bar = el === ui.mqbar; // الشريط العلوي: نفس خط ولون وحجم شريط الأخبار السفلي
  line.style.cssText = "position:absolute;top:0;bottom:0;left:0;display:flex;align-items:center;white-space:nowrap;will-change:transform;backface-visibility:hidden;line-height:1.5;" +
    (bar ? "" : "font-weight:700;color:" + d.bColor + ";font-family:'" + (d.bFont || S.look.fontText) + "',Amiri,serif;font-size:" + Math.round(Math.min(H0 * .55, Math.max(40, d.bSize * 1.35))) + "px");
  el.appendChild(line); var W = line.offsetWidth, sp = mqSpeed(), dur = Math.round((W0 + W) / sp * 1000);
  var a = mv === "ltr" ? [-W, W0] : [W0, -W]; // ltr: من اليسار إلى اليمين
  mqAnim(line, a[0], a[1], dur, false); // على كرت الشاشة: حركة ناعمة
  return dur + 300;
}
function slides(now){
  var fs = $("#fslide");
  var SECB = isSecond() && !!ui.mqbar, items = SECB ? s2Text() : slideList();
  var stop = function(){ if (ui.mqbar && slideState.bar && S.slides.move !== "band") bandIdle(); slideState.bar = false; mainEl.classList.remove("mqon"); slideState.show = false; if (ui.slide) ui.slide.hidden = true; if (ui.zone) ui.zone.classList.remove("sliding"); if (fs) fs.hidden = true; stage.classList.remove("fsl"); mainEl.classList.remove("sbon"); };
  if (slideState.stopReq) { slideState.stopReq = false; slideState.test = 0; var wb = slideState.bar; stop(); var d2 = tkCoord && wb ? tkPass(false) : 0; slideState.next = now + (d2 ? d2 + 500 : S.slides.every*1000); return; } // لمسة على الشريحة توقفها
  if (slideState.testReq) { slideState.testReq = false; if (!items.length) { scrMsg("لا توجد شرائح مفعلة لتجربتها"); return; } stop(); slideState.test = items.length; slideState.i = -1; slideState.next = 0; scrMsg("تجربة الشرائح (" + items.length + ")، المس الشريحة لإيقافها"); }
  var coord = !!(ui.mqbar && S.slides.move !== "band" && (isSecond() ? SECB : true) && items.some(function(x){ return !x.img && (x.title || x.body); }));
  if (coord !== tkCoord) { tkCoord = coord; slideState.cInit = 0; if (!coord) { tkStop(); requestAnimationFrame(function(){ tkPass(true); }); } else tkStop(); }
  if (!items.length || (isSecond() && !SECB)) { stop(); if (ui.mqbar && ui.mqbar.querySelector(".smst")) bandIdle(); return; }
  if (ui.mqbar && S.slides.move === "band" && !slideState.cInit && !slideState.show) { slideState.cInit = 1; slideState.next = Math.min(slideState.next || 0, now + 1000); }
  if (coord && !slideState.cInit && !slideState.show) { slideState.cInit = 1; var d0 = tkPass(false); slideState.next = now + (d0 ? d0 + 500 : 1500); return; } // يبدأ بالسفلي ثم العلوي
  if (SECB && !slideState.s2i) { slideState.s2i = 1; slideState.next = now + 1500; } // الشاشة الثانية: الشرائح المتحركة متتالية // الشاشة الثانية تعرض المحتوى في مساحتها الخاصة
  if (!ui.zone && !fs) return;
  if (slideState.show && now >= slideState.until) { var wasBar = slideState.bar; stop(); if (slideState.test > 0 && --slideState.test > 0) slideState.next = now + 400; else { slideState.test = 0;
      var d1 = coord && wasBar ? tkPass(false) : 0; // انتهى العلوي: يمر السفلي مرة كاملة ثم يعود العلوي
      slideState.next = now + (d1 ? d1 + 500 : S.slides.move === "band" && wasBar ? 0 : (SECB || coord ? 1200 : S.slides.every*1000)); } } // في التجربة: الشرائح متتالية بدون انتظار
  else if (!slideState.show && now >= slideState.next) {
    slideState.i = S.slides.random && !slideState.test ? Math.floor(Math.random()*items.length) : (slideState.i + 1) % items.length;
    var sl = items[slideState.i], full = !!sl.full || !ui.zone;
    slideState.show = true; slideState.full = full; slideState.until = now + ((+sl.sec || S.slides.sec)*1000);
    if (ui.mqbar && !sl.img && (sl.title || sl.body)) { // متحركة: في شريطها تحت الساعة، فلا تُغطّى الساعة ولا تتحرك عناصر الشاشة
      if (S.slides.move === "band") { var st0 = bandStatic(ui.mqbar, sl); if (st0) { slideState.bar = true; slideState.until = now + st0; return; } }
      ui.mqbar.classList.remove("idle"); var mq0 = slideMove(ui.mqbar, sl);
      if (mq0) { tkStop(); slideState.bar = true; slideState.until = now + mq0; ui.mqbar.classList.add("on"); mainEl.classList.add("mqon"); return; }
    }
    if (SECB) { slideState.show = false; slideState.next = now + 3000; return; }
    var el = full ? fs : ui.slide;
    renderSlide(el, sl); el.hidden = false; el.classList.remove("fade"); void el.offsetWidth; el.classList.add("fade");
    var mq = slideMove(el, sl); if (mq) slideState.until = now + mq; // الشريحة المتحركة: مدتها حسب طول النص
    var below = !full && ui.slide && ui.slide.classList.contains("sbelow");
    if (below) mainEl.classList.add("sbon"); else if (!full) ui.zone.classList.add("sliding"); else stage.classList.add("fsl"); // شريحة بملء الشاشة تخفي ما تحتها
  }
}
function boards(now){
  if (!ui.board) return;
  var all = S.boards.items.filter(function(b){ return b.active; }), pin = all.filter(function(b){ return b.pinned; });
  var items = pin.length ? pin.slice(0, 1) : all; if (!items.length) return;
  if (now < boardState.until && boardState.n === items.length) return;
  boardState.i = (boardState.i + 1) % items.length; boardState.n = items.length; boardState.until = now + S.boards.rot*1000;
  var b = items[boardState.i], bt = $(".bt", ui.board), bb = $(".bb", ui.board), bi = $(".bimg", ui.board);
  bt.textContent = b.title || ""; bb.textContent = b.body || "";
  bt.style.cssText = "font-size:" + (b.tSize || 110) + "px;color:" + (b.tColor || "var(--acc)") + ";font-family:'" + (b.tFont || S.look.fontText) + "',Cairo,sans-serif";
  bb.style.cssText = "font-size:" + (b.bSize || 64) + "px;color:" + (b.bColor || "var(--fg)") + ";font-family:'" + (b.bFont || S.look.fontText) + "',Cairo,sans-serif";
  bi.hidden = true; if (b.img) mediaURL(b.img).then(function(u){ if (u) { bi.src = u; bi.hidden = false; } });
  ui.board.classList.remove("fade"); void ui.board.offsetWidth; ui.board.classList.add("fade");
}

/* ===== الطقس (يعمل عند تشغيل النسخة المحلية مع إنترنت) ===== */
var wx = null, wxAt = 0, wxStatus = "";
try { var wc0 = JSON.parse(localStorage.getItem("rawayie-weather") || "null"); if (wc0 && Date.now() - wc0.at < 3*3600000) { wx = wc0.wx; wxStatus = "cache@" + wc0.at; } } catch(e){}
/* النهار من الشروق إلى المغرب حسب مواقيت اليوم نفسها، فيبقى الرمز صحيحاً بدون إنترنت ويتبدل وحده */
var wxDN = "";
function wxDayNight(){
  if (!ui.wx || ui.wx.hidden) return;
  var now = Date.now(), z = zp(now), d = dayTimes(z.Y, z.M, z.D), sr = byK(d, "sunrise"), mg = byK(d, "maghrib");
  var k = sr && mg ? (now >= sr.A && now < mg.A ? "clear_day" : "clear_night") : (wx && +wx.is_day === 0 ? "clear_night" : "clear_day");
  if (k !== wxDN) { wxDN = k; $("img", ui.wx).src = "img/" + k + ".png"; }
}
function wxIcon(c, day){
  if (c === 0 || c === 1) return day ? "clear_day" : "clear_night";
  if (c === 2 || c === 3) return "cloudy"; if (c === 45 || c === 48) return "fog";
  if (c >= 51 && c <= 67 || c >= 80 && c <= 82) return "rain"; if (c >= 71 && c <= 77 || c === 85 || c === 86) return "cloudy";
  if (c === 95) return "thunder"; if (c > 95) return "thunder_rain"; return "unknown";
}
function getJSON(url){
  if (window.fetch) return fetch(url, {cache:"no-store"}).then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); });
  return new Promise(function(res, rej){ var x = new XMLHttpRequest(); x.open("GET", url); x.onload = function(){ try { res(JSON.parse(x.responseText)); } catch(e){ rej(e); } }; x.onerror = rej; x.send(); });
}
var WX_KEY = "rawayie-weather";
function fetchWeather(){
  if (!S.weather.on) return; wxAt = Date.now();
  var ci = cityInfo(), lat = ci.lat, lng = ci.lng;
  if (S.weather.src === "manual" && S.weather.lat !== "") { lat = +S.weather.lat; lng = +S.weather.lng; }
  var ok = function(c){ wx = c; wxStatus = "ok@" + Date.now(); try { localStorage.setItem(WX_KEY, JSON.stringify({at:Date.now(), wx:c, lat:lat, lng:lng})); } catch(e){} renderWeather(); };
  var fail = function(){
    try { var c = JSON.parse(localStorage.getItem(WX_KEY) || "null"); // آخر قراءة محفوظة (حتى 3 ساعات)
      if (c && Date.now() - c.at < 3*3600000 && Math.abs(c.lat - lat) < .5) { wx = c.wx; wxStatus = "cache@" + c.at; renderWeather(); }
      else { wx = null; wxStatus = "fail"; renderWeather(); } } catch(e){ wx = null; wxStatus = "fail"; renderWeather(); }
    wxAt = Date.now() - 25*60000; // إعادة المحاولة بعد 5 دقائق
  };
  try {
    getJSON("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lng + "&current=temperature_2m,weather_code,is_day&timezone=auto")
      .then(function(j){ if (!j.current) throw new Error("x"); ok(j.current); })
      .catch(function(){ // مصدر احتياطي
        return getJSON("https://wttr.in/" + lat + "," + lng + "?format=j1").then(function(j){
          var c = j.current_condition[0], code = +c.weatherCode, h = zp(Date.now()).h;
          var wmo = code === 113 ? 0 : code <= 122 ? 2 : (code === 143 || code === 248 || code === 260) ? 45 : code >= 386 ? 95 : (code >= 179 && code <= 377 && [179,227,230,323,326,329,332,335,338,368,371].indexOf(code) >= 0) ? 71 : 61;
          ok({temperature_2m:+c.temp_C, weather_code:wmo, is_day:(h >= 6 && h < 18) ? 1 : 0});
        });
      }).catch(fail);
  } catch(e){ fail(); }
}
function renderWeather(){
  if (!ui.wx) return;
  if (!S.weather.on || !wx) { ui.wx.hidden = true; return; }
  // رمز النهار أو الليل فقط (شمس أو هلال) ودرجة الحرارة بدون علامة الدرجة
  ui.wx.hidden = false; wxDN = ""; wxDayNight();
  $("span", ui.wx).textContent = num(Math.round(wx.temperature_2m));
}

/* ===== الأصوات ===== */
var audio = new Audio(), unlocked = false, fired = {};
function unlock(){
  if (unlocked) return; unlocked = true;
  var hide = function(){ var b = $("#sndbtn"); if (b) b.hidden = true; };
  try { audio.src = "snd/beep_07a.mp3"; audio.volume = 0; var p = audio.play();
    if (p && p.then) p.then(hide, function(){ unlocked = false; }); else hide(); } catch(e){ unlocked = false; }
  setTimeout(function(){ audio.pause(); audio.volume = +S.snd.vol; }, 300);
}
// التشغيل التلقائي (وضع الكشك): يفعّل الصوت بدون ضغط إذا سمح المتصفح بذلك
setTimeout(unlock, 1200);
function play(kind, pk){
  if (S.snd && S.snd.mute === true) return; // كتم كل الأصوات
  var src = "";
  // أذان الفجر كاملاً فيه «الصلاة خير من النوم»
  if (kind === "azanFajr") { kind = "azan"; pk = "fajr"; }
  if (kind === "azan") src = S.snd.azan === "short" ? "snd/azan.mp3" : S.snd.azan === "short2" ? "snd/azan_old.mp3" : S.snd.azan === "long" ? (pk === "fajr" && S.snd.fajrLong !== false ? "snd/azan_fajr.mp3" : "snd/azan_long.mp3") : "";
  if (kind === "iqama") src = S.snd.iqama === "short" ? "snd/iqama.mp3" : S.snd.iqama === "short2" ? "snd/iqama_old.mp3" : "";
  var BEEPS = {beep_07a:1, beep_06:1, beep_b:1, beep_t:1};
  // نغمتا التنبيه قبل الأذان وقبل الإقامة («beep» للتنبيهات المجدولة بنغمة ما قبل الإقامة)
  var toneSrc = function(f){ return f === "beep_04w" ? "snd/beep_04.wav" : f === "beep_04" ? "snd/beep_04.mp3" : "snd/" + (BEEPS[f] ? f : "beep_07a") + ".mp3"; };
  if (kind === "preA") src = toneSrc((S.snd.preA || {}).file);
  if (kind === "beep" || kind === "preI") src = toneSrc((S.snd.preI || {}).file || S.snd.beepFile);
  if (/^pt:\w+$/.test(kind)) src = toneSrc(kind.slice(3)); // تجربة نغمة من الإعدادات
  var custom = (kind === "azan" && S.snd.azan === "custom") ? S.snd.azanId : (kind === "iqama" && S.snd.iqama === "custom") ? S.snd.iqamaId : "";
  // نغمة التطبيق: تُسمع عند الأذان والإقامة إذا لم يُختر صوت أذان أو إقامة (مثل تطبيق روائع السابق)
  var tn = S.snd.tone || "short", tsrc = tn === "clear" ? "snd/beep_04.wav" : tn === "short" ? "snd/beep_04.mp3" : ""; // نغمتا تطبيق روائع السابق (نفس النغمة بصيغتين)
  if (kind === "tone") src = tsrc;
  if (/^sf:[\w.-]+\.mp3$/.test(kind)) src = "snd/" + kind.slice(3); // تجربة صوت معيّن من الإعدادات
  if (/^tone[A-Z]/.test(kind)) src = kind === "toneClear" ? "snd/beep_04.wav" : "snd/beep_04.mp3"; // تجربة نغمة من الإعدادات
  if ((kind === "azan" || kind === "iqama") && !src && !custom) src = tsrc;
  var go = function(u){ if (!u) return; try { audio.pause(); audio.src = u; audio.volume = +S.snd.vol; var p = audio.play(); if (p && p.catch) p.catch(function(){}); } catch(e){} };
  if (custom) mediaURL(custom).then(go); else go(src);
}
/* ===== تنبيهات صوتية مجدولة =====
   صوت ورسالة قصيرة (12 ثانية) قبل أو بعد أذان أو إقامة صلاة معيّنة بعدد دقائق، أو عند منتصف الليل والثلث الأخير.
   تعمل داخل الجهاز بدون إنترنت. مثال: «قبل الفجر بـ 30 دقيقة: صلاة القيام» */
var remFired = {}, remT = null;
var REM_NAMES = {fajr:"الفجر", sunrise:"الشروق", dhuhr:"الظهر", asr:"العصر", maghrib:"المغرب", isha:"العشاء", mid:"منتصف الليل", third:"الثلث الأخير من الليل"};
function remBase(r, ph, now){
  if (r.ref === "mid" || r.ref === "third") { var n0 = nightTimes(ph.today, ph, now); return n0 ? n0[r.ref] : 0; }
  var p = byK(ph.today, r.ref); if (!p) return 0;
  return r.at === "iqama" && r.ref !== "sunrise" ? p.I : p.A;
}
function remShow(r){
  var stage0 = stage, el = document.getElementById("remmsg"); if (!stage0) return;
  if (!el) { el = document.createElement("div"); el.id = "remmsg"; el.className = "slide full"; stage0.appendChild(el); }
  renderSlide(el, {title:r.title || "", body:r.text || "", tSize:120, bSize:80, tColor:"#EBD1A0", bColor:"#ffffff", bg:"#000000", bgOp:.9, full:true, radius:0, align:"center", valign:"center", lineH:1.7, gap:36, pad:90});
  el.hidden = false; el.style.zIndex = 8; try { fitSlide(el); } catch(e){}
  clearTimeout(remT); remT = setTimeout(function(){ el.hidden = true; }, Math.max(5, +r.sec || 12) * 1000);
}
function remRun(r){
  if (r.sound && r.sound !== "none") play(r.sound === "azan" ? "azan" : r.sound === "iqama" ? "iqama" : "beep");
  if (r.text || r.title) remShow(r);
}
function soundReminders(now, ph){
  var L = (S.sndRem && S.sndRem.items) || []; if (!L.length || !ph.today) return;
  L.forEach(function(r){ if (!r || r.on === false) return;
    var b = remBase(r, ph, now); if (!b) return;
    var at = b + (r.when === "after" ? 1 : -1) * (+r.min || 0) * 60000, key = r.id + "@" + Math.round(at / 60000);
    if (now >= at && now - at < 8000 && !remFired[key]) { remFired[key] = 1; remRun(r); }
  });
}
function events(now, ph){
  try { soundReminders(now, ph); } catch(e){}
  // نغمة التنبيه قبل الأذان: للصلاة القادمة (أو الحالية إذا كان التنبيه وقت الأذان نفسه)
  var PA = S.snd.preA || {};
  if (PA.on) [ph.next, ph.cur].forEach(function(q){ if (!q || q.k === "sunrise" || q.k === "eid") return;
    var at = q.A - Math.max(0, +PA.min || 0)*60000, kk = q.k + "@" + q.A + "pa";
    if (now >= at && now - at < 5000 && !fired[kk]) { fired[kk] = 1; play("preA"); } });
  var p = ph.cur; if (!p || p.k === "eid") return;
  var k = p.k + "@" + p.A;
  var fire = function(id, at, fn){ if (now >= at && now - at < 5000 && !fired[k + id]) { fired[k + id] = 1; fn(); } };
  fire("a", p.A, function(){ play("azan", p.k); });
  var PI = S.snd.preI || {}; if (PI.on) fire("b", p.I - Math.max(0, +PI.min || 0)*60000, function(){ play("preI"); }); // قبل الإقامة
  fire("i", p.I, function(){ play("iqama"); });
}

/* ===== الشاشات الكاملة ===== */
/* ===== خطة الأذكار لكل صلاة =====
   مدة كل ذكر (ثابتة أو حسب طول النص)، وعدد مرات عرض القائمة، وعدم التكرار في نفس الصلاة،
   والإكمال من حيث توقفت الصلاة السابقة حتى لا تتكرر نفس الأذكار في كل صلاة */
var zkPlans = {}, zkPos = (function(){ try { return JSON.parse(localStorage.getItem("rawayie-zkpos") || "{}") || {}; } catch(e){ return {}; } })();
function zkListOf(kind){ return kind === "after" ? txList("after", window.ADHKAR_AFTER) : kind === "morning" ? txList("morning", window.ADHKAR_MORNING) : txList("evening", window.ADHKAR_EVENING); }
function zkSecOf(kind, text){
  var Z = S.zk, base = +(Z[kind + "Sec"] || Z.itemSec || 25);
  if (!Z.autoSec) return Math.max(3, base);
  return Math.max(6, Math.min(120, Math.round(4 + String(text).length / 11))); // تقريباً سرعة قراءة مريحة على الشاشة
}
/* قوالب الأذكار: one ذكر بعد ذكر · page صفحة مزخرفة · full صفحة بملء الشاشة بدون خلفية.
   يمكن اختيار أكثر من قالب، فتتناوب الصلوات عليها: كل صلاة بالقالب التالي */
var ZK_TPLS = ["one", "page", "full", "royal", "ivory", "night", "bgold", "bivory", "bgray"]; // bgold/bivory/bgray: لوحات أذكار بعد الصلاة الجاهزة (صور) // royal ملكي · ivory عاجي · night ليلي: زخارف مرسومة (SVG) حادة على أي دقة
function zkTpls(kind){ var Z = S.zk || {}, o = Z[kind + "Tpl"], l = o ? ZK_TPLS.filter(function(k){ return o[k] && (kind === "after" || k.charAt(0) !== "b"); }) : [];
  return l.length ? l : o ? ["one"] : [Z[kind + "Page"] === "page" ? "page" : "one"]; } // بدون اختيار: ذكر بعد ذكر، أو الإعداد القديم
function zkTplFor(kind, key){ var l = zkTpls(kind); if (l.length < 2) return l[0];
  var st = zkPos[kind + "T"] || {};
  if (st.key !== key) { st = {key:key, i:st.key ? (+st.i || 0) + 1 : 0}; zkPos[kind + "T"] = st; try { localStorage.setItem("rawayie-zkpos", JSON.stringify(zkPos)); } catch(e){} }
  return l[st.i % l.length]; }
function zkPlan(kind, start, tpl){
  var key = kind + "@" + start + (tpl ? "#" + tpl : ""); if (zkPlans[key]) return zkPlans[key];
  var Z = S.zk, list = zkListOf(kind) || [], n = list.length; if (!n) return null;
  tpl = tpl || zkTplFor(kind, key);
  if (tpl && tpl !== "one") { var pl = {page:true, tpl:tpl, list:list.slice(), total:Math.max(1, +Z[kind + "Min"] || 5) * 60000, n:n, seq:[{t:""}]}; zkPlans[key] = pl; return pl; } // صفحة ثابتة لكل الأذكار
  var maxMs = Math.max(1, +Z[kind + "Min"] || 5) * 60000, rounds = Z.noRepeat ? 1 : Math.max(1, +Z[kind + "Rounds"] || 1);
  var st = zkPos[kind] || {}, first;
  if (st.key === key) first = st.start;                                     // نفس الجلسة (مثلاً بعد إعادة تحميل الشاشة)
  else first = Z.rotate ? (+st.next || 0) % n : 0;
  var seq = [], total = 0;
  for (var c = 0; c < rounds * n; c++) { var tx = list[(first + c) % n], ms = zkSecOf(kind, tx) * 1000;
    if (seq.length && total + ms > maxMs) break; seq.push({t:tx, ms:ms, i:(first + c) % n}); total += ms; }
  if (st.key !== key) { zkPos[kind] = {key:key, start:first, next:(first + seq.length) % n}; try { localStorage.setItem("rawayie-zkpos", JSON.stringify(zkPos)); } catch(e){} }
  var plan = {seq:seq, total:total, n:n}; zkPlans[key] = plan;
  var ks = Object.keys(zkPlans); if (ks.length > 12) delete zkPlans[ks[0]];
  return plan;
}
function txList(k, def){ var l = (S.texts[k] || []).filter(function(x){ return x && x.trim(); }); return l.length ? l : def; }
var ovKey = "";
function zkSize(txt){ var L = txt.length, P = layout === "P"; var s = (P ? 66 : 70)*Math.sqrt(170/Math.max(L, 60)); return Math.round(Math.max(P ? 40 : 38, Math.min(P ? 76 : 80, s))*(+((S.look.fs || {}).zk) || 1)*(+((S.look.fs || {}).ts) || 1)); }
/* ذكر في لوحة الأذكار: العنوان القصير في السطر الأول (آية الكرسي، سيد الاستغفار) ذهبي، وعدد المرات في شارة */
function zkItem(x){
  var lines = String(x).split("\n"), hd = "", cnt = "";
  if (lines.length > 1 && lines[0].length <= 26) hd = lines.shift();
  var body = lines.join(" "), m = body.match(/\s*[(（]([^()]*(?:مرة|مرات|مره)[^()]*)[)）]\s*$/);
  if (m) { cnt = m[1]; body = body.slice(0, m.index); }
  if (hd && !body.trim()) { body = hd; hd = ""; } // ذكر قصير مع عدد مرات فقط: يبقى نصاً عادياً
  return '<p>' + (hd ? '<b class="zkt">' + esc(hd) + '</b> ' : "") + esc(body) + (cnt ? ' <span class="zkn">' + esc(cnt) + '</span>' : "") + '</p>';
}
/* زخارف قوالب الأذكار عالية الدقة (رسم متجه SVG: حاد على شاشات 4K، ولا يحتاج صوراً ولا إنترنت) */
function zkCorner(){ // زاوية مزخرفة: خطان متوازيان، قوس، ورقة، ونجمة ثمانية
  return '<svg viewBox="0 0 140 140" aria-hidden="true"><g class="zkdl"><path d="M8 132 V8 H132"/><path d="M20 120 V20 H120" class="zkdt"/>' +
    '<path d="M20 78 A58 58 0 0 1 78 20"/><path d="M20 58 A38 38 0 0 1 58 20" class="zkdt"/>' +
    '<path d="M78 20 C92 8 108 10 116 20 C106 18 96 22 90 30"/><path d="M20 78 C8 92 10 108 20 116 C18 106 22 96 30 90"/></g>' +
    '<g class="zkdf">' + star8(20, 20, 15, 7, "") + '<circle cx="20" cy="20" r="3.5" class="zkdh"/></g></svg>'; }
function zkDeco(tp){
  if (tp === "royal") return ["tl","tr","bl","br"].map(function(k){ return '<i class="zkcn ' + k + '">' + zkCorner() + '</i>'; }).join("");
  if (tp === "night") return '<i class="zkst"></i>';
  return "";
}
function zkBand(id){ // شريط نجوم هندسي متكرر
  return '<svg class="zkband" width="100%" height="56" aria-hidden="true"><defs><pattern id="' + id + '" width="56" height="56" patternUnits="userSpaceOnUse"><g class="zkdl">' +
    star8(28, 28, 24, 11, "") + '<circle cx="28" cy="28" r="6"/><path d="M0 28 H4 M52 28 H56 M28 0 V4 M28 52 V56"/></g></pattern></defs><rect width="100%" height="56" fill="url(#' + id + ')"/></svg>'; }
function zkDecoTop(tp){
  if (tp === "ivory") return zkBand("zkpt1");
  if (tp === "night") return '<svg class="zkmoon" viewBox="0 0 240 110" aria-hidden="true"><path class="zkdf" d="M138 14 A44 44 0 1 0 138 96 A35 35 0 1 1 138 14 Z"/>' +
    '<g class="zkdf">' + star8(160, 40, 9, 4, "") + star8(186, 24, 5, 2.3, "") + star8(60, 30, 5, 2.3, "") + star8(196, 70, 4, 1.8, "") + star8(44, 76, 4, 1.8, "") + '</g></svg>';
  return "";
}
function zkDecoBot(tp){ return tp === "ivory" ? zkBand("zkpt2") : ""; }
/* أذكار بصفحة ثابتة: كل الأذكار معاً بأكبر خط يتسع لها، وإن طالت القائمة تُقسم على صفحات متساوية المدة */
function zkPage(now, ph, plan, m, key, el0){
  if (/^b(gold|ivory|gray)$/.test(plan.tpl || "")) { // لوحة أذكار جاهزة بملء الشاشة: العمودية أو الأفقية حسب الشاشة
    var bc = plan.tpl.slice(1), bsrc = "zk/after-" + bc + "-" + (layout === "P" ? "P" : "L") + ".jpg", bk = key + "|brd|" + bsrc;
    if (ovKey !== bk) { ovKey = bk; ovEl.className = "on zk zkimg zkbrd"; ovEl.innerHTML = '<div class="zkbw" style="background:' + (bc === "ivory" ? "#f6f1ec" : "#000") + '"><img class="zkim" alt="" src="' + bsrc + '"></div>'; }
    return; }
  var title = t(m === "zk-after" ? "zk_after_title" : m === "zk-morning" ? "zk_morning_title" : "zk_evening_title");
  var tp = ZK_TPLS.indexOf(plan.tpl) > 1 ? plan.tpl : "page", full = tp !== "page", img = full ? "" : (S.zk || {})[m.slice(3) + "Img"], cls = "on zk zkpage" + (full ? " zkfull" + (tp !== "full" ? " zkt-" + tp : "") : "");
  if (img) { // لوحة أذكار جاهزة (صورة) بملء الشاشة طوال المدة
    var ki = key + "|img|" + img; if (ovKey !== ki) { ovKey = ki; ovEl.className = "on zk zkimg"; ovEl.innerHTML = '<img class="zkim" alt="">';
      var im = $(".zkim", ovEl); mediaURL(img).then(function(u){ if (u && im) im.src = u; }); }
    return; }
  var rs = layout === "P" ? 86 : 72, cn = ["tl","tr","bl","br"].map(function(k){ return '<i class="zkc ' + k + '">' + rosette(rs) + '</i>'; }).join("");
  var head = '<div class="zkh"><div class="zkdome"><svg viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 120 C60 120 92 104 112 78 C132 52 150 40 172 30 C186 23 194 14 200 0 C206 14 214 23 228 30 C250 40 268 52 288 78 C308 104 340 120 400 120 Z"/></svg>' +
    '<div class="zkb">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div></div><div class="o-title">' + esc(title) + '</div><div class="zkorn">' + star8(0, 0, 0, 0, "") .slice(0, 0) + '<span></span>۞<span></span></div></div>';
  var Zf = S.zk || {}, fu = tp === "full" && Zf.fullBgImg ? specImg(Zf.fullBgImg) : "", fd = Math.max(0, Math.min(.9, Zf.fullDim == null ? .45 : +Zf.fullDim || 0));
  var fbg = tp === "full" && Zf.fullBgImg && !fu ? "#000" : esc(Zf.fullBg || "#0b1a5c"); // صورة من الجهاز لم تُحمّل بعد: أسود مؤقتاً بدل وميض اللون
  var fsty = fu ? 'background:linear-gradient(rgba(0,0,0,' + fd + '),rgba(0,0,0,' + fd + ')),url(&quot;' + esc(fu) + '&quot;) center/cover no-repeat,#000' : tp === "full" ? 'background-color:' + fbg : "";
  var shell = full ? function(fs, items, pg){ return '<div class="zkfw' + (fu ? " zkfimg" : "") + '"' + (fsty ? ' style="' + fsty + '"' : "") + '><i class="zkfr"></i>' + zkDeco(tp) + '<div class="zkfh">' + zkDecoTop(tp) + '<div class="zkb">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div><div class="o-title">' + esc(title) + '</div>' +
      '<div class="zkorn"><span></span><b>◆</b><span></span></div></div><div class="zkp"' + (fs ? ' style="font-size:' + fs + 'px"' : "") + '>' + items + '</div><div class="zkf"><span class="o-page">' + (pg || "") + '</span></div>' + zkDecoBot(tp) + '</div>'; } :
    function(fs, items, pg){ return '<div class="zkcard"><div class="zkpat"></div>' + cn + head + '<div class="zkp"' + (fs ? ' style="font-size:' + fs + 'px"' : "") + '>' + items + '</div>' +
    '<div class="zkf"><span class="o-page">' + (pg || "") + '</span></div></div>'; };
  if (!plan.pages || plan.lay !== layout) { // تقسيم الصفحات بالقياس الفعلي على الشاشة
    ovEl.className = cls; ovEl.innerHTML = shell(0, "", "");
    var box = $(".zkp", ovEl), L = plan.list, MIN = layout === "P" ? 34 : 30, MAX = full ? (layout === "P" ? 110 : 90) : (layout === "P" ? 80 : 64);
    var fits = function(items, fs){ box.style.fontSize = fs + "px"; box.innerHTML = items.map(zkItem).join(""); return box.scrollHeight <= box.clientHeight + 2 && box.scrollWidth <= box.clientWidth + 2; };
    var pages = null; // القائمة الطويلة (مثل أذكار الصباح والمساء) تُقسم على صفحات بخط مقروء، والقصيرة في صفحة واحدة
    for (var k = 1; k <= L.length && !pages; k++) { // أقل عدد صفحات يتسع فيه كل جزء بخط مقروء
      var tot = L.reduce(function(a, x){ return a + x.length; }, 0), per = tot / k, ch = [], cur = [], acc = 0;
      L.forEach(function(x){ if (cur.length && acc + x.length / 2 > per * (ch.length + 1) && ch.length < k - 1) { ch.push(cur); cur = []; } cur.push(x); acc += x.length; }); ch.push(cur);
      if (ch.every(function(c){ return fits(c, MIN); })) pages = ch;
    }
    pages = pages || L.map(function(x){ return [x]; });
    plan.pages = pages.map(function(c){ var lo = MIN, hi = MAX; while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (fits(c, mid)) lo = mid; else hi = mid; } return {items:c, fs:lo}; });
    plan.lay = layout; ovKey = "";
    if (document.fonts && document.fonts.status !== "loaded" && !plan.fw) { plan.fw = true; // القياس قبل تحميل خط الأذكار يعطي حجماً أكبر من اللازم: إعادة القياس بعد تحميله
      document.fonts.ready.then(function(){ plan.pages = null; plan.fw = false; ovKey = ""; }); }
  }
  var np = plan.pages.length, pi = Math.min(np - 1, Math.floor(el0 / (plan.total / np)));
  var k2 = key + "|p" + pi + "|" + ph.zkStart + (full ? "|" + fu + "|" + fd + "|" + fbg : "");
  if (ovKey !== k2) { ovKey = k2; var pg = plan.pages[pi];
    ovEl.className = cls;
    ovEl.innerHTML = shell(pg.fs, pg.items.map(zkItem).join(""), np > 1 ? num(pi + 1) + " / " + num(np) : "");
    var bx = $(".zkp", ovEl); // ضمان ظهور الأذكار كاملة: تصغير الخط إن تجاوز النص المساحة
    while (bx && pg.fs > 12 && (bx.scrollHeight > bx.clientHeight + 2 || bx.scrollWidth > bx.clientWidth + 2)) { pg.fs--; bx.style.fontSize = pg.fs + "px"; } }
  digits($(".o-clock", ovEl), fmtT(now, false, 1));
}
/* رمز «أغلق الجوال» مرسوم (لا يعتمد على تحميل صورة): جوال أبيض داخل دائرة حمراء بخط مائل، واضح من بعيد */
var NOPHONE = '<svg class="o-ico" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fff"/><rect x="34" y="18" width="32" height="64" rx="7" fill="#1d1d1f"/><rect x="38" y="25" width="24" height="44" rx="2" fill="#9fd3ff"/><circle cx="50" cy="75" r="3.2" fill="#fff"/>' +
  '<circle cx="50" cy="50" r="42" fill="none" stroke="#e0201c" stroke-width="9"/><path d="M21 21 79 79" stroke="#e0201c" stroke-width="9" stroke-linecap="round"/></svg>';
function overlay(now, ph){
  overlayInner(now, ph);
  // رسالة إغلاق الجوال الطويلة: تنقسم على سطرين متوازنين، ويصغر الخط إن لزم حتى تظهر كاملة داخل الشاشة
  var om = ovEl.querySelector(".o-msg .o-mt");
  if (om && !om.dataset.fit) { om.dataset.fit = "1"; var box = om.parentNode; box.style.fontSize = "";
    var fs = parseFloat(getComputedStyle(box).fontSize) || 60, lh = fs * 1.3, n = 0;
    while (n++ < 30 && fs > 26 && (om.offsetHeight > lh * 2.4 || box.scrollWidth > box.clientWidth + 2 || box.offsetWidth > ovEl.clientWidth * 0.98)) { fs -= 3; lh = fs * 1.3; box.style.fontSize = fs + "px"; } }
  // إضاءة خافتة للشاشة السوداء حتى لا يزعج الضوء المصلين
  if (ph.mode === "black") {
    var sty = blackBg(ph), lv = sty.lv; sty = sty.css;
    if (ovEl.dataset.bl !== sty) { ovEl.dataset.bl = sty; ovEl.style.background = sty; ovEl.style.setProperty("--blk", String(.16 + lv));
      // لون نصوص شاشة الإخفاء معتم (رمادي) بدل الشفاف: الشفافية تُظهر تداخل حروف الخط العربي كتشوهات
      var bv = Math.round(255 * Math.min(.82, .36 + lv)), dv = Math.round(bv * .86);
      ovEl.style.setProperty("--blkc", "rgb(" + bv + "," + bv + "," + bv + ")"); ovEl.style.setProperty("--blkd", "rgb(" + dv + "," + dv + "," + dv + ")"); }
    ovEl.style.setProperty("--blks", String(Math.max(.5, Math.min(2.2, +S.blackSize || 1))));
  } else if (ovEl.dataset.bl) { ovEl.dataset.bl = ""; ovEl.style.background = ""; }
  // الساعة كاملة أعلى الشاشات الكاملة
  if (!ph.mode || ph.mode === "black") return;
  var tc = $(".o-top", ovEl);
  if (!tc) { tc = document.createElement("div"); tc.className = "o-top"; tc.innerHTML = '<span class="o-tt"></span><i class="o-tap"></i>'; ovEl.insertBefore(tc, ovEl.firstChild); }
  // ساعة أعلى شاشات الأذان والإقامة والأذكار: إظهارها وحجمها والثواني من «خيارات العرض»
  tc.style.display = S.look.ovClock === false || (S.look.ovClkWait !== true && /\bwait\b/.test(ovEl.className)) ? "none" : ""; // في انتظار الإقامة تظهر فوق العداد مباشرة (ويمكن إخفاؤها) ovEl.style.setProperty("--ovclk", String(Math.max(.5, Math.min(2, +S.look.ovClkSize || 1))));
  digits($(".o-tt", tc), fmtT(now, S.look.ovSec !== false, 1)); $(".o-tap", tc).textContent = ampm(now);
}
function overlayInner(now, ph){
  var m = ph.mode, p = ph.p, z = zp(now);
  stage.classList.toggle("ovon", !!m);
  if (!m) { if (ovEl.className) { ovEl.className = ""; ovEl.innerHTML = ""; ovKey = ""; } return; }
  var dateLine = '<div class="o-date">' + esc(dayName(z.Y, z.M, z.D)) + " · " + esc(hijriText(z.Y, z.M, z.D)) + '</div>';
  var ver = S.look.hideVersion ? "" : '<div class="o-ver">' + footHTML() + '</div>';
  var key = m + p.k + p.A, h = "";
  if (m === "black") {
    var smsg = ph.sleep ? sleepMsg(ph) : "";
    key += (ph.sleep ? "S" + (ph.sleepKind || "") : "") + "|" + smsg;
    if (ovKey !== key) { ovKey = key; ovEl.className = "on black";
      var sl = ph.sleep ? (S.sleepLook || "black") : "";
      ovEl.innerHTML = (sl === "black" ? "" : sl === "clock" ? '<div class="o-clock sleepclk"></div>' :
        (S.blackTime ? '<div class="o-clock"></div>' : "") + (S.blackDate ? '<div class="o-date"></div>' : "") +
        (ph.sleep || S.blackMsg === false ? "" : '<div class="o-sub">' + esc(t("prayer_is_currently_being_performed")) + '</div>') + (ph.sleep || S.blackMsg === false ? "" : ver)) +
        (smsg ? '<div class="o-sleepmsg">' + esc(smsg).replace(/\n/g, "<br>") + '</div>' : ""); }
    var c = $(".o-clock", ovEl); if (c) { digits(c, fmtT(now, S.look.seconds, 1)); if (c.scrollWidth > c.clientWidth + 1 || c.style.fontSize) fitText(c, .4); }
    var d = $(".o-date", ovEl); if (d) { var dt = dayName(z.Y, z.M, z.D) + " · " + hijriText(z.Y, z.M, z.D); if (d.textContent !== dt) d.textContent = dt; if (d.scrollWidth > d.clientWidth + 1) fitText(d, .5); }
    return;
  }
  if (m.indexOf("zk-") === 0) {
    var plan = ph.zkPlan, el0 = now - ph.zkStart, j = 0, acc = 0;
    if (!plan || !plan.seq.length) return;
    if (plan.page) { zkPage(now, ph, plan, m, key, el0); return; }
    while (j < plan.seq.length - 1 && el0 >= acc + plan.seq[j].ms) { acc += plan.seq[j].ms; j++; }
    var item = plan.seq[j];
    key += "|" + j + "|" + ph.zkStart;
    if (ovKey !== key) { ovKey = key;
      var title = t(m === "zk-after" ? "zk_after_title" : m === "zk-morning" ? "zk_morning_title" : "zk_evening_title");
      ovEl.className = "on zk";
      ovEl.innerHTML = '<div class="o-title">' + esc(title) + '</div><div class="o-zk" style="font-size:' + zkSize(item.t) + 'px">' + esc(item.t) + '</div>' +
        '<div class="o-page">' + num(j + 1) + " / " + num(plan.seq.length) + '</div><div class="o-clock sm"></div>';
    }
    digits($(".o-clock", ovEl), fmtT(now, false, 1));
    return;
  }
  if (m === "azan") {
    if (ovKey !== key) { ovKey = key; ovEl.className = "on azan";
      var an = annHTML("azan", p);
      ovEl.innerHTML = (an || '<div class="o-sub">' + esc(t("adhan_")) + '</div><div class="o-big">' + esc(p.name) + '</div>') + '<div class="o-clock"></div>' + dateLine; }
    digits($(".o-clock", ovEl), fmtT(now, S.look.seconds, 1));
    return;
  }
  if (m === "dua") {
    if (ovKey !== key) { ovKey = key; ovEl.className = "on zk";
      ovEl.innerHTML = '<div class="o-title">' + esc(t("dua_after_azan_title")) + '</div><div class="o-zk" style="font-size:' + zkSize(S.texts.dua || window.DUA_AFTER_AZAN) + 'px">' + esc(S.texts.dua || window.DUA_AFTER_AZAN) + '</div>' +
        '<div class="o-sub sm">' + esc(t("remaining_for_iqamaa")) + '</div><div class="o-cnt duacnt"></div>'; }
    digits($(".o-cnt", ovEl), dur(Math.floor((p.I - now)/1000)));
    return;
  }
  if (m === "khutbah") {
    if (ovKey !== key) { ovKey = key; ovEl.className = "on khutbah"; var hh = hijri(z.Y, z.M, z.D);
      ovEl.innerHTML = '<div class="o-big md">' + esc(t("friday_khutbah_screen_title")) + '</div>' +
        (S.fri.showHijri ? '<div class="o-sub">' + esc(dayName(z.Y, z.M, z.D) + " " + num(hh.day) + " " + hh.monthName + " " + t("friday_khutbah_for_year") + " " + num(hh.year) + " " + t("hijri_year_suffix")) + '</div>' : "") +
        (S.fri.showGreg ? '<div class="o-date">' + esc(t("friday_khutbah_corresponding_to") + " " + gregText(z.Y, z.M, z.D)) + '</div>' : "") +
        '<img class="o-np" src="img/nophone.png" alt=""><div class="o-msg">' + esc(t("friday_khutbah_phone_request")) + '</div><div class="o-clock sm"></div>' + ver; }
    digits($(".o-clock", ovEl), fmtT(now, false, 1));
    return;
  }
  if (m === "iqcount") {
    // شاشة الانتظار بين الأذان والإقامة: عداد دائري يتناقص مع الوقت
    var waitStart = Math.min(p.I - 1000, p.A + ((S.azanScreen ? +S.azanDur : 0) + (S.duaAfterAzan ? 1 : 0))*60000);
    var left = Math.max(0, Math.ceil((p.I - now)/1000)), tot = Math.max(1, (p.I - waitStart)/1000), frac = Math.max(0, Math.min(1, left/tot));
    var lastMin = left <= 60, hadith = S.hadithOn && left <= S.hadithSec;
    var wt = !!S.iqTimes, lb = lastMin && !!S.lastMinBlack;
    key += (S.ringStyle || "") + (lastMin ? "L" : "") + (hadith ? "H" : "") + (wt ? "T" : "") + (lb ? "B" : "");
    if (lb) { // آخر دقيقة: عداد كبير على شاشة سوداء
      if (ovKey !== key) { ovKey = key; ovEl.className = "on iq lastblk";
        ovEl.innerHTML = '<div class="o-sub">' + esc(t("remaining_for_iqamaa")) + '</div><div class="o-cnt huge"></div>' +
          (S.notifyOn ? '<div class="o-msg">' + NOPHONE + '<span class="o-mt">' + esc(S.notifyMsg) + '</span></div>' : ""); }
      var cb = $(".o-cnt", ovEl); digits(cb, dur(left)); tcls(cb, "red", S.red90 && left <= 90);
      return;
    }
    if (ovKey !== key) { ovKey = key; ovEl.className = "on iq wait" + (wt ? " wt" : "");
      var ticks = ""; for (var q = 0; q < 60; q++) ticks += '<line x1="100" y1="' + (q % 5 ? 4 : 2) + '" x2="100" y2="' + (q % 5 ? 8 : 11) + '" transform="rotate(' + (q*6) + ' 100 100)"/>';
      // العنوان «الوقت المتبقي للإقامة» فوق العداد، وداخل الدائرة العداد فقط
      ovEl.innerHTML = '<div class="o-sub">' + esc(t("remaining_for_iqamaa")) + '</div>' +
        (S.circle !== false ? '<div class="ring' + (S.ringStyle === "plain" ? "" : " clk3") + '">' + (S.ringStyle === "plain" ? "" : clockFace()) + '<svg viewBox="0 0 200 200" aria-hidden="true"><g class="rt">' + ticks + '</g>' +
          '<circle cx="100" cy="100" r="88" class="r0"/><circle cx="100" cy="100" r="88" class="r1"/><g class="rdot"><circle cx="188" cy="100" r="6.5"/></g></svg>' +
          '<div class="rin"><div class="o-cnt"></div></div></div>'
          : '<div class="o-cnt big"></div>') +
        (wt ? waitTimesHTML(ph, p) : "") +
        (hadith ? '<div class="o-hadith">' + esc(S.hadithText) + '</div>' : "") +
        (S.notifyOn && (lastMin || S.notifyAll !== false) ? '<div class="o-msg">' + NOPHONE + '<span class="o-mt">' + esc(S.notifyMsg) + '</span></div>' : "") + '<div class="o-clock sm"></div>' + ver; }
    var cnt = $(".o-cnt", ovEl); digits(cnt, dur(left));
    var red = S.red90 && left <= 90; tcls(cnt, "red", red);
    var r1 = $(".r1", ovEl);
    if (r1) { // سمات SVG مباشرة بدل classList حتى تعمل الدائرة في المتصفحات والتلفزيونات القديمة
      var C = 2*Math.PI*88, off = (C*(1 - frac)).toFixed(2);
      r1.setAttribute("stroke-dasharray", C.toFixed(2)); r1.setAttribute("stroke-dashoffset", off); r1.style.strokeDasharray = C.toFixed(2); r1.style.strokeDashoffset = off; tcls(r1, "red", red);
      var dot = $(".rdot", ovEl); if (dot) { var rot = "rotate(" + (frac*360).toFixed(2) + " 100 100)"; dot.setAttribute("transform", rot); dot.style.transform = "rotate(" + (frac*360).toFixed(2) + "deg)"; tcls(dot, "red", red); } }
    digits($(".o-clock", ovEl), fmtT(now, false, 1));
    return;
  }
  if (m === "iqnow" || m === "praying") {
    if (ovKey !== key) { ovKey = key; ovEl.className = "on azan";
      var an2 = m === "iqnow" ? annHTML("iqama", p) : "";
      ovEl.innerHTML = (an2 || '<div class="o-sub">' + esc(t(m === "iqnow" ? "iqama_time_has_begun_now" : "prayer_is_currently_being_performed")) + '</div><div class="o-big">' + esc(p.name) + '</div>') +
        '<img class="o-np" src="img/nophone.png" alt=""><div class="o-clock sm"></div>' + ver; }
    digits($(".o-clock", ovEl), fmtT(now, false, 1));
  }
}
/* خلفية شاشة الإخفاء أثناء الصلاة وشاشة السكون (بعد العشاء وبعد الشروق):
   أسود، أو الخلفية الحالية معتمة، أو لون خافت، أو صورة مختارة (من خلفيات التطبيق أو من الجهاز أو رابط) بدرجة إضاءة */
var bgUrlCache = {};
function specImg(v){ // file:np01.svg | رابط | معرف صورة محفوظة في الجهاز
  v = String(v || ""); if (!v) return "";
  if (v.indexOf("file:") === 0) return "bg/" + v.slice(5);
  if (isUrl(v)) return v;
  if (bgUrlCache[v] !== undefined) return bgUrlCache[v];
  bgUrlCache[v] = ""; mediaURL(v).then(function(u){ bgUrlCache[v] = u || ""; if (ovEl) ovEl.dataset.bl = "~"; });
  return "";
}
function blackBg(ph){
  var sp;
  if (ph.sleep) { var o = (S.sleepBg || {})[ph.sleepKind === "sunrise" ? "sunrise" : "isha"] || {};
    if (!o.style || o.style === "black") return {css:"#000", lv:0};
    sp = o.style === "prayer" ? null : {style:o.style, color:o.color, light:o.light, img:o.img}; }
  if (!sp) sp = {style:S.blackStyle || "bg", color:S.blackColor, light:S.blackLight, img:S.blackImg};
  var lv = Math.max(0, Math.min(1, +sp.light || 0)), dim = "linear-gradient(rgba(0,0,0," + (1 - lv).toFixed(2) + "),rgba(0,0,0," + (1 - lv).toFixed(2) + ")), ";
  if (sp.style === "black") return {css:"#000", lv:0};
  if (sp.style === "color") return {css:mixHex("#000000", sp.color || "#3a2a12", Math.min(1, lv*2)), lv:lv};
  if (sp.style === "image") { var u = specImg(sp.img); return {css:u ? dim + 'url("' + u + '") center/cover no-repeat, #000' : "#000", lv:lv}; }
  var bi = stage.style.backgroundImage; return {css:lv && bi ? dim + bi + " center/cover no-repeat" : "#000", lv:lv};
}
/* رسالة شاشة السكون: نص تلقائي يوضح وقت الإخفاء والعودة، أو نص يكتبه المستخدم ({العودة} = وقت عودة الشاشة) */
function sleepMsg(ph){
  if (S.sleepMsgOn === false) return "";
  var k = ph.sleepKind === "sunrise" ? "sunrise" : "isha", custom = String((k === "sunrise" ? S.sleepMsgSunrise : S.sleepMsgIsha) || "").trim();
  var back = ph.wakeAt ? (fmtT(ph.wakeAt) + " " + ampm(ph.wakeAt)).replace(/\s+$/, "") : "";
  if (custom) return custom.replace(/\{العودة\}/g, back);
  return (k === "sunrise" ? "الإخفاء الحالي: ضحى، من بعد الشروق بـ " + num(S.hideSunrise) + " دقيقة حتى قبل الظهر بـ " + num(S.wakeDhuhr) + " دقيقة"
    : "الإخفاء الحالي: ليلاً، من بعد العشاء بـ " + num(S.hideIsha) + " دقيقة حتى قبل الفجر بـ " + num(S.wakeFajr) + " دقيقة") + (back ? "\nتعود الشاشة الساعة " + back : "");
}
/* تبديل صنف يعمل مع عناصر SVG في المتصفحات القديمة التي لا تدعم classList عليها */
function tcls(el, c, on){ if (!el) return; var cur = " " + (el.getAttribute("class") || "") + " ", has = cur.indexOf(" " + c + " ") >= 0;
  if (on && !has) el.setAttribute("class", (cur + c).replace(/^\s+|\s+$/g, "")); else if (!on && has) el.setAttribute("class", cur.replace(" " + c + " ", " ").replace(/^\s+|\s+$/g, "")); }
/* أوقات الصلوات (الأذان فقط بدون الإقامة) أسفل عداد انتظار الإقامة */
function waitTimesHTML(ph, p){
  var L0 = ((ph && ph.today && ph.today.list) || []).filter(function(x){ return x.k !== "sunrise"; });
  return '<div class="o-wt">' + L0.map(function(x){ var on = x.k === p.k || (p.k === "jumuah" && x.k === "dhuhr") || (x.k === "jumuah" && p.k === "dhuhr");
    return '<div class="wti' + (on ? " on" : "") + '"><b>' + esc(x.name) + '</b><span>' + fmtT(x.A) + '</span></div>'; }).join("") + '</div>';
}
/* رسالة الإعلان: «حان الآن موعد أذان صلاة الظهر، وذلك في مسجد الحي» مع إبراز اسم الصلاة واسم المسجد */
function annHTML(kind, p){
  var A0 = S.ann || {}; if (A0.on === false || locale() !== "ar") return "";
  var tpl = String(A0[kind] || "").trim(); if (!tpl) return "";
  var mq = String(S.mosque || "").trim(); if (mq && !/^(ال)?(مسجد|جامع|مصلى)/.test(mq)) mq = "مسجد " + mq;
  var pn = String(p.name || "").replace(/^صلاة\s+/, "");
  tpl = tpl.replace(/\{الصلاة\}\s*[،,]\s*/g, "{الصلاة} "); // اسم الصلاة يظهر في سطر مستقل، فلا تبدأ الجملة التالية بفاصلة
  return '<div class="o-ann">' + esc(tpl).replace(/\{الصلاة\}/g, '<b>' + esc(pn) + '</b>').replace(/\{المسجد\}/g, '<b class="mq">' + esc(mq) + '</b>').replace(/\n/g, "<br>") + '</div>';
}
/* سطر أسفل الشاشة: rawayie.sa 2.6.0 | الدمام
   اسم التطبيق ورقم الإصدار يظهران دائماً في كل الشاشات، ولا تخفيهما الإعدادات المرسلة من لوحة الإدارة.
   رقم الإصدار يُقرأ من version.js الذي تكتبه الإضافة من رقم إصدارها، فيتحدث وحده مع كل تحديث */
function footHTML(){
  var site = String(S.look.footSite == null ? "" : S.look.footSite).trim(); if (/^(https?:\/\/)?(www\.)?rawayie\.sa\/?$/i.test(site)) site = ""; // نص إضافي اختياري
  var loc = S.look.showLoc === false ? "" : [String(S.addr || "").trim(), cityInfo().name].filter(Boolean).join("، ");
  var L = S.look, head = (L.showSite === false ? "" : '<span class="fsite" dir="ltr">rawayie.sa </span>') + (L.footVer === false ? "" : '<span class="fver" dir="ltr">' + esc(VERSION) + '</span>');
  var parts = head ? [head] : [];
  if (site) parts.push('<span class="fsite" dir="ltr">' + esc(site) + '</span>'); if (loc) parts.push('<span class="floc">' + esc(loc) + '</span>');
  return parts.join('<span class="fsep' + (L.netStar ? ' net' : '') + '">|</span>'); // لون الاتصال فقط عند تفعيل التحقق من الاتصال
}
function versionText(){ return t("copy_right_for_sadja") + " · " + (window.RawayieAndroid ? "نسخة أندرويد " : "نسخة الويب ") + VERSION; }

/* ===== ملاءمة النصوص الطويلة =====
   اسم المسجد والتاريخ يبقيان في سطر واحد ويصغران تلقائياً إذا كانا أطول من المساحة، فلا يتكسّران ولا يدفعان الجدول */
function fitText(el, min){
  if (!el) return;
  el.style.fontSize = ""; el.style.whiteSpace = "nowrap";
  var avail = el.clientWidth, need = el.scrollWidth; min = min || .5;
  if (!avail || need <= avail + 1) return;
  var k = Math.max(min, avail/need*.97), fs = parseFloat(getComputedStyle(el).fontSize) || 0;
  if (fs) el.style.fontSize = (fs*k).toFixed(1) + "px";
  if (k === min && el.scrollWidth > el.clientWidth + 1) el.style.whiteSpace = "normal"; // طويل جداً: سطران بخط أصغر
}
function fitAll(){ fitRows(); fitText(ui.mname, .5); fitText(ui.dayn, .6); fitText(ui.hij, .6); if (ui.dbg) { fitText($(".dbm", ui.dbg), .6); fitText($(".dbm", ui.dbh), .6); } }
/* شارات التاريخ: رقم اليوم داخل شارة، ثم الشهر، ثم السنة. الهجري من جدول أم القرى مع تعديل المشرف */
var EN_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function fillBadges(z){
  if (!ui.dbg) return;
  var h = hijri(z.Y, z.M, z.D), dow = new Date(Date.UTC(z.Y, z.M, z.D, 12)).getUTCDay(), ar = locale() === "ar";
  var set = function(box, d, m, y){ $(".dbn", box).textContent = num(d); $(".dbm", box).textContent = m; $(".dby", box).textContent = num(y) + (ar ? "" : " ") + y2; };
  var y2 = t("gregorian_year_suffix"); set(ui.dbg, z.D, names().g[z.M], z.Y);
  y2 = t("hijri_year_suffix"); set(ui.dbh, h.day, h.monthName, h.year);
  if (ui.dayn) ui.dayn.classList.toggle("fri", dow === 5); // الجمعة بخلفية مميزة
  if (ui.dbe) { ui.dbe.textContent = EN_DAYS[dow]; ui.dbe.classList.toggle("off", S.look.dayEn === false || locale() === "en"); } // يبقى مكانه محجوزاً فلا تختل المحاذاة
  // شارة صغيرة في رمضان (الأيام البيض تظهر في التذكيرات فلا تتكرر هنا)
  var lbl = ar && S.look.dateTag !== false && h.month === 9 ? "رمضان" : "";
  if (ui.dbt) { ui.dbt.textContent = lbl; ui.dbt.hidden = !lbl; }
}

/* ===== تبديل التاريخ بين الهجري والميلادي في مكانه ===== */
var dateTexts = [], dateIdx = 0, dateNext = 0;
function switchDate(){
  if (!ui.hij || dateTexts.length < 2) return;
  var el = ui.hij; el.classList.add("dout");
  setTimeout(function(){ dateIdx = 1 - dateIdx; el.textContent = dateTexts[dateIdx]; fitText(el, .6); el.classList.remove("dout"); }, 450);
}
/* ===== الدقة الواحدة ===== */
var timer = null, previewKind = "", previewSleep = false, previewBlackUntil = 0, previewAnnUntil = 0, previewAnnMode = "";
/* كل جزء من التحديث يعمل مستقلاً: لو تعطل جزء في متصفح قديم، تستمر الساعة وشاشات الأذان والإقامة */
var lastErr = "";
function safe(name, fn){ try { fn(); } catch(e){ lastErr = name + ": " + (e && e.message || e); try { console.error(name, e); } catch(x){} } }
/* إطفاء الشاشة فعلياً وقت الصلاة (تطبيق أندرويد): مرة واحدة لكل فترة إخفاء، وتعود قبل نهايتها بـ 15 ثانية */
var offKey = "";
function offCheck(now, ph){
  var AN = window.RawayieAndroid; if (!AN || !AN.screenOff || window.RAWAYIE_PREVIEW || now < previewBlackUntil) return;
  if (ph.mode !== "black") { offKey = ""; return; }
  if (!(ph.sleep ? S.offSleep : S.offPrayer)) return;
  var end = ph.sleep ? ph.wakeAt : ph.p.I + ph.p.pd*60000, key = (ph.sleep ? "S" : "P") + end;
  if (!end || offKey === key) return; offKey = key; // إن شغّلها أحد بالريموت لا تُطفأ مرة أخرى في نفس الفترة
  if (end - now < 60000) return;
  var off = window.RWS_CLOCK ? window.RWS_CLOCK.state().off : 0; // المنبّه بساعة الجهاز نفسها
  try { AN.screenOff(Math.round(end - off - 15000)); } catch(e){}
}
function tick(force){
  var now = Date.now(), z = zp(now), ph = phase(now);
  if (z.s < 2 || secBuilt === null) { var sb = isSecond(); if (secBuilt !== null && sb !== secBuilt) { secBuilt = sb; rebuild(); return; } secBuilt = sb; } // بداية أو نهاية مدة شاشة الإعلانات
  safe("off", function(){ offCheck(now, ph); });
  safe("rotg", rotGuard);
  safe("wxdn", wxDayNight);
  if (stage.classList.contains("spon") && !document.getElementById("splash")) stage.classList.remove("spon"); // احتياط
  if (now - fitRowsAt > 5000) { fitRowsAt = now; safe("fitrows", fitRows); }
  var dk = z.Y + "-" + z.M + "-" + z.D;
  if (dk !== lastDay) safe("date", function(){
    lastDay = dk;
    if (ui.dayn) ui.dayn.textContent = dayName(z.Y, z.M, z.D);
    if (ui.hij) { var hh0 = hijri(z.Y, z.M, z.D); dateTexts = [num(hh0.day) + " " + hh0.monthName + " " + num(hh0.year) + " " + t("hijri_year_suffix"), gregText(z.Y, z.M, z.D)];
      dateIdx = S.dateMode === "greg" ? 1 : 0; dateNext = Date.now() + (+S.dateSec)*1000; ui.hij.textContent = dateTexts[dateIdx]; }
    fillBadges(z);
    fitAll();
    if (ui.gre) ui.gre.textContent = num(z.Y + "/" + (z.M + 1) + "/" + z.D);
    if (ui.bdate) ui.bdate.textContent = dayName(z.Y, z.M, z.D) + " · " + hijriText(z.Y, z.M, z.D);
    if (ui.foot) ui.foot.innerHTML = footHTML() +
      (ph.today.src === "astro" && !S.custom.on ? ' · <span class="warn">حساب فلكي</span>' : "");
  });
  // الشاشات الأهم أولاً: الأذان والانتظار والإقامة
  if (now < previewBlackUntil) { ph.mode = "black"; ph.sleep = previewSleep;
    if (previewSleep && (!ph.sleepKind || previewKind)) { var pk = previewKind || (!S.sleepIsha && S.sleepSunrise ? "sunrise" : "isha"), pw = pk === "sunrise" ? byK(ph.today, "dhuhr").A - (+S.wakeDhuhr || 0)*60000 : byK(ph.tom, "fajr").A - (+S.wakeFajr || 0)*60000;
      ph.sleepKind = pk; ph.wakeAt = pw; } }
  if (now < previewAnnUntil && (ph.next || ph.cur)) { ph.mode = previewAnnMode; ph.p = ph.next || ph.cur; ph.sleep = false; }
  safe("overlay", function(){ overlay(now, ph); });
  safe("events", function(){ events(now, ph); });
  safe("clock", function(){ if (ui.tm) {
    if (ui.ss) { digits(ui.tm, fmtT(now, !!S.look.fullClock, 1)); digits(ui.ss, S.look.seconds && !S.look.fullClock ? num(two(z.s)) : ""); }
    else digits(ui.tm, fmtT(now, S.look.seconds, 1));
    var apt = ampm(now); for (var ai = 0; ai < ui.aps.length; ai++) if (ui.aps[ai].textContent !== apt) ui.aps[ai].textContent = apt;
  } });
  safe("count", function(){ if (ui.cv) {
    var lbl, target;
    if (ph.inIqama) { lbl = t("remaining_to_iqama"); target = ph.cur.I; }
    else { lbl = leftFor(ph.next.name); target = ph.next.A; }
    var sec = Math.floor((target - now)/1000);
    ui.cl.textContent = lbl; var cvT = dur(sec, S.look.nextSec || ph.inIqama); digits(ui.cv, cvT);
    // المتبقي يظهر كاملاً دائماً: يُصغَّر تلقائياً إذا لم يتسع له مكانه بجانب الشعار
    var fitK = cvT.length + "|" + lbl + "|" + ui.cnt.clientWidth;
    if (ui.cv._fit !== fitK) { ui.cv._fit = fitK; ui.cv.style.transform = ""; var cw = ui.cnt.clientWidth, vw = ui.cv.scrollWidth;
      if (cw && vw > cw) ui.cv.style.transform = "scale(" + (cw / vw).toFixed(3) + ")"; }
    ui.cnt.classList.toggle("red", S.red90 && sec <= 90);
  } });
  safe("iqclk", function(){ if (!ui.iqclk) return;
    var q = ph.inIqama ? ph.cur : ph.next, tx = "";
    if (q && q.k !== "eid" && q.I > q.A) tx = esc(t("iqama") + " " + q.name) + '<span class="iqt">' + fmtT(q.I) + '</span>' + esc(ampm(q.I));
    if (ui.iqclk._t !== tx) { ui.iqclk._t = tx; ui.iqclk.innerHTML = tx; }
  });
  safe("net", function(){ var R0 = window.REMOTE, rf = !!(R0 && S.remote && S.remote.on && R0.state && R0.state.status === "fail");
    Array.prototype.forEach.call(mainEl.querySelectorAll(".net"), function(n){ n.classList.toggle("off", navigator.onLine === false || rf); n.title = rf ? "تعذر الاتصال بلوحة المدير" : ""; }); });
  if (ui.hij && S.dateMode === "alt" && dateTexts.length && now >= dateNext) safe("switchDate", function(){ dateNext = now + (+S.dateSec)*1000; switchDate(); });
  safe("bg", function(){ autoBg(now, ph); });
  if (verReload && !ph.mode && !ph.inIqama && !ph.inPrayer && !(ph.next && ph.next.A - now < 3*60000) && !document.body.classList.contains("setopen")) { /* ولا بين الأذان ونهاية الصلاة في وضع «الشاشة الرئيسية دائماً»، ولا قبل الأذان بـ 3 دقائق */ var vr = verReload; verReload = ""; // إعادة التحميل خارج أوقات الصلاة
    try { sessionStorage.setItem("rws-ver-reload", vr); } catch(e){} setTimeout(function(){ location.reload(); }, 300); }
  safe("times", function(){ renderTimes(ph); });
  safe("night", function(){ renderNight(ph, now); });
  safe("ticker", function(){ renderTicker(); });
  safe("ayat", function(){ renderAyat(now); });
  safe("slides", function(){ slides(now); });
  safe("boards", function(){ boards(now); });
  safe("second", function(){ secondScreen(now); });
  safe("alerts", function(){ alerts(now, ph); });
  if (S.weather.on && now - wxAt > 30*60000) safe("weather", fetchWeather);
}

/* ===== التشغيل ===== */
/* التحديث التلقائي لرقم الإصدار: كل 10 دقائق تقرأ الشاشة version.js من الموقع (بدون كاش).
   إذا تغيّر الرقم فهذا تحديث جديد للإضافة: يظهر الرقم الجديد أسفل الشاشة فوراً، وتُعاد تهيئة الشاشة
   لتحميل الملفات الجديدة (ليس أثناء الأذان أو الإقامة أو الصلاة)، مرة واحدة فقط لكل إصدار */
var verReload = "";
function checkVersion(){
  if (navigator.onLine === false || !window.fetch) return;
  fetch("version.js?t=" + Date.now(), {cache:"no-store"}).then(function(r){ return r.ok ? r.text() : ""; }).then(function(tx){
    var m = /RWS_VERSION\s*=\s*"([^"]+)"/.exec(tx || ""); if (!m || m[1] === VERSION) return;
    VERSION = m[1]; window.RWS_VERSION = m[1]; if (window.APP) window.APP.VERSION = m[1]; lastDay = ""; ovKey = ""; // يظهر الرقم الجديد فوراً
    var done = ""; try { done = sessionStorage.getItem("rws-ver-reload") || ""; } catch(e){}
    if (done === m[1]) return; verReload = m[1];
  }).catch(function(){});
}
function start(){
  stage = $("#stage"); ovEl = $("#ov"); mainEl = $("#main");
  addEventListener("resize", fit);
  loadCustomLogo();
  // الضغط على اسم صلاة الفجر: الخلفية التالية، والضغط على وقت الفجر (الأذان أو الإقامة): الخلفية السابقة
  mainEl.addEventListener("click", function(e){
    // طريقة تغيير الخلفية: «عند كل صلاة» بالضغط على أي صلاة، و«كل يوم» بالضغط على اسم اليوم
    var bm = S.look.bgMode || "manual", rw = e.target.closest("[data-k]"), bOK = S.sup.fajrBg !== false && !slideState.show;
    if (bOK && bm === "prayer" && rw && rw.getAttribute("data-k") !== "fajr") { if (bgTapOK()) nextBg(!!S.look.bgShuffle, false); }
    else if (bOK && (bm === "day" || bm === "dayPick") && e.target.closest(".dayn")) { if (bgTapOK()) nextBg(bm === "dayPick" || !!S.look.bgShuffle, false, false, bm === "dayPick"); return; }
    if (slideTap(e)) return; if (e.target.closest('[data-k="fajr"]')) { if (S.sup.fajrBg !== false && bgTapOK()) nextBg(false, false, !!e.target.closest(".c2,.c3,.a,.i")); }
    else if (e.target.closest(".hij") && S.dateMode !== "both") { dateNext = Date.now() + (+S.dateSec)*1000; switchDate(); } });
  var fsl = $("#fslide"); if (fsl) fsl.addEventListener("click", slideTap);
  ovEl.addEventListener("click", function(){ if (zkPrev) { zkPreview(null); } }); // لمسة تنهي معاينة الأذكار
  var mb = $("#menu"); if (mb) mb.addEventListener("click", function(e){ e.stopPropagation(); if (window.SETTINGS) window.SETTINGS.open(); });
  fit();
  loadCity(uqCityId(), function(){ dayCache = {}; lastRowKey = ""; lastDay = ""; tick(true); });
  clearInterval(timer); timer = setInterval(tick, 1000);
  ["click", "keydown", "touchstart"].forEach(function(e){ addEventListener(e, unlock, {once:false, passive:true}); });
  wake(); document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "visible") wake(); });
  addEventListener("online", function(){ lastDay = ""; }); addEventListener("offline", function(){ lastDay = ""; });
  checkVersion(); setInterval(checkVersion, 10*60000);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ tickerKey = ""; fitAll(); });
  addEventListener("resize", function(){ setTimeout(fitAll, 100); });
  splash();
  // تطبيق أندرويد: بعد رسم أول إطار تُخفى شاشة البداية الأصلية
  var rq = window.requestAnimationFrame || function(f){ setTimeout(f, 16); };
  rq(function(){ rq(function(){ try { if (window.RawayieAndroid && RawayieAndroid.ready) RawayieAndroid.ready(); } catch(e){} }); });
}
/* ===== رسالة بداية التشغيل: البسملة والشعار واسم المسجد ===== */
function splash(preview){
  var sp = S.splash || {}; if (!preview && (sp.on === false || window.RAWAYIE_PREVIEW)) return;
  var old = document.getElementById("splash"); if (old && old.parentNode) old.parentNode.removeChild(old);
  var el = document.createElement("div"); el.id = "splash"; el.className = "splash " + orient();
  var sub = String(sp.sub || "").trim(), loc = [String(S.addr || "").trim(), cityInfo().name].filter(Boolean).join("، ");
  el.innerHTML = '<div class="sp-in"><div class="sp-bs">' + esc(String(sp.text || "").trim() || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ") + '</div>' +
    '<div class="sp-lg"></div>' + (sp.name !== false ? '<div class="sp-nm">' + esc(S.mosque || "") + '</div>' : "") +
    (sub ? '<div class="sp-sub">' + esc(sub).replace(/\n/g, "<br>") + '</div>' : (sp.name !== false && loc ? '<div class="sp-loc">' + esc(loc) + '</div>' : "")) + '</div>';
  var bs0 = el.querySelector(".sp-bs"), L0 = bs0 ? bs0.textContent.length : 0; // آية طويلة: يصغر الخط حسب طولها لتظهر في سطرين أو ثلاثة
  if (bs0 && L0 > 34) bs0.style.fontSize = Math.round((orient() === "P" ? 96 : 80) * Math.max(.5, Math.sqrt(34 / L0) * 1.15)) + "px";
  stage.appendChild(el); stage.classList.add("spon"); // الشاشة خلف البداية مخفية: لا تظهر الساعة أو الشريط فوق شاشة البداية
  var fillLogo = function(n){ var lg = el.querySelector(".sp-lg"); if (!lg) return; var h = logoHTML("splogo");
    if (!h && S.look.logoId && n < 8) { setTimeout(function(){ fillLogo(n + 1); }, 300); return; }
    lg.innerHTML = h || '<img class="splogo" src="img/mark.png" alt="">'; };
  fillLogo(0);
  el.addEventListener("click", function(){ hide(); });
  var gone = false, hide = function(){ if (gone) return; gone = true; el.classList.add("out"); stage.classList.remove("spon"); setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 1100); };
  setTimeout(hide, Math.min(60, Math.max(2, +sp.sec || 6))*1000);
}
function wake(){ try { if (navigator.wakeLock) navigator.wakeLock.request("screen").catch(function(){}); } catch(e){} }
function rebuild(){ zkPlans = {}; loadCustomLogo(); dayCache = {}; layout = ""; loadCity(uqCityId(), function(){ dayCache = {}; lastRowKey = ""; lastDay = ""; }); fit(); }

window.APP = {S:S, DEF:DEF, bgList:bgList, nextBg:function(){ nextBg(false, true); }, applyLook:function(){ applyLook(); }, zkList:zkListOf, lastErr:function(){ return lastErr || window.__lastErr || ""; }, splash:splash, inSched:inSched, save:save, rebuild:rebuild, IDB:IDB, mediaURL:mediaURL, uid:uid, t:t, num:num, two:two,
  wxInfo:function(){ return {status:wxStatus, wx:wx}; }, refreshWeather:function(){ wxAt = 0; fetchWeather(); },
  previewBlack:function(ms, sleep, kind){ previewSleep = !!sleep; previewKind = kind || ""; previewBlackUntil = Date.now() + ms; if (ovEl) { ovKey = ""; ovEl.dataset.bl = "~"; } },
  previewAnn:function(mode){ previewAnnMode = mode; previewAnnUntil = Date.now() + 8000; },
  orient:function(){ return orient(); }, zkPreview:zkPreview, scrMsg:function(t){ scrMsg(t); },
  mySlot:mySlot, isSecond:isSecond, dualOn:dualOn, dayTimes:dayTimes, renderSlide:renderSlide, SLIDE_DEF:SLIDE_DEF, zp:zp, zms:zms, dkey:dkey, hijri:hijri, fmtT:fmtT, uqCityId:uqCityId, loadCity:loadCity, UQD:UQD, cityInfo:cityInfo,
  play:play, unlock:unlock, fit:fit, resetAll:function(){ try { localStorage.removeItem(LS_KEY); } catch(e){} location.reload(); },
  setAll:function(o){ var n = mvFix(merge(DEF, sndFix(o))); if (n.look) n.look.rotOk = +n.look.rot || 0; for (var k in S) delete S[k]; for (var k2 in n) S[k2] = n[k2]; save(); rebuild(); },
  fitSlide:fitSlide, remTest:function(r){ remRun(r); }, REM_NAMES:REM_NAMES, clearCache:function(){ dayCache = {}; lastRowKey = ""; lastDay = ""; }, tzOffset:tzOffset, remindList:remindList, VERSION:VERSION, METHODS:METHODS, checkVersion:checkVersion};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* ===== مؤشر فأرة خاص للشاشة المرسومة مدوّرة (المتصفحات) =====
   المتصفح لا يستطيع تدوير مؤشر النظام، فعند الضغط الأول يُمسك المؤشر (Pointer Lock) ويظهر سهم خاص
   يتحرك بالاتجاه الذي يراه المستخدم، والضغط يعمل في مكانه. زر Esc يعيد مؤشر النظام.
   في تطبيق أندرويد يقوم التطبيق نفسه بهذا العمل. */
(function(){
  "use strict";
  var D = document, root = D.documentElement;
  if (window.RawayieAndroid || !root.requestPointerLock && !(D.body && D.body.requestPointerLock)) return;
  var cur = null, x = -1, y = -1, locked = false;
  function rot(){ return +root.getAttribute("data-rot") || 0; }
  function lockEl(){ return D.body; }
  function isLocked(){ return (D.pointerLockElement || D.mozPointerLockElement) === lockEl(); }
  function show(){
    if (!cur) { cur = D.createElement("div"); cur.className = "vcur"; cur.setAttribute("aria-hidden", "true");
      cur.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M2 2v18l5-4.6 3.6 7.6 3.4-1.6-3.6-7.4H17z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>';
      cur.style.cssText = "position:fixed;left:0;top:0;width:26px;height:26px;z-index:2147483647;pointer-events:none;transform-origin:0 0;display:none";
      D.body.appendChild(cur); }
    cur.style.display = "block";
    cur.style.transform = "translate(" + x + "px," + y + "px) rotate(" + rot() + "deg)";
  }
  function hide(){ if (cur) cur.style.display = "none"; }
  function fire(type, el){
    var o = {bubbles:true, cancelable:true, clientX:x, clientY:y, button:0, buttons:type === "mousedown" || type === "pointerdown" ? 1 : 0, view:window};
    try { el.dispatchEvent(type.indexOf("pointer") === 0 && window.PointerEvent ? new PointerEvent(type, Object.assign ? Object.assign({pointerType:"mouse", isPrimary:true}, o) : o) : new MouseEvent(type, o)); } catch(e){}
  }
  function clickAt(){
    var el = D.elementFromPoint(x, y); if (!el) return;
    fire("pointerdown", el); fire("mousedown", el); fire("pointerup", el); fire("mouseup", el);
    var tag = el.tagName.toLowerCase(), ty = (el.type || "").toLowerCase();
    // نافذة الاختيار الخاصة بالتطبيق فُتحت (تدور مع الشاشة): لا تُفتح نافذة النظام
    if (D.querySelector(".pkov:not([hidden])")) return;
    if (tag === "select" || (tag === "input" && /^(color|time|date)$/.test(ty))) { el.focus(); try { if (el.showPicker) el.showPicker(); } catch(e){} return; }
    if (tag === "textarea" || (tag === "input" && !/checkbox|radio|button|submit|range|color|file/.test(ty))) { el.focus(); return; }
    if (tag === "input" && ty === "range") { // نقل المؤشر إلى مكان الضغط على امتداد الشريط حسب اتجاهه الظاهر
      var r = el.getBoundingClientRect(), a = rot(), f;
      f = a === 90 ? (y - r.top) / r.height : a === 270 ? (r.bottom - y) / r.height : a === 180 ? (r.right - x) / r.width : (x - r.left) / r.width;
      if (getComputedStyle(el).direction === "rtl") f = 1 - f;
      var mn = +el.min || 0, mx = +(el.max || 100), st = +el.step || 1, v = mn + Math.max(0, Math.min(1, f)) * (mx - mn); v = Math.round(v / st) * st;
      el.value = v; el.dispatchEvent(new Event("input", {bubbles:true})); el.dispatchEvent(new Event("change", {bubbles:true})); return; }
    if (el.click) el.click(); else fire("click", el);
  }
  var swallow = 0, off = false;
  // إذا رفض المتصفح إمساك المؤشر (مثل الصفحات المضمّنة) يتوقف المؤشر الخاص وتعمل الفأرة عادياً
  D.addEventListener("pointerlockerror", function(){ off = true; swallow = 0; });
  // الضغطة الأولى بالفأرة تمسك المؤشر فقط، ولا تضغط في المكان الخطأ
  D.addEventListener("pointerdown", function(e){
    if (off || !rot() || locked || e.pointerType !== "mouse" || e.button !== 0 || e.isTrusted === false) return;
    x = e.clientX; y = e.clientY;
    try { var p = lockEl().requestPointerLock(); if (p && p.catch) p.catch(function(){ off = true; swallow = 0; }); } catch(err){ off = true; return; }
    e.preventDefault(); e.stopPropagation(); swallow = Date.now() + 900;
    setTimeout(function(){ if (!locked) { off = true; swallow = 0; } }, 1200);
  }, true);
  ["click", "mouseup", "pointerup", "mousedown", "pointerdown"].forEach(function(t){
    D.addEventListener(t, function(e){
      if (!e.isTrusted) return;
      if (Date.now() < swallow || (locked && t !== "mousedown")) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });
  D.addEventListener("pointerlockchange", function(){
    locked = isLocked();
    if (locked) show(); else hide();
  });
  D.addEventListener("mousemove", function(e){
    if (!locked) return;
    var a = rot() * Math.PI / 180, c = Math.round(Math.cos(a)), s = Math.round(Math.sin(a)), dx = e.movementX || 0, dy = e.movementY || 0;
    x = Math.max(0, Math.min(innerWidth - 1, x + dx*c - dy*s)); y = Math.max(0, Math.min(innerHeight - 1, y + dx*s + dy*c));
    show();
  }, true);
  D.addEventListener("mousedown", function(e){ if (locked && e.isTrusted) { e.preventDefault(); e.stopPropagation(); if (e.button === 0) clickAt(); } }, true);
  D.addEventListener("wheel", function(e){ if (!locked) return; e.preventDefault(); if (window.__vwheel) window.__vwheel(x / innerWidth, y / innerHeight, e.deltaY > 0 ? 1 : -1); }, {capture:true, passive:false});
  // رجوع الشاشة للوضع الطبيعي: يترك المؤشر
  setInterval(function(){ if (locked && !rot()) { try { D.exitPointerLock(); } catch(e){} } }, 1000);
})();

/* ===== إخفاء مؤشر الفأرة بعد 4 ثوانٍ بدون حركة =====
   الفأرة أو ريموت المؤشر (Air Mouse) يُظهر سهماً كان يبقى على الشاشة. يختفي بعد التوقف وفوراً عند أزرار الريموت،
   ويعود مع أول حركة. يشمل مؤشر النظام (cursor:none) والمؤشر المرسوم في الشاشة المدوّرة بالمتصفح (.vcur).
   تطبيق أندرويد يخفي مؤشره بنفسه أيضاً (MainActivity: sysCursorIdle و cursorIdle) */
(function(){
  "use strict";
  var D = document, root = D.documentElement, t = 0, IDLE = 4000;
  var st = D.createElement("style");
  st.textContent = "html.nocur,html.nocur *{cursor:none!important}html.nocur .vcur{display:none!important}";
  (D.head || root).appendChild(st);
  function hide(){ clearTimeout(t); root.classList.add("nocur"); }
  function wake(e){
    if (e && e.pointerType && e.pointerType !== "mouse") return; // اللمس لا يُظهر مؤشراً
    root.classList.remove("nocur"); clearTimeout(t); t = setTimeout(hide, IDLE);
  }
  ["mousemove", "mousedown", "wheel", "pointermove"].forEach(function(n){ D.addEventListener(n, wake, {passive:true, capture:true}); });
  D.addEventListener("keydown", hide, true); // أزرار الريموت
  hide();
})();
