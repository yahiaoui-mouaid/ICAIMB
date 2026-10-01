/*
 * PAIN SCORE — internationalisation (static, frontend-only).
 *
 * Holds the UI string dictionary for English and Arabic, the current language
 * state, and small lookup helpers used by app.js. Loading order: this file is
 * loaded after the data modules and before bodymap.js / app.js.
 *
 * No backend, no AI. Translations are static data only.
 */
(function () {
  'use strict';

  var LANGS = ['en', 'ar'];

  var STR = {
    /* ---------------------------------------------------- shared chrome */
    docTitle: {
      en: 'PAIN SCORE — Doctor Interface',
      ar: 'PAIN SCORE — واجهة الطبيب'
    },
    brandSub: {
      en: 'Anatomy & Pain Classification',
      ar: 'التشريح وتصنيف الألم'
    },
    roleBadge: {
      en: 'Doctor Interface',
      ar: 'واجهة الطبيب'
    },
    searchPlaceholder: {
      en: 'Search pain type, structure or region…',
      ar: 'ابحث عن نوع الألم أو العضو/البنية أو المنطقة…'
    },
    searchLabel: {
      en: 'Search pain type, structure or region',
      ar: 'ابحث عن نوع الألم أو العضو/البنية أو المنطقة'
    },
    refBtn: {
      en: 'Classification Reference',
      ar: 'مرجع التصنيف'
    },
    homeBtn: {
      en: 'Reset',
      ar: 'إعادة تعيين'
    },
    langToggle: {
      en: 'العربية',
      ar: 'English'
    },
    noticeTitle: {
      en: 'Clinician-driven selection.',
      ar: 'التحديد من قِبل الطبيب.'
    },
    noticeBody: {
      en: 'Navigate the anatomical map and pain taxonomy manually — this interface does not detect, predict, score, or diagnose pain.',
      ar: 'تنقّل في الخريطة التشريحية وتصنيف الألم يدويًا — هذه الواجهة لا تكتشف الألم ولا تتوقّعه ولا تُقيّمه ولا تُشخّصه.'
    },

    /* ---------------------------------------------------- filters panel */
    filtersTitle: {
      en: 'Pain Filters',
      ar: 'فلاتر الألم'
    },
    filtersAria: {
      en: 'Pain filters',
      ar: 'فلاتر الألم'
    },
    filtersHint: {
      en: 'Narrow pain types across the whole taxonomy.',
      ar: 'ضيّق أنواع الألم ضمن التصنيف بأكمله.'
    },
    mech: { en: 'Mechanism', ar: 'الآلية' },
    dur: { en: 'Duration', ar: 'المدة' },
    sens: { en: 'Sensation', ar: 'الإحساس' },
    clearAll: { en: 'Clear all', ar: 'مسح الكل' },

    /* ---------------------------------------------------- body stage */
    bodyAria: {
      en: 'Interactive human anatomy',
      ar: 'تشريح الجسم البشري التفاعلي'
    },
    frontView: { en: 'Front View', ar: 'المنظر الأمامي' },
    backView: { en: 'Back View', ar: 'المنظر الخلفي' },
    hintStart: {
      en: 'Click an anatomical region to begin',
      ar: 'انقر على منطقة تشريحية للبدء'
    },
    hintRegion: {
      en: 'Selected region:',
      ar: 'المنطقة المحددة:'
    },
    hintSwitch: {
      en: '— click another region to switch',
      ar: '— انقر على منطقة أخرى للتبديل'
    },
    hintBack: { en: '(back view)', ar: '(المنظر الخلفي)' },
    hintFiltered: {
      en: 'Regions without matching pain types are dimmed — click any region to explore it',
      ar: 'المناطق التي لا تحتوي على أنواع ألم مطابقة معتمة — انقر أي منطقة لاستكشافها'
    },
    quickTitle: {
      en: 'Cross-cutting pain systems',
      ar: 'أنظمة الألم الشاملة'
    },

    /* ---------------------------------------------------- detail panel */
    detailAria: {
      en: 'Pain classification detail',
      ar: 'تفاصيل تصنيف الألم'
    },
    crumbHome: { en: 'All regions', ar: 'كل المناطق' },

    homeTitle: {
      en: 'Where is the patient&#39;s pain?',
      ar: 'أين ألم المريض؟'
    },
    homeBody: {
      en: 'Click an anatomical region on the body model, or use search. Then choose the involved structure and the reported pain type. Every selection is made by you — the clinician.',
      ar: 'انقر على منطقة تشريحية على نموذج الجسم، أو استخدم البحث. ثم اختر العضو/البنية المعنية ونوع الألم المُبلَّغ عنه. كل تحديد يقوم به الطبيب — أنت.'
    },
    flowTitle: { en: 'Selection flow', ar: 'تسلسل التحديد' },
    flow1: {
      en: 'Select an anatomical region',
      ar: 'اختر منطقة تشريحية'
    },
    flow2: {
      en: 'Select the organ or structure involved',
      ar: 'اختر العضو أو البنية المعنية'
    },
    flow3: {
      en: 'Review the related pain categories',
      ar: 'راجِع فئات الألم ذات الصلة'
    },
    flow4: {
      en: 'Select the pain type &amp; its characteristics',
      ar: 'اختر نوع الألم وخصائصه'
    },
    systemsTitle: {
      en: 'System &amp; cross-cutting views',
      ar: 'الأنظمة والعرض الشامل'
    },
    recentTitle: { en: 'Recently viewed', ar: 'تمت مشاهدته مؤخرًا' },

    moduleSelect: {
      en: 'Select the involved organ or structure:',
      ar: 'اختر العضو أو البنية المعنية:'
    },
    moduleStats: {
      en: '{s} structures · {p} pain types',
      ar: '{s} بنى · {p} نوع ألم'
    },
    groupUngrouped: { en: 'Structures', ar: 'البنى' },
    cardCount: {
      en: '{n} pain types',
      ar: '{n} نوع ألم'
    },
    cardCountMatch: {
      en: '{n} / {m} pain types',
      ar: '{n} / {m} نوع ألم'
    },
    structMatchSummary: {
      en: '{n} of {m} pain types match the active filters.',
      ar: '{n} من أصل {m} نوع ألم تطابق الفلاتر المفعّلة.'
    },
    clearFilters: { en: 'Clear filters', ar: 'مسح الفلاتر' },
    structPrompt: {
      en: 'Pain categories for this structure — select the reported pain type:',
      ar: 'فئات الألم لهذه البنية — اختر نوع الألم المُبلَّغ عنه:'
    },

    descTitle: { en: 'Description', ar: 'الوصف' },
    charsTitle: { en: 'Pain characteristics', ar: 'خصائص الألم' },
    charsNone: {
      en: 'No specific characteristics recorded.',
      ar: 'لا توجد خصائص محددة مسجّلة.'
    },
    durTitle: { en: 'Duration', ar: 'المدة' },
    radTitle: { en: 'Radiation / referred pain', ar: 'الانتشار / الألم المُحال' },
    radNone: {
      en: 'Typically non-radiating.',
      ar: 'عادةً لا ينتشر إلى موضع آخر.'
    },
    relTitle: { en: 'Related structures', ar: 'البنى ذات الصلة' },
    relNone: {
      en: 'No related structures recorded.',
      ar: 'لا توجد بنى ذات صلة مسجّلة.'
    },
    relIn: {
      en: 'Related classifications in',
      ar: 'تصنيفات ذات صلة في'
    },
    backTo: { en: '← Back to', ar: 'العودة إلى →' },
    clinicianNote: {
      en: 'Selected region / structure / pain category are clinician selections. This interface does not detect, predict, score, or diagnose pain.',
      ar: 'المنطقة / البنية / فئة الألم المحددة هي اختيارات يقوم بها الطبيب. هذه الواجهة لا تكتشف الألم ولا تتوقّعه ولا تُقيّمه ولا تُشخّصه.'
    },

    filteredTitle: {
      en: 'Filtered pain types',
      ar: 'أنواع الألم المُفلترة'
    },
    filteredStats: {
      en: '{n} matching pain type(s) across {m} region(s) · highlighted on the body model',
      ar: '{n} نوع ألم مطابق في {m} منطقة · مظلَّل على نموذج الجسم'
    },
    noMatchTitle: {
      en: 'No matching pain types',
      ar: 'لا توجد أنواع ألم مطابقة'
    },
    noMatchBody: {
      en: 'No pain type matches every active filter. Remove one of the filters to widen the results.',
      ar: 'لا يوجد نوع ألم يطابق كل الفلاتر المفعّلة. أزِل أحد الفلاتر لتوسيع النتائج.'
    },
    showAll: {
      en: 'Show all taxonomy results',
      ar: 'اعرض كل نتائج التصنيف'
    },
    filteredModuleStats: {
      en: '{n} matching pain type(s) in this region',
      ar: '{n} نوع ألم مطابق في هذه المنطقة'
    },
    noMatchRegionTitle: {
      en: 'No matches in this region',
      ar: 'لا توجد مطابقات في هذه المنطقة'
    },
    noMatchRegionBody: {
      en: 'No pain type in {module} matches every active filter.',
      ar: 'لا يوجد نوع ألم في {module} يطابق كل الفلاتر المفعّلة.'
    },

    /* ---------------------------------------------------- body / tooltip */
    sideRight: { en: 'Right', ar: 'الأيمن' },
    sideLeft: { en: 'Left', ar: 'الأيسر' },
    clickExplore: {
      en: '— click to explore',
      ar: '— انقر للاستكشاف'
    },

    /* ---------------------------------------------------- search */
    searchNone: {
      en: 'No matching pain type, structure or region.',
      ar: 'لا يوجد نوع ألم أو بنية أو منطقة مطابقة.'
    },
    srPain: { en: 'Pain type', ar: 'نوع الألم' },
    srStruct: { en: 'Structure', ar: 'البنية' },
    srRegion: { en: 'Region', ar: 'المنطقة' },
    srRegionPath: { en: 'Anatomical region', ar: 'منطقة تشريحية' },

    /* ---------------------------------------------------- reference modal */
    refTitle: {
      en: 'Pain Classification Reference',
      ar: 'مرجع تصنيف الألم'
    },
    close: { en: 'Close', ar: 'إغلاق' },
    refMech: {
      en: 'Pain classification by mechanism',
      ar: 'تصنيف الألم بحسب الآلية'
    },
    refDur: {
      en: 'Classification by duration',
      ar: 'التصنيف بحسب المدة'
    },
    refDurTh1: { en: 'Duration', ar: 'المدة' },
    refDurTh2: { en: 'Description', ar: 'الوصف' },
    refSens: {
      en: 'Pain sensations (characteristics)',
      ar: 'أحاسيس الألم (الخصائص)'
    },
    refRad: {
      en: 'Referred pain patterns',
      ar: 'أنماط الألم المُحال'
    },
    refRadTh1: { en: 'Origin', ar: 'المنشأ' },
    refRadTh2: { en: 'Perceived at', ar: 'يُحَسّ في' },
    refRadTh3: { en: 'Example', ar: 'مثال' }
  };

  /* Mechanism / duration / sensation / category lookups (small, closed sets). */
  var MECH_AR = {
    Nociceptive: 'مستقبِلي',
    Neuropathic: 'عصبي',
    Nociplastic: 'نوسيبلاستيكي',
    Mixed: 'مختلط'
  };
  var DUR_AR = {
    Acute: 'حادّ',
    Chronic: 'مزمن',
    Episodic: 'متقطع (نوبات)',
    Recurrent: 'متكرر'
  };
  var SENS_AR = {
    'Sharp': 'حادّ',
    'Stabbing': 'طاعن',
    'Burning': 'حارق',
    'Electric': 'كهربائي',
    'Shooting': 'سارٍ',
    'Throbbing': 'نابض',
    'Pressure': 'ضاغط',
    'Crushing': 'ساحق',
    'Cramping': 'تشنّجي',
    'Deep': 'عميق',
    'Aching': 'موجِع',
    'Pricking': 'واخز',
    'Stinging': 'لاذع',
    'Tingling-associated': 'مصحوب بوخز',
    'Hyperalgesia': 'فرط الإحساس بالألم',
    'Allodynia': 'ألم من منبّه غير مؤلم (ألودينيا)'
  };
  var CAT_AR = {
    'Somatic — Musculoskeletal': 'جسدي — عضلي هيكلي',
    'Somatic — Superficial': 'جسدي — سطحي',
    'Visceral': 'حشوي',
    'Neuropathic': 'عصبي',
    'Mixed': 'مختلط',
    'Vascular': 'وعائي',
    'Nociplastic': 'نوسيبلاستيكي',
    'Nociceptive': 'مستقبِلي'
  };

  var lang = 'en';

  function cur() { return lang; }

  function isAr() { return lang === 'ar'; }

  function setLang(l) {
    if (LANGS.indexOf(l) < 0) return;
    lang = l;
  }

  function t(key) {
    var entry = STR[key];
    if (!entry) return key;
    return entry[lang] !== undefined ? entry[lang] : entry.en;
  }

  /* Template: tFmt('cardCount', { n: 5 }) */
  function tFmt(key, vars) {
    var s = t(key);
    if (!vars) return s;
    Object.keys(vars).forEach(function (k) {
      s = s.split('{' + k + '}').join(vars[k]);
    });
    return s;
  }

  function mechAr(m) { return MECH_AR[m] || m; }
  function durAr(d) { return DUR_AR[d] || d; }
  function sensAr(c) { return SENS_AR[c] || c; }
  function catAr(c) { return CAT_AR[c] || c; }

  /* English name for the non-active language — used on the toggle button. */
  function otherLang() { return lang === 'en' ? 'ar' : 'en'; }

  window.I18N = {
    langs: LANGS,
    cur: cur,
    isAr: isAr,
    setLang: setLang,
    t: t,
    tFmt: tFmt,
    otherLang: otherLang,
    mechAr: mechAr,
    durAr: durAr,
    sensAr: sensAr,
    catAr: catAr
  };
})();
