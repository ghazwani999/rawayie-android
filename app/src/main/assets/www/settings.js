/* روائع الأذان - نسخة الويب: لوحة الإعدادات */
(function(){
"use strict";
var A = window.APP, S = A.S, $ = function(s, r){ return (r || document).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var panel, body, nav, cur = "home", unlocked = false, role = "admin"; // role: admin | sup
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function get(p){ return p.split(".").reduce(function(o, k){ return o == null ? o : o[k]; }, S); }
function put(p, v){ var ks = p.split("."), o = S; for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = v; }
function commit(){ A.save(); A.rebuild(); if (window.SC_APPLY) window.SC_APPLY(); }
function toast(msg){ var t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(function(){ t.hidden = true; }, 2200); }
var PN = {fajr:"الفجر", sunrise:"الشروق", dhuhr:"الظهر", asr:"العصر", maghrib:"المغرب", isha:"العشاء"};
var DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

/* ===== عناصر التحكم ===== */
var n = 0; function id(){ return "f" + (++n); }
function tog(label, p, hint){ var i = id(); return '<label class="fld tog" for="' + i + '"><span><b>' + esc(label) + '</b>' + (hint ? '<small>' + esc(hint) + '</small>' : "") + '</span>' +
  '<input type="checkbox" id="' + i + '" data-p="' + p + '" data-t="bool"' + (get(p) ? " checked" : "") + '><i></i></label>'; }
function numIn(label, p, min, max, step, suf, hint){ var i = id(); return '<label class="fld" for="' + i + '"><span><b>' + esc(label) + '</b>' + (hint ? '<small>' + esc(hint) + '</small>' : "") + '</span>' +
  '<span class="nb"><button type="button" data-step="-' + (step || 1) + '" aria-label="إنقاص">−</button><input type="number" id="' + i + '" data-p="' + p + '" data-t="num" min="' + min + '" max="' + max + '" step="' + (step || 1) + '" value="' + esc(get(p)) + '">' +
  '<button type="button" data-step="' + (step || 1) + '" aria-label="زيادة">+</button>' + (suf ? '<em>' + esc(suf) + '</em>' : "") + '</span></label>'; }
function sel(label, p, opts, hint){ var i = id(), v = String(get(p)); return '<label class="fld" for="' + i + '"><span><b>' + esc(label) + '</b>' + (hint ? '<small>' + esc(hint) + '</small>' : "") + '</span>' +
  '<select id="' + i + '" data-p="' + p + '" data-t="' + (typeof get(p) === "number" ? "num" : "str") + '">' + opts.map(function(o){ return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === v ? " selected" : "") + '>' + esc(o[1]) + '</option>'; }).join("") + '</select></label>'; }
function txt(label, p, hint, area){ var i = id(); return '<label class="fld col" for="' + i + '"><span><b>' + esc(label) + '</b>' + (hint ? '<small>' + esc(hint) + '</small>' : "") + '</span>' +
  (area ? '<textarea id="' + i + '" data-p="' + p + '" data-t="str" rows="3">' + esc(get(p)) + '</textarea>' : '<input type="text" id="' + i + '" data-p="' + p + '" data-t="str" value="' + esc(get(p)) + '">') + '</label>'; }
function timeIn(label, p, hint){ var i = id(); return '<label class="fld" for="' + i + '"><span><b>' + esc(label) + '</b>' + (hint ? '<small>' + esc(hint) + '</small>' : "") + '</span><input type="time" id="' + i + '" data-p="' + p + '" data-t="str" value="' + esc(get(p)) + '"></label>'; }
function colorIn(label, p){ var i = id(); return '<label class="fld" for="' + i + '"><span><b>' + esc(label) + '</b></span><input type="color" id="' + i + '" data-p="' + p + '" data-t="str" value="' + esc(get(p)) + '"></label>'; }
function card(title, inner, note){ return '<section class="sec"><h3>' + esc(title) + '</h3>' + (note ? '<p class="note">' + esc(note) + '</p>' : "") + inner + '</section>'; }
function btn(label, act, cls, data){ return '<button type="button" class="btn ' + (cls || "") + '" data-act="' + act + '"' + (data ? ' data-x="' + esc(data) + '"' : "") + '>' + esc(label) + '</button>'; }

/* ===== الأقسام ===== */
/* الأقسام مرتبة في مجموعات: [المفتاح، الاسم، الوصف، الأيقونة، المجموعة] */
var GROUPS = [["base","المسجد والمواقيت"],["prayer","شاشات الصلاة"],["content","المحتوى المعروض"],["look","المظهر والعرض"],["sys","النظام والتحكم"]];
var SECTIONS = [
  ["mosque","المسجد والموقع","اسم المسجد والمدينة وطريقة حساب المواقيت","pin","base"],
  ["times","المواقيت والإقامة","دقائق الإقامة وتعديل الأوقات والتاريخ الهجري","clock","base"],
  ["calendar","تقويم المواقيت","عرض مواقيت أي يوم وتعديلها يدوياً","cal","base"],
  ["friday","الجمعة والعيد","الخطبة وصلاة الجمعة وصلاة العيد","mosq","base"],
  ["screens","شاشات الأذان والإقامة","رسالة الأذان وشاشة الأذان وعداد انتظار الإقامة","bell","prayer"],
  ["hide","الإخفاء ووضع السكون","الشاشة السوداء أثناء الصلاة والإخفاء ليلاً وضحى","moon","prayer"],
  ["sounds","الأصوات","صوت الأذان والإقامة والتنبيهات","sound","prayer"],
  ["adhkar","الأذكار","أذكار بعد الصلاة والصباح والمساء ومدة كل ذكر","beads","content"],
  ["news","الإعلانات والرسائل","شريط الإعلانات والرسائل العاجلة المجدولة","mega","content"],
  ["texts","محرر النصوص","الأدعية والأحاديث والنصوص الثابتة","text","content"],
  ["slides","الشرائح","صور وشرائح تُعرض بالتناوب على الشاشة","img","content"],
  ["boards","لوحات العرض","لوحات معلومات بملء الشاشة","board","content"],
  ["display","خيارات العرض","العدادات والأذان والإقامة والجدول والساعة في مكان واحد","sliders","look"],
  ["look","الخلفية والألوان","صورة الخلفية وتغييرها تلقائياً وألوان النصوص","palette","look"],
  ["hilite","تمييز الصلاة القادمة","إظهار السطر المميز ولونه ونصوصه أو إطار حوله","hl","look"],
  ["fonts","الخطوط والأحجام","نوع الخط وحجم كل عنصر على الشاشة","font","look"],
  ["layout","الساعة والجدول","شكل الساعة وجدول المواقيت وما يظهر أسفل الشاشة","table","look"],
  ["rotate","تدوير وملاءمة الشاشة","اتجاه الشاشة وملء الشاشة وأزرار التحكم","rot","look"],
  ["shadow","ظل الصلوات","الظل والإطار خلف جدول الصلوات","shade","look"],
  ["weather","حالة الطقس","درجة الحرارة وحالة الجو على الشاشة","sun","look"],
  ["remote","الإدارة عن بعد","تفعيل الشاشة بكود وربطها بلوحة المدير","wifi","sys"],
  ["perms","الصلاحيات","كلمة سر المدير وحساب مشرف المسجد","lock","sys"],
  ["general","التشغيل والنسخ الاحتياطي","تفعيل التطبيق وبداية التشغيل والعمل بدون إنترنت وحفظ الإعدادات","gear","sys"]
];
/* أقسام فرعية تتبع صلاحية القسم الأصلي للمشرف */
var PERM_OF = {hide:"screens", hilite:"look", fonts:"look", layout:"look", display:"look"};
var PERM_LABEL = {screens:"شاشات الأذان والإقامة والإخفاء", look:"المظهر (الخلفية والخطوط والساعة)"};
var ICONS = {
  pin:'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  mosq:'<path d="M4 20V11a8 5 0 0 1 16 0v9zM12 3v3M9 20v-4a3 3 0 0 1 6 0v4"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sound:'<path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  beads:'<circle cx="12" cy="5" r="2"/><circle cx="6.5" cy="9" r="2"/><circle cx="17.5" cy="9" r="2"/><circle cx="7.5" cy="15.5" r="2"/><circle cx="16.5" cy="15.5" r="2"/><path d="M12 17.5V21"/>',
  mega:'<path d="M4 10v4h3l8 4V6L7 10zM18 9.5a3.5 3.5 0 0 1 0 5M8 14l1 5h2"/>',
  text:'<path d="M5 6h14M5 10h14M5 14h10M5 18h7"/>',
  img:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/>',
  board:'<rect x="3.5" y="4" width="17" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-.8 2-1.8 0-1.2-1-1.6-1-2.7 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
  font:'<path d="M4 19L10 5l6 14M6.5 14h7M17 19v-7M15 12h4"/>',
  table:'<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9h17M3.5 14.5h17M10 9v11"/>',
  rot:'<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5"/>',
  hl:'<rect x="3" y="4" width="18" height="4" rx="1.5" opacity=".45"/><rect x="2.5" y="10" width="19" height="4.5" rx="1.5"/><rect x="3" y="16.5" width="18" height="4" rx="1.5" opacity=".45"/>',
  shade:'<rect x="6" y="6" width="13" height="13" rx="2"/><path d="M3 15V5a2 2 0 0 1 2-2h10"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  wifi:'<path d="M3 9a13 13 0 0 1 18 0M6 12.5a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="19" r="1"/>',
  lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  home:'<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'
};
function ico(k){ return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[k] || "") + '</svg>'; }
function secOf(k){ for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i][0] === k) return SECTIONS[i]; return null; }
function groupName(g){ for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i][0] === g) return GROUPS[i][1]; return ""; }
var R = {};
var ADMIN_ONLY = {perms:1, general:1, remote:1};
function allowed(sec){ if (sec === "home") return true; if (!S.pass || role === "admin") return true; sec = PERM_OF[sec] || sec; return !ADMIN_ONLY[sec] && (S.sup.sections || []).indexOf(sec) >= 0; }
function firstAllowed(){ for (var i = 0; i < SECTIONS.length; i++) if (allowed(SECTIONS[i][0])) return SECTIONS[i][0]; return ""; }
function anyAllowed(){ return !!firstAllowed(); }

/* حالة التدوير من النظام (تطبيق أندرويد فقط) */
function rotNativeHTML(r){
  var AN = window.RawayieAndroid;
  if (!AN || !AN.setRotation) return r ? '<p class="note">تنبيه: في المتصفح تُرسم الشاشة مدوّرة، فتتحرك الفأرة بالاتجاه الأصلي للجهاز. للتحكم الصحيح بالفأرة دوّر الشاشة من إعدادات العرض في النظام (ويندوز: إعدادات العرض ← اتجاه العرض) واترك التدوير هنا على «الوضع الطبيعي».</p>' : "";
  var n = 0; try { n = +AN.nativeRot() || 0; } catch(e){}
  var ok = S.look.sysRot === true && r && n === r;
  var info = ""; try { var ri = JSON.parse(AN.rotInfo ? AN.rotInfo() : "{}"); if (ri.win) info = '<p class="note" dir="ltr" style="font-size:12px;opacity:.7">window ' + esc(ri.win) + ' · page ' + innerWidth + 'x' + innerHeight + ' · rot ' + ri.rot + ' · fill ' + ri.fill + (ri.failed >= 0 ? ' · unsupported ' + ri.failed : "") + '</p>'; } catch(e){}
  return '<p class="note">مع الشاشة المدوّرة يظهر عند تحريك الفأرة مؤشر خاص يتحرك بالاتجاه الصحيح، وأسهم الريموت تتنقل بالاتجاه الذي تراه.</p>' +
    tog("تجريبي: تدوير الشاشة من نظام أندرويد", "look.sysRot", "بعض الأجهزة فقط تدعمه. إذا لم تملأ الشاشة أو ظهرت مقلوبة أوقفه") +
    (r && S.look.sysRot === true ? '<p class="note">' + (ok ? "✓ الجهاز دوّر الشاشة بنفسه: الفأرة والريموت بالاتجاه الصحيح. إذا ظهرت الشاشة مقلوبة اختر الاتجاه المعاكس." : "هذا الجهاز لا يسمح بهذا الاتجاه من التطبيق (أو يعرضه في جزء من الشاشة)، فتُرسم الشاشة مدوّرة بملء الشاشة كاملة. عند تحريك الفأرة يظهر مؤشر خاص يتحرك بالاتجاه الصحيح، والضغط يعمل في مكانه.") + '</p>' : "") + info;
}
R.rotate = function(){
  var r = +S.look.rot || 0, o = S.look.orient || "auto";
  var R4 = [[0,"الوضع الطبيعي","بدون تدوير"],[90,"تدوير يمين","90° مع عقارب الساعة"],[180,"مقلوب","180°"],[270,"تدوير يسار","90° عكس عقارب الساعة"]];
  var O3 = [["auto","تلقائي","حسب مقاس الشاشة"],["portrait","رأسي","طولي دائماً"],["landscape","أفقي","عرضي دائماً"]];
  return card("تدوير الشاشة",
    '<div class="rots">' + R4.map(function(x){ return '<button type="button" class="rot' + (x[0] === r ? " on" : "") + '" data-act="setRot" data-x="' + x[0] + '" aria-pressed="' + (x[0] === r) + '">' +
      '<span class="rscr" style="transform:rotate(' + x[0] + 'deg)"><i></i><em>↑</em></span><b>' + x[1] + '</b><small>' + x[2] + '</small></button>'; }).join("") + '</div>' +
    '<div class="row-end">' + btn("تدوير 90° ↻", "rotStep", "ghost") + '</div>' + rotNativeHTML(r),
    "لشاشة معلقة باتجاه مختلف عن الجهاز، مثل تلفاز أفقي مركّب عمودياً. تدور معها كل محتويات الشاشة والقوائم.") +
  card("ملاءمة الشاشة",
    tog("ترك مساحة الكاميرا الأمامية في الجوالات", "look.safeArea", "لا يغطي اسم المسجد أو الساعة كاميرا الجوال (النوتش) والحواف المنحنية") +
    (window.RawayieAndroid && window.RawayieAndroid.isPhone && window.RawayieAndroid.isPhone() ? tog("إظهار شريط الحالة في الجوال", "look.phoneBar", "الساعة والبطارية أعلى الشاشة فوق الخلفية") : "") +
    tog("ملء الشاشة تلقائياً عند التشغيل", "look.autoFS", "تدخل الشاشة ملء الشاشة وحدها، وإن منعها المتصفح فعند أول ضغطة على الريموت أو لمسة") +
    sel("طريقة ملء الشاشة", "look.fitMode", [["fill","ملء كامل بدون أشرطة سوداء (يتكيف مع أي شاشة)"],["fit","الحفاظ على النسبة الأصلية (قد تظهر أشرطة)"]], "الملء الكامل يناسب الجوال والتابلت وشاشات 4:3 و21:9") +
    '<div class="row-end">' + btn("ملء الشاشة الآن", "fsNow", "ghost") + '</div>') +
  card("اتجاه التصميم",
    '<div class="rots o3">' + O3.map(function(x){ return '<button type="button" class="rot' + (x[0] === o ? " on" : "") + '" data-act="setOri" data-x="' + x[0] + '" aria-pressed="' + (x[0] === o) + '"><span class="rscr ' + x[0] + '"><i></i></span><b>' + x[1] + '</b><small>' + x[2] + '</small></button>'; }).join("") + '</div>',
    "الوضع الرأسي يعرض الصلوات في جدول طولي، والأفقي يعرضها بجانب الساعة.") +
  hdmiCard() +
  card("أزرار التحكم على الشاشة",
    sel("شريط الاختصارات أعلى الشاشة", "look.scMode", [["move","يظهر عند تحريك الفأرة أو اللمس"],["always","ظاهر دائماً"],["hidden","مخفي"]], "أزرار: الإعدادات، ملء الشاشة، تدوير الشاشة، تفعيل الصوت") +
    tog("إظهار زر القائمة ☰ أعلى الشاشة", "look.menuBtn", "عند إخفائه تُفتح الإعدادات بالضغط المطوّل على الشاشة، أو بزر S أو Enter"));
};

R.mosque = function(){
  var regions = {};
  Object.keys(window.CITIES).forEach(function(k){ var c = window.CITIES[k]; (regions[c[1]] = regions[c[1]] || []).push([k, c[0]]); });
  var opts = Object.keys(regions).sort(function(a, b){ return window.REGIONS[a].localeCompare(window.REGIONS[b], "ar"); }).map(function(r){
    return '<optgroup label="' + esc(window.REGIONS[r]) + '">' + regions[r].sort(function(a, b){ return a[1].localeCompare(b[1], "ar"); })
      .map(function(c){ return '<option value="' + c[0] + '"' + (c[0] === S.city ? " selected" : "") + '>' + esc(c[1]) + '</option>'; }).join("") + '</optgroup>'; }).join("");
  return card("المسجد", txt("اسم المسجد", "mosque") + tog("إظهار اسم المسجد على الشاشة", "look.showName") +
      sel("اللغة", "lang", [["ar","العربية"],["en","English"],["bn","বাংলা"]]) +
      tog("إظهار الشعار", "look.logo", "الشعار في وسط الشاشة") +
      '<div class="fld"><span><b>صورة الشعار</b><small>' + (S.look.logoId ? "شعار مخصص من الجهاز" : "الهلال والمسجد") + '. يفضّل صورة PNG بخلفية شفافة</small></span><span class="nb"><label class="btn sm ghost">تغيير الشعار<input type="file" accept="image/*" data-up="logo" hidden></label>' + (S.look.logoId ? btn("الشعار الافتراضي", "logoReset", "sm ghost") : "") + '</span></div>' +
      (S.look.logo !== false && S.look.logo !== "none" ? numIn("شفافية الشعار", "look.logoOp", 0.05, 1, 0.05, "", "1 = ظاهر بالكامل") + numIn("حجم دائرة الشعار", "look.embSize", 0.4, 1.2, 0.05, "", "أصغر = مساحة أكبر للمتبقي للصلاة والتاريخ الميلادي بجانبه. الافتراضي 0.7") +
        sel("لون الشعار", "look.logoColor", [["auto","يتكيف مع لون الخلفية (يستخدم شكل الشعار فقط)"],["gold","ألوان الصورة الأصلية"],["silver","فضي شفاف"],["custom","لون مخصص"]]) +
        (S.look.logoColor === "custom" ? colorIn("اختر لون الشعار", "look.logoCustom") : "") : "")) +
    card("موقع المسجد",
      '<label class="fld"><span><b>المدينة</b><small>مواقيت أم القرى الرسمية لـ 118 مدينة سعودية</small></span><input type="search" id="csearch" placeholder="ابحث عن المدينة" aria-label="ابحث عن المدينة"></label>' +
      '<label class="fld" for="city"><span><b>اختر المدينة</b></span><select id="city" data-p="city" data-t="str">' + opts + '</select></label>' +
      txt("الحي أو العنوان", "addr", "مثل: حي النزهة. يظهر مع اسم المدينة أسفل الشاشة") + tog("إظهار موقع المسجد أسفل الشاشة", "look.showLoc", "بجانب إصدار التطبيق") +
      tog("موقع مخصص (خارج المدن المدعومة)", "custom.on", "يحسب المواقيت فلكياً من الإحداثيات") +
      (S.custom.on ? txt("اسم الموقع", "custom.name") + numIn("خط العرض", "custom.lat", -90, 90, 0.0001) + numIn("خط الطول", "custom.lng", -180, 180, 0.0001) +
        numIn("فرق التوقيت عن غرينتش", "custom.tz", -720, 840, 30, "دقيقة", "180 = توقيت السعودية") +
        sel("طريقة الحساب", "custom.method", [["uq","أم القرى"],["mwl","رابطة العالم الإسلامي"],["egypt","الهيئة المصرية"],["isna","أمريكا الشمالية"],["karachi","كراتشي"],["gulf","الخليج"]]) : ""));
};

R.times = function(){
  var z = A.zp(Date.now()), d = A.dayTimes(z.Y, z.M, z.D);
  var prev = '<div class="today">' + d.list.map(function(x){ return '<div><b>' + esc(PN[x.k]) + '</b><span>' + A.fmtT(x.A) + '</span>' + (x.k === "sunrise" ? "" : '<small>إقامة ' + A.fmtT(x.I) + '</small>') + '</div>'; }).join("") + '</div>' +
    '<p class="note">' + (d.src === "uq" ? "المصدر: تقويم أم القرى الرسمي لمدينة " + esc(A.cityInfo().name) : "المصدر: حساب فلكي") + '</p>';
  var adj = ["fajr","sunrise","dhuhr","asr","maghrib","isha"].map(function(k){ return numIn(PN[k], "adj." + k, -180, 180, 1, "دقيقة"); }).join("");
  var iq = ["fajr","dhuhr","asr","maghrib","isha"].map(function(k){ return numIn(PN[k], "iq." + k, 0, 90, 1, "دقيقة"); }).join("") + numIn("الضحى بعد الشروق", "duha", 0, 60, 1, "دقيقة");
  return card("مواقيت اليوم", prev) +
    card("إقامة الصلاة", iq, "عدد الدقائق بين الأذان والإقامة") +
    card("تعديل لكل صلاة", adj, "المدى من -180 إلى +180 دقيقة") +
    card("تعديل عام لكل الصلوات",
      sel("تعديل عام", "shift", [[60,"إضافة ساعة لكل صلاة"],[0,"بدون تغيير"],[-60,"إنقاص ساعة لكل صلاة"]]) +
      tog("إضافة ساعة واحدة لأوقات الصلاة في الصيف", "summer") +
      tog("أضف 30 دقيقة إلى العشاء في رمضان", "ramadan30", "تقويم أم القرى يضيفها تلقائياً، وهذا الخيار للحساب الفلكي بطرق أخرى")) +
    card("ضبط التاريخ الهجري", numIn("تعديل التاريخ الهجري", "hijriAdj", -2, 2, 1, "يوم")) +
    card("عرض التاريخ", tog("إظهار اسم اليوم", "look.showDay") + tog("إظهار التاريخ", "look.showDate", "الهجري والميلادي") + sel("طريقة العرض", "dateMode", [["alt","تبديل بين الهجري والميلادي في نفس المكان"],["hijri","الهجري فقط"],["greg","الميلادي فقط"],["both","الهجري أعلى والميلادي بجانب الشعار"]]) + numIn("مدة عرض كل تاريخ", "dateSec", 3, 60, 1, "ثانية"), "يمكن أيضاً الضغط على التاريخ في الشاشة للتبديل يدوياً") +
    '<div class="row-end">' + btn("إعادة الإعدادات الافتراضية للمواقيت", "resetTimes", "ghost") + '</div>';
};

var calMonth = null, calEdit = null;
R.calendar = function(){
  var z = A.zp(Date.now()), todayKey = A.dkey(z.Y, z.M, z.D);
  var c = !S.custom.on && A.UQD[S.city], days = [];
  var startMs = c ? c.start : Date.UTC(z.Y, z.M, z.D - 15), count = c ? c.rows.length : 400;
  var months = [];
  for (var i = 0; i < count; i++) {
    var dd = new Date(startMs + i*86400000), Y = dd.getUTCFullYear(), M = dd.getUTCMonth(), D = dd.getUTCDate(), h = A.hijri(Y, M, D);
    var mk = h.year + "-" + h.month; if (months.indexOf(mk) < 0) months.push(mk);
    days.push({Y:Y, M:M, D:D, h:h, mk:mk});
  }
  var th = A.hijri(z.Y, z.M, z.D), curMk = th.year + "-" + th.month;
  if (!calMonth || months.indexOf(calMonth) < 0) calMonth = months.indexOf(curMk) >= 0 ? curMk : months[0];
  var mnames = {}; days.forEach(function(x){ mnames[x.mk] = x.h.monthName + " " + x.h.year; });
  var editBox = "";
  var rows = days.filter(function(x){ return x.mk === calMonth; }).map(function(x){
    var k = A.dkey(x.Y, x.M, x.D), d = A.dayTimes(x.Y, x.M, x.D), fut = k >= todayKey, ed = !!S.overrides[k];
    var dn = DAYS[new Date(Date.UTC(x.Y, x.M, x.D)).getUTCDay()] + " " + x.D + "/" + (x.M + 1);
    // نموذج تعديل اليوم يظهر فوق الجدول بعرض كامل، فلا يحتاج سحباً أفقياً على الشاشات الضيقة أو المدوّرة
    if (calEdit === k) editBox = '<div class="calbox"><b>تعديل مواقيت يوم ' + esc(x.h.day + " " + x.h.monthName + " · " + dn) + '</b><div class="calgrid">' +
      d.list.map(function(p){ var zz = A.zp(p.A); return '<label><span>' + PN[p.k] + '</span><input type="time" data-cal="' + p.k + '" value="' + A.two(zz.h) + ":" + A.two(zz.m) + '"></label>'; }).join("") +
      '</div><div class="row-end">' + btn("حفظ", "calSave", "", k) + (ed ? btn("إعادة للأصل", "calReset", "ghost", k) : "") + btn("إلغاء", "calCancel", "ghost") + '</div></div>';
    var cells = d.list.map(function(p){ return '<td>' + A.fmtT(p.A) + '</td>'; }).join("");
    return '<tr class="' + (k === todayKey ? "now" : "") + (ed ? " ovr" : "") + (fut ? "" : " past") + (calEdit === k ? " editing" : "") + '"><th>' + x.h.day + '<small>' + dn + '</small>' +
      (fut ? '<span class="calbtn">' + btn(ed ? "تعديل ✎" : "تعديل", "calEdit", "sm ghost", k) + '</span>' : "") + '</th>' + cells + '</tr>';
  }).join("");
  return card("تقويم المواقيت الهجري",
    '<label class="fld" for="calm"><span><b>الشهر</b></span><select id="calm">' + months.map(function(m){ return '<option value="' + m + '"' + (m === calMonth ? " selected" : "") + '>' + esc(mnames[m]) + (m === curMk ? " (الشهر الحالي)" : "") + '</option>'; }).join("") + '</select></label>' +
    editBox +
    '<div class="tw"><table class="cal"><thead><tr><th>اليوم</th>' + ["fajr","sunrise","dhuhr","asr","maghrib","isha"].map(function(k){ return "<th>" + PN[k] + "</th>"; }).join("") + '</tr></thead><tbody>' + rows + '</tbody></table></div>',
    "اليوم والأيام القادمة قابلة للتحرير، والأيام الماضية للعرض فقط. التعديل اليدوي لليوم له الأولوية على الضبط العام.");
};

R.friday = function(){
  return card("إعدادات صلاة الجمعة",
    tog("تفعيل برنامج صلاة الجمعة", "fri.on", "عند إيقافه يعمل يوم الجمعة كصلاة ظهر عادية") +
    timeIn("وقت أذان الجمعة", "fri.adhanTime", "اتركه فارغاً لاستخدام وقت الظهر") +
    numIn("مدة الخطبة بعد انتهاء الأذان", "fri.khutbah", 5, 90, 1, "دقيقة") +
    numIn("مدة صلاة الجمعة", "fri.dur", 5, 40, 1, "دقيقة", "أضف دقيقة أو دقيقتين احتياطاً") +
    tog("تفعيل إخفاء الشاشة أثناء صلاة الجمعة", "fri.hide") +
    tog("إظهار التاريخ الهجري في شاشة الخطبة", "fri.showHijri") + tog("إظهار التاريخ الميلادي في شاشة الخطبة", "fri.showGreg")) +
  card("صلاة العيد",
    tog("إظهار صلاة عيد الفطر", "eid.fitrOn") + timeIn("وقت صلاة عيد الفطر", "eid.fitr") +
    tog("إظهار صلاة عيد الأضحى", "eid.adhaOn") + timeIn("وقت صلاة عيد الأضحى", "eid.adha"), "تظهر صلاة العيد في جدول المواقيت يوم العيد حسب التاريخ الهجري");
};

R.screens = function(){
  return card("رسالة الأذان والإقامة",
    tog("تفعيل رسالة «حان الآن موعد...»", "ann.on", "تظهر على شاشة الأذان وعند الإقامة بدل العنوان المختصر") +
    (S.ann.on !== false ? txt("رسالة الأذان", "ann.azan", "اكتب {الصلاة} مكان اسم الصلاة و{المسجد} مكان اسم المسجد") + txt("رسالة الإقامة", "ann.iqama", "يمكن استخدام {الصلاة} و{المسجد}") +
      '<div class="row-end">' + btn("استعادة النص الافتراضي", "annReset", "ghost") + btn("معاينة الأذان", "annPrevA", "ghost") + btn("معاينة الإقامة", "annPrevI", "ghost") + '</div>' : ""),
    "مثال: حان الآن موعد أذان صلاة الظهر، وذلك في مسجد الحي") +
  card("شاشة الأذان",
    tog("إظهار شاشة الأذان", "azanScreen") + numIn("مدة الأذان", "azanDur", 1, 10, 1, "دقيقة") + tog("إظهار دعاء ما بعد الأذان", "duaAfterAzan")) +
  card("شاشة الإقامة",
    tog("العد التنازلي للإقامة آخر دقيقة فقط", "lastMinOnly", "عند تفعيله لا تظهر شاشة انتظار الإقامة إلا في آخر دقيقة قبل الإقامة") +
    '<p class="note warn" id="lmwarn"' + (S.lastMinOnly ? "" : " hidden") + '>⚠ مفعّل الآن: لن تظهر شاشة انتظار الإقامة بعد الأذان، وتبقى الشاشة الرئيسية ظاهرة، ثم يظهر العداد في آخر دقيقة فقط قبل الإقامة. لإظهار العداد طوال فترة الانتظار أوقف هذا الخيار.</p>' + tog("إظهار الوقت المتبقي للإقامة داخل دائرة", "circle") +
    tog("إظهار أوقات الصلوات أثناء انتظار الإقامة", "iqTimes", "أوقات الأذان فقط (بدون أوقات الإقامة) أسفل العداد، مع تمييز الصلاة الحالية") +
    tog("تغيير لون العداد إلى الأحمر في آخر 90 ثانية", "red90") +
    tog("رسالة التنبيه بالصوت عند آخر دقيقة قبل الإقامة", "notifyOn") + txt("رسالة التنبيه", "notifyMsg") +
    tog("عرض حديث الرسول ﷺ قبل الإقامة", "hadithOn") + numIn("توقيت عرض الحديث", "hadithSec", 10, 600, 5, "ثانية قبل الإقامة") + txt("نص الحديث", "hadithText", "", true)) +
  "";
};
R.hide = function(){
  return card("إخفاء الشاشة أثناء الصلاة",
    tog("تفعيل إخفاء الشاشة أثناء الصلاة", "hidePrayer") +
    '<div class="grid2">' + ["fajr","dhuhr","asr","maghrib","isha"].map(function(k){ return numIn("مدة صلاة " + PN[k], "pd." + k, 3, 40, 1, "دقيقة"); }).join("") + '</div>' +
    '<h4 class="subh">خلفية شاشة الإخفاء</h4>' + bgSpecUI({style:"blackStyle", color:"blackColor", light:"blackLight", img:"blackImg"}, false) +
    '<div class="row-end">' + btn("معاينة شاشة الإخفاء 10 ثوانٍ", "blkPrev", "ghost") + '</div>' + tog("إظهار الوقت على الشاشة السوداء", "blackTime") + tog("إظهار التاريخ على الشاشة السوداء", "blackDate") + rangeIn("حجم النصوص في شاشة الإخفاء", "blackSize", 0.5, 2.2, 0.05, "%", "الوقت والتاريخ وعبارة «الصلاة قائمة»") +
    "") +
  card("إخفاء الشاشة في أوقات الفراغ (وضع السكون)",
    tog("إخفاء الشاشة بعد العشاء", "sleepIsha", "تختفي الشاشة ليلاً وتعود وحدها قبل أذان الفجر") +
    (S.sleepIsha ? numIn("تختفي بعد انتهاء صلاة العشاء بـ", "hideIsha", 0, 300, 5, "دقيقة") + numIn("تعود قبل أذان الفجر بـ", "wakeFajr", 0, 180, 5, "دقيقة") : "") +
    tog("إخفاء الشاشة بعد الشروق", "sleepSunrise", "تختفي في الضحى وتعود وحدها قبل أذان الظهر") +
    (S.sleepSunrise ? numIn("تختفي بعد الشروق بـ", "hideSunrise", 0, 300, 5, "دقيقة") + numIn("تعود قبل أذان الظهر بـ", "wakeDhuhr", 0, 180, 5, "دقيقة") : "") +
    sel("ما يظهر على شاشة السكون", "sleepLook", [["black","لا شيء غير رسالة السكون"],["clock","ساعة صغيرة خافتة"],["same","الوقت والتاريخ مثل شاشة الإخفاء أثناء الصلاة"]], "الخلفية تختارها من بطاقة «خلفية شاشة السكون»") +
    tog("إظهار رسالة على شاشة السكون", "sleepMsgOn", "نص خافت يتحرك ببطء لحماية الشاشة. يوضح وقت الإخفاء ووقت عودة الشاشة") +
    (S.sleepMsgOn !== false ? (S.sleepIsha || !S.sleepSunrise ? txt("رسالة السكون بعد العشاء", "sleepMsgIsha", "اتركها فارغة للنص التلقائي: «" + autoSleepText("isha") + "». اكتب {العودة} ليظهر وقت عودة الشاشة", true) : "") +
      (S.sleepSunrise ? txt("رسالة السكون بعد الشروق", "sleepMsgSunrise", "اتركها فارغة للنص التلقائي: «" + autoSleepText("sunrise") + "». اكتب {العودة} ليظهر وقت عودة الشاشة", true) : "") : "") +
    '<div class="row-end">' + btn("معاينة الإخفاء 10 ثوانٍ", "sleepPrev", "ghost") + '</div>' +
    '<p class="note">' + esc(sleepText()) + '</p>',
    "الجهاز لا يدخل في السكون أثناء الإخفاء، حتى يعود في الوقت المحدد بدون أي لمسة.") +
  (S.sleepIsha || S.sleepSunrise ? card("خلفية شاشة السكون",
    '<div class="seg">' + [["isha","بعد العشاء"],["sunrise","بعد الشروق"]].map(function(k){ return '<button type="button" data-act="sbTab" data-x="' + k[0] + '" class="' + (sbTab() === k[0] ? "on" : "") + '">' + k[1] + '</button>'; }).join("") + '</div>' +
    bgSpecUI({style:"sleepBg." + sbTab() + ".style", color:"sleepBg." + sbTab() + ".color", light:"sleepBg." + sbTab() + ".light", img:"sleepBg." + sbTab() + ".img"}, true) +
    '<div class="row-end">' + btn("معاينة شاشة السكون " + (sbTab() === "isha" ? "بعد العشاء" : "بعد الشروق") + " 10 ثوانٍ", "sleepPrevK", "ghost", sbTab()) + '</div>',
    "لكل فترة خلفيتها: الأسود يوفر الطاقة أكثر، ويمكن اختيار صورة أو لون خافت مع رسالة السكون") : "") +
  card("منع السكون في الجهاز",
    '<div class="fld"><span><b>الحالة</b><small>' + esc(awakeText()) + '</small></span></div>' +
    '<p class="note">يمنع التطبيق المتصفح والجهاز من إطفاء الشاشة أو الدخول في السكون طوال الوقت. في بعض أجهزة التلفاز أوقف أيضاً من إعداداتها: «توفير الطاقة» و«الإيقاف التلقائي» و«مؤقت النوم»، وفي الكمبيوتر: إعدادات الطاقة ← عدم إيقاف الشاشة أبداً.</p>');
};
/* ترخيص الشاشة: يصدر من موقع الإدارة فقط ويتجدد تلقائياً */
function licCard(){
  var L = window.LICENSE; if (!L) return "";
  var s = L.status(), d = function(n){ return n <= 1 ? "يوم واحد" : n === 2 ? "يومان" : n + " أيام"; };
  var stt = s.active ? (s.until ? "مفعّل حتى " + new Date(s.until).toLocaleDateString("ar-SA-u-ca-gregory") : "مفعّل ✓ شكراً لكم") : s.trial ? "فترة تجريبية: متبقي " + d(s.leftDays) : s.pending ? "جارٍ التحقق من موقع الإدارة" : (s.msg || (s.linked ? "غير مفعّلة" : "غير مرتبطة بموقع الإدارة"));
  return card("ترخيص الشاشة",
    '<div class="fld"><span><b>الحالة</b><small>' + esc(stt) + '</small></span><span class="pill ' + (s.active ? "ok" : s.trial || s.pending ? "" : "bad") + '">' + (s.active ? "مفعّل" : s.trial ? "تجريبي" : s.pending ? "تحقق" : "غير مفعّل") + '</span></div>' +
    '<div class="fld"><span><b>رقم الجهاز</b><small>أرسله مع طلب التفعيل</small></span><b dir="ltr" style="font-size:20px;letter-spacing:2px">' + esc(s.idText) + '</b></div>' +
    (s.renewedAt ? '<div class="fld"><span><b>آخر تجديد من الموقع</b><small>تعمل الشاشة ' + d(s.offlineDays) + ' بدون إنترنت</small></span><span dir="ltr">' + esc(new Date(s.renewedAt).toLocaleString("en-GB")) + '</span></div>' : "") +
    '<div class="row-end">' + (s.linked ? '<button type="button" class="btn" data-act="licCheck">تحديث الترخيص الآن</button>' : "") +
      (s.active ? "" : '<a class="btn" href="' + s.waLink + '" target="_blank" rel="noopener" style="background:#1fa855;border-color:#1fa855;color:#fff">تواصل عبر واتساب ' + esc(s.wa) + '</a>') + '</div>',
    s.active ? "" : "يُفعَّل الترخيص من لوحة الإدارة فقط. أرسل رقم الجهاز عبر واتساب " + s.wa + "، ثم اكتب كود التفعيل (6 أرقام) الذي يصلك.");
}
/* دقة العرض على التلفاز (تطبيق أندرويد فقط) */
function hdmiCard(){
  var AN = window.RawayieAndroid; if (!AN || !AN.displayInfo) return "";
  var d = {}; try { d = JSON.parse(AN.displayInfo()); } catch(e){}
  var ui = d.uiW ? Math.max(d.uiW, d.uiH) + "×" + Math.min(d.uiW, d.uiH) : "؟", out = d.outW ? Math.max(d.outW, d.outH) + "×" + Math.min(d.outW, d.outH) + (d.hz ? " @" + d.hz + "Hz" : "") : "غير معروف";
  var mx = d.maxW ? Math.max(d.maxW, d.maxH) + "×" + Math.min(d.maxW, d.maxH) : "";
  var uiLow = d.uiW && Math.max(d.uiW, d.uiH) < 1900, up = d.outW && d.uiW && Math.max(d.outW, d.outH) > Math.max(d.uiW, d.uiH) + 10;
  return card("دقة العرض على التلفاز (HDMI)",
    '<div class="fld"><span><b>مخرج HDMI الآن</b><small><span dir="ltr">' + esc(out) + '</span>' + (mx && mx !== out.split(" ")[0] ? ' · أعلى دقة يدعمها الجهاز: <span dir="ltr">' + esc(mx) + '</span>' : "") + '</small></span></div>' +
    '<div class="fld"><span><b>دقة رسم الشاشة في الجهاز</b><small><span dir="ltr">' + esc(ui) + '</span>' + (uiLow ? " ⚠ منخفضة" : "") + (up ? ' ثم يكبّرها الجهاز إلى <span dir="ltr">' + esc(out.split(" ")[0]) + '</span>' : "") + '</small></span></div>' +
    '<label class="fld tog" for="hd4k"><span><b>تشغيل مخرج HDMI بأعلى دقة يدعمها الجهاز</b><small>مثل 4K إن كان الجهاز والتلفاز يدعمانها</small></span><input type="checkbox" id="hd4k"' + (d.prefer4k !== false ? " checked" : "") + '><i></i></label>' +
    '<p class="note">' + esc(uiLow ? "الجهاز يرسم الشاشة بدقة أقل من 1080، فتظهر النصوص أقل حدة. من إعدادات الجهاز ← العرض (Display) ← الدقة (Resolution) اختر 1080p أو 4K، وإن وُجد خيار «دقة واجهة المستخدم» أو «UI resolution» فاجعله 1080p أو أعلى." :
      "أغلب أجهزة أندرويد للتلفاز ترسم واجهة التطبيقات بدقة 1080p ثم تكبّرها إلى 4K. هذا من نظام الجهاز وليس من التطبيق، وتبقى الصورة واضحة إذا ضُبط ما يلي:") + '</p>' +
    '<ul class="tips"><li>في التلفاز: اجعل «حجم الصورة» على «Just Scan» أو «ملاءمة الشاشة» أو «1:1» وأوقف «Overscan»، لأن التكبير يقلل الحدة.</li>' +
    '<li>في جهاز التشغيل: إعدادات ← العرض ← «موضع الشاشة» أو «Screen zoom» اجعله 100%.</li>' +
    '<li>في التلفاز: أوقف «تحسين الحدة» الزائد واختر وضع صورة «قياسي» أو «Standard».</li></ul>');
}
/* اختيار خلفية شاشة الإخفاء أو السكون: النوع ثم اللون أو الصورة ثم درجة الإضاءة */
function sbTab(){ var t = R.hide.sb || (S.sleepIsha || !S.sleepSunrise ? "isha" : "sunrise"); if (t === "isha" && !S.sleepIsha && S.sleepSunrise) t = "sunrise"; if (t === "sunrise" && !S.sleepSunrise) t = "isha"; return t; }
function bgSpecUI(P, sleep){
  var st = get(P.style) || (sleep ? "black" : "bg"), img = get(P.img) || "";
  var opts = (sleep ? [["black","أسود تماماً"],["prayer","مثل شاشة الإخفاء أثناء الصلاة"]] : [["black","أسود تماماً"]]).concat([["bg","الخلفية الحالية معتمة"],["color","لون خافت"],["image","صورة مخصصة"]]);
  var h = '<div class="seg wrap">' + opts.map(function(o){ return '<button type="button" data-act="spSet" data-x="' + esc(P.style + "|" + o[0]) + '" class="' + (st === o[0] ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div>';
  if (st === "color") h += colorIn("اللون", P.color);
  if (st === "image") {
    var o2 = A.orient(), list = A.bgList(o2), cur0 = img.indexOf("file:") === 0 ? img.slice(5) : "";
    h += '<div class="fld col"><span><b>الصورة</b><small>' + (img ? (cur0 ? "من خلفيات التطبيق" : /^(https?:)?\/\//.test(img) ? "من رابط" : "صورة من الجهاز") : "اختر صورة من الخلفيات أو من جهازك") + '</small></span></div>' +
      '<div class="bgs pick">' + list.map(function(b, i){ var svg = /\.svg$/.test(b[0]);
        return '<button type="button" class="bgt ' + o2 + (svg ? " svg" : "") + (b[0] === cur0 ? " on" : "") + '" data-act="spImg" data-x="' + esc(P.img + "|file:" + b[0]) + '" style="' +
          (svg ? "background-image:url(bg/" + b[0] + ")" : "background-position:0 " + (-(b[3] != null ? b[3] : i)*(o2 === "P" ? 160 : 90)) + "px") + '" aria-label="خلفية ' + (i + 1) + '"></button>'; }).join("") + '</div>' +
      '<div class="row-end"><label class="btn ghost">صورة من الجهاز<input type="file" accept="image/*" data-up="' + esc("sp:" + P.img) + '" hidden></label>' + (img ? btn("إزالة الصورة", "spImg", "ghost", P.img + "|") : "") + '</div>';
  }
  if (st !== "black" && st !== "prayer") h += rangeIn("درجة الإضاءة", P.light, 0, st === "image" ? 1 : 0.5, 0.01, "%", st === "image" ? "100% الصورة بكامل وضوحها، والأقل أغمق وأريح للمصلين" : "0% أسود تماماً. ارفعها قليلاً حتى لا تكون الشاشة مطفأة دون أن تزعج المصلين");
  return h;
}
function autoSleepText(k){ return k === "sunrise" ? "الإخفاء الحالي: ضحى: من بعد الشروق بـ" + S.hideSunrise + " دقيقة حتى قبل الظهر بـ" + S.wakeDhuhr + " دقيقة، تعود الشاشة الساعة …"
  : "الإخفاء الحالي: ليلاً: من بعد العشاء بـ" + S.hideIsha + " دقيقة حتى قبل الفجر بـ" + S.wakeFajr + " دقيقة، تعود الشاشة الساعة …"; }
function sleepText(){
  var d = A.dayTimes ? null : null, p = [];
  if (S.sleepIsha) p.push("ليلاً: من بعد العشاء بـ" + S.hideIsha + " دقيقة حتى قبل الفجر بـ" + S.wakeFajr + " دقيقة");
  if (S.sleepSunrise) p.push("ضحى: من بعد الشروق بـ" + S.hideSunrise + " دقيقة حتى قبل الظهر بـ" + S.wakeDhuhr + " دقيقة");
  return p.length ? "الإخفاء الحالي: " + p.join("، و") + "." : "الإخفاء متوقف: الشاشة تعمل طوال اليوم.";
}
function awakeText(){
  var w = window.STAY_AWAKE || {};
  return w.method === "wakelock" ? "يعمل ✓ (قفل الشاشة من المتصفح)" : w.method === "video" ? "يعمل ✓ (طريقة بديلة للمتصفحات القديمة)" :
    w.method === "pending" ? "يبدأ عند أول لمسة أو ضغطة زر" : "غير مدعوم في هذا المتصفح. استخدم Chrome أو Fully Kiosk مع خيار Keep Screen On";
}

R.sounds = function(){
  return card("ضبط صوت الأذان والإقامة",
    sel("صوت الأذان", "snd.azan", [["none","بدون صوت"],["short","صوت أذان قصير"],["long","الأذان كاملاً"],["custom","ملف MP3 من الجهاز"]]) +
    (S.snd.azan === "custom" ? '<div class="fld"><span><b>ملف الأذان</b>' + (S.snd.azanId ? "<small>تم اختيار ملف</small>" : "") + '</span><input type="file" accept="audio/*" data-up="azan"></div>' : "") +
    sel("صوت الإقامة", "snd.iqama", [["none","بدون صوت"],["short","صوت إقامة قصير"],["custom","ملف MP3 من الجهاز"]]) +
    (S.snd.iqama === "custom" ? '<div class="fld"><span><b>ملف الإقامة</b>' + (S.snd.iqamaId ? "<small>تم اختيار ملف</small>" : "") + '</span><input type="file" accept="audio/*" data-up="iqama"></div>' : "") +
    tog("صوت تنبيه قبل الإقامة بدقيقة", "snd.beep") +
    numIn("مستوى الصوت", "snd.vol", 0, 1, 0.1) +
    '<div class="row-end">' + btn("تجربة الأذان", "test", "ghost", "azan") + btn("تجربة الإقامة", "test", "ghost", "iqama") + btn("تجربة التنبيه", "test", "ghost", "beep") + '</div>',
    "تمنع المتصفحات تشغيل الصوت قبل أول لمسة. بعد فتح الشاشة اضغط زر «تفعيل الصوت» مرة واحدة.");
};

R.adhkar = function(){
  var Z = S.zk, PR = [["fajr","الفجر"],["dhuhr","الظهر والجمعة"],["asr","العصر"],["maghrib","المغرب"],["isha","العشاء"]];
  var kindCard = function(kind, title, onLabel, hint){
    var n = (A.zkList ? A.zkList(kind) : []).length;
    return card(title, tog(onLabel, "zk." + kind, hint) +
      (Z[kind] ? (kind === "after" ? '<div class="fld col"><span><b>الصلوات التي تظهر بعدها</b></span><div class="days">' + PR.map(function(p){ return '<label><input type="checkbox" data-p="zk.afterOn.' + p[0] + '" data-t="bool"' + (!Z.afterOn || Z.afterOn[p[0]] !== false ? " checked" : "") + '> ' + p[1] + '</label>'; }).join("") + '</div></div>' : "") +
        numIn("أقصى مدة", "zk." + kind + "Min", 1, 60, 1, "دقيقة", "تنتهي الأذكار عند انتهاء القائمة أو هذه المدة، أيهما أسبق") +
        (Z.autoSec ? "" : numIn("مدة كل ذكر", "zk." + kind + "Sec", 5, 120, 5, "ثانية")) +
        (Z.noRepeat ? "" : numIn("عدد مرات عرض القائمة", "zk." + kind + "Rounds", 1, 5, 1, "مرة", "في كل صلاة")) +
        '<p class="note">عدد الأذكار في القائمة: ' + n + ' · تعديلها من محرر النصوص</p>' : ""));
  };
  return kindCard("after", "أذكار ما بعد الصلاة", "تفعيل أذكار ما بعد الصلاة", "تظهر بعد انتهاء الصلاة") +
    kindCard("morning", "أذكار الصباح", "تفعيل أذكار الصباح", "تظهر بعد صلاة الفجر وأذكارها") +
    kindCard("evening", "أذكار المساء", "تفعيل أذكار المساء", "تظهر بعد صلاة العصر وأذكارها") +
    card("طريقة العرض",
      tog("مدة كل ذكر حسب طول النص", "zk.autoSec", "الذكر القصير يظهر ثواني قليلة، والطويل وقتاً أطول للقراءة") +
      tog("عدم تكرار الذكر في نفس الصلاة", "zk.noRepeat", "يظهر كل ذكر مرة واحدة فقط في كل صلاة") +
      tog("الإكمال من حيث توقفت في الصلاة السابقة", "zk.rotate", "إذا كانت القائمة أطول من المدة، تبدأ الصلاة التالية بالأذكار التي لم تظهر، فلا تتكرر نفس الأذكار في كل صلاة")) +
  card("دعاء أسفل الشاشة", tog("إظهار الدعاء أسفل الشاشة", "fixedOn", "يظهر فوق شريط الإعلانات") + txt("نص الدعاء", "fixedZekr", "اتركه فارغاً لعرض: اللهم اغفر لي وارحمني واهدني وعافني وارزقني", true) +
    '<div class="row-end">' + btn("استعادة الدعاء الافتراضي", "fzDef", "ghost") + '</div>');
};

function schedText(x){
  var p = [];
  if (x.d1 || x.d2) p.push((x.d1 ? "من " + x.d1 : "") + (x.d2 ? " إلى " + x.d2 : ""));
  if (x.wd && x.wd.length) p.push("أيام: " + x.wd.map(function(d){ return DAYS[d]; }).join("، "));
  if (x.t1 || x.t2) p.push("الساعة " + (x.t1 || "00:00") + " - " + (x.t2 || "24:00"));
  return p.length ? " · " + p.join(" · ") : "";
}
var newsEdit = null;
R.news = function(){
  var list = S.news.map(function(x, i){
    var sch = (x.type === "week" ? "أيام: " + (x.days || []).map(function(d){ return DAYS[d]; }).join("، ") : x.type === "date" ? "تاريخ: " + x.date : x.type === "daily" ? "يومياً" : "يظهر دائماً") + schedText(x);
    if (newsEdit === x.id) return '<li class="ed">' + newsForm(x) + '</li>';
    return '<li><div><p>' + esc(x.text) + '</p><small>' + esc(sch) + '</small></div><span>' + btn("↑", "nUp", "sm ghost", x.id) + btn("تعديل", "nEdit", "sm ghost", x.id) + btn("حذف", "nDel", "sm danger", x.id) + '</span></li>';
  }).join("");
  return card("إعلانات المسجد أسفل الشاشة",
    tog("تفعيل شريط الإعلانات", "tickerOn") + tog("تفعيل شريط النص المتحرك", "marquee", "عند إيقافه تظهر الرسائل واحدة تلو الأخرى") +
    numIn("سرعة الشريط", "speed", 40, 300, 10, "بكسل/ث") + numIn("مدة عرض الرسالة", "newsSec", 4, 60, 1, "ثانية") +
    tog("ظل خلف شريط الإعلانات", "look.newsShade", "عند إيقافه يظهر النص مباشرة فوق الخلفية بدون شريط داكن") +
    (S.look.newsShade !== false ? rangeIn("درجة الظل", "look.newsShadeOp", 0, 0.9, 0.05, "%", "0% = تلقائي بنفس ظل جدول المواقيت") : "")) +
  card("الرسائل", '<ul class="list">' + (list || '<li class="empty">لا توجد رسائل بعد</li>') + '</ul>' + (newsEdit === "new" ? '<div class="ed">' + newsForm({id:"new", text:"", type:"none", days:[], date:""}) + '</div>' : "") +
    '<div class="row-end">' + btn("إضافة رسالة", "nAdd") + (S.news.length ? btn("حذف الكل", "nClear", "danger ghost") : "") + '</div>',
    "هنا يمكنك إضافة الرسائل أو أي معلومات مفيدة لتُعرض أسفل الشاشة") + alertsCard();
};
// الرسائل العاجلة المجدولة (تأتي من لوحة المدير، ويمكن حذفها أو إيقافها هنا)
function alertsCard(){
  var L = S.alerts || [];
  return card("الرسائل العاجلة المجدولة", L.length ? '<ul class="list">' + L.map(function(x){
      return '<li><div><p><b>' + esc(x.title || "") + '</b> ' + esc(x.text || "") + '</p><small>' + esc((x.on === false ? "موقفة" : "مفعلة") + schedText(x)) + '</small></div><span>' +
        btn(x.on === false ? "تفعيل" : "إيقاف", "alTog", "sm ghost", x.id) + btn("حذف", "alDel", "sm danger", x.id) + '</span></li>'; }).join("") + '</ul>'
      : '<p class="note">لا توجد رسائل مجدولة. تُرسل من لوحة المدير ← رسالة عاجلة ← «حسب جدول».</p>',
    "تغطي الشاشة بالكامل في وقتها المحدد، ولا تظهر أثناء الصلاة.");
}
function newsForm(x){
  return '<div class="form" data-nid="' + esc(x.id) + '"><label class="fld col"><span><b>نص الرسالة</b></span><textarea rows="2" id="ntext">' + esc(x.text) + '</textarea></label>' +
    '<label class="fld"><span><b>نوع الجدولة</b></span><select id="ntype">' + [["none","بدون جدولة (يظهر دائماً)"],["daily","يومياً"],["week","أيام محددة من الأسبوع"],["date","تاريخ محدد مرة واحدة"]]
      .map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === x.type ? " selected" : "") + '>' + o[1] + '</option>'; }).join("") + '</select></label>' +
    '<div class="days" id="ndays"' + (x.type === "week" ? "" : " hidden") + '>' + DAYS.map(function(d, i){ return '<label><input type="checkbox" value="' + i + '"' + ((x.days || []).indexOf(i) >= 0 ? " checked" : "") + '>' + d + '</label>'; }).join("") + '</div>' +
    '<label class="fld" id="ndatew"' + (x.type === "date" ? "" : " hidden") + '><span><b>التاريخ</b></span><input type="date" id="ndate" value="' + esc(x.date) + '"></label>' +
    '<div class="sched"><label><span>من تاريخ</span><input type="date" id="nd1" value="' + esc(x.d1 || "") + '"></label><label><span>إلى تاريخ</span><input type="date" id="nd2" value="' + esc(x.d2 || "") + '"></label>' +
    '<label><span>من الساعة</span><input type="time" id="nt1" value="' + esc(x.t1 || "") + '"></label><label><span>إلى الساعة</span><input type="time" id="nt2" value="' + esc(x.t2 || "") + '"></label></div>' +
    '<p class="note">اترك الحقول فارغة ليظهر الإعلان دائماً. مثال: من 18:00 إلى 21:00 يظهر مساءً فقط.</p>' +
    '<div class="row-end">' + btn("حفظ الرسالة", "nSave", "", x.id) + btn("إلغاء", "nCancel", "ghost") + '</div></div>';
}

/* ===== محرر النصوص ===== */
var txTarget = "news", txSplit = "blank";
function txDefs(){
  var D = A.DEF;
  return {
    news:{label:"إعلانات الشريط", multi:true, get:function(){ return S.news.map(function(n){ return n.text; }); },
      set:function(arr){ var old = {}; S.news.forEach(function(n){ old[n.text] = n; });
        S.news = arr.map(function(t){ return old[t] || {id:A.uid(), text:t, type:"none", days:[], date:""}; }); }, def:D.news.map(function(n){ return n.text; })},
    after:{label:"أذكار بعد الصلاة", multi:true, get:function(){ return S.texts.after.length ? S.texts.after : window.ADHKAR_AFTER; }, set:function(a){ S.texts.after = a; }, def:window.ADHKAR_AFTER},
    morning:{label:"أذكار الصباح", multi:true, get:function(){ return S.texts.morning.length ? S.texts.morning : window.ADHKAR_MORNING; }, set:function(a){ S.texts.morning = a; }, def:window.ADHKAR_MORNING},
    evening:{label:"أذكار المساء", multi:true, get:function(){ return S.texts.evening.length ? S.texts.evening : window.ADHKAR_EVENING; }, set:function(a){ S.texts.evening = a; }, def:window.ADHKAR_EVENING},
    boards:{label:"لوحات العرض (السطر الأول عنوان)", multi:true, get:function(){ return S.boards.items.map(function(b){ return (b.title || "") + (b.body ? "\n" + b.body : ""); }); },
      set:function(arr){ var old = S.boards.items; S.boards.items = arr.map(function(t, i){ var p = t.split("\n"), o = old[i] || {id:A.uid(), tSize:110, bSize:64, tFont:S.look.fontText, bFont:S.look.fontText, tColor:"#EBD1A0", bColor:"#ffffff", active:true, pinned:false, img:""};
        o.title = p[0]; o.body = p.slice(1).join("\n"); return o; }); }, def:[]},
    fixed:{label:"دعاء أسفل الشاشة", multi:false, get:function(){ return S.fixedZekr; }, set:function(v){ S.fixedZekr = v; }, def:D.fixedZekr},
    hadith:{label:"الحديث قبل الإقامة", multi:false, get:function(){ return S.hadithText; }, set:function(v){ S.hadithText = v; }, def:D.hadithText},
    dua:{label:"دعاء ما بعد الأذان", multi:false, get:function(){ return S.texts.dua || window.DUA_AFTER_AZAN; }, set:function(v){ S.texts.dua = v === window.DUA_AFTER_AZAN ? "" : v; }, def:window.DUA_AFTER_AZAN},
    notify:{label:"رسالة التنبيه قبل الإقامة", multi:false, get:function(){ return S.notifyMsg; }, set:function(v){ S.notifyMsg = v; }, def:D.notifyMsg},
    mosque:{label:"اسم المسجد", multi:false, get:function(){ return S.mosque; }, set:function(v){ S.mosque = v; }, def:D.mosque}
  };
}
function txSplitText(t){
  t = String(t || "").replace(/\r\n?/g, "\n").replace(/^﻿/, "").trim();
  if (!t) return [];
  var parts = txSplit === "line" ? t.split("\n") : t.split(/\n[ \t]*\n+/);
  return parts.map(function(x){ return x.trim(); }).filter(Boolean);
}
function txJoin(arr){ return arr.join(txSplit === "line" ? "\n" : "\n\n"); }
R.texts = function(){
  var T = txDefs(), d = T[txTarget], val = d.multi ? txJoin(d.get()) : d.get();
  var ins = ["ﷺ","﴿ ﴾","« »","۞","،"].map(function(c){ return '<button type="button" class="btn sm ghost" data-act="tIns" data-x="' + c + '">' + c + '</button>'; }).join("");
  return card("محرر النصوص",
    '<label class="fld" for="txt"><span><b>النص المراد تحريره</b></span><select id="txt">' + Object.keys(T).map(function(k){ return '<option value="' + k + '"' + (k === txTarget ? " selected" : "") + '>' + esc(T[k].label) + '</option>'; }).join("") + '</select></label>' +
    (d.multi ? '<label class="fld" for="txs"><span><b>الفصل بين العناصر</b><small>يُطبق على المحرر والاستيراد</small></span><select id="txs"><option value="blank"' + (txSplit === "blank" ? " selected" : "") + '>سطر فارغ بين كل عنصر</option><option value="line"' + (txSplit === "line" ? " selected" : "") + '>كل سطر عنصر مستقل</option></select></label>' : "") +
    '<div class="tbar">' + ins + '<span class="tcount" id="tcount"></span></div>' +
    '<textarea id="tarea" class="tarea" rows="' + (d.multi ? 16 : 5) + '" dir="rtl" spellcheck="false">' + esc(val) + '</textarea>' +
    '<div class="row-end">' + btn("حفظ النص", "tSave") + btn("نسخ", "tCopy", "ghost") + btn("استعادة الافتراضي", "tDef", "ghost") + '</div>',
    d.multi ? "اكتب كل عنصر منفصلاً. يمكن أن يمتد العنصر الواحد على عدة أسطر عند اختيار «سطر فارغ بين كل عنصر»." : "") +
  card("استيراد من الكمبيوتر",
    '<label class="fld" for="tmode"><span><b>طريقة الاستيراد</b></span><select id="tmode"><option value="replace">استبدال النص الحالي</option><option value="append">إضافة إلى النص الحالي</option></select></label>' +
    '<div class="drop" id="tdrop"><b>اسحب الملف إلى هنا</b><span>أو</span><label class="btn">اختر ملفاً من الجهاز<input type="file" id="tfile" accept=".txt,.text,.md,.csv,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden></label>' +
    '<small>ملفات نصية (.txt) أو مستندات Word (.docx). يُعرض النص في المحرر لمراجعته قبل الحفظ.</small></div>');
};
function txCount(){ var a = $("#tarea"), c = $("#tcount"); if (!a || !c) return; var d = txDefs()[txTarget];
  c.textContent = d.multi ? txSplitText(a.value).length + " عنصر" : a.value.trim().length + " حرف"; }
function decodeText(buf){
  var u = new Uint8Array(buf);
  try { return new TextDecoder("utf-8", {fatal:true}).decode(u); }
  catch(e){ try { return new TextDecoder("windows-1256").decode(u); } catch(e2){ return new TextDecoder().decode(u); } }
}
function readDocx(buf){
  var dv = new DataView(buf), u = new Uint8Array(buf), e = -1;
  for (var i = u.length - 22; i >= Math.max(0, u.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) return Promise.reject(new Error("zip"));
  var n = dv.getUint16(e + 10, true), p = dv.getUint32(e + 16, true), td = new TextDecoder();
  for (var k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    var method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    var name = td.decode(u.subarray(p + 46, p + 46 + nl));
    if (name === "word/document.xml") {
      var start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), data = u.slice(start, start + csize);
      var xmlP = method === 0 ? Promise.resolve(td.decode(data)) :
        new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
      return xmlP.then(function(xml){
        return xml.split(/<\/w:p>/).map(function(par){
          return par.replace(/<w:tab\/>/g, " ").replace(/<w:br[^>]*\/>/g, "\n").replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>|<[^>]+>/g, function(m, t){ return t || ""; });
        }).map(function(t){ return t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&"); }).join("\n").replace(/\n{3,}/g, "\n\n");
      });
    }
    p += 46 + nl + xl + cl;
  }
  return Promise.reject(new Error("docx"));
}
/* ===== المحرر الخاص: يفتح عند الكتابة في أي حقل نصي ===== */
var ED = {el:null};
var ED_SYM = ["ﷺ","﷽","﴿ ﴾","« »","۞","،","؛","؟","ـ"];
var ED_HAR = [["َ","فتحة"],["ُ","ضمة"],["ِ","كسرة"],["ّ","شدة"],["ْ","سكون"],["ً","تنوين فتح"],["ٌ","تنوين ضم"],["ٍ","تنوين كسر"],["ٰ","ألف خنجرية"]];
function edEligible(el){
  if (!el || el.dataset.noed !== undefined || el.readOnly || el.disabled) return false;
  if (el.closest("#ed")) return false;
  if (el.tagName === "TEXTAREA") return el.id !== "bk" && el.id !== "tarea" && el.getAttribute("dir") !== "ltr";
  return el.tagName === "INPUT" && el.type === "text" && el.getAttribute("dir") !== "ltr" && !/server|code/i.test(el.dataset.p || "");
}
function edLabel(el){ var f = el.closest(".fld,.fcol,label"), b = f && f.querySelector("b"); return b ? b.textContent : (el.placeholder || el.getAttribute("aria-label") || "النص"); }
function edOpen(el){
  ED.el = el; var multi = el.tagName === "TEXTAREA";
  var ed = $("#ed"); if (!ed) { ed = document.createElement("div"); ed.id = "ed"; ed.setAttribute("role", "dialog"); ed.setAttribute("aria-modal", "true"); panel.appendChild(ed); }
  var font = /zekr|fixed|hadith|dua|texts|ADHKAR/i.test(el.dataset.p || el.id || "") ? S.look.fontZekr : S.look.fontText;
  ed.innerHTML = '<div class="edbox"><div class="edh"><b>' + esc(edLabel(el)) + '</b><span class="edc" id="edc"></span><button type="button" class="btn ghost sm" data-ed="x">إغلاق</button></div>' +
    '<div class="edbody"><div class="edmain"><div class="edtools"><span class="edg">' + ED_SYM.map(function(c){ return '<button type="button" data-ins="' + c + '">' + c + '</button>'; }).join("") + '</span>' +
    '<span class="edg har">' + ED_HAR.map(function(c){ return '<button type="button" data-ins="' + c[0] + '" title="' + c[1] + '">ـ' + c[0] + '</button>'; }).join("") + '</span>' +
    '<span class="edg"><button type="button" data-ed="strip" title="إزالة التشكيل">إزالة التشكيل</button><button type="button" data-ed="clear">مسح</button>' +
    '<label class="edfile">استيراد ملف<input type="file" accept=".txt,.docx,text/plain" hidden id="edf"></label></span></div>' +
    '<textarea id="edt" dir="rtl" spellcheck="false" rows="' + (multi ? 9 : 3) + '" style="font-family:\'' + esc(font) + '\',Amiri,serif"></textarea>' +
    '<div class="edpv"><small>معاينة على الشاشة</small><div id="edp" style="font-family:\'' + esc(font) + '\',Amiri,serif"></div></div></div><div class="edside"></div></div>' +
    '<div class="edf"><small>' + (multi ? "Enter لسطر جديد · Ctrl+Enter للحفظ" : "سطر واحد · Enter للحفظ") + '</small><button type="button" class="btn ghost" data-ed="x">إلغاء</button><button type="button" class="btn" data-ed="ok">حفظ</button></div></div>';
  var t = $("#edt"); t.value = el.value; ed.hidden = false; ed.dataset.multi = multi ? "1" : "";
  if (vkOn()) { t.setAttribute("inputmode", "none"); vkOpen(t, $(".edside", ed), false); }
  var upd = function(){ $("#edp").textContent = t.value || " "; var w = t.value.trim() ? t.value.trim().split(/\s+/).length : 0; $("#edc").textContent = t.value.length + " حرف · " + w + " كلمة"; };
  t.addEventListener("input", upd); upd(); setTimeout(function(){ t.focus(); t.setSelectionRange(t.value.length, t.value.length); }, 30);
  t.addEventListener("keydown", function(e){
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); edClose(false); }
    else if (e.key === "Enter" && (e.ctrlKey || e.metaKey || !multi)) { e.preventDefault(); edClose(true); }
  });
  $("#edf").addEventListener("change", function(){ var f = this.files[0]; if (!f) return;
    f.arrayBuffer().then(function(buf){ return /\.docx$/i.test(f.name) ? readDocx(buf) : decodeText(buf); }).then(function(txt){ t.setRangeText(txt.trim(), t.selectionStart, t.selectionEnd, "end"); upd(); t.focus(); })
      .catch(function(){ toast("تعذرت قراءة الملف"); }); this.value = ""; });
  ed.onclick = function(e){ var b = e.target.closest("button"); if (!b) { if (e.target === ed) edClose(false); return; }
    if (b.dataset.ins) { var c = b.dataset.ins, s0 = t.selectionStart, e0 = t.selectionEnd;
      if (c.indexOf(" ") > 0 && s0 !== e0) c = c.split(" ")[0] + t.value.slice(s0, e0) + c.split(" ")[1]; else c = c.replace(" ", "");
      t.setRangeText(c, s0, e0, "end"); upd(); t.focus(); }
    if (b.dataset.ed === "strip") { t.value = t.value.replace(/[ً-ٰٟۖ-ۭ]/g, ""); upd(); t.focus(); }
    if (b.dataset.ed === "clear") { t.value = ""; upd(); t.focus(); }
    if (b.dataset.ed === "x") edClose(false);
    if (b.dataset.ed === "ok") edClose(true); };
}
/* ===== لوحة المفاتيح الخاصة بالتطبيق =====
   بديل لوحة مفاتيح النظام (التي تظهر غير مدوّرة وتغطي نصف الشاشة على التلفاز): عربي، إنجليزي، أرقام ورموز.
   تدور مع الشاشة، وتعمل بالريموت والفأرة واللمس، وتكتب في أي حقل نصي في الإعدادات وفي المحرر الخاص */
var VK = {el:null, t:null, lang:"ar", mode:"", shift:false, docked:false};
// نفس ترتيب لوحة Gboard العربية والإنجليزية (من اليسار إلى اليمين كما تظهر على الشاشة)
var VK_L = {
  ar:[["١","٢","٣","٤","٥","٦","٧","٨","٩","٠"],["ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج"],["ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط"],["ذ","ء","ؤ","ر","ى","ة","و","ز","ظ","د"]],
  en:[["1","2","3","4","5","6","7","8","9","0"],["q","w","e","r","t","y","u","i","o","p"],["a","s","d","f","g","h","j","k","l"],["z","x","c","v","b","n","m"]],
  sym:[["1","2","3","4","5","6","7","8","9","0"],["@","#","$","_","&","-","+","(",")","/"],["*","\"","'",":","؛","!","؟","?","=","%"]]
};
// الضغط المطوّل (أو تكرار زر OK في الريموت) يعرض الحروف البديلة
var VK_ALT = {"ا":["أ","إ","آ","ٱ"],"ى":["ئ"],"ي":["ئ"],"و":["ؤ"],"ه":["ة"],".":["َ","ُ","ِ","ّ","ْ","ً","ٌ","ٍ"],"،":["؛","؟","!",":"],",":[";","?","!",":"],"e":["é","è"],"a":["à","á"]};
function vkOn(){ var v = vkOn0(); imeSync(v); return v; }
function vkOn0(){
  var m = S.vkb || "auto"; if (m === "on") return true; if (m === "off") return false;
  var AN = window.RawayieAndroid, rot = +document.documentElement.getAttribute("data-rot") || 0;
  if (rot) return true; // الشاشة مدوّرة: لوحة النظام تظهر بالعرض فتغطيها
  if (AN) return true; // تطبيق أندرويد (تلفاز أو جوال): لوحة التطبيق والمحرر الخاص في كل الحقول ومنها البحث
  return false;
}
// تطبيق أندرويد: عند تفعيل لوحة التطبيق تُمنع لوحة مفاتيح النظام من الظهور معها
var imeLast = null;
function imeSync(v){
  var AN = window.RawayieAndroid; if (!AN || v === imeLast) return; imeLast = v;
  try { if (AN.setImeBlock) AN.setImeBlock(!!v); } catch(e){}
}
function imeHide(){ var AN = window.RawayieAndroid; try { if (AN && AN.hideKeyboard) AN.hideKeyboard(); } catch(e){} }
setTimeout(function(){ try { vkOn(); } catch(e){} }, 0);
document.addEventListener("change", function(){ setTimeout(function(){ try { vkOn(); } catch(e){} }, 50); }, true);
function vkTyping(el){
  if (!el || el.disabled || el.readOnly) return false;
  if (el.tagName === "TEXTAREA") return true;
  return el.tagName === "INPUT" && /^(text|search|url|email|number|password|tel|)$/.test(el.type || "") && el.id !== "actcode" && el.id !== "liccode";
}
function vkHTML(){
  var sym = VK.mode === "sym", ar = VK.lang === "ar" && !sym, L = sym ? VK_L.sym : VK_L[VK.lang], up = VK.lang === "en" && VK.shift && !sym;
  var k = function(c, cls, lab, w){ var alt = VK_ALT[c] && /^[اى.]$/.test(c) ? '<sup>' + esc(VK_ALT[c][0]) + '</sup>' : "";
    return '<button type="button" class="vk' + (cls ? " " + cls : "") + '" data-vk="' + esc(c) + '"' + (w ? ' style="flex:' + w + '"' : "") + '>' + (lab || esc(c)) + (lab ? "" : alt) + '</button>'; };
  var rows = L.map(function(r, i){
    var last = i === L.length - 1, keys = r.map(function(c){ return k(up ? c.toUpperCase() : c); }).join("");
    if (last && !ar && !sym) keys = k("{shift}", "fn" + (VK.shift ? " on" : ""), "⇧", 1.5) + keys + k("{bs}", "fn", "⌫", 1.5);
    else if (last) keys += k("{bs}", "fn", "⌫", 1.5);
    return '<div class="vkr' + (i === 0 ? " num" : "") + '">' + keys + '</div>'; }).join("");
  // الصف السفلي مثل Gboard: رموز، تبديل اللغة، فاصلة، مسافة باسم اللغة، نقطة، إدخال
  var enter = VK.t && VK.t.tagName === "TEXTAREA" ? "{nl}" : "{done}";
  return '<div class="vkb" role="group" aria-label="لوحة المفاتيح">' + rows +
    '<div class="vkr">' + k("{mode}", "fn", sym ? (VK.lang === "ar" ? "أ ب ت" : "ABC") : (ar ? "!#١" : "?123"), 1.5) + k("{lang}", "fn", "🌐", 1.1) + k(ar ? "،" : ",") +
      k(" ", "sp", ar ? "العربية" : "English", 4.6) + k(".") + k(enter, "fn ent", "↵", 1.5) + '</div>' +
    '<div class="vkr vkbar"><button type="button" class="vk fn hide" data-vk="{done}" aria-label="تم">⌨ تم</button><span class="vkhint">اضغط مطولاً للحروف البديلة (أ إ آ ئ والتشكيل)</span></div></div>';
}
function vkRender(){ vkAltClose(); if (VK.el) { var f = document.activeElement, fk = f && f.dataset ? f.dataset.vk : null; VK.el.innerHTML = vkHTML(); if (fk != null) { var nb = VK.el.querySelector('[data-vk="' + (VK.shift && fk.length === 1 ? fk : fk).replace(/"/g, '\\"') + '"]'); if (nb) nb.focus(); } } }
function vkOpen(t, host, docked){
  if (!vkOn() || !t) return false;
  if (VK.t && VK.t !== t && VK.docked) vkCommit();
  VK.t = t; VK.docked = !!docked;
  try { t.setAttribute("inputmode", "none"); } catch(e){}
  imeHide();
  VK.lang = t.getAttribute("dir") === "ltr" || /url|email|number|password|tel/.test(t.type) ? "en" : "ar";
  VK.mode = t.type === "number" || t.type === "tel" ? "sym" : ""; VK.shift = false;
  if (!VK.el) { VK.el = document.createElement("div"); VK.el.className = "vkwrap";
    VK.el.addEventListener("mousedown", function(e){ if (e.target.closest("[data-vk]")) e.preventDefault(); }); // الضغط بالفأرة لا يُخرج المؤشر من الحقل
    VK.el.addEventListener("click", vkClick); vkLpBind(VK.el); }
  var bef = host.querySelector(".edf"); if (bef) host.insertBefore(VK.el, bef); else if (VK.el.parentNode !== host) host.appendChild(VK.el);
  VK.el.classList.toggle("dock", !!docked); VK.el.hidden = false; vkRender();
  if (docked) { var sb = $(".sbody", panel); if (sb) { sb.style.paddingBottom = (VK.el.offsetHeight + 30) + "px"; } try { t.scrollIntoView({block:"center"}); } catch(e){} }
  return true;
}
function vkClose(){ if (!VK.el) return; if (VK.docked) vkCommit(); VK.el.hidden = true; var sb = $(".sbody", panel); if (sb) sb.style.paddingBottom = ""; VK.t = null; }
function vkCommit(){ var t = VK.t; if (t && document.body.contains(t)) t.dispatchEvent(new Event("change", {bubbles:true})); }
function vkIns(txt){
  var t = VK.t; if (!t) return;
  var a = t.selectionStart, b = t.selectionEnd; if (a == null || t.type === "number" || t.type === "email") { t.value = t.value + txt; }
  else { t.value = t.value.slice(0, a) + txt + t.value.slice(b); try { t.setSelectionRange(a + txt.length, a + txt.length); } catch(e){} }
  t.dispatchEvent(new Event("input", {bubbles:true}));
}
/* الحروف البديلة: نافذة صغيرة فوق الزر */
var vkLp = null, vkLpFired = false;
function vkAltOpen(b){
  var c = b.dataset.vk, alts = VK_ALT[c]; if (!alts || !VK.el) return false;
  vkAltClose(); var box = document.createElement("div"); box.className = "vkalt";
  box.innerHTML = [c].concat(alts).map(function(a){ return '<button type="button" class="vk" data-vk="' + esc(a) + '">' + esc(a) + '</button>'; }).join("");
  VK.el.appendChild(box);
  // موضع النافذة داخل لوحة المفاتيح (بإحداثياتها المحلية، فتبقى صحيحة مع الشاشة المدوّرة)
  var off = 0, n = b; while (n && n !== VK.el) { off += n.offsetTop; n = n.offsetParent; }
  var offl = 0; n = b; while (n && n !== VK.el) { offl += n.offsetLeft; n = n.offsetParent; }
  box.style.top = Math.max(0, off - b.offsetHeight - 8) + "px"; box.style.left = Math.max(0, offl - 10) + "px";
  var f = box.querySelectorAll("button")[1]; if (f) f.focus();
  return true;
}
function vkAltClose(){ var a = VK.el && VK.el.querySelector(".vkalt"); if (a) a.parentNode.removeChild(a); }
function vkLpBind(el){
  el.addEventListener("pointerdown", function(e){ var b = e.target.closest("[data-vk]"); vkLpFired = false; clearTimeout(vkLp); if (!b || b.closest(".vkalt") || !VK_ALT[b.dataset.vk]) return;
    vkLp = setTimeout(function(){ vkLpFired = vkAltOpen(b); }, 450); });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function(t){ el.addEventListener(t, function(){ clearTimeout(vkLp); }); });
  // الريموت: الضغط المطوّل على OK يكرر الزر، فتفتح الحروف البديلة
  el.addEventListener("keydown", function(e){ var b = e.target.closest ? e.target.closest("[data-vk]") : null; if (!b) return;
    if ((e.key === "Enter" || e.key === " ") && e.repeat && VK_ALT[b.dataset.vk] && !b.closest(".vkalt")) { e.preventDefault();
      if (!el.querySelector(".vkalt")) { var t = VK.t, p = t && t.selectionStart; // الحرف الذي كُتب بأول ضغطة يُستبدل بالبديل
        if (t && p > 0 && t.value.charAt(p - 1) === b.dataset.vk) { t.value = t.value.slice(0, p - 1) + t.value.slice(p); try { t.setSelectionRange(p - 1, p - 1); } catch(x){} t.dispatchEvent(new Event("input", {bubbles:true})); }
        vkAltOpen(b); } }
    if (e.key === "Escape" && el.querySelector(".vkalt")) { e.preventDefault(); e.stopPropagation(); vkAltClose(); } });
}
function vkClick(e){
  if (vkLpFired) { vkLpFired = false; e.stopPropagation(); return; } // انتهى الضغط المطوّل بفتح البدائل
  var b = e.target.closest("[data-vk]"); if (!b || !VK.t) return; e.stopPropagation();
  var c = b.dataset.vk, t = VK.t;
  if (c === "{bs}") { var a = t.selectionStart, z = t.selectionEnd;
    if (a == null || t.type === "number" || t.type === "email") t.value = t.value.slice(0, -1);
    else if (a !== z) { t.value = t.value.slice(0, a) + t.value.slice(z); t.setSelectionRange(a, a); }
    else if (a > 0) { t.value = t.value.slice(0, a - 1) + t.value.slice(a); t.setSelectionRange(a - 1, a - 1); }
    t.dispatchEvent(new Event("input", {bubbles:true})); return; }
  if (c === "{shift}") { VK.shift = !VK.shift; vkRender(); return; }
  if (c === "{lang}") { VK.lang = VK.lang === "ar" ? "en" : "ar"; VK.mode = ""; VK.shift = false; vkRender(); return; }
  if (c === "{mode}") { VK.mode = VK.mode === "sym" ? "" : "sym"; vkRender(); return; }
  if (c === "{left}" || c === "{right}") { // السهم حسب اتجاه الكتابة الظاهر
    var p = t.selectionStart; if (p == null) return; var rtl = VK.lang === "ar" && VK.mode !== "sym", d = c === "{left}" ? (rtl ? 1 : -1) : (rtl ? -1 : 1);
    p = Math.max(0, Math.min(t.value.length, p + d)); try { t.setSelectionRange(p, p); } catch(x){} return; }
  if (c === "{clear}") { t.value = ""; t.dispatchEvent(new Event("input", {bubbles:true})); return; }
  if (c === "{nl}") { if (t.tagName === "TEXTAREA") vkIns("\n"); return; }
  if (c === "{done}") { if (ED.el && $("#ed") && !$("#ed").hidden && t.id === "edt") { edClose(true); return; } var tt = t; vkClose(); try { tt.focus({preventScroll:true}); } catch(x){} return; }
  if (b.closest(".vkalt")) { vkAltClose(); }
  // حقول الأرقام تحتاج أرقاماً إنجليزية
  if (/^[٠-٩]$/.test(c) && (t.type === "number" || t.getAttribute("dir") === "ltr")) c = String("٠١٢٣٤٥٦٧٨٩".indexOf(c));
  vkIns(c); if (VK.shift) { VK.shift = false; vkRender(); }
}

/* ===== منتقيات التطبيق: القوائم المنسدلة والألوان والوقت والتاريخ =====
   نوافذ النظام (قائمة الاختيار، منتقي اللون والوقت) تظهر بالاتجاه الأصلي للجهاز ولا تدور مع الشاشة،
   فيعرض التطبيق بدلها نوافذه الخاصة داخل الإعدادات: تدور مع الشاشة وتعمل بالريموت والفأرة واللمس */
var PK = {el:null, t:null};
function pkOn(){ return vkOn(); }
function pkTarget(el){
  if (!el || !el.closest) return null;
  var t = el.closest("select,input[type=color],input[type=time],input[type=date]");
  if (!t || t.disabled || t.closest(".pkov")) return null;
  return t;
}
function pkLabel(t){ var f = t.closest(".fld,.fcol,label"), b = f && f.querySelector("b"); return b ? b.textContent : (t.getAttribute("aria-label") || ""); }
function pkClose(){ if (PK.el) { PK.el.hidden = true; PK.el.innerHTML = ""; } var t = PK.t; PK.t = null; if (t) try { t.focus({preventScroll:true}); } catch(e){} }
function pkSet(v){ var t = PK.t; if (!t) return; t.value = v; t.dispatchEvent(new Event("input", {bubbles:true})); t.dispatchEvent(new Event("change", {bubbles:true})); }
function pkPal(){
  var out = [], hs = [0, 15, 30, 45, 60, 90, 140, 170, 195, 210, 230, 260, 285, 320];
  [[.85, .25], [.75, .4], [.7, .55], [.6, .72]].forEach(function(sl){ hs.forEach(function(h){ out.push(A.hsl ? A.hsl(h, sl[0], sl[1]) : "hsl(" + h + "," + sl[0]*100 + "%," + sl[1]*100 + "%)"); }); });
  return out;
}
function hsl2hex(h, s, l){ var c = (1 - Math.abs(2*l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c/2, r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  var hx = function(v){ v = Math.round((v + m) * 255).toString(16); return v.length < 2 ? "0" + v : v; }; return "#" + hx(r) + hx(g) + hx(b); }
function pkOpen(t){
  PK.t = t;
  if (!PK.el) { PK.el = document.createElement("div"); PK.el.className = "pkov"; PK.el.setAttribute("role", "dialog");
    PK.el.addEventListener("click", function(e){ if (e.target === PK.el) { pkClose(); return; } var b = e.target.closest("[data-pk]"); if (!b) return; e.stopPropagation(); pkAct(b.dataset.pk, b.dataset.v); }); }
  var host = $("#ed") && !$("#ed").hidden ? $("#ed") : panel; if (PK.el.parentNode !== host) host.appendChild(PK.el);
  var tag = t.tagName.toLowerCase(), ty = (t.type || "").toLowerCase(), h = '<div class="pkbox"><div class="pkh"><b>' + esc(pkLabel(t)) + '</b><button type="button" class="btn ghost sm" data-pk="x">إغلاق</button></div>';
  if (tag === "select") {
    h += '<div class="pklist">' + Array.prototype.map.call(t.children, function(n){
      var one = function(o){ return '<button type="button" class="pkopt' + (o.value === t.value ? " on" : "") + '" data-pk="opt" data-v="' + esc(o.value) + '"' + (o.disabled ? " disabled" : "") + '>' + esc(o.textContent) + '</button>'; };
      return n.tagName === "OPTGROUP" ? '<div class="pkgrp">' + esc(n.label) + '</div>' + Array.prototype.map.call(n.children, one).join("") : one(n);
    }).join("") + '</div>';
  } else if (ty === "color") {
    var cols = [];
    [[.9, .3], [.85, .45], [.75, .6], [.65, .75]].forEach(function(sl){ [0, 15, 30, 45, 55, 90, 140, 170, 190, 205, 225, 260, 285, 320].forEach(function(hh){ cols.push(hsl2hex(hh, sl[0], sl[1])); }); });
    cols = cols.concat(["#ffffff", "#e6e6e6", "#bdbdbd", "#8a8a8a", "#5c5c5c", "#333333", "#1a1a1a", "#000000", "#EBD1A0", "#E7B65B", "#C9A24A", "#1F5A8A", "#0E6B5C", "#7A1E2C"]);
    h += '<div class="pkcur"><span style="background:' + esc(t.value) + '"></span><b dir="ltr">' + esc(t.value) + '</b></div><div class="pkcols">' +
      cols.map(function(c){ return '<button type="button" class="pkc' + (c.toLowerCase() === String(t.value).toLowerCase() ? " on" : "") + '" data-pk="col" data-v="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>'; }).join("") + '</div>';
  } else if (ty === "time") {
    var tv = (t.value || "00:00").split(":"); PK.h = +tv[0] || 0; PK.m = +tv[1] || 0;
    h += '<div class="pktime" dir="ltr"><div class="pkcol"><button type="button" class="pkst" data-pk="h" data-v="1">▲</button><b id="pkh"></b><button type="button" class="pkst" data-pk="h" data-v="-1">▼</button></div><b class="pksep">:</b>' +
      '<div class="pkcol"><button type="button" class="pkst" data-pk="m" data-v="1">▲</button><b id="pkm"></b><button type="button" class="pkst" data-pk="m" data-v="-1">▼</button></div>' +
      '<div class="pkcol sm"><button type="button" class="pkst" data-pk="m" data-v="10">+10</button><button type="button" class="pkst" data-pk="m" data-v="-10">−10</button></div></div>' +
      '<div class="row-end">' + (t.value ? '<button type="button" class="btn ghost" data-pk="clr">مسح</button>' : "") + '<button type="button" class="btn" data-pk="ok">تم</button></div>';
  } else if (ty === "date") {
    var d0 = t.value ? t.value.split("-") : null, nw = new Date(); PK.y = d0 ? +d0[0] : nw.getFullYear(); PK.mo = d0 ? +d0[1] : nw.getMonth() + 1; PK.d = d0 ? +d0[2] : nw.getDate();
    var st = function(k, lab){ return '<div class="pkcol"><small>' + lab + '</small><button type="button" class="pkst" data-pk="' + k + '" data-v="1">▲</button><b id="pk' + k + '"></b><button type="button" class="pkst" data-pk="' + k + '" data-v="-1">▼</button></div>'; };
    h += '<div class="pktime" dir="ltr">' + st("y", "السنة") + st("mo", "الشهر") + st("d", "اليوم") + '</div>' +
      '<div class="row-end">' + (t.value ? '<button type="button" class="btn ghost" data-pk="clr">مسح</button>' : "") + '<button type="button" class="btn" data-pk="ok">تم</button></div>';
  }
  PK.el.innerHTML = h + '</div>'; PK.el.hidden = false; pkShow();
  var f = PK.el.querySelector(".pkopt.on,.pkc.on,.pkst,.pkopt,.pkc"); if (f) { try { f.focus({preventScroll:true}); } catch(e){ f.focus(); } if (f.scrollIntoView) try { f.scrollIntoView({block:"center"}); } catch(e){} }
}
function two2(n){ return (n < 10 ? "0" : "") + n; }
function pkShow(){
  var g = function(id){ return document.getElementById(id); };
  if (g("pkh")) { g("pkh").textContent = two2(PK.h); g("pkm").textContent = two2(PK.m); }
  if (g("pky")) { var dim = new Date(PK.y, PK.mo, 0).getDate(); if (PK.d > dim) PK.d = dim; g("pky").textContent = PK.y; g("pkmo").textContent = two2(PK.mo); g("pkd").textContent = two2(PK.d); }
}
function pkAct(a, v){
  var t = PK.t; if (!t) return;
  if (a === "x") { pkClose(); return; }
  if (a === "opt" || a === "col") { pkSet(v); pkClose(); return; }
  if (a === "h") { PK.h = (PK.h + +v + 24) % 24; pkShow(); return; }
  if (a === "m") { var tm = PK.h * 60 + PK.m + +v; tm = (tm + 1440) % 1440; PK.h = Math.floor(tm / 60); PK.m = tm % 60; pkShow(); return; }
  if (a === "y") { PK.y += +v; pkShow(); return; }
  if (a === "mo") { PK.mo = ((PK.mo - 1 + +v + 12) % 12) + 1; pkShow(); return; }
  if (a === "d") { var dim = new Date(PK.y, PK.mo, 0).getDate(); PK.d = ((PK.d - 1 + +v + dim) % dim) + 1; pkShow(); return; }
  if (a === "clr") { pkSet(""); pkClose(); return; }
  if (a === "ok") { pkSet(t.type === "time" ? two2(PK.h) + ":" + two2(PK.m) : PK.y + "-" + two2(PK.mo) + "-" + two2(PK.d)); pkClose(); }
}
function pkBind(root){
  var stop = function(e){ if (!pkOn()) return; var t = pkTarget(e.target); if (!t) return; e.preventDefault(); e.stopPropagation(); return t; };
  root.addEventListener("mousedown", function(e){ if (stop(e)) { /* يفتح عند الضغط */ var t = pkTarget(e.target); try { t.focus({preventScroll:true}); } catch(x){} pkOpen(t); } }, true);
  root.addEventListener("touchend", function(e){ var t = stop(e); if (t) pkOpen(t); }, {capture:true, passive:false});
  root.addEventListener("click", function(e){ if (pkOn() && pkTarget(e.target)) { e.preventDefault(); e.stopPropagation(); } }, true);
  root.addEventListener("keydown", function(e){
    if (PK.el && !PK.el.hidden && e.key === "Escape") { e.preventDefault(); e.stopPropagation(); pkClose(); return; }
    if (!pkOn() || !/^(Enter| |Spacebar)$/.test(e.key)) return; var t = pkTarget(e.target); if (!t || e.target !== t) return;
    e.preventDefault(); e.stopPropagation(); pkOpen(t); }, true);
}

function edClose(save){
  var ed = $("#ed"), el = ED.el; if (!ed || !el) return;
  if (save) { var v = $("#edt").value; if (ed.dataset.multi !== "1") v = v.replace(/\s*\n+\s*/g, " ");
    el.value = v; el.dispatchEvent(new Event("input", {bubbles:true})); el.dispatchEvent(new Event("change", {bubbles:true})); }
  if (VK.t && VK.t.id === "edt") { VK.el.hidden = true; VK.t = null; }
  ed.hidden = true; ED.el = null; try { el.focus({preventScroll:true}); } catch(e){}
}

function importFile(f){
  if (!f) return;
  var isDocx = /\.docx$/i.test(f.name);
  f.arrayBuffer().then(function(buf){ return isDocx ? readDocx(buf) : decodeText(buf); }).then(function(text){
    var a = $("#tarea"), d = txDefs()[txTarget], mode = $("#tmode").value;
    if (d.multi) { var items = txSplitText(text), cur0 = mode === "append" ? txSplitText(a.value) : []; a.value = txJoin(cur0.concat(items)); toast("تم استيراد " + items.length + " عنصر. راجعها ثم اضغط حفظ النص"); }
    else { a.value = mode === "append" && a.value.trim() ? a.value.trim() + "\n" + text.trim() : text.trim(); toast("تم الاستيراد. راجع النص ثم اضغط حفظ النص"); }
    txCount();
  }).catch(function(){ toast("تعذرت قراءة الملف. احفظه بصيغة .txt أو .docx وأعد المحاولة"); });
}

/* ===== محرر الشرائح ===== */
var slEdit = null, slDraft = null;
function slDims(sl){ var P = A.orient() === "P"; // حسب اتجاه الشاشة بعد التدوير
  return sl.full ? (P ? [1080, 1920] : [1920, 1080]) : (P ? [940, 720] : [850, 720]); }
function slFrame(sl, w, cls){ var d = slDims(sl), sc = w/d[0];
  return '<div class="sfw ' + (cls || "") + '" style="width:' + w + 'px;height:' + Math.round(d[1]*sc) + 'px"><div class="sframe" data-sl="' + esc(sl.id) + '" style="width:' + d[0] + 'px;height:' + d[1] + 'px;transform:scale(' + sc + ')"></div></div>'; }
function slItems(){ return S.slides.items; }
function slById(id){ var l = slItems(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; }
R.slides = function(){
  var items = slItems().map(function(sl, i){
    if (slEdit === sl.id) return "";
    var label = sl.title || (sl.body || "").slice(0, 40) || (sl.img ? "شريحة صورة" : "شريحة فارغة");
    return '<li class="sitem' + (sl.active === false ? " off" : "") + '">' + slFrame(sl, 150) + '<div><b>' + esc(label) + '</b><small>' +
      (sl.full ? "ملء الشاشة" : "منتصف الشاشة") + (sl.sec ? " · " + sl.sec + " ثانية" : "") + (sl.active === false ? " · متوقفة" : "") + '</small></div>' +
      '<span>' + btn("↑", "sUp", "sm ghost", sl.id) + btn("تحرير", "sEdit", "sm ghost", sl.id) + btn("نسخ", "sDup", "sm ghost", sl.id) + btn("حذف", "sDel", "sm danger", sl.id) + '</span></li>';
  }).join("");
  return card("استعراض الشرائح",
    tog("تفعيل الشرائح", "slides.on") + tog("عرض الشرائح بشكل عشوائي", "slides.random") +
    numIn("وقت العرض لكل شريحة", "slides.sec", 3, 120, 1, "ثانية") + numIn("تظهر الشريحة كل", "slides.every", 10, 900, 10, "ثانية"),
    "تظهر الشريحة في منتصف الشاشة مكان الساعة، أو بملء الشاشة إذا اخترت ذلك في محرر الشريحة") +
  (slEdit ? card(slEdit === "new" ? "شريحة جديدة" : "تحرير الشريحة", slForm()) : "") +
  card("الشرائح", '<ul class="slist">' + (items || (slEdit ? "" : '<li class="empty">لا توجد شرائح بعد</li>')) + '</ul>' +
    '<div class="row-end">' + btn("إضافة شريحة نصية", "sNew") + '<label class="btn ghost">إضافة صور<input type="file" accept="image/*" multiple data-up="slide" hidden></label>' +
    (slItems().length ? btn("حذف الكل", "sClear", "danger ghost") : "") + '</div>');
};
function spIn(label, k, type, a, b, st, suf){
  var v = slDraft[k], i = id();
  if (type === "text") return '<label class="fld col" for="' + i + '"><span><b>' + esc(label) + '</b></span><input type="text" id="' + i + '" data-sp="' + k + '" value="' + esc(v) + '"></label>';
  if (type === "area") return '<label class="fld col" for="' + i + '"><span><b>' + esc(label) + '</b></span><textarea id="' + i + '" data-sp="' + k + '" rows="4" class="tarea">' + esc(v) + '</textarea></label>';
  if (type === "color") return '<label class="fld" for="' + i + '"><span><b>' + esc(label) + '</b></span><input type="color" id="' + i + '" data-sp="' + k + '" value="' + esc(v) + '"></label>';
  if (type === "bool") return '<label class="fld tog" for="' + i + '"><span><b>' + esc(label) + '</b>' + (a ? '<small>' + esc(a) + '</small>' : "") + '</span><input type="checkbox" id="' + i + '" data-sp="' + k + '"' + (v ? " checked" : "") + '><i></i></label>';
  if (type === "font") return '<label class="fld" for="' + i + '"><span><b>' + esc(label) + '</b></span><select id="' + i + '" data-sp="' + k + '"><option value="">خط الشاشة</option>' + fontOpts(v) + '</select></label>';
  if (type === "sel") return '<label class="fld" for="' + i + '"><span><b>' + esc(label) + '</b></span><select id="' + i + '" data-sp="' + k + '">' + a.map(function(o){ return '<option value="' + o[0] + '"' + (String(o[0]) === String(v) ? " selected" : "") + '>' + esc(o[1]) + '</option>'; }).join("") + '</select></label>';
  return '<label class="fld rng" for="' + i + '"><span><b>' + esc(label) + '</b></span><span class="rg"><input type="range" id="' + i + '" data-sp="' + k + '" min="' + a + '" max="' + b + '" step="' + st + '" value="' + esc(v) + '"><output>' + esc(v) + (suf || "") + '</output></span></label>';
}
function seg(label, k, opts){
  return '<div class="fld"><span><b>' + esc(label) + '</b></span><div class="seg m0">' + opts.map(function(o){
    return '<button type="button" data-act="spSeg" data-x="' + k + ":" + o[0] + '" class="' + (slDraft[k] === o[0] ? "on" : "") + '">' + esc(o[1]) + '</button>'; }).join("") + '</div></div>';
}
function slForm(){
  var d = slDraft;
  return '<div class="sedit"><div class="sprev">' + slFrame(d, 420, "big") + '<small>معاينة مباشرة</small></div><div class="sfields">' +
    '<h4>النص</h4>' + spIn("العنوان", "title", "text") + spIn("النص", "body", "area") +
    '<div class="grid2">' + spIn("خط العنوان", "tFont", "font") + spIn("خط النص", "bFont", "font") +
    spIn("حجم العنوان", "tSize", "range", 30, 220, 2, "px") + spIn("حجم النص", "bSize", "range", 20, 160, 2, "px") +
    spIn("لون العنوان", "tColor", "color") + spIn("لون النص", "bColor", "color") + '</div>' +
    '<h4>المحاذاة والمسافات</h4>' +
    seg("المحاذاة الأفقية", "align", [["right","يمين"],["center","وسط"],["left","يسار"]]) +
    seg("المحاذاة العمودية", "valign", [["top","أعلى"],["center","وسط"],["bottom","أسفل"]]) +
    spIn("تباعد الأسطر", "lineH", "range", 1, 2.8, 0.1) + spIn("المسافة بين العناصر", "gap", "range", 0, 160, 2, "px") +
    spIn("الهوامش الداخلية", "pad", "range", 0, 220, 4, "px") + spIn("استدارة الزوايا", "radius", "range", 0, 80, 2, "px") +
    '<h4>الصورة والخلفية</h4>' +
    '<div class="fld"><span><b>صورة الشريحة</b>' + (d.img ? "<small>توجد صورة</small>" : "<small>اختياري</small>") + '</span><span class="nb"><label class="btn sm ghost">' + (d.img ? "تغيير الصورة" : "اختر صورة") + '<input type="file" accept="image/*" id="spimg" hidden></label>' + (d.img ? btn("حذف الصورة", "spImgDel", "sm ghost") : "") + '</span></div>' +
    (d.img ? spIn("طريقة عرض الصورة", "imgMode", "sel", [["contain","احتواء الصورة كاملة"],["cover","ملء الإطار"],["bg","خلفية خلف النص"]]) +
      (d.imgMode !== "bg" ? spIn("ارتفاع الصورة مع النص", "imgH", "range", 15, 90, 1, "%") : "") : "") +
    spIn("لون الخلفية", "bg", "color") + spIn("شفافية الخلفية", "bgOp", "range", 0, 1, 0.05) +
    '<h4>العرض</h4>' + spIn("عرض بملء الشاشة", "full", "bool", "تغطي الشاشة كاملة بدلاً من منتصفها") +
    spIn("مدة عرض هذه الشريحة", "sec", "range", 0, 120, 1, " ث") + '<p class="note">0 = المدة العامة للشرائح</p>' +
    spIn("الشريحة مفعلة", "active", "bool") +
    '<div class="row-end">' + btn("حفظ الشريحة", "sSave") + btn("إلغاء", "sCancel", "ghost") + '</div></div></div>';
}
function slPaint(root){ $$(".sframe", root || body).forEach(function(f){
  var sl = slEdit && f.closest(".sprev") ? slDraft : slById(f.dataset.sl); if (sl) A.renderSlide(f, sl); }); }
function slPreview(){ var f = $(".sprev .sframe", body); if (!f) return;
  var w = 420, d = slDims(slDraft), sc = w/d[0]; f.style.width = d[0] + "px"; f.style.height = d[1] + "px"; f.style.transform = "scale(" + sc + ")";
  f.parentNode.style.height = Math.round(d[1]*sc) + "px"; A.renderSlide(f, slDraft); }
function onSlInput(e){
  var el = e.target;
  if (el.dataset.p && el.type === "range") { var vv = parseFloat(el.value); put(el.dataset.p, vv); A.save(); A.rebuild();
    var oo = el.parentNode.querySelector("output"); if (oo) oo.textContent = fmtR(vv, el.closest(".fld").querySelector("output").textContent.replace(/[0-9.\-]/g, "") || ""); shPreview(); if (/^look\.hi/.test(el.dataset.p)) updHiPrev(); return; }
  if (el.dataset.p && el.type === "color" && /^look\.hi/.test(el.dataset.p)) { put(el.dataset.p, el.value); A.save(); A.rebuild(); updHiPrev(); return; }
  var k = el.dataset.sp; if (!k || !slDraft) return;
  var v = el.type === "checkbox" ? el.checked : (el.type === "range" ? parseFloat(el.value) : el.value);
  slDraft[k] = v;
  var o = el.parentNode.querySelector("output"); if (o) o.textContent = el.value + (k === "tSize" || k === "bSize" || k === "gap" || k === "pad" || k === "radius" ? "px" : k === "imgH" ? "%" : k === "sec" ? " ث" : "");
  if (k === "imgMode" && e.type === "change") { render(); return; }
  slPreview();
}

var boardEdit = null;
R.boards = function(){
  var list = S.boards.items.map(function(b){
    if (boardEdit === b.id) return '<li class="ed">' + boardForm(b) + '</li>';
    return '<li><div><p><b>' + esc(b.title || "بدون عنوان") + '</b></p><small>' + esc((b.body || "").slice(0, 80)) + '</small>' +
      '<small class="tags">' + (b.active ? "مفعل" : "غير مفعل") + (b.pinned ? " · مثبت" : "") + (b.img ? " · صورة" : "") + '</small></div>' +
      '<span>' + btn("↑", "bUp", "sm ghost", b.id) + btn("تعديل", "bEdit", "sm ghost", b.id) + btn("حذف", "bDel", "sm danger", b.id) + '</span></li>';
  }).join("");
  return card("وضع لوحات العرض",
    tog("تفعيل لوحات العرض", "boards.on", "شاشة بديلة تعرض رسالة كبيرة مع المواقيت والساعة") + numIn("مدة تدوير اللوحات", "boards.rot", 5, 300, 5, "ثانية")) +
  card("اللوحات", '<ul class="list">' + (list || '<li class="empty">لا توجد لوحات عرض بعد</li>') + '</ul>' +
    (boardEdit === "new" ? '<div class="ed">' + boardForm({id:"new", title:"تنبيه مهم", body:"هذا مثال حي لشكل الرسالة على الشاشة.", tSize:110, bSize:64, tFont:"Cairo", bFont:"Cairo", tColor:"#E7B65B", bColor:"#ffffff", active:true, pinned:false}) + '</div>' : "") +
    '<div class="row-end">' + btn("إضافة لوحة", "bAdd") + (S.boards.items.length ? btn("حذف الكل", "bClear", "danger ghost") : "") + '</div>');
};
function fontOpts(v){ return window.FONTS.map(function(f){ return '<option value="' + esc(f[0]) + '"' + (f[0] === v ? " selected" : "") + '>' + esc(f[1]) + '</option>'; }).join(""); }
function boardForm(b){
  return '<div class="form" data-bid="' + esc(b.id) + '">' +
    '<label class="fld col"><span><b>العنوان</b></span><input type="text" id="btitle" value="' + esc(b.title) + '"></label>' +
    '<label class="fld col"><span><b>النص</b></span><textarea rows="3" id="bbody">' + esc(b.body) + '</textarea></label>' +
    '<div class="grid2"><label class="fld"><span><b>حجم العنوان</b></span><input type="number" id="btsize" min="40" max="220" value="' + (b.tSize || 110) + '"></label>' +
    '<label class="fld"><span><b>حجم النص</b></span><input type="number" id="bbsize" min="24" max="160" value="' + (b.bSize || 64) + '"></label>' +
    '<label class="fld"><span><b>خط العنوان</b></span><select id="btfont">' + fontOpts(b.tFont) + '</select></label>' +
    '<label class="fld"><span><b>خط النص</b></span><select id="bbfont">' + fontOpts(b.bFont) + '</select></label>' +
    '<label class="fld"><span><b>لون العنوان</b></span><input type="color" id="btcolor" value="' + esc(b.tColor || "#E7B65B") + '"></label>' +
    '<label class="fld"><span><b>لون النص</b></span><input type="color" id="bbcolor" value="' + esc(b.bColor || "#ffffff") + '"></label></div>' +
    '<label class="fld tog"><span><b>مفعل</b></span><input type="checkbox" id="bactive"' + (b.active ? " checked" : "") + '><i></i></label>' +
    '<label class="fld tog"><span><b>تثبيت</b><small>تُعرض هذه اللوحة وحدها دون تدوير</small></span><input type="checkbox" id="bpinned"' + (b.pinned ? " checked" : "") + '><i></i></label>' +
    '<div class="fld"><span><b>صورة</b>' + (b.img ? '<small>توجد صورة</small>' : "") + '</span><span><input type="file" accept="image/*" id="bimg">' + (b.img ? btn("حذف الصورة", "bImgDel", "sm ghost", b.id) : "") + '</span></div>' +
    '<div class="bprev" style="--tc:' + esc(b.tColor || "#E7B65B") + ';--bc:' + esc(b.bColor || "#fff") + '"><b style="font-family:\'' + esc(b.tFont) + '\'">' + esc(b.title || "") + '</b><p style="font-family:\'' + esc(b.bFont) + '\'">' + esc(b.body || "") + '</p></div>' +
    '<div class="row-end">' + btn("حفظ", "bSave", "", b.id) + btn("إلغاء", "bCancel", "ghost") + '</div></div>';
}

R.look = function(){
  var tab = R.look.tab || A.orient();
  var list = tab === "P" ? window.BG_P : window.BG_L, curBg = tab === "P" ? S.look.bgP : S.look.bgL;
  // الخلفيات الجديدة عالية الدقة (SVG) أولاً بصورتها الحقيقية، ثم خلفيات التطبيق من الصورة المصغرة المجمعة
  var bgBtn = function(b, i){ var svg = /\.svg$/.test(b[0]);
    return '<button type="button" class="bgt ' + tab + (svg ? " svg" : "") + (b[0] === curBg && !S.look.customBg ? " on" : "") + '" data-act="bg" data-x="' + tab + ":" + b[0] + '" style="' +
      (svg ? "background-image:url(bg/" + b[0] + ")" : "background-position:0 " + (-(b[3] != null ? b[3] : i)*(tab === "P" ? 160 : 90)) + "px") + '" data-n="' + (i + 1) + '" aria-label="خلفية ' + (i + 1) + '"></button>'; };
  // الخلفية المستخدمة الآن: صورتها ورقمها واسم ملفها ونوعها وطريقة تغييرها
  var ci = -1; list.forEach(function(b, i){ if (b[0] === curBg) ci = i; });
  var modes = {manual:"يدوي", prayer:"تتغير عند كل صلاة", day:"تتغير كل يوم", month:"تتغير كل شهر", random:"تتغير عشوائياً كل " + (S.look.bgEvery || 30) + " دقيقة"};
  var curBox = '<div class="bgcur">' + (S.look.customBg ? "" :
      ci >= 0 ? bgBtn(list[ci], ci).replace('<button type="button" class="bgt', '<span class="bgt cur').replace(/data-act="bg" /, "").replace("</button>", "</span>") : "") +
    '<div class="bgci"><b>الخلفية المستخدمة الآن (' + (tab === "P" ? "رأسي" : "أفقي") + ')</b>' +
    (S.look.customBg ? '<span>صورة مخصصة من الجهاز</span>' : ci >= 0 ? '<span>خلفية رقم <b class="bgno">' + (ci + 1) + '</b> من ' + list.length + '</span><small dir="ltr">' + esc(curBg) + '</small><small>' + (/^z.*\.svg$/.test(curBg) ? "نقش إسلامي شفاف" : /\.svg$/.test(curBg) ? "خلفية متجهة عالية الدقة" : "صورة") + " · " + (modes[S.look.bgMode || "manual"] || "") + '</small>' : '<span>غير محددة</span>') +
    (ci >= 0 && !S.look.customBg ? '<span class="nb">' + btn("إظهارها في القائمة", "bgFind", "sm ghost") + '</span>' : "") + '</div></div>';
  var hid = S.look.bgHidden || [], showHid = R.look.showHid, del = R.look.delMode;
  var vis = function(b){ return showHid ? hid.indexOf(b[0]) >= 0 : hid.indexOf(b[0]) < 0; };
  var wrap = function(b, i){ if (!vis(b)) return ""; var x = bgBtn(b, i);
    return del || showHid ? '<span class="bgw">' + x + '<button type="button" class="bgx' + (showHid ? " re" : "") + '" data-act="' + (showHid ? "bgRestore" : "bgHide") + '" data-x="' + b[0] + '" aria-label="' + (showHid ? "استعادة" : "حذف") + ' الخلفية">' + (showHid ? "↺" : "×") + '</button></span>' : x; };
  // الأحدث أولاً: النقوش الإسلامية الشفافة، ثم الخلفيات المتجهة، ثم الصور
  var grp = function(f){ return /^z.*\.svg$/.test(f) ? 0 : /\.svg$/.test(f) ? 1 : 2; };
  var bgs = [0, 1, 2].map(function(g){ return list.map(function(b, i){ return grp(b[0]) === g ? wrap(b, i) : ""; }).join(""); }).join("");
  var nHid = list.filter(function(b){ return hid.indexOf(b[0]) >= 0; }).length;
  var accents = ["#E7B65B","#F4D58D","#FFFFFF","#7FD1C7","#9CC7FF","#F2A07B","#C9E265"];
  return card("صورة الخلفية",
    curBox + '<div class="seg"><button type="button" data-act="bgTab" data-x="P" class="' + (tab === "P" ? "on" : "") + '">رأسي</button><button type="button" data-act="bgTab" data-x="L" class="' + (tab === "L" ? "on" : "") + '">أفقي</button></div>' +
    (showHid ? '<p class="note">الخلفيات المحذوفة: اضغط ↺ لإعادتها إلى القائمة.</p>' : del ? '<p class="note">اضغط × على أي خلفية لحذفها من هذه الشاشة وذاكرة الجهاز. للحذف النهائي من التطبيق نفسه: لوحة ووردبريس ← إعدادات الربط ← حذف الخلفيات نهائياً، أو احذف ملفها من مجلد bg في النسخة المحلية.</p>' : "") +
    '<div class="bgs' + (del || showHid ? " bgdel" : "") + '">' + (bgs || '<p class="note">لا توجد خلفيات محذوفة.</p>') + '</div>' +
    '<div class="row-end">' + (showHid ? btn("رجوع", "bgHidView", "ghost") : btn(del ? "تم" : "حذف خلفيات", "bgDelMode", del ? "" : "ghost") + (nHid ? btn("المحذوفة (" + nHid + ")", "bgHidView", "ghost") : "")) + '</div>' +
    '<div class="row-end"><label class="btn ghost">صورة من الجهاز<input type="file" accept="image/*" data-up="bg" hidden></label>' + (S.look.customBg ? btn("إلغاء الصورة المخصصة", "bgClear", "ghost") : "") + '</div>' +
    sel("تغيير الخلفية", "look.bgMode", [["manual","يدوي (بالضغط على صلاة الفجر)"],["prayer","عند كل صلاة"],["day","كل يوم"],["month","كل شهر"],["random","عشوائي كل مدة"]], "يعمل مع خلفيات التطبيق، ويتوقف عند اختيار صورة من الجهاز") +
    (S.look.bgMode === "random" ? numIn("تغيير الخلفية كل", "look.bgEvery", 5, 1440, 5, "دقيقة") : "") +
    (S.look.bgMode && S.look.bgMode !== "manual" && S.look.bgMode !== "random" ? tog("اختيار الخلفية التالية عشوائياً", "look.bgShuffle", "عند إيقافه تتغير الخلفيات بالترتيب") : "") +
    sel("لون النصوص", "look.tone", [["auto","تلقائي حسب الخلفية"],["dark","نصوص فاتحة (خلفية داكنة)"],["light","نصوص داكنة (خلفية فاتحة)"]])) +
  card("الألوان",
    tog("تلوين النصوص تلقائياً حسب الخلفية", "look.autoColor", "يختار ألوان النصوص والظل والتمييز من ألوان الخلفية. أوقفه لاستخدام اللون المخصص أدناه") +
    '<div class="sw">' + accents.map(function(c){ return '<button type="button" data-act="accent" data-x="' + c + '" style="background:' + c + '" class="' + (S.look.accent.toLowerCase() === c.toLowerCase() ? "on" : "") + '" aria-label="' + c + '"></button>'; }).join("") + '</div>' +
    colorIn("لون مخصص", "look.accent")) +
  card("العلامة المائية",
    tog("إظهار العلامة المائية خلف جدول المواقيت", "look.wm", "صورة شفافة خلف أوقات الصلوات") +
    (S.look.wm !== false ? '<div class="fld"><span><b>صورة العلامة المائية</b><small>' + (S.look.wmImg ? "صورة مخصصة" : "الهلال والمسجد (الافتراضية)") + '. يفضّل صورة PNG بخلفية شفافة</small></span><span class="nb"><label class="btn sm ghost">تغيير الصورة<input type="file" accept="image/*" data-up="wm" hidden></label>' + (S.look.wmImg ? btn("الصورة الافتراضية", "wmReset", "sm ghost") : "") + '</span></div>' + rangeIn("درجة الظهور", "look.wmOp", 0.03, 0.5, 0.01, "%", "كلما قلّت صارت أخف") + rangeIn("الحجم", "look.wmSize", 0.4, 1.2, 0.05, "%", "نسبةً إلى ارتفاع الجدول") : ""));
};
/* تمييز الصلاة القادمة: لون الشريط وشفافيته ولون نصوصه، أو إطار فقط، مع معاينة */
function hexRgba(h, a){ h = String(h || "#000000").replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&"); var n = parseInt(h, 16) || 0; return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")"; }
function hiPrevHTML(){
  var L = S.look, bg = L.hiCustom ? hexRgba(L.hiColor, +L.hiOpacity) : "rgba(255,255,255,.16)", fc = L.hiTextOn ? L.hiTextColor : "#ffffff";
  return '<div class="hiprev" style="background:linear-gradient(' + (L.hiFrame ? "rgba(0,0,0,.3),rgba(0,0,0,.3)" : bg + "," + bg) + '),#1d2733;color:' + esc(fc) + ';box-shadow:' + (L.hiFrame ? "inset 0 0 0 3px " + esc(L.hiCustom ? L.hiColor : L.accent) : "none") + '"><span>العصر</span><i>3:25</i><i>3:45</i></div>';
}
function updHiPrev(){ var o = document.querySelector(".hiprev"); if (o) o.outerHTML = hiPrevHTML(); }
function hiCard(){
  var L = S.look, hs = ["#1F5A8A","#0E6B5C","#7A1E2C","#B8862B","#5B3A8C","#C0392B","#2E7D32","#FFFFFF","#000000"];
  var tx = ["#ffffff","#111111","#F4D58D","#E7B65B","#9CC7FF"];
  var sw = function(list, act, cur, on){ return '<div class="sw">' + list.map(function(c){ return '<button type="button" data-act="' + act + '" data-x="' + c + '" style="background:' + c + '" class="' + (on && String(cur).toLowerCase() === c.toLowerCase() ? "on" : "") + '" aria-label="' + c + '"></button>'; }).join("") + '</div>'; };
  var pv = hiPrevHTML();
  var on = L.hiOn !== false, tc = L.tblStyle === "cards";
  return card("شكل جدول المواقيت",
    sel("نمط الجدول", "look.tblStyle", [["cards","بطاقات بإطار وتمييز ملوّن"],["classic","كلاسيكي (حسب ألوان الخلفية)"]], "البطاقات: كل صلاة داخل إطار مستدير، والصلاة القادمة بتعبئة زرقاء") +
    (tc ? colorIn("لون أسماء الصلوات والعناوين", "look.tcName") + colorIn("لون وقت الأذان", "look.tcAdhan") + colorIn("لون وقت الإقامة", "look.tcIqama") +
      (L.hiCustom ? "" : colorIn("لون تعبئة الصلاة القادمة", "look.tcHi")) + btn("ألوان الشكل الافتراضية", "tcReset", "sm ghost") : "")) +
  card("تمييز الصلاة القادمة",
    tog("إظهار تمييز الصلاة القادمة", "look.hiOn", "تلوين سطر الصلاة القادمة في جدول المواقيت، أو الصلاة الحالية أثناء انتظار الإقامة") +
    (!on ? "" : pv +
    tog("لون مخصص لتمييز الصلاة القادمة", "look.hiCustom", "عند إيقافه يُختار لون مناسب للخلفية تلقائياً") +
    (L.hiCustom ? sw(hs, "hiSw", L.hiColor, true) + colorIn("لون التمييز", "look.hiColor") + rangeIn("درجة وضوح اللون", "look.hiOpacity", 0.1, 1, 0.05, "%", "كلما قلّت ظهرت الخلفية من خلفه") : "") +
    tog("لون مخصص لنصوص الصلاة القادمة", "look.hiTextOn", "اسم الصلاة ووقت الأذان والإقامة في السطر المميز") +
    (L.hiTextOn ? sw(tx, "hiTx", L.hiTextColor, true) + colorIn("لون النصوص", "look.hiTextColor") : "") +
    tog("إطار فقط بدل تعبئة الشريط", "look.hiFrame", "يظهر حول الصلاة القادمة إطار بلون التمييز بدل خلفية ملوّنة") +
    tog("تكبير السطر المميز قليلاً", "look.hiZoom", "يبرز سطر الصلاة القادمة بتكبير بسيط عن باقي الصلوات") +
    tog("تخفيت الصلوات الماضية", "look.dimPast", "الصلوات التي مضت اليوم تظهر بلون أخف")), "السطر المميز في جدول المواقيت هو الصلاة القادمة، أو الصلاة الحالية أثناء انتظار الإقامة");
}
R.hilite = function(){ return hiCard(); };
R.fonts = function(){
  return card("ضبط خطوط التطبيق",
    sel("خط النصوص", "look.fontText", window.FONTS) + sel("خط الأرقام والساعة", "look.fontNum", window.FONTS) + sel("خط الأذكار", "look.fontZekr", window.FONTS) +
    '<div class="fprev" style="font-family:\'' + esc(S.look.fontZekr) + '\'">سبحان الله وبحمده، سبحان الله العظيم</div>') +
  card("أحجام الخطوط",
    rangeIn("حجم النصوص (عام)", "look.fs.ts", 0.5, 1.5, 0.05, "%", "يكبّر أو يصغّر كل النصوص معاً") +
    rangeIn("حجم الأرقام (عام)", "look.fs.ns", 0.5, 1.5, 0.05, "%", "يكبّر أو يصغّر كل الأرقام معاً") +
    '<h4 class="subh">لكل عنصر</h4>' +
    rangeIn("اسم المسجد", "look.fs.name", 0.5, 1.6, 0.05, "%") + rangeIn("اليوم والتاريخ", "look.fs.date", 0.5, 1.6, 0.05, "%") +
    rangeIn("الساعة", "look.fs.clock", 0.5, 1.4, 0.05, "%") + rangeIn("عداد الصلاة القادمة", "look.fs.count", 0.5, 1.6, 0.05, "%") +
    rangeIn("أسماء الصلوات", "look.fs.pname", 0.5, 1.4, 0.05, "%") + rangeIn("أوقات الصلوات", "look.fs.ptime", 0.5, 1.4, 0.05, "%") +
    rangeIn("الدعاء الثابت", "look.fs.fixed", 0.5, 1.8, 0.05, "%") + rangeIn("شريط الإعلانات", "look.fs.news", 0.5, 1.6, 0.05, "%") +
    rangeIn("الأذكار", "look.fs.zk", 0.5, 1.5, 0.05, "%") +
    '<div class="row-end">' + btn("إعادة الأحجام الافتراضية", "fsReset", "ghost") + '</div>', "100% هو الحجم الأصلي");
};
/* ===== خيارات العرض: كل خيارات الشاشة الأساسية في مكان واحد ومجموعات واضحة ===== */
var DISP_REC = {"look.showCount":true, "look.bigCounter":true, "look.bigIqCnt":true, "red90":true, "lastMinBlack":true,
  "azanScreen":true, "iqNowOn":true, "iqNowSec":30, "look.iqClock":true, "look.ovGlass":true, "look.homeClock":false,
  "look.shadow":true, "look.dimPast":true, "look.hiOn":true, "look.nightTimes":true, "look.netStar":true,
  "look.bigL":true, "look.centerL":true, "look.dateSide":true, "look.centerP":true,
  "look.h24":false, "look.zeroH":"all", "look.fullClock":false, "look.arabicDigits":true};
function dispOri(){ var o = R.display.o; if (o) return o; try { return A.orient() === "P" ? "P" : "L"; } catch(e){ return "L"; } }
function segBtns(act, opts, on){ return '<div class="seg m0" role="radiogroup">' + opts.map(function(o){ var a = String(o[0]) === String(on);
  return '<button type="button" role="radio" aria-checked="' + a + '" data-act="' + act + '" data-x="' + esc(o[0]) + '" class="' + (a ? "on" : "") + '">' + esc(o[1]) + '</button>'; }).join("") + '</div>'; }
R.display = function(){
  var o = dispOri(), now = (function(){ try { return A.orient(); } catch(e){ return ""; } })();
  return card("العدّاد والعد التنازلي",
    tog("إظهار العد التنازلي", "look.showCount", "الوقت المتبقي للصلاة القادمة بجانب الشعار") +
    tog("تكبير عداد الوقت المتبقي للصلاة القادمة", "look.bigCounter") +
    tog("تكبير العد التنازلي على شاشة الإقامة", "look.bigIqCnt", "أرقام أكبر في عداد انتظار الإقامة") +
    tog("تغيير لون العداد إلى الأحمر في آخر 90 ثانية", "red90") +
    tog("تكبير العداد على شاشة سوداء عند آخر دقيقة", "lastMinBlack", "قبل الإقامة بدقيقة يملأ العداد شاشة سوداء")) +
  card("الأذان والإقامة",
    tog("إظهار شاشة الأذان", "azanScreen") +
    tog("عرض شاشة الإقامة قبل الشاشة السوداء", "iqNowOn", "رسالة «حان الآن موعد الإقامة» ثم تُخفى الشاشة أثناء الصلاة") +
    (S.iqNowOn !== false ? numIn("مدة شاشة الإقامة", "iqNowSec", 5, 180, 5, "ثانية") : "") +
    tog("عرض الإقامة مع الساعة", "look.iqClock", "وقت إقامة الصلاة القادمة تحت الساعة") +
    tog("الساعة أعلى شاشات الأذان والإقامة والأذكار", "look.ovClock", "الوقت الحالي أعلى الشاشة أثناء الأذان وانتظار الإقامة والأذكار") +
    (S.look.ovClock !== false ? tog("إظهارها في شاشة انتظار الإقامة", "look.ovClkWait", "تظهر فوق عداد الإقامة مباشرة") + tog("إظهار الثواني في هذه الساعة", "look.ovSec") + rangeIn("حجم هذه الساعة", "look.ovClkSize", 0.5, 2, 0.05, "%") : "") +
    tog("شاشات شبه شفافة للأذان والإقامة والأذكار", "look.ovGlass", "تظهر الخلفية خلفها. عند الإيقاف تكون بلون ثابت") +
    tog("ساعة المنزل: إخفاء أوقات الإقامة", "look.homeClock", "للبيوت فقط. لا يناسب المساجد لأنه يخفي الإقامة عن المصلين") +
    (S.look.homeClock ? '<p class="note warn">⚠ ساعة المنزل مفعّلة: أوقات الإقامة مخفية عن المصلين.</p>' : "")) +
  card("جدول المواقيت",
    tog("تظليل خلف أوقات الصلاة", "look.shadow", "تفاصيل الظل من قسم «ظل الصلوات»") +
    tog("تخفيت الصلوات الماضية", "look.dimPast") +
    tog("إظهار أوقات الليل", "look.nightTimes", "منتصف الليل والثلث الأخير في شريط أسفل الشاشة") +
    (S.look.nightTimes ? '<div class="subbox">' +
      tog("منتصف الليل", "look.nightMid") + tog("الثلث الأخير من الليل", "look.nightThird", "يتميّز بعلامة «الآن» عند دخوله حتى أذان الفجر") +
      sel("وقت الظهور", "look.nightShow", [["maghrib","من المغرب حتى الفجر"],["isha","بعد صلاة العشاء حتى الفجر"],["always","طوال اليوم"],["custom","من ساعة إلى ساعة"]], "الليل من أذان المغرب إلى أذان الفجر") +
      (S.look.nightShow === "isha" ? numIn("يظهر بعد انتهاء صلاة العشاء بـ", "look.nightAfter", 0, 240, 5, "دقيقة") : "") +
      (S.look.nightShow === "custom" ? timeIn("من الساعة", "look.nightFrom") + timeIn("إلى الساعة", "look.nightTo", "يمكن أن يتجاوز منتصف الليل، مثل من 21:00 إلى 04:00") : "") +
      rangeIn("حجم شريط أوقات الليل", "look.nbSize", 0.5, 1.8, 0.05, "%", "حجم النصوص والأيقونات والشريط كله") +
      tog("تخصيص الظل والاستدارة والخلفية", "look.nbCustom", "عند إيقافه يتبع شكل صفوف الصلوات (قسم ظل الصلوات)") +
      (S.look.nbCustom ? rangeIn("قوة الظل", "look.nbShadow", 0, 1, 0.05, "%", "صفر = بدون ظل") + rangeIn("انتشار الظل", "look.nbBlur", 0, 60, 1, "px") +
        rangeIn("استدارة الزوايا", "look.nbRadius", 0, 60, 1, "px") + rangeIn("شفافية الخلفية", "look.nbBgOp", 0, 1, 0.05, "%", "صفر = بدون خلفية") : "") +
      '</div>' : "") +
    tog("التحقق من اتصال الإنترنت", "look.netStar", "نجمة أسفل الشاشة: خضراء عند الاتصال وحمراء عند الانقطاع")) +
  card("اتجاه الشاشة",
    '<div class="fld"><span><b>خيارات العرض</b><small>' + (now ? "الشاشة الآن " + (now === "P" ? "رأسية" : "أفقية") : "") + '</small></span>' +
      segBtns("dispOri", [["L","الأفقي"],["P","الرأسي"]], o) + '</div>' +
    (o === "L" ?
      tog("تكبير أوقات الصلاة والإقامة", "look.bigL") +
      tog("وضع أسماء الصلوات في المنتصف", "look.centerL") +
      tog("التاريخ يميناً واسم المسجد يساراً", "look.dateSide", "في سطر واحد أعلى الشاشة، فتتسع المساحة للساعة")
    : tog("وضع أسماء الصلوات في المنتصف", "look.centerP"))) +
  card("الوقت والأرقام",
    '<div class="fld"><span><b>نظام الساعة</b></span>' + segBtns("dispH24", [["12","12 ساعة (ص/م)"],["24","24 ساعة"]], S.look.h24 ? "24" : "12") + '</div>' +
    sel("إضافة صفر قبل الساعة", "look.zeroH", [["off","بدون صفر (9:05)"],["clock","في الساعة فقط (09:05)"],["all","في الساعة وأوقات الصلوات"]], "في نظام 24 ساعة يظهر الصفر دائماً") +
    tog("تفعيل عرض الساعة الكاملة 00:00:00", "look.fullClock", "الساعات والدقائق والثواني بحجم واحد") +
    tog("تفعيل الأرقام العربية", "look.arabicDigits", "١٢:٣٠ بدل 12:30")) +
  '<div class="row-end">' + btn("استعادة القيم الموصى بها للمساجد", "dispRec", "ghost") + '</div>';
};
R.layout = function(){
  return card("الساعة والأرقام",
    tog("إظهار الثواني صغيرة بجانب الساعة", "look.seconds"), "نظام 12/24 ساعة والأرقام العربية والصفر قبل الساعة في «خيارات العرض»") +
  card("جدول المواقيت",
    sel("نمط الجدول", "look.tblStyle", [["cards","بطاقات بإطار وتمييز ملوّن"],["classic","كلاسيكي (حسب ألوان الخلفية)"]], "ألوان البطاقات في قسم «تمييز الصلاة القادمة»") +
    tog("إظهار عناوين الأعمدة", "look.thead", "الصلاة - وقت الأذان - وقت الإقامة فوق الجدول") +
    (S.look.homeClock ? "" : sel("عرض الإقامة", "look.iqFmt", [["time","بوقت الإقامة (3:02)"],["min","بالدقائق بعد الأذان (20’)"]]))) +
  card("عناصر الشاشة",
    tog("إظهار الثواني في الصلاة القادمة", "look.nextSec") +
    txt("نص إضافي أسفل الشاشة", "look.footSite", "أسفل الشاشة يظهر دائماً: rawayie.sa " + A.VERSION + " | المدينة، ورقم الإصدار يتحدث تلقائياً مع كل تحديث. هذا النص يُضاف بعدهما، اتركه فارغاً إن لم تحتجه") + tog("إخفاء السطر السفلي في شاشة الإقامة والشاشة السوداء", "look.hideVersion"))
};

function rangeIn(label, p, min, max, step, suf, hint){ var i = id(), v = get(p);
  return '<label class="fld rng" for="' + i + '"><span><b>' + esc(label) + '</b>' + (hint ? '<small>' + esc(hint) + '</small>' : "") + '</span><span class="rg"><input type="range" id="' + i + '" data-p="' + p + '" data-t="num" min="' + min + '" max="' + max + '" step="' + step + '" value="' + esc(v) + '"><output>' + esc(fmtR(v, suf)) + '</output></span></label>'; }
function fmtR(v, suf){ return suf === "%" ? Math.round(v*100) + "%" : v + (suf || ""); }
R.shadow = function(){
  var auto = S.look.autoColor && !S.look.customBg;
  return card("الظل خلف الصلوات",
    tog("تفعيل الظل خلف الصلوات", "look.shadow", "شريط خلف كل صلاة في جدول المواقيت") +
    (S.look.shadow ?
      (auto ? tog("لون الظل تلقائي من الخلفية", "look.rowAuto", "أوقفه لاختيار لون بنفسك") : "") +
      (!auto || !S.look.rowAuto ? colorIn("لون الظل", "look.rowColor") : "") +
      rangeIn("شفافية الظل", "look.rowOpacity", 0, 1, 0.05, "%", "0% شفاف تماماً، 100% لون كامل") +
      rangeIn("قوة الظل حول الشريط", "look.rowShadow", 0, 0.8, 0.02, "%") +
      rangeIn("استدارة الزوايا", "look.rowRadius", 0, 60, 1, "px") : "") +
    rangeIn("المسافة بين صفوف الصلوات", "look.rowGap", 0, 60, 1, "px", "تعمل مع الظل وبدونه، والصفوف تتكيف مع المساحة") +
    '<div class="shprev" id="shprev"></div><p class="note">معاينة على خلفيتك الحالية</p>');
};
function shPreview(){
  var p = $("#shprev"), st = document.getElementById("stage"); if (!p || !st) return;
  var cs = st.style, on = S.look.shadow, bgimg = st.style.backgroundImage;
  p.style.backgroundImage = bgimg; p.style.gap = cs.getPropertyValue("--rowgap") || "0";
  p.innerHTML = [["الفجر","4:22"],["الظهر","11:25"],["العصر","2:42"]].map(function(r, i){
    return '<div style="border-radius:' + cs.getPropertyValue("--rowrad") + ';background:' + (i === 2 ? cs.getPropertyValue("--hi") : on ? cs.getPropertyValue("--rowbg") : "transparent") +
      ';box-shadow:' + (on && i !== 2 ? cs.getPropertyValue("--rowsh") : "none") + ';color:' + cs.getPropertyValue("--fg") + '"><b style="color:' + cs.getPropertyValue("--acc") + '">' + r[0] + '</b><span>' + r[1] + '</span></div>'; }).join("");
}

function wxState(){
  if (!S.weather.on) return "";
  var i = A.wxInfo(), msg;
  if (i.wx) msg = (i.status.indexOf("cache") === 0 ? "آخر قراءة محفوظة: " : "يعمل الآن: ") + Math.round(i.wx.temperature_2m) + "°، آخر تحديث " + A.fmtT(+i.status.split("@")[1]);
  else if (i.status === "fail") msg = "تعذر الاتصال بخدمة الطقس من هذه الصفحة. يظهر الطقس في النسخة المحلية على جهاز متصل بالإنترنت.";
  else msg = "جارٍ جلب حالة الطقس...";
  return '<div class="fld"><span><b>الحالة</b><small>' + esc(msg) + '</small></span>' + btn("تحديث الآن", "wxRefresh", "sm ghost") + '</div>';
}
R.weather = function(){
  return card("حالة الطقس",
    tog("تفعيل حالة الطقس", "weather.on", "إظهار درجة الحرارة في الشاشة الرئيسية") +
    sel("مكان ظهور الطقس", "weather.pos", [["mid","بجانب الشعار"],["clock","بجانب الساعة"],["top","أعلى الشاشة (الزاوية)"],["bottom","أسفل الشاشة (الزاوية)"]]) +
    sel("مصدر بيانات الطقس", "weather.src", [["auto","تلقائي (من المدينة)"],["manual","يدوي (GPS)"]]) +
    wxState() + (S.weather.src === "manual" ? numIn("خط العرض", "weather.lat", -90, 90, 0.0001) + numIn("خط الطول", "weather.lng", -180, 180, 0.0001) : ""),
    "يتم جلب البيانات من Open-Meteo، وتحتاج اتصالاً بالإنترنت. لا تعمل داخل رابط Claude لأنه يمنع الاتصال بالمواقع الخارجية، وتعمل في النسخة المحلية المثبتة على جهاز الشاشة.");
};

/* ===== تفعيل الشاشة بكود من لوحة المدير ===== */
var actEl = null;
function actOpen(){
  var R0 = window.REMOTE; if (!R0 || !R0.activate) return;
  var known = R0.wpSite(), site0 = known || (S.remote && S.remote.site) || "";
  if (!actEl) { actEl = document.createElement("div"); actEl.id = "act"; actEl.className = "actov"; $("#ui").appendChild(actEl); }
  var keys = ["1","2","3","4","5","6","7","8","9","del","0","ok"];
  actEl.innerHTML = '<div class="actbox" role="dialog" aria-modal="true" aria-labelledby="acth"><img src="img/mark.png" alt=""><h2 id="acth">ربط الشاشة وتفعيلها</h2>' +
    '<p>اكتب <b>كود التفعيل (6 أرقام)</b> من لوحة المدير ← شاشات المساجد</p>' +
    (window.LICENSE ? '<p class="actdev">رقم الجهاز: <b dir="ltr">' + esc(window.LICENSE.status().idText) + '</b></p>' : "") +
    (known ? '<p class="actsite" dir="ltr">' + esc(known.replace(/^https?:\/\//, "")) + '</p>' :
      '<label class="actf" for="actsite"><span>عنوان موقع الإدارة</span><input id="actsite" type="url" dir="ltr" placeholder="example.com" autocomplete="url" value="' + esc(site0.replace(/^https?:\/\//, "")) + '"></label>') +
    '<input id="actcode" class="actcode" dir="ltr" inputmode="none" autocomplete="one-time-code" maxlength="9" placeholder="•••• ••••" aria-label="كود التفعيل أو الربط">' +
    '<div class="actpad">' + keys.map(function(k, i){ return '<button type="button" data-k="' + k + '" data-i="' + i + '"' + (k === "ok" ? ' class="ok"' : "") + '>' + (k === "del" ? "⌫" : k === "ok" ? "تفعيل" : k) + '</button>'; }).join("") + '</div>' +
    '<p class="acterr" id="acterr" role="alert"></p><button type="button" class="actlater" data-k="later">لاحقاً</button></div>';
  actEl.hidden = false;
  var code = $("#actcode", actEl), err = $("#acterr", actEl);
  var fmt = function(){ var d = code.value.replace(/\D/g, "").slice(0, 6); code.value = d.length > 3 ? d.slice(0, 3) + " " + d.slice(3) : d; };
  var go = function(){
    var dg = code.value.replace(/\D/g, "");
    if (dg.length !== 6) { err.className = "acterr bad"; err.textContent = "كود التفعيل 6 أرقام"; return; }
    var site = known || ($("#actsite", actEl) || {}).value || ""; err.textContent = "جارٍ الربط..."; err.className = "acterr";
    R0.activate(site, code.value).then(function(j){ err.className = "acterr ok"; err.textContent = "تم ربط الشاشة" + (j.name ? ": " + j.name : "");
      setTimeout(function(){ actClose(); A.rebuild(); }, 1400); }, function(e){ err.className = "acterr bad"; err.textContent = e.message || String(e); });
  };
  code.addEventListener("input", fmt);
  actEl.onclick = function(e){ var b = e.target.closest("[data-k]"); if (!b) return; var k = b.dataset.k;
    if (k === "later") { actClose(true); return; }
    if (k === "ok") { go(); return; }
    if (k === "del") code.value = code.value.replace(/\D/g, "").slice(0, -1); else code.value = code.value.replace(/\D/g, "") + k;
    fmt(); };
  // ريموت التلفاز: الأسهم تتنقل بين أزرار لوحة الأرقام، والأرقام تُكتب مباشرة
  actEl.onkeydown = function(e){
    var t = e.target, i = t.dataset && t.dataset.i !== undefined ? +t.dataset.i : -1, pad = $$(".actpad button", actEl);
    if (/^[0-9]$/.test(e.key) && t !== code && t.id !== "actsite") { e.preventDefault(); code.value = code.value.replace(/\D/g, "") + e.key; fmt(); return; }
    if (e.key === "Enter" && (t === code || t.id === "actsite")) { e.preventDefault(); go(); return; }
    if (e.key === "Escape") { actClose(true); return; }
    if (i >= 0) { var n = {ArrowRight:-1, ArrowLeft:1, ArrowDown:3, ArrowUp:-3}[e.key];
      if (n !== undefined) { e.preventDefault(); var j = i + n; if (j >= 0 && j < pad.length) pad[j].focus(); else if (j < 0) code.focus(); } }
    else if (t === code && e.key === "ArrowDown") { e.preventDefault(); pad[1].focus(); }
  };
  setTimeout(function(){ (known || site0 ? code : $("#actsite", actEl) || code).focus(); }, 50);
}
function actClose(later){ if (actEl) actEl.hidden = true; if (later) { try { localStorage.setItem("rawayie-act-later", "1"); } catch(e){} try { document.cookie = "rwactlater=1; max-age=315360000; path=/; SameSite=Lax"; } catch(e){} } }
// تطبيق مفتوح من موقع ووردبريس وغير مرتبط بعد: تظهر نافذة التفعيل تلقائياً
setTimeout(function(){
  var R0 = window.REMOTE, later = false, L0 = window.LICENSE;
  // «لاحقاً» تُحفظ دائماً: لا تظهر النافذة عند كل تشغيل، ويبقى الربط متاحاً من الإعدادات ← الإدارة عن بعد
  try { later = localStorage.getItem("rawayie-act-later") === "1" || /(?:^|; )rwactlater=1/.test(document.cookie) || sessionStorage.getItem("rawayie-act-later") === "1"; } catch(e){}
  var licensed = !!L0; // رسالة الترخيص فوق الشاشة فيها ربط الشاشة بالكود، فلا تُفتح نافذة ثانية
  if (!window.RAWAYIE_PREVIEW && R0 && R0.wpSite && R0.wpSite() && !(S.remote && S.remote.on && S.remote.server) && !later && !licensed) actOpen();
}, (S.splash && S.splash.on !== false ? (+S.splash.sec || 6) * 1000 + 600 : 800));

R.remote = function(){
  var R0 = window.REMOTE, st = R0 ? R0.state : {status:"off"}, r = S.remote || {};
  var msg = !r.on ? "غير مفعلة" : st.status === "ok" ? "متصلة. آخر مزامنة " + A.fmtT(st.at, true) : st.status === "fail" ? "تعذر الاتصال: " + st.err : "جارٍ الاتصال...";
  return card("تفعيل الشاشة بكود",
    '<div class="fld"><span><b>' + (r.on && r.server ? "الشاشة مرتبطة" : "غير مرتبطة") + '</b><small>' + esc(r.on && r.server ? (r.site || r.server).replace(/^https?:\/\//, "") : "اطلب كود التفعيل من لوحة المدير (ووردبريس): شاشات المساجد ← كود التفعيل") + '</small></span>' + btn(r.on && r.server ? "تفعيل بكود آخر" : "تفعيل بكود", "actOpen") + '</div>',
    "أسهل من الرابط الطويل: تكتب عنوان الموقع وكوداً من 6 أرقام فقط، فترتبط الشاشة وتأخذ إعداداتها من اللوحة.") +
  card("ربط الشاشة بلوحة المدير العام",
    '<div class="code"><small>رمز هذه الشاشة</small><b dir="ltr">' + esc(r.code) + '</b><span>أضف هذا الرمز في لوحة المدير العام</span></div>' +
    tog("تفعيل الإدارة عن بعد", "remote.on") +
    txt("رابط قاعدة البيانات", "remote.server", "مثال: https://اسم-المشروع-default-rtdb.firebaseio.com") +
    // رمز الشاشة المرتبطة بموقع ووردبريس محجوب: لا يُعرض ولا يُنسخ
    (/\/wp-json\/|[?&]rest_route=/.test(r.server || "") ? '<div class="fld"><span><b>رمز الشاشة</b><small>' + (r.key ? "محجوب ومحفوظ داخل هذا الجهاز فقط" : r.pair ? "جارٍ الربط من الرابط..." : "غير مرتبطة بعد") + '</small></span><span dir="ltr">' + (r.key ? "••••••••" : "") + '</span></div>' :
    '<label class="fld" for="rkey"><span><b>مفتاح الوصول</b><small>اختياري، حسب إعدادات الحماية في قاعدة البيانات</small></span><input type="password" id="rkey" data-p="remote.key" data-t="str" value="' + esc(r.key) + '" autocomplete="off"></label>') +
    numIn("التحقق من التحديثات كل", "remote.poll", 15, 600, 15, "ثانية") +
    tog("إرسال التعديلات المحلية إلى اللوحة", "remote.allowLocal", "عند إيقافه تبقى اللوحة هي المصدر الوحيد، وتُستبدل أي تعديلات محلية عند التحديث التالي") +
    '<div class="fld"><span><b>الحالة</b><small>' + esc(msg) + '</small></span><span class="nb">' + btn("مزامنة الآن", "rSync", "sm ghost") + btn("رفع إعدادات الشاشة", "rPush", "sm ghost") + '</span></div>',
    "تُزامن النصوص والمواقيت والمظهر. الصور والأصوات المرفوعة من الجهاز تبقى محلية في كل شاشة.");
};
R.perms = function(){
  var secs = SECTIONS.filter(function(s){ return !ADMIN_ONLY[s[0]] && !PERM_OF[s[0]]; });
  return card("كلمة سر المدير",
    '<label class="fld" for="pw"><span><b>كلمة سر مدير الشاشة</b><small>' + (S.pass ? "مفعلة. المدير يملك كل الصلاحيات" : "غير مفعلة: الإعدادات مفتوحة للجميع") + '</small></span><input type="password" id="pw" placeholder="' + (S.pass ? "اكتب كلمة جديدة أو اتركها فارغة للإلغاء" : "اكتب كلمة السر") + '" autocomplete="new-password"></label>' +
    '<div class="row-end">' + btn("حفظ كلمة سر المدير", "pwSave") + '</div>',
    "يجب تفعيل كلمة سر المدير أولاً حتى تعمل صلاحيات المشرف") +
  card("حساب مشرف المسجد",
    txt("اسم المشرف", "sup.name") +
    '<label class="fld" for="spw"><span><b>كلمة سر المشرف</b><small>' + (S.sup.pass ? "مفعلة" : "غير مفعلة") + '. يجب أن تختلف عن كلمة سر المدير</small></span><input type="password" id="spw" placeholder="' + (S.sup.pass ? "كلمة جديدة أو فارغة للإلغاء" : "اكتب كلمة سر المشرف") + '" autocomplete="new-password"></label>' +
    '<div class="row-end">' + btn("حفظ كلمة سر المشرف", "spwSave") + '</div>') +
  card("الأقسام المسموح للمشرف بتعديلها",
    '<div class="perms">' + secs.map(function(s){ var on = (S.sup.sections || []).indexOf(s[0]) >= 0;
      return '<label class="pchk"><input type="checkbox" data-perm="' + s[0] + '"' + (on ? " checked" : "") + '><span>' + esc(PERM_LABEL[s[0]] || s[1]) + '</span></label>'; }).join("") + '</div>' +
    '<div class="row-end">' + btn("تحديد الكل", "permAll", "sm ghost") + btn("إلغاء الكل", "permNone", "sm ghost") + btn("الإعلانات والمحتوى فقط", "permContent", "sm ghost") + '</div>',
    "قسما «الصلاحيات» و«عام» للمدير فقط دائماً، وفيهما كلمات السر والنسخ الاحتياطي وإعادة الضبط") +
  card("التحكم من الشاشة مباشرة",
    tog("تغيير الخلفية بالضغط على صلاة الفجر", "sup.fajrBg", "عند إيقافه لا يستطيع أحد تغيير الخلفية من الشاشة") +
    tog("زر تدوير الشاشة في الاختصارات", "sup.rotate"),
    "تنطبق على أي شخص أمام الشاشة عند تفعيل كلمة سر المدير");
};
/* المتصفح الحالي: هل يدعم استمرار الشاشة بدون إنترنت، وما المتصفح الموصى به */
var BROWSER_TIPS = {
  android: "Google Chrome أو Fully Kiosk Browser (من متجر Google Play). بعد فتح الشاشة اضغط «تثبيت التطبيق» لتعمل كتطبيق مستقل بدون إنترنت.",
  win: "Google Chrome أو Microsoft Edge. اضغط «تثبيت التطبيق» لتظهر الشاشة كبرنامج مستقل على سطح المكتب، أو استخدم النسخة المحلية (ملف ZIP) فهي تعمل بدون إنترنت دائماً.",
  mac: "Google Chrome أو Safari 17 فما فوق (ملف ← إضافة إلى Dock).",
  ios: "Safari: زر المشاركة ← «إضافة إلى الشاشة الرئيسية»، ثم افتح الشاشة من الأيقونة.",
  linux: "Chromium أو Google Chrome، أو النسخة المحلية على راسبيري باي.",
  chromeos: "Google Chrome: اضغط «تثبيت التطبيق».",
  other: "Google Chrome أو Microsoft Edge أو Firefox بإصدار حديث."
};
function offBrowser(){
  var O = window.OFFLINE; if (!O || !O.state.browser) return "";
  var s0 = O.state, b = s0.browser, ok = b.file || (s0.supported && b.sw);
  var mb = function(n){ return n > 1048576 ? (n/1048576).toFixed(1) + " ميغابايت" : Math.round(n/1024) + " كيلوبايت"; };
  var row = function(label, val, good){ return '<div class="fld"><span><b>' + esc(label) + '</b><small>' + esc(val) + '</small></span><span class="pill ' + (good === true ? "ok" : good === false ? "bad" : "") + '">' + (good === true ? "✓" : good === false ? "✗" : "—") + '</span></div>'; };
  return row("المتصفح", b.name + (b.ver ? " " + b.ver : "") + (s0.standalone ? " · يعمل كتطبيق مثبت" : ""), ok ? true : false) +
    row("استمرار الشاشة بدون إنترنت", b.file ? "النسخة المحلية: كل الملفات على الجهاز" : ok ? "مدعوم في هذا المتصفح" : (b.sw ? "يحتاج رابط https" : "غير مدعوم في هذا المتصفح، استخدم أحد المتصفحات الموصى بها"), ok) +
    (b.file ? "" : row("الحفظ الدائم", s0.persisted === true ? "مفعّل: لن يحذف المتصفح ملفات الشاشة" : s0.persisted === false ? "غير مفعّل: قد يحذف المتصفح الملفات عند امتلاء الذاكرة" : "غير متاح في هذا المتصفح", s0.persisted === true ? true : s0.persisted === false ? false : null)) +
    (s0.quota ? row("المساحة المستخدمة", mb(s0.usage) + " من " + mb(s0.quota), null) : "") +
    '<div class="row-end">' + (s0.canInstall ? btn("تثبيت التطبيق على الجهاز", "offInstall") : "") + (!b.file && s0.persisted === false ? btn("تفعيل الحفظ الدائم", "offPersist", "ghost") : "") + '</div>' +
    '<p class="note"><b>المتصفح الموصى به لهذا الجهاز:</b> ' + esc(BROWSER_TIPS[b.os] || BROWSER_TIPS.other) + '</p>';
}
function offState(){
  var O = window.OFFLINE, s0 = O ? O.state : null;
  if (!s0) return "غير متاح";
  if (s0.err === "apk") return "التطبيق مثبت على الجهاز وكل ملفاته بداخله، فيعمل بدون إنترنت دائماً.";
  if (s0.err === "file") return "الشاشة تعمل من ملف على الجهاز، فهي تعمل بدون إنترنت أصلاً.";
  if (!s0.supported) return location.protocol === "http:" && location.hostname !== "localhost" ? "يحتاج الموقع إلى HTTPS حتى يعمل الحفظ بدون إنترنت." : "المتصفح لا يدعم الحفظ بدون إنترنت.";
  if (s0.busy) return "جارٍ تنزيل الملفات...";
  if (!s0.at) return "لم يُجهَّز بعد.";
  return (s0.fail ? "جاهز جزئياً: تعذر تنزيل " + s0.fail + " من " + s0.total + " ملف. " : "جاهز للعمل بدون إنترنت. ") + "آخر تجهيز " + A.fmtT(s0.at) + ".";
}
/* ===== التشغيل التلقائي بعد إعادة تشغيل الجهاز ===== */
function runLink(){
  var u = location.href.split("#")[0].split("?")[0], r = S.remote || {};
  if (r.on && r.server && r.code) u += "?server=" + encodeURIComponent(r.server) + "&code=" + encodeURIComponent(r.code) + (r.key ? "&token=" + encodeURIComponent(r.key) : "");
  return u;
}
function platform(){ var u = navigator.userAgent; return /Android/i.test(u) ? "android" : /Windows/i.test(u) ? "win" : /Mac OS/i.test(u) ? "mac" : /Linux|CrOS/i.test(u) ? "linux" : "other"; }
var KFLAGS = "--kiosk --autoplay-policy=no-user-gesture-required --no-first-run --noerrdialogs --disable-session-crashed-bubble --disable-infobars";
function winBat(){
  var edgeFirst = /Edg\//.test(navigator.userAgent); // يُفتح نفس المتصفح الذي ضُبطت فيه الإعدادات
  var chrome = ['if exist "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe" set "B=%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe"',
    'if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" set "B=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"',
    'if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set "B=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"'];
  var edge = ['if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" set "B=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"',
    'if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" set "B=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"'];
  var L = ["@echo off", "chcp 65001 >nul",
    "rem Rawayie Al-Adhan prayer screen - start automatically with Windows",
    "rem Double-click once to enable.  To disable: delete rawayie-screen.bat from shell:startup",
    'set "ST=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\rawayie-screen.bat"',
    'set "HD=%LOCALAPPDATA%\\RawayieScreen"',
    'if /i "%~1"=="run" goto run',
    'if not exist "%HD%" mkdir "%HD%"',
    'copy /y "%~f0" "%HD%\\start.bat" >nul',
    '> "%ST%" echo @chcp 65001 ^>nul',
    '>> "%ST%" echo @call "%HD%\\start.bat" run',
    "echo.", "echo   [OK] Autostart is ON. The prayer screen will open full screen after every restart.",
    "echo   To exit full screen press Alt+F4.", "timeout /t 6 >nul", "goto open",
    ":run", "timeout /t 15 /nobreak >nul",
    ":open", 'set "URL=' + runLink().replace(/%/g, "%%") + '"', 'set "B="']
    .concat(edgeFirst ? chrome.concat(edge) : edge.concat(chrome))
    .concat(['if not defined B goto nob', 'start "" "%B%" ' + KFLAGS + ' "%URL%"', "exit /b", ":nob", 'start "" "%URL%"', "exit /b"]);
  return L.join("\r\n") + "\r\n";
}
function linuxDesk(){
  return "[Desktop Entry]\nType=Application\nName=Rawayie Al-Adhan\nComment=Prayer times screen\n" +
    "Exec=chromium-browser " + KFLAGS + " " + runLink().replace(/%/g, "%%") + "\nX-GNOME-Autostart-enabled=true\nX-GNOME-Autostart-Delay=15\n";
}
function dl(name, text, type){
  var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type:type || "application/octet-stream"})); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function autoCard(){
  var AN = window.RawayieAndroid;
  if (AN) { var ok = false; try { ok = AN.canAutostart(); } catch(e){}
    return card("التشغيل التلقائي بعد إعادة تشغيل الجهاز",
      '<div class="fld"><span><b>الحالة</b><small>' + (ok ? "مفعّل ✓ يفتح التطبيق وحده بعد تشغيل الجهاز" : "يحتاج إذناً واحداً: «الظهور فوق التطبيقات الأخرى»") + '</small></span>' + (ok ? "" : btn("السماح الآن", "autoApk", "sm")) + '</div>' +
      '<p class="note">في بعض أجهزة التلفاز ابحث أيضاً في إعداداتها عن «التشغيل التلقائي» أو «Auto start» وفعّله لهذا التطبيق، وأوقف «توفير الطاقة».</p>'); }
  var pf = platform(), lk = esc(runLink());
  var main = pf === "win" ? btn("تفعيل التشغيل التلقائي (ويندوز)", "autoWin") : pf === "linux" ? btn("تفعيل التشغيل التلقائي (لينكس / راسبيري)", "autoLinux") : "";
  var steps = {
    win: "اضغط الزر فينزل ملف صغير، ثم افتحه مرة واحدة من التنزيلات. إذا ظهر تحذير ويندوز اختر «مزيد من المعلومات» ثم «تشغيل على أي حال». بعدها تفتح الشاشة وحدها بملء الشاشة بعد كل إعادة تشغيل، ويعمل الأذان بدون ضغط «تفعيل الصوت». للخروج من ملء الشاشة: Alt+F4.",
    linux: "اضغط الزر فينزل ملف rawayie.desktop، ثم انقله إلى المجلد ‎~/.config/autostart‎. تفتح الشاشة بملء الشاشة بعد كل تشغيل.",
    android: "أجهزة أندرويد والشاشات الذكية لا تسمح للمتصفح بالتشغيل وحده. ثبّت تطبيق «Fully Kiosk Browser» من متجر Google Play، وضع فيه رابط الشاشة أدناه كصفحة البداية (Start URL)، وفعّل خيار التشغيل عند بدء الجهاز (Start on boot). أو استخدم تطبيق روائع الأذان الأصلي.",
    mac: "من إعدادات النظام ← عام ← عناصر تسجيل الدخول، أضف متصفح Chrome، واجعل رابط الشاشة أدناه صفحة البداية فيه.",
    other: "اجعل المتصفح يفتح مع تشغيل الجهاز، واجعل رابط الشاشة أدناه صفحة البداية."
  }[pf];
  return card("التشغيل التلقائي بعد إعادة تشغيل الجهاز",
    '<p class="note">' + esc(steps) + '</p>' +
    '<div class="fld col"><span><b>رابط تشغيل هذه الشاشة</b><small>بإعداداتها وربطها بالإدارة عن بعد إن وُجد</small></span><input type="text" readonly dir="ltr" value="' + lk + '" id="runlk"></div>' +
    '<div class="row-end">' + main + btn("نسخ الرابط", "autoCopy", "ghost") +
      (pf !== "win" ? btn("ملف ويندوز", "autoWin", "ghost") : btn("ملف لينكس", "autoLinux", "ghost")) + '</div>',
    "يحتاجه جهاز الشاشة عند انقطاع الكهرباء أو إعادة التشغيل، فتعود الشاشة وحدها بدون تدخل.");
}

R.general = function(){
  return licCard() + card("رسالة بداية التشغيل",
    tog("تفعيل رسالة بداية التشغيل", "splash.on", "تظهر عند فتح التطبيق: البسملة ثم الشعار ثم اسم المسجد، وتختفي وحدها") +
    (S.splash.on !== false ? txt("النص في الأعلى", "splash.text", "الافتراضي: بسم الله الرحمن الرحيم") + tog("إظهار اسم المسجد", "splash.name") +
      txt("سطر إضافي أسفل الاسم", "splash.sub", "اختياري، مثل: حياكم الله. إذا تُرك فارغاً يظهر موقع المسجد") +
      numIn("مدة الظهور", "splash.sec", 2, 60, 1, "ثانية") : "") +
    '<div class="row-end">' + btn("معاينة الآن", "splashPrev", "ghost") + '</div>') + autoCard() + card("المحرر ولوحة المفاتيح", tog("فتح المحرر الخاص عند الكتابة", "textEditor", "نافذة كبيرة فيها الرموز والتشكيل والمعاينة واستيراد الملفات، تظهر عند الكتابة في أي حقل نصي") +
    sel("لوحة المفاتيح", "vkb", [["on","محرر ولوحة التطبيق دائماً (المفضل)"],["auto","تلقائي: في تطبيق أندرويد والشاشة المدوّرة فقط"],["off","لوحة مفاتيح الجهاز"]], "لوحة التطبيق عربي وإنجليزي وأرقام ورموز، تدور مع الشاشة وتعمل بالريموت والفأرة")) +
    card("العمل بدون إنترنت",
    '<div class="fld"><span><b>الحالة</b><small id="offst">' + esc(offState()) + '</small></span>' + btn("تجهيز الآن", "offPrep", "sm") + '</div>' + offBrowser() +
    tog("تنزيل كل الخلفيات", "offlineAllBg", "حتى يمكن تغيير الخلفية بدون إنترنت (حوالي 15 ميغابايت). تُنزَّل تلقائياً عند اختيار تغيير الخلفية التلقائي"),
    "بعد ضبط الإعدادات تحفظ الشاشة كل ما تحتاجه في الجهاز، وتعمل بالكامل عند انقطاع الإنترنت: المواقيت والأذان والإقامة والأذكار والشرائح. يتحدث الحفظ تلقائياً بعد كل تعديل.") +
        card("النسخ الاحتياطي",
      '<label class="fld col" for="bk"><span><b>إعدادات الشاشة</b><small>انسخ النص واحفظه، أو الصق نسخة سابقة ثم اضغط استيراد. الصور والأصوات المرفوعة لا تُنسخ.</small></span><textarea id="bk" rows="5" dir="ltr"></textarea></label>' +
      '<div class="row-end">' + btn("تصدير", "bkOut", "ghost") + btn("نسخ", "bkCopy", "ghost") + btn("استيراد", "bkIn") + '</div>' +
      '<div class="fld"><span><b>ملف الإعدادات</b><small>ملف واحد فيه كل الإعدادات مع الشعار والخلفيات والأصوات والشرائح المرفوعة. انقله لشاشة أخرى أو احتفظ به نسخة احتياطية</small></span><span class="nb">' + btn("حفظ في ملف", "bkFile", "sm") + '<label class="btn sm ghost">فتح ملف<input type="file" accept=".json,application/json" data-up="bkfile" hidden></label></span></div>') +
    card("إعادة ضبط", '<p class="note">تمسح جميع الإعدادات وتعيد الشاشة لحالتها الأولى.</p><div class="row-end" id="rstw">' + btn("إعادة ضبط", "reset", "danger") + btn("إعادة تحميل", "reload", "ghost") + '</div>') +
    card("معلومات عن البرنامج",
      '<div class="about"><img src="img/mark.png" alt=""><div><b>روائع الأذان · ' + (window.RawayieAndroid ? 'نسخة أندرويد ' : 'نسخة الويب ') + A.VERSION + '</b><p>هذا التطبيق وقف لبيوت الله ولا يجوز بيعه</p>' +
      '<p>مؤسسة روائع لتقنية المعلومات · المملكة العربية السعودية</p><p>الرقم الوطني الموحد: <span dir="ltr">7033223112</span></p><p>الموقع الإلكتروني: <span dir="ltr">rawayie.sa</span></p></div>' +
      '<img class="qr" src="img/qr.png" alt="رمز QR لمعلومات مؤسسة روائع لتقنية المعلومات"></div><p class="note">امسح الرمز بالجوال لعرض معلومات المؤسسة والرقم الوطني الموحد وموقعها.</p>');
};

/* ===== الصفحة الرئيسية للإعدادات: كل الأقسام في مجموعات مع البحث في كل الخيارات ===== */
/* شريط التفعيل أعلى صفحة الإعدادات: رقم الجهاز ظاهر دائماً حتى يُرسل لطلب كود التفعيل */
function licStrip(){
  var L = window.LICENSE; if (!L) return ""; var s = L.status(); if (s.active) return "";
  return '<button type="button" class="licstrip' + (s.expired ? " bad" : "") + '" data-act="goto" data-x="general|رقم الجهاز"><span><b>' + (s.trial ? "نسخة تجريبية: متبقي " + s.leftDays + (s.leftDays === 1 ? " يوم" : " أيام") : s.pending ? "جارٍ التحقق من ترخيص الشاشة" : esc(s.msg || "الشاشة غير مفعّلة")) + '</b><small>أرسل رقم الجهاز عبر واتساب ' + esc(s.wa) + ' لطلب كود التفعيل من الإدارة</small></span><span class="lsid"><small>رقم الجهاز</small><b dir="ltr">' + esc(s.idText) + '</b></span></button>';
}
function homeHTML(){
  return '<div class="shome"><h2>' + ico("gear") + 'الإعدادات</h2><p class="sdesc">اختر القسم الذي تريد ضبطه، أو ابحث عن أي خيار باسمه.</p>' +
    '<label class="ssearch" for="sq">' + ico("search") + '<input type="search" id="sq" placeholder="ابحث في الإعدادات… مثل: الإقامة، الخلفية، الخط، السكون" autocomplete="off"></label>' +
    licStrip() + '<div id="sres" class="sres" hidden></div><div id="sgroups">' +
    GROUPS.map(function(g){ var ss = SECTIONS.filter(function(s){ return s[4] === g[0] && allowed(s[0]); }); if (!ss.length) return "";
      return '<section class="hgrp"><h3>' + esc(g[1]) + '</h3><div class="tiles">' + ss.map(function(s){
        return '<button type="button" class="tile" data-sec="' + s[0] + '"><span class="ti">' + ico(s[3]) + '</span><span class="tt"><b>' + esc(s[1]) + '</b><small>' + esc(s[2]) + '</small></span></button>'; }).join("") + '</div></section>'; }).join("") + '</div></div>';
}
/* أزرار التنقل أسفل القسم: السابق والتالي */
function nextHTML(k){
  var L = SECTIONS.filter(function(s){ return allowed(s[0]); }), i = -1; for (var j = 0; j < L.length; j++) if (L[j][0] === k) i = j;
  var pv = i > 0 ? L[i - 1] : null, nx = i >= 0 && i < L.length - 1 ? L[i + 1] : null;
  return '<div class="snext">' + (pv ? '<button type="button" class="btn ghost" data-sec="' + pv[0] + '">→ ' + esc(pv[1]) + '</button>' : '<span></span>') +
    (nx ? '<button type="button" class="btn ghost" data-sec="' + nx[0] + '">' + esc(nx[1]) + ' ←</button>' : "") + '</div>';
}
/* فهرس البحث: أسماء البطاقات والخيارات في كل قسم */
var sIndex = null;
function buildIndex(){
  var out = [], keep = n;
  SECTIONS.forEach(function(s){ if (!allowed(s[0]) || !R[s[0]]) return; var h = "";
    try { h = R[s[0]](); } catch(e){ return; }
    var card0 = "", re = /<h3>([^<]*)<\/h3>|<b>([^<]*)<\/b>(?:<small>([^<]*)<\/small>)?/g, m;
    while ((m = re.exec(h))) {
      if (m[1] != null) { card0 = unesc(m[1]); out.push({sec:s[0], card:card0, label:card0, hint:"", head:true}); }
      else if (m[2] && m[2].length > 1) out.push({sec:s[0], card:card0, label:unesc(m[2]), hint:unesc(m[3] || "")});
    } });
  n = keep; return out;
}
function unesc(t){ return String(t).replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); }
function norm(t){ return String(t || "").replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase(); }
function searchRun(q){
  var box = $("#sres", body), grp = $("#sgroups", body); if (!box) return;
  q = norm(q).trim();
  if (!q) { box.hidden = true; box.innerHTML = ""; grp.hidden = false; return; }
  if (!sIndex) sIndex = buildIndex();
  var words = q.split(/\s+/).map(function(w){ return w.length > 3 && w.indexOf("ال") === 0 ? w.slice(2) : w; }), seen = {}, hit = function(t){ t = norm(t); for (var i = 0; i < words.length; i++) if (t.indexOf(words[i]) < 0) return false; return true; };
  var secs = SECTIONS.filter(function(sc){ return allowed(sc[0]) && hit(sc[1] + " " + sc[2]); }).map(function(sc){ return {sec:sc[0], label:sc[1], card:"", hint:sc[2], top:true}; });
  var res = secs.concat(sIndex.filter(function(x){ if (!hit(x.label + " " + x.hint)) return false;
    var k = x.sec + "|" + x.label; if (seen[k]) return false; seen[k] = 1; return true; })).slice(0, 40);
  grp.hidden = true; box.hidden = false;
  box.innerHTML = res.length ? res.map(function(x){ var sc = secOf(x.sec);
    return '<button type="button" class="sr" data-act="goto" data-x="' + esc(x.sec + "|" + (x.top ? "" : x.label)) + '"><span class="ti">' + ico(sc[3]) + '</span><span class="tt"><b>' + esc(x.label) + '</b><small>' + esc(x.top ? "قسم: " + x.hint : sc[1] + (x.head || !x.card ? "" : " ‹ " + x.card)) + '</small></span></button>'; }).join("")
    : '<p class="note">لا توجد نتائج. جرّب كلمة أخرى.</p>';
}
function gotoOpt(sec, label){
  cur = sec; render(); body.scrollTop = 0;
  var el = null; $$("h3, .fld b", body).some(function(b){ if (b.textContent === label) { el = b.closest(".fld") || b.closest(".sec"); return true; } return false; });
  if (el) { if (el.scrollIntoView) el.scrollIntoView({block:"center"}); el.classList.add("flash"); setTimeout(function(){ el.classList.remove("flash"); }, 2600);
    var inp = $("input,select,textarea", el); if (inp && inp.focus) try { inp.focus({preventScroll:true}); } catch(e){ inp.focus(); } }
}

/* ===== الرسم والأحداث ===== */
function render(){
  n = 0;
  if (!allowed(cur)) cur = "home";
  $$("button[data-sec]", nav).forEach(function(b){ b.hidden = !allowed(b.dataset.sec); b.classList.toggle("on", b.dataset.sec === cur); });
  $$(".ngrp", nav).forEach(function(g){ g.hidden = !$$("button[data-sec]", g).some(function(b){ return !b.hidden; }); });
  var cs = $("#curs"); if (cs) { var sc0 = secOf(cur); cs.textContent = sc0 ? "· " + sc0[1] : ""; }
  var who = $("#who"); if (who) who.textContent = S.pass ? (role === "admin" ? "مدير الشاشة" : (S.sup.name || "مشرف المسجد")) : "";
  if (!anyAllowed()) { body.innerHTML = '<h2>لا توجد صلاحيات</h2><p class="note">لم يحدد مدير الشاشة أي قسم لهذا الحساب.</p>'; return; }
  if (cur === "home") { body.innerHTML = homeHTML(); var hq = $("#sq", body); if (hq) hq.addEventListener("input", function(){ searchRun(hq.value); }); return; }
  var sc1 = secOf(cur);
  body.innerHTML = '<div class="shead"><button type="button" class="crumb" data-sec="home">' + ico("home") + 'الإعدادات</button><span class="crumb-sep">‹</span><span class="crumb g">' + esc(groupName(sc1[4])) + '</span>' +
    '<h2>' + ico(sc1[3]) + esc(sc1[1]) + '</h2><p class="sdesc">' + esc(sc1[2]) + '</p></div>' + R[cur]() + nextHTML(cur);
  $$("[data-media]", body).forEach(function(im){ A.mediaURL(im.dataset.media).then(function(u){ if (u) im.src = u; }); });
  if (cur === "slides") { slPaint(); }
  if (cur === "shadow") setTimeout(shPreview, 30);
  var ta1 = $("#tarea"); if (ta1) { ta1.addEventListener("input", txCount); txCount(); }
  var dz = $("#tdrop"); if (dz) {
    ["dragenter","dragover"].forEach(function(ev){ dz.addEventListener(ev, function(e){ e.preventDefault(); dz.classList.add("over"); }); });
    ["dragleave","drop"].forEach(function(ev){ dz.addEventListener(ev, function(e){ e.preventDefault(); dz.classList.remove("over"); }); });
    dz.addEventListener("drop", function(e){ importFile(e.dataTransfer.files[0]); });
  }
  var cs = $("#csearch"); if (cs) cs.addEventListener("input", function(){
    var q = cs.value.trim(), s = $("#city");
    $$("option", s).forEach(function(o){ o.hidden = q && o.textContent.indexOf(q) < 0 && o.value.indexOf(q.toLowerCase()) < 0; });
    var f = $$("option", s).filter(function(o){ return !o.hidden; })[0]; if (q && f && f.value !== S.city) { s.value = f.value; s.dispatchEvent(new Event("change", {bubbles:true})); }
  });
}
function onChange(e){
  var el = e.target;
  if (el.id === "calm") { calMonth = el.value; render(); return; }
  if (el.dataset.p === "lastMinOnly") { var lw = $("#lmwarn"); if (lw) lw.hidden = !el.checked; } // توضيح فوري عند التفعيل
  if (el.id === "spimg") { var f9 = el.files[0]; if (!f9) return; shrink(f9, 3840).then(function(b){ var id9 = A.uid(); return A.IDB.put(id9, b).then(function(){ slDraft.img = id9; render(); }); }).catch(function(){ toast("تعذر حفظ الصورة"); }); return; }
  if (el.dataset.sp) { onSlInput(e); return; }
  if (el.dataset.perm) { var ss = S.sup.sections || []; var ix = ss.indexOf(el.dataset.perm); if (el.checked && ix < 0) ss.push(el.dataset.perm); if (!el.checked && ix >= 0) ss.splice(ix, 1); S.sup.sections = ss; A.save(); return; }
  if (el.id === "txt") { txTarget = el.value; render(); return; }
  if (el.id === "txs") { var a0 = $("#tarea"), items0 = txSplitText(a0.value); txSplit = el.value; a0.value = txJoin(items0); txCount(); return; }
  if (el.id === "tfile") { importFile(el.files[0]); el.value = ""; return; }
  if (el.id === "tmode" || el.id === "tarea") return;
  if (el.id === "ntype") { $("#ndays").hidden = el.value !== "week"; $("#ndatew").hidden = el.value !== "date"; return; }
  if (el.id === "hd4k") { try { window.RawayieAndroid.setPrefer4k(el.checked); } catch(e){} setTimeout(render, 2500); return; }
  if (el.dataset.up) { upload(el); return; }
  if (!el.dataset.p) return;
  var v = el.dataset.t === "bool" ? el.checked : el.dataset.t === "num" ? parseFloat(el.value) : el.value;
  if (el.dataset.t === "num" && isNaN(v)) return;
  if (el.type === "number") { var mn = parseFloat(el.min), mx = parseFloat(el.max); if (v < mn) v = mn; if (v > mx) v = mx; }
  put(el.dataset.p, v); commit(); if (cur === "shadow") setTimeout(shPreview, 30); if (/^look\.hi/.test(el.dataset.p)) updHiPrev();
  if (/^remote\./.test(el.dataset.p) && window.REMOTE) { window.REMOTE.start(); setTimeout(function(){ if (cur === "remote") render(); }, 2000); }
  if (el.dataset.p === "city" || el.dataset.p === "custom.on") A.loadCity(S.city, function(){ A.clearCache(); if (cur === "times" || cur === "calendar") render(); });
  if (/^(sleepIsha|sleepSunrise|sleepMsgOn|hideIsha|wakeFajr|hideSunrise|wakeDhuhr|zk\.(after|morning|evening|autoSec|noRepeat)|custom\.on|look\.logo|look\.hiCustom|look\.nativeRot|look\.wm|look\.hiTextOn|look\.hiFrame|look\.nbCustom|look\.ovClock|look\.tblStyle|look\.hiOn|look\.shadow|look\.logo|look\.rowAuto|look\.scMode|remote\.on|look\.bgMode|blackStyle|look\.homeClock|iqNowOn|look\.nightTimes|look\.nightShow|look\.newsShade$|look\.logoColor|look\.autoColor|snd\.azan|snd\.iqama|weather\.src|lang|city)$/.test(el.dataset.p)) render();
}
function step(b){ var inp = b.parentNode.querySelector("input"), s = parseFloat(b.dataset.step), v = (parseFloat(inp.value) || 0) + s;
  v = Math.round(v*10000)/10000; inp.value = v; inp.dispatchEvent(new Event("change", {bubbles:true})); }

function shrink(file, max){
  return new Promise(function(res){
    var img = new Image(), u = URL.createObjectURL(file);
    // تصغير بجودة عالية: على مراحل (النصف كل مرة) مع تنعيم عالٍ، فلا تظهر حواف مسننة أو بكسلة. الصورة الأصغر من الحد تبقى كما هي
    img.onload = function(){ var s = Math.min(1, max/Math.max(img.width, img.height));
      if (s >= 1 && file.size < 6e6) { URL.revokeObjectURL(u); res(file); return; }
      var tw = Math.round(img.width*s), th = Math.round(img.height*s), src = img, cw = img.width, ch = img.height, c;
      do { cw = Math.max(tw, Math.round(cw/2)); ch = Math.max(th, Math.round(ch/2));
        c = document.createElement("canvas"); c.width = cw; c.height = ch; var x = c.getContext("2d");
        x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high"; x.drawImage(src, 0, 0, cw, ch); src = c;
      } while (cw > tw || ch > th);
      URL.revokeObjectURL(u); c.toBlob(function(b){ res(b || file); }, file.type === "image/png" ? "image/png" : "image/jpeg", .93); };
    img.onerror = function(){ res(file); }; img.src = u;
  });
}
/* ===== حفظ جميع الإعدادات ===== */
function saveAll(){
  A.save();
  var b = $("#saveall"), jobs = [];
  if (window.REMOTE && S.remote && S.remote.on) jobs.push(window.REMOTE.push());
  if (window.OFFLINE && window.OFFLINE.prepare) jobs.push(window.OFFLINE.prepare());
  if (b) { b.disabled = true; b.textContent = "جارٍ الحفظ..."; }
  Promise.all(jobs.map(function(p){ return Promise.resolve(p).catch(function(){}); })).then(function(){
    var z = A.zp(Date.now()); S.savedAt = Date.now(); A.save();
    if (b) { b.disabled = false; b.textContent = "تم الحفظ ✓"; b.classList.add("ok"); setTimeout(function(){ b.textContent = "حفظ الإعدادات"; b.classList.remove("ok"); }, 2500); }
    toast("تم حفظ جميع الإعدادات في هذا الجهاز" + (S.remote && S.remote.on ? " والخادم" : "") + " · " + A.two(z.h) + ":" + A.two(z.m));
  });
}
// ملف واحد فيه كل الإعدادات مع الشعار والخلفيات والأصوات والشرائح المرفوعة
function mediaIds(){ var ids = {}; (function walk(o){ if (!o || typeof o !== "object") return; for (var k in o) { var v = o[k]; if (typeof v === "string" && /^m[0-9a-z]{8,16}$/.test(v)) ids[v] = 1; else walk(v); } })(S); return Object.keys(ids); }
function blobToData(b){ return new Promise(function(res){ var r = new FileReader(); r.onload = function(){ res(r.result); }; r.onerror = function(){ res(""); }; r.readAsDataURL(b); }); }
function saveFile(){
  var c = JSON.parse(JSON.stringify(S)); delete c.pass; if (c.sup) delete c.sup.pass; if (c.remote) { delete c.remote.key; delete c.remote.pair; }
  c._file = "rawayie-settings"; c._media = {};
  toast("جارٍ تجهيز الملف...");
  Promise.all(mediaIds().map(function(id){ return A.IDB.get(id).then(function(b){ return b ? blobToData(b).then(function(d){ if (d) c._media[id] = d; }) : null; }).catch(function(){}); })).then(function(){
    var z = A.zp(Date.now()), nm = "rawayie-settings-" + z.Y + "-" + A.two(z.M + 1) + "-" + A.two(z.D) + ".json";
    dl(nm, JSON.stringify(c), "application/json");
    toast("تم حفظ ملف الإعدادات" + (Object.keys(c._media).length ? " مع " + Object.keys(c._media).length + " صورة وصوت" : ""));
  });
}
function openFile(f){
  var r = new FileReader();
  r.onload = function(){
    try {
      var obj = JSON.parse(r.result), media = obj._media || {}; delete obj._media; delete obj._file;
      obj.pass = S.pass; obj.sup = obj.sup || {}; obj.sup.pass = S.sup.pass;
      if (S.remote) { obj.remote = Object.assign({}, obj.remote || {}, {key:S.remote.key}); }
      Promise.all(Object.keys(media).map(function(id){ return fetch(media[id]).then(function(x){ return x.blob(); }).then(function(b){ return A.IDB.put(id, b); }).catch(function(){}); }))
        .then(function(){ A.setAll(obj); render(); toast("تم فتح ملف الإعدادات وتطبيقه"); });
    } catch(err){ toast("الملف غير صالح"); }
  };
  r.readAsText(f);
}
function upload(el){
  var kind = el.dataset.up, files = Array.prototype.slice.call(el.files || []); if (!files.length) return;
  if (kind === "bkfile") { openFile(files[0]); el.value = ""; return; }
  var one = function(f, max){ var id = A.uid(); return (f.type.indexOf("image") === 0 ? shrink(f, max) : Promise.resolve(f)).then(function(b){ return A.IDB.put(id, b).then(function(){ return id; }); }); };
  var fail = function(){ toast("تعذر حفظ الملف على هذا الجهاز"); };
  if (kind === "slide") { Promise.all(files.map(function(f){ return one(f, 3840); })).then(function(ids){ S.slides.items = S.slides.items.concat(ids.map(function(m){ return {id:A.uid(), img:m, imgMode:"contain", active:true}; })); commit(); render(); toast("تمت إضافة " + ids.length + " شريحة"); }).catch(fail); return; }
  var f = files[0];
  if (kind.indexOf("sp:") === 0) { var pth = kind.slice(3); one(f, 3840).then(function(id){ var old = get(pth); if (old && old.indexOf("file:") < 0 && !/^(https?:)?\/\//.test(old)) A.IDB.del(old); put(pth, id); commit(); render(); toast("تم الحفظ بنجاح"); }).catch(fail); return; }
  one(f, kind === "logo" ? 1200 : kind === "wm" ? 2000 : 3840).then(function(id){
    if (kind === "logo") { if (S.look.logoId) A.IDB.del(S.look.logoId); S.look.logoId = id; S.look.logoColor = "gold"; S.look.logo = true; }
    if (kind === "wm") { if (S.look.wmImg && !/^(https?:)?\/\//.test(S.look.wmImg)) A.IDB.del(S.look.wmImg); S.look.wmImg = id; S.look.wm = true; }
    if (kind === "bg") { if (S.look.customBg) A.IDB.del(S.look.customBg); S.look.customBg = id; }
    if (kind === "azan") { if (S.snd.azanId) A.IDB.del(S.snd.azanId); S.snd.azanId = id; }
    if (kind === "iqama") { if (S.snd.iqamaId) A.IDB.del(S.snd.iqamaId); S.snd.iqamaId = id; }
    commit(); render(); toast("تم الحفظ بنجاح");
  }).catch(fail);
}
function move(arr, i){ if (i > 0) { var x = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = x; } }
function idx(arr, id){ for (var i = 0; i < arr.length; i++) if ((arr[i].id || arr[i]) === id) return i; return -1; }

var confirmAct = null;
function onClick(e){
  var b = e.target.closest("button"); if (!b) return;
  if (b.dataset.step) { step(b); return; }
  if (b.dataset.sec) { if (!allowed(b.dataset.sec)) return; panel.classList.remove("navopen"); $("#hamb").setAttribute("aria-expanded", "false"); cur = b.dataset.sec; calEdit = null; newsEdit = null; boardEdit = null; slEdit = null; slDraft = null; render(); body.scrollTop = 0; return; }
  var a = b.dataset.act, x = b.dataset.x; if (!a) return;
  var danger = {reset:1, nClear:1, sClear:1, bClear:1};
  if (danger[a] && confirmAct !== a) { confirmAct = a; b.textContent = "اضغط مرة أخرى للتأكيد"; setTimeout(function(){ if (confirmAct === a) { confirmAct = null; render(); } }, 3500); return; }
  confirmAct = null;
  switch (a) {
    case "spSet": var q1 = x.split("|"); put(q1[0], q1[1]);
      var lp = q1[0].replace(/style$/, "light").replace(/^blackStyle$/, "blackLight"); if (q1[1] === "image" && !(+get(lp) > 0.3)) put(lp, 0.6);
      commit(); render(); break;
    case "spImg": var q2 = x.split("|"), old = get(q2[0]); if (old && old.indexOf("file:") < 0 && !/^(https?:)?\/\//.test(old)) A.IDB.del(old); put(q2[0], q2[1] || ""); commit(); render(); break;
    case "sbTab": R.hide.sb = x; render(); break;
    case "sleepPrevK": close(); A.previewBlack(10000, true, x); break;
    case "autoApk": try { window.RawayieAndroid.requestAutostart(); } catch(e){} setTimeout(render, 4000); break;
    case "licCheck": if (window.LICENSE) window.LICENSE.check().then(function(ok){ toast(ok ? "تم تحديث الترخيص ✓" : (window.LICENSE.status().msg || "تعذر الاتصال بموقع الإدارة")); render(); }); break;
    case "licKey": var lk = $("#liccode"); if (lk) { var dg = lk.value.replace(/\D/g, ""); dg = x === "del" ? dg.slice(0, -1) : (dg + x).slice(0, 8); lk.value = dg.length > 4 ? dg.slice(0, 4) + " " + dg.slice(4) : dg; } break;
    case "licAct": var lc = $("#liccode"); if (window.LICENSE && lc && window.LICENSE.activate(lc.value)) { toast("تم تفعيل التطبيق ✓"); render(); } else { var lm = $("#licmsg"); if (lm) { lm.textContent = "الكود غير صحيح لهذا الجهاز"; lm.style.color = "#ff8a8a"; } } break;
    case "goto": var gi = x.indexOf("|"); gotoOpt(x.slice(0, gi), x.slice(gi + 1)); break;
    case "resetTimes": S.adj = JSON.parse(JSON.stringify(A.DEF.adj)); S.iq = JSON.parse(JSON.stringify(A.DEF.iq)); S.duha = A.DEF.duha; S.shift = 0; S.summer = false; S.ramadan30 = false; S.hijriAdj = 0; commit(); render(); toast("تمت إعادة الضبط"); break;
    case "calEdit": calEdit = x; render(); var cb = $(".calbox", body); if (cb && cb.scrollIntoView) cb.scrollIntoView({block:"center"}); break;
    case "calCancel": calEdit = null; render(); break;
    case "calSave":
      var o = {}, p = x.split("-"), d = A.dayTimes(+p[0], +p[1] - 1, +p[2]), old = S.overrides[x] || {};
      $$("[data-cal]", body).forEach(function(inp){
        var k = inp.dataset.cal, cur0 = d.list.filter(function(q){ return q.k === k; })[0], zz = A.zp(cur0.A), v0 = A.two(zz.h) + ":" + A.two(zz.m);
        if (inp.value && (inp.value !== v0 || old[k])) o[k] = inp.value;
      });
      if (Object.keys(o).length) S.overrides[x] = o; else delete S.overrides[x];
      calEdit = null; commit(); render(); toast("تم التعديل"); break;
    case "calReset": delete S.overrides[x]; commit(); render(); break;
    case "test": A.unlock(); setTimeout(function(){ A.play(x); }, 350); break;
    case "nAdd": newsEdit = "new"; render(); break;
    case "nEdit": newsEdit = x; render(); break;
    case "nCancel": newsEdit = null; render(); break;
    case "alTog": var al = (S.alerts || []).filter(function(q){ return q.id === x; })[0]; if (al) { al.on = al.on === false; commit(); render(); } break;
    case "alDel": S.alerts = (S.alerts || []).filter(function(q){ return q.id !== x; }); commit(); render(); toast("تم حذف الرسالة"); break;
    case "nDel": S.news.splice(idx(S.news, x), 1); commit(); render(); break;
    case "nUp": move(S.news, idx(S.news, x)); commit(); render(); break;
    case "nClear": S.news = []; commit(); render(); toast("تم حذف كل الرسائل"); break;
    case "tIns": var ta0 = $("#tarea"), s0 = ta0.selectionStart, e0 = ta0.selectionEnd, ch = x.replace(" ", "");
      if (x.indexOf(" ") > 0 && s0 !== e0) ch = x.split(" ")[0] + ta0.value.slice(s0, e0) + x.split(" ")[1];
      ta0.setRangeText(ch, s0, e0, "end"); ta0.focus(); txCount(); break;
    case "tSave": var dd = txDefs()[txTarget], v = $("#tarea").value;
      if (dd.multi) dd.set(txSplitText(v)); else { if (txTarget === "mosque" && !v.trim()) { toast("اكتب اسم المسجد"); return; } dd.set(v.trim()); }
      commit(); toast("تم الحفظ بنجاح"); txCount(); break;
    case "tCopy": var tc = $("#tarea"); try { navigator.clipboard.writeText(tc.value).then(function(){ toast("تم النسخ"); }, function(){ tc.select(); toast("حدد النص وانسخه"); }); } catch(err){ tc.select(); } break;
    case "tDef": var d2 = txDefs()[txTarget]; $("#tarea").value = d2.multi ? txJoin(d2.def) : d2.def; txCount(); toast("اضغط حفظ النص لاعتماد النص الافتراضي"); break;
    case "blkPrev": close(); A.previewBlack(10000); break;
    case "fsReset": S.look.fs = JSON.parse(JSON.stringify(A.DEF.look.fs)); commit(); render(); toast("تمت إعادة الأحجام"); break;
    case "wmReset": if (S.look.wmImg && !/^(https?:)?\/\//.test(S.look.wmImg)) A.IDB.del(S.look.wmImg); S.look.wmImg = ""; commit(); render(); toast("تمت استعادة العلامة الافتراضية"); break;
    case "logoReset": if (S.look.logoId) A.IDB.del(S.look.logoId); S.look.logoId = ""; commit(); render(); toast("تمت استعادة الشعار الافتراضي"); break;
    case "rSync": if (window.REMOTE) { window.REMOTE.start(); setTimeout(render, 2500); toast("جارٍ المزامنة"); } break;
    case "rPush": if (window.REMOTE) window.REMOTE.push().then(function(){ render(); toast("تم رفع الإعدادات"); }); break;
    case "fzDef": S.fixedZekr = A.DEF.fixedZekr; S.fixedOn = true; commit(); render(); toast("تمت استعادة الدعاء"); break;
    case "autoWin": dl("rawayie-autostart.bat", winBat()); toast("افتح الملف المنزّل مرة واحدة لتفعيل التشغيل التلقائي"); break;
    case "autoLinux": dl("rawayie.desktop", linuxDesk(), "text/plain"); toast("انقل الملف إلى ‎~/.config/autostart‎"); break;
    case "autoCopy": var rl = $("#runlk"); if (rl) { rl.select(); try { (navigator.clipboard ? navigator.clipboard.writeText(rl.value) : Promise.reject()).catch(function(){ document.execCommand("copy"); }); } catch(e){ document.execCommand("copy"); } toast("تم نسخ الرابط"); } break;
    case "saveAll": saveAll(); break;
    case "sleepPrev": close(); A.previewBlack(10000, true); break;
    case "fsNow": close(); toggleFS(); break;
    case "actOpen": close(); actOpen(); break;
    case "annReset": S.ann.azan = A.DEF.ann.azan; S.ann.iqama = A.DEF.ann.iqama; commit(); render(); toast("تمت استعادة النص الافتراضي"); break;
    case "annPrevA": case "annPrevI": close(); A.previewAnn(a === "annPrevA" ? "azan" : "iqnow"); break;
    case "splashPrev": close(); A.splash(true); break;
    case "bkFile": saveFile(); break;
    case "offInstall": window.OFFLINE.install().then(function(ok){ toast(ok ? "تم تثبيت التطبيق، افتحه من أيقونته" : "لم يكتمل التثبيت"); render(); }); break;
    case "offPersist": window.OFFLINE.persist(true).then(function(p){ toast(p ? "تم تفعيل الحفظ الدائم" : "رفض المتصفح الطلب. ثبّت التطبيق ثم أعد المحاولة"); render(); }); break;
    case "offPrep": if (window.OFFLINE) { b.disabled = true; $("#offst").textContent = "جارٍ تنزيل الملفات..."; window.OFFLINE.prepare().then(function(){ render(); toast(window.OFFLINE.state.supported ? "تم تجهيز الشاشة" : offState()); }); } break;
    case "setRot": S.look.rot = +x; commit(); render(); setTimeout(function(){ if (cur === "rotate") render(); }, 2800); break;
    case "rotStep": S.look.rot = ((+S.look.rot || 0) + 90) % 360; commit(); render(); setTimeout(function(){ if (cur === "rotate") render(); }, 2800); break;
    case "setOri": S.look.orient = x; commit(); render(); break;
    case "dispOri": R.display.o = x; render(); break;
    case "dispH24": S.look.h24 = x === "24"; commit(); render(); break;
    case "dispRec": Object.keys(DISP_REC).forEach(function(k){ put(k, DISP_REC[k]); }); commit(); render(); toast("تم تطبيق القيم الموصى بها ✓"); break;
    case "wxRefresh": A.refreshWeather(); setTimeout(render, 1500); break;
    case "nSave":
      var tx = $("#ntext").value.trim(); if (!tx) { toast("من فضلك اكتب نص الرسالة"); return; }
      var it = {id: x === "new" ? A.uid() : x, text: tx, type: $("#ntype").value, days: $$("#ndays input:checked").map(function(c){ return +c.value; }), date: $("#ndate").value,
        d1: $("#nd1").value, d2: $("#nd2").value, t1: $("#nt1").value, t2: $("#nt2").value};
      if (x === "new") S.news.push(it); else S.news[idx(S.news, x)] = it;
      newsEdit = null; commit(); render(); toast("تم الحفظ بنجاح"); break;
    case "sNew": slEdit = "new"; slDraft = JSON.parse(JSON.stringify(A.SLIDE_DEF)); slDraft.id = "new"; slDraft.title = "عنوان الشريحة"; slDraft.body = "اكتب نص الشريحة هنا"; render(); body.scrollTop = 0; break;
    case "sEdit": slEdit = x; slDraft = JSON.parse(JSON.stringify(A.SLIDE_DEF)); var src = slById(x); for (var kk in src) slDraft[kk] = src[kk]; render(); body.scrollTop = 0; break;
    case "sCancel": slEdit = null; slDraft = null; render(); break;
    case "sSave": var it2 = JSON.parse(JSON.stringify(slDraft));
      if (slEdit === "new") { it2.id = A.uid(); S.slides.items.push(it2); } else S.slides.items[idx(S.slides.items, slEdit)] = it2;
      slEdit = null; slDraft = null; commit(); render(); toast("تم حفظ الشريحة"); break;
    case "sDup": var c3 = JSON.parse(JSON.stringify(slById(x))); c3.id = A.uid(); S.slides.items.splice(idx(S.slides.items, x) + 1, 0, c3); commit(); render(); break;
    case "sDel": var d3 = slById(x); if (d3 && d3.img && !S.slides.items.some(function(q){ return q !== d3 && q.img === d3.img; })) A.IDB.del(d3.img); S.slides.items.splice(idx(S.slides.items, x), 1); commit(); render(); break;
    case "sUp": move(S.slides.items, idx(S.slides.items, x)); commit(); render(); break;
    case "sClear": S.slides.items.forEach(function(q){ if (q.img) A.IDB.del(q.img); }); S.slides.items = []; commit(); render(); break;
    case "spSeg": var q2 = x.split(":"); slDraft[q2[0]] = q2[1]; $$('[data-act="spSeg"]', body).forEach(function(bt){ if (bt.dataset.x.split(":")[0] === q2[0]) bt.classList.toggle("on", bt.dataset.x === x); }); slPreview(); break;
    case "spImgDel": slDraft.img = ""; render(); break;
    case "bAdd": boardEdit = "new"; render(); break;
    case "bEdit": boardEdit = x; render(); break;
    case "bCancel": boardEdit = null; render(); break;
    case "bDel": var bi = idx(S.boards.items, x); if (S.boards.items[bi].img) A.IDB.del(S.boards.items[bi].img); S.boards.items.splice(bi, 1); commit(); render(); break;
    case "bUp": move(S.boards.items, idx(S.boards.items, x)); commit(); render(); break;
    case "bClear": S.boards.items.forEach(function(q){ if (q.img) A.IDB.del(q.img); }); S.boards.items = []; commit(); render(); break;
    case "bImgDel": var bb = S.boards.items[idx(S.boards.items, x)]; if (bb && bb.img) { A.IDB.del(bb.img); bb.img = ""; commit(); render(); } break;
    case "bSave": saveBoard(x); break;
    case "bg": var q = x.split(":"), hadCustom = !!S.look.customBg; if (q[0] === "P") S.look.bgP = q[1]; else S.look.bgL = q[1];
      if (hadCustom) { A.IDB.del(S.look.customBg); S.look.customBg = ""; }
      // تبديل خفيف وسريع: تُطبَّق الخلفية والألوان فقط بدون إعادة بناء الشاشة أو قائمة الإعدادات
      A.save(); A.applyLook(); $$(".bgt.on", body).forEach(function(z){ z.classList.remove("on"); }); b.classList.add("on");
      if (hadCustom) render(); break;
    case "bgFind": (function(){ var o = document.querySelector(".bgs .bgt.on"); if (!o) return; try { o.scrollIntoView({block:"center", inline:"center", behavior:"smooth"}); } catch (e2) { o.scrollIntoView(); } o.classList.add("flash"); setTimeout(function(){ o.classList.remove("flash"); }, 2400); })(); break;
    case "bgTab": R.look.tab = x; render(); break;
    case "bgDelMode": R.look.delMode = !R.look.delMode; R.look.showHid = false; render(); break;
    case "bgHidView": R.look.showHid = !R.look.showHid; R.look.delMode = false; render(); break;
    case "bgHide":
      var tb = R.look.tab || A.orient(), all = tb === "P" ? window.BG_P : window.BG_L, H0 = S.look.bgHidden = S.look.bgHidden || [];
      if (all.filter(function(q){ return H0.indexOf(q[0]) < 0 && q[0] !== x; }).length < 1) { toast("يجب أن تبقى خلفية واحدة على الأقل"); break; }
      if (H0.indexOf(x) < 0) H0.push(x);
      var curF = tb === "P" ? S.look.bgP : S.look.bgL;
      if (curF === x) { var nx = A.bgList(tb)[0][0]; if (tb === "P") S.look.bgP = nx; else S.look.bgL = nx; } // الخلفية الحالية حُذفت: تُختار التالية
      A.save(); A.applyLook(); var sp = b.parentNode; if (sp && sp.parentNode) sp.parentNode.removeChild(sp);
      // تُمسح من ذاكرة الجهاز أيضاً فتتوفر المساحة
      try { if (window.caches) caches.keys().then(function(ks){ ks.forEach(function(k){ caches.open(k).then(function(c){ c.keys().then(function(rs){ rs.forEach(function(rq){ if (rq.url.indexOf("/bg/" + x) >= 0) c.delete(rq); }); }); }); }); }); } catch(err){}
      toast("حُذفت الخلفية من القائمة ومن ذاكرة الجهاز"); break;
    case "bgRestore": S.look.bgHidden = (S.look.bgHidden || []).filter(function(q){ return q !== x; }); A.save(); var sp2 = b.parentNode; if (sp2 && sp2.parentNode) sp2.parentNode.removeChild(sp2); toast("أُعيدت الخلفية"); break;
    case "bgClear": A.IDB.del(S.look.customBg); S.look.customBg = ""; commit(); render(); break;
    case "accent": S.look.accent = x; commit(); render(); break;
    case "tcReset": S.look.tcName = "#FFD54A"; S.look.tcAdhan = "#FFFFFF"; S.look.tcIqama = "#FFD54A"; S.look.tcHi = "#3B93E3"; commit(); render(); break;
    case "hiSw": S.look.hiCustom = true; S.look.hiColor = x; commit(); render(); break;
    case "hiTx": S.look.hiTextOn = true; S.look.hiTextColor = x; commit(); render(); break;
    case "pwSave": var np = $("#pw").value; if (np && np === S.sup.pass) { toast("كلمة سر المدير يجب أن تختلف عن كلمة سر المشرف"); return; }
      S.pass = np; role = "admin"; unlocked = true; A.save(); toast(S.pass ? "تم حفظ كلمة سر المدير" : "تم إلغاء كلمة السر"); render(); break;
    case "spwSave": var sp = $("#spw").value; if (sp && sp === S.pass) { toast("كلمة سر المشرف يجب أن تختلف عن كلمة سر المدير"); return; }
      if (sp && !S.pass) { toast("فعّل كلمة سر المدير أولاً"); return; }
      S.sup.pass = sp; A.save(); toast(sp ? "تم حفظ كلمة سر المشرف" : "تم إلغاء حساب المشرف"); render(); break;
    case "permAll": S.sup.sections = SECTIONS.filter(function(s){ return !ADMIN_ONLY[s[0]] && !PERM_OF[s[0]]; }).map(function(s){ return s[0]; }); A.save(); render(); break;
    case "permNone": S.sup.sections = []; A.save(); render(); break;
    case "permContent": S.sup.sections = ["news","texts","slides","boards","adhkar"]; A.save(); render(); break;
    case "bkOut": var c = JSON.parse(JSON.stringify(S)); delete c.pass; if (c.sup) delete c.sup.pass; if (c.remote) { delete c.remote.key; delete c.remote.pair; } $("#bk").value = JSON.stringify(c); break;
    case "bkCopy": var ta = $("#bk"); if (!ta.value) { var c2 = JSON.parse(JSON.stringify(S)); delete c2.pass; if (c2.sup) delete c2.sup.pass; ta.value = JSON.stringify(c2); }
      try { navigator.clipboard.writeText(ta.value).then(function(){ toast("تم النسخ"); }, function(){ ta.select(); toast("حدد النص وانسخه"); }); } catch(err){ ta.select(); } break;
    case "bkIn": try { var obj = JSON.parse($("#bk").value); obj.pass = S.pass; obj.sup = obj.sup || {}; obj.sup.pass = S.sup.pass; A.setAll(obj); render(); toast("تم الاستيراد"); } catch(err){ toast("النص غير صالح، تأكد من نسخه كاملاً"); } break;
    case "reset": A.resetAll(); break;
    case "reload": location.reload(); break;
    case "close": close(); break;
  }
}
function saveBoard(x){
  var it = x === "new" ? {id:A.uid(), img:""} : S.boards.items[idx(S.boards.items, x)];
  it.title = $("#btitle").value; it.body = $("#bbody").value; it.tSize = +$("#btsize").value || 110; it.bSize = +$("#bbsize").value || 64;
  it.tFont = $("#btfont").value; it.bFont = $("#bbfont").value; it.tColor = $("#btcolor").value; it.bColor = $("#bbcolor").value;
  it.active = $("#bactive").checked; it.pinned = $("#bpinned").checked;
  if (it.pinned) S.boards.items.forEach(function(q){ if (q !== it) q.pinned = false; });
  var f = $("#bimg").files[0];
  var done = function(){ if (x === "new") S.boards.items.push(it); boardEdit = null; commit(); render(); toast("تم الحفظ بنجاح"); };
  if (f) shrink(f, 3840).then(function(b){ var id = A.uid(); return A.IDB.put(id, b).then(function(){ if (it.img) A.IDB.del(it.img); it.img = id; }); }).then(done, done); else done();
}

/* ===== الفتح والإغلاق ===== */
function open(){
  if (window.RAWAYIE_PREVIEW) return; // المعاينة للعرض فقط، والتعديل من لوحة المدير
  if (!panel) build();
  sIndex = null;
  panel.hidden = false; document.body.classList.add("setopen");
  if (S.pass && !unlocked) { $("#lock").hidden = false; $("#setwrap").hidden = true; setTimeout(function(){ $("#lockpw").focus(); }, 50); }
  else { $("#lock").hidden = true; $("#setwrap").hidden = false; render(); }
}
function close(){ if (S.pass) { unlocked = false; } if (panel) panel.hidden = true; document.body.classList.remove("setopen"); calEdit = newsEdit = boardEdit = null; }
function build(){
  panel = $("#set");
  panel.innerHTML = '<div class="sbar"><button type="button" class="hamb" id="hamb" aria-label="أقسام الإعدادات" aria-expanded="false"><span></span><span></span><span></span></button><img src="img/mark.png" alt=""><b>الإعدادات</b><span class="curs" id="curs"></span><small>ضبط مواقيت الصلاة والإقامة والشاشة</small><span class="who" id="who"></span><button type="button" class="btn savebtn" data-act="saveAll" id="saveall">حفظ الإعدادات</button><button type="button" class="btn ghost" data-act="close">إغلاق الإعدادات</button></div>' +
    '<form id="lock" class="lock" hidden><h2>فتح تعديل الإعدادات</h2><label class="fld" for="lockpw"><span><b>كلمة السر</b></span><input type="password" id="lockpw" autocomplete="current-password"></label><p class="err" id="lockerr" hidden>كلمة السر غير صحيحة</p><button class="btn" type="submit">فتح التعديل</button></form>' +
    '<div id="setwrap"><div class="navshade" id="navshade"></div><nav class="snav" id="snav"><button type="button" class="nhome" data-sec="home">' + ico("home") + '<span>الرئيسية والبحث</span></button>' + GROUPS.map(function(g){
      return '<div class="ngrp"><div class="nglbl">' + esc(g[1]) + '</div>' + SECTIONS.filter(function(s){ return s[4] === g[0]; }).map(function(s){ return '<button type="button" data-sec="' + s[0] + '">' + ico(s[3]) + '<span>' + esc(s[1]) + '</span></button>'; }).join("") + '</div>'; }).join("") + '</nav><div class="sbody" id="sbody"></div></div>';
  nav = $(".snav", panel); body = $("#sbody");
  var navT = function(open){ panel.classList.toggle("navopen", open); $("#hamb").setAttribute("aria-expanded", open ? "true" : "false"); if (open) { var on = $(".snav button.on", panel); if (on) on.focus(); } };
  $("#hamb").addEventListener("click", function(e){ e.stopPropagation(); navT(!panel.classList.contains("navopen")); });
  $("#navshade").addEventListener("click", function(){ navT(false); });
  panel.addEventListener("keydown", function(e){ if (e.key === "Escape" && panel.classList.contains("navopen")) { e.stopPropagation(); navT(false); $("#hamb").focus(); } }, true);
  // السحب بعجلة الفأرة: القوائم الأفقية تتحرك أفقياً
  // عجلة الفأرة: الصفحة والجداول تتحرك عمودياً دائماً. الأشرطة الأفقية فقط (الخلفيات والتبويبات) تتحرك أفقياً، وعند نهايتها تكمل الصفحة نزولاً
  panel.addEventListener("wheel", function(e){
    if (e.shiftKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    var el = e.target.closest(".bgs,.tabs,.seg"); if (!el || el.scrollWidth <= el.clientWidth + 1) return;
    var before = el.scrollLeft; el.scrollLeft -= e.deltaY;
    if (el.scrollLeft !== before) e.preventDefault();
  }, {passive:false});
  panel.addEventListener("mousedown", function(e){ if (S.textEditor === false) return; var el = e.target; if (edEligible(el)) { e.preventDefault(); edOpen(el); } });
  panel.addEventListener("keydown", function(e){ if (S.textEditor === false) return; var el = e.target; if (edEligible(el) && (e.key.length === 1 || e.key === "Enter") && !e.ctrlKey && !e.metaKey) { e.preventDefault(); edOpen(el); if (e.key.length === 1) { var t = $("#edt"); t.value += e.key; t.dispatchEvent(new Event("input")); } } });
  panel.addEventListener("touchend", function(e){ if (S.textEditor === false) return; var el = e.target; if (edEligible(el)) { e.preventDefault(); edOpen(el); } });
  pkBind(panel);
  panel.addEventListener("click", onClick); panel.addEventListener("change", onChange); panel.addEventListener("input", onSlInput);
  // لوحة المفاتيح الخاصة: تمنع لوحة النظام قبل أن تظهر، وتفتح تحت الحقل
  var vkPre = function(e){ var el = e.target; if (vkOn() && vkTyping(el) && !el.closest(".vkwrap")) el.setAttribute("inputmode", "none"); };
  panel.addEventListener("pointerdown", vkPre, true); panel.addEventListener("touchstart", vkPre, {capture:true, passive:true});
  panel.addEventListener("focusin", function(e){
    var el = e.target;
    if (VK.el && !VK.el.hidden && VK.docked && el !== VK.t && !VK.el.contains(el)) vkClose();
    if (!vkOn() || !vkTyping(el) || el.closest("#ed") || el.closest(".vkwrap")) return;
    if (S.textEditor !== false && edEligible(el)) return; // يفتح المحرر الخاص ومعه لوحة المفاتيح
    vkOpen(el, panel, true);
  });
  panel.addEventListener("keydown", function(e){ if (e.key === "Escape" && VK.el && !VK.el.hidden && VK.docked) { e.stopPropagation(); var tt = VK.t; vkClose(); if (tt) tt.focus(); } }, true);
  $("#lock").addEventListener("submit", function(e){ e.preventDefault();
    var v = $("#lockpw").value;
    if (v === S.pass) { unlocked = true; role = "admin"; }
    else if (S.sup.pass && v === S.sup.pass) { unlocked = true; role = "sup"; }
    else { $("#lockerr").hidden = false; return; }
    $("#lockpw").value = ""; $("#lockerr").hidden = true; open(); });
}

/* ===== ملء الشاشة: يدعم كل المتصفحات (القياسي وwebkit وmoz وms) ===== */
function fsEl(){ var d = document; return d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement || null; }
function toggleFS(){
  var d = document, e = d.documentElement, p = null;
  try {
    if (fsEl()) p = (d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen).call(d);
    else {
      var req = e.requestFullscreen || e.webkitRequestFullscreen || e.webkitRequestFullScreen || e.mozRequestFullScreen || e.msRequestFullscreen;
      if (!req) { toast(/iPhone|iPad|iPod/.test(navigator.userAgent) ? "في آيفون: زر المشاركة ← «إضافة إلى الشاشة الرئيسية» ثم افتح الشاشة من الأيقونة" : "المتصفح لا يدعم ملء الشاشة. ثبّت التطبيق من الإعدادات ← عام"); return; }
      p = req.call(e, {navigationUI:"hide"});
    }
    if (p && p.catch) p.catch(function(){ toast("اضغط مرة أخرى لملء الشاشة"); });
  } catch(err){ toast("تعذر ملء الشاشة في هذا المتصفح"); }
  setTimeout(function(){ A.fit(); }, 400);
}
["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach(function(ev){ document.addEventListener(ev, function(){ setTimeout(A.fit, 200); }); });
/* ملء الشاشة تلقائياً: المتصفح لا يسمح به إلا بعد لمسة أو ضغطة زر، فيُطلب فوراً، وإن رُفض يتم عند أول ضغطة على الريموت أو لمسة */
function enterFS(){
  var e = document.documentElement, req = e.requestFullscreen || e.webkitRequestFullscreen || e.webkitRequestFullScreen || e.mozRequestFullScreen || e.msRequestFullscreen;
  if (!req || window.isFS()) return Promise.resolve(window.isFS());
  try { var p = req.call(e, {navigationUI:"hide"}); return p && p.then ? p.then(function(){ return true; }, function(){ return false; }) : Promise.resolve(window.isFS()); } catch(err){ return Promise.resolve(false); }
}
function autoFS(){
  if (S.look.autoFS === false || window.isFS() || window.RAWAYIE_PREVIEW) return;
  var e = document.documentElement; if (!(e.requestFullscreen || e.webkitRequestFullscreen || e.mozRequestFullScreen || e.msRequestFullscreen)) return;
  enterFS().then(function(ok){
    if (ok || window.isFS()) return;
    var hint = document.createElement("div"); hint.className = "fshint"; hint.textContent = "اضغط أي زر أو المس الشاشة لملء الشاشة"; document.getElementById("ui").appendChild(hint);
    var evs = ["keydown", "pointerdown", "touchend", "click"], done = false;
    var go = function(){ if (done) return; done = true; evs.forEach(function(v){ removeEventListener(v, go, true); }); if (hint.parentNode) hint.parentNode.removeChild(hint); if (S.look.autoFS !== false) enterFS(); };
    evs.forEach(function(v){ addEventListener(v, go, true); });
    setTimeout(function(){ if (hint.parentNode) hint.classList.add("out"); }, 12000);
  });
}
setTimeout(autoFS, 900);

/* ===== الاختصارات ===== */
function shortcuts(){
  var bar = $("#sc"), hideT = null;
  var mode = function(){ return S.look.scMode || (S.look.shortcuts === false ? "hidden" : "move"); };
  var show = function(){ var m = mode(); if (m === "hidden" || !$("#set").hidden) return; bar.classList.add("vis"); clearTimeout(hideT);
    if (m !== "always") hideT = setTimeout(function(){ bar.classList.remove("vis"); }, 4000); };
  var applyBar = function(){ var m = mode(); bar.classList.toggle("vis", m === "always" && $("#set").hidden); bar.hidden = m === "hidden"; document.documentElement.classList.toggle("scalways", m === "always"); };
  window.SC_APPLY = applyBar; setInterval(applyBar, 2000); applyBar();
  ["mousemove", "touchstart"].forEach(function(e){ addEventListener(e, show, {passive:true}); });
  bar.addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return; var a = b.dataset.sc;
    if (a === "set") open();
    if (a === "fs") toggleFS();
    if (a === "rot" && (!S.pass || S.sup.rotate)) { S.look.rot = (S.look.rot + 90) % 360; A.save(); A.rebuild(); }
    if (a === "snd") { A.unlock(); }
  });
  addEventListener("keydown", function(e){
    if (actEl && !actEl.hidden) return; // نافذة التفعيل تستقبل الأزرار بنفسها
    var setOpen = !$("#set").hidden;
    if (e.key === "Escape" && setOpen) { close(); return; }
    if (setOpen || /input|textarea|select/i.test((e.target.tagName || ""))) return;
    if (e.key === "s" || e.key === "S" || e.key === "Enter" || e.key === "ContextMenu" || e.key === "Menu") { e.preventDefault(); open(); }
    if (e.key === "f" || e.key === "F") $('[data-sc="fs"]').click();
  });
  // ضغطة مطولة على الشاشة تفتح الإعدادات
  var lp = null; $("#stage").addEventListener("pointerdown", function(){ lp = setTimeout(open, 1200); });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function(e){ $("#stage").addEventListener(e, function(){ clearTimeout(lp); }); });
}
/* التنقل بأسهم الريموت داخل الإعدادات والنوافذ: يختار أقرب عنصر في اتجاه السهم كما يراه المستخدم على الشاشة
   (يعمل صحيحاً حتى لو كانت الشاشة مدوّرة)، ولا يعلق التركيز خارج القائمة */
// أزرار الأرقام في الريموت تكتب في كود التفعيل مباشرة
addEventListener("keydown", function(e){
  if (!/^[0-9]$/.test(e.key)) return; var lp = document.querySelector(".licpad"); if (!lp || !lp.contains(document.activeElement) || document.activeElement.id === "liccode") return;
  e.preventDefault(); var lk = document.getElementById("liccode"), dg = (lk.value.replace(/\D/g, "") + e.key).slice(0, 8); lk.value = dg.length > 4 ? dg.slice(0, 4) + " " + dg.slice(4) : dg;
});
function spatialNav(){
  var dirs = {ArrowUp:[0, -1], ArrowDown:[0, 1], ArrowLeft:[-1, 0], ArrowRight:[1, 0]};
  var SEL = 'button:not([disabled]),a[href],input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])';
  addEventListener("keydown", function(e){
    var d0 = dirs[e.key]; if (!d0 || e.altKey || e.ctrlKey || e.metaKey) return;
    if (VK.el && !VK.el.hidden && e.target === VK.t && e.key === "ArrowDown") { var k1 = VK.el.querySelector(".vkr:nth-child(2) .vk"); if (k1) { e.preventDefault(); k1.focus(); return; } }
    // الشاشة المرسومة مدوّرة: «أسفل» عند المستخدم هو اتجاه آخر على الجهاز، فيُدار السهم بنفس زاوية الرسم
    var th = (+document.documentElement.getAttribute("data-rot") || 0) * Math.PI / 180, cs0 = Math.round(Math.cos(th)), sn0 = Math.round(Math.sin(th));
    var d = [d0[0]*cs0 - d0[1]*sn0, d0[0]*sn0 + d0[1]*cs0];
    var root = null, sp = $("#set"), ae = document.activeElement;
    if (actEl && !actEl.hidden) return; // لوحة أرقام التفعيل لها تنقل خاص
    if (sp && !sp.hidden) root = sp; else return;
    var edv = $("#ed"); if (edv && !edv.hidden) root = edv; // داخل المحرر: التنقل بين أزراره ولوحة المفاتيح فقط
    if (PK.el && !PK.el.hidden) root = PK.el; // داخل نافذة الاختيار
    var t = e.target, tag = (t.tagName || "").toLowerCase(), ty = (t.type || "").toLowerCase();
    // داخل حقل نص: السهمان الأفقيان يحركان المؤشر، وشريط التمرير يتغير بالأسهم الأفقية
    if (tag === "textarea") return;
    if (tag === "input" && /text|search|url|email|number|password|tel/.test(ty) && d0[0] !== 0) return;
    if (tag === "input" && ty === "range" && d0[0] !== 0) return;
    var list = Array.prototype.slice.call(root.querySelectorAll(SEL)).filter(function(el){
      if (el === ae) return false; var r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      if (el.closest("[hidden]")) return false; var cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none") return false;
      return true; });
    if (!list.length) return;
    e.preventDefault();
    if (!ae || ae === document.body || !root.contains(ae)) { list[0].focus(); return; }
    var o = ae.getBoundingClientRect(), ox = o.left + o.width/2, oy = o.top + o.height/2, best = null, bs = 1e9;
    list.forEach(function(el){
      var r = el.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
      // المسافة على امتداد السهم من حافة العنصر الحالي، مع عقوبة الانحراف الجانبي
      var vx = cx - ox, vy = cy - oy, along = vx*d[0] + vy*d[1];
      if (along <= 4) return;
      var edge = d[0] ? Math.max(0, (d[0] > 0 ? r.left - o.right : o.left - r.right)) : Math.max(0, (d[1] > 0 ? r.top - o.bottom : o.top - r.bottom));
      var overlap = d[0] ? Math.min(o.bottom, r.bottom) - Math.max(o.top, r.top) : Math.min(o.right, r.right) - Math.max(o.left, r.left);
      var perp = Math.abs(vx*d[1] - vy*d[0]), sc = edge + along*.3 + (overlap > 0 ? 0 : perp*2.2);
      if (sc < bs) { bs = sc; best = el; }
    });
    if (best) { try { best.focus({preventScroll:true}); } catch(x){ best.focus(); } if (best.scrollIntoView) try { best.scrollIntoView({block:"nearest", inline:"nearest"}); } catch(x){ best.scrollIntoView(false); } }
  }, true);
}
function init(){ shortcuts(); spatialNav(); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
// زر الرجوع في الريموت: يغلق لوحة المفاتيح ثم المحرر ثم الإعدادات بالترتيب
function back(){
  if (PK.el && !PK.el.hidden) { pkClose(); return true; }
  if (VK.el && !VK.el.hidden) { if (VK.t && VK.t.id === "edt") edClose(false); else vkClose(); return true; }
  var ed = $("#ed"); if (ed && !ed.hidden) { edClose(false); return true; }
  // خطوة للخلف: من أي قسم إلى الصفحة الرئيسية للإعدادات، ومنها يُغلق
  if (panel && !panel.hidden && cur !== "home") { cur = "home"; render(); if (body) body.scrollTop = 0; return true; }
  return false;
}
function stepBack(){ if (back()) return; if (panel && !panel.hidden) close(); }
// زر الرجوع في الفأرة، والضغط باليمين داخل الإعدادات: خطوة للخلف
document.addEventListener("mouseup", function(e){ if (e.button === 3) { e.preventDefault(); stepBack(); } }, true);
document.addEventListener("auxclick", function(e){ if (e.button === 3) e.preventDefault(); }, true);
document.addEventListener("contextmenu", function(e){ if (panel && !panel.hidden) { e.preventDefault(); stepBack(); } }, true);
window.SETTINGS = {open:open, close:close, back:back, stepBack:stepBack};
})();
