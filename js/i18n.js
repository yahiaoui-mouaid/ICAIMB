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
    noticeAssessTitle: {
      en: 'Clinician-documented assessment.',
      ar: 'تقييم يُوثِّقه الطبيب.'
    },
    noticeAssessBody: {
      en: 'Every field is selected by you — the physician. This interface does not detect, predict, score with a device, or diagnose pain, and it makes no treatment recommendation.',
      ar: 'كل حقل يحدِّده الطبيب — أنت. هذه الواجهة لا تكتشف الألم ولا تتوقّعه ولا تُقيّمه بجهاز ولا تُشخّصه، ولا تقدّم أي توصية علاجية.'
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
    refRadTh3: { en: 'Example', ar: 'مثال' },

    /* ---------------------------------------------------- mode switch */
    modeAssess: {
      en: 'Pain Assessment',
      ar: 'تقييم الألم'
    },
    modeExplore: {
      en: 'Taxonomy Explorer',
      ar: 'مستكشف التصنيف'
    },
    modeAssessAria: { en: 'Pain assessment mode', ar: 'وضع تقييم الألم' },
    modeExploreAria: { en: 'Pain taxonomy explorer mode', ar: 'وضع استكشاف تصنيف الألم' },

    /* ---------------------------------------------------- wizard chrome */
    wizAppName: { en: 'Pain Assessment', ar: 'تقييم الألم' },
    wizProgress: { en: 'Progress', ar: 'التقدّم' },
    wizStepOf: { en: 'Step {n} of {m}', ar: 'الخطوة {n} من {m}' },
    wizStepsDone: { en: '{n} of {m} steps complete', ar: '{n} من {m} خطوات مكتملة' },
    wizPrev: { en: '← Previous', ar: 'السابق →' },
    wizNext: { en: 'Next →', ar: '← التالي' },
    wizFinish: { en: 'Review summary', ar: 'مراجعة الملخّص' },
    wizSaveDraft: { en: 'Save draft', ar: 'حفظ المسوّدة' },
    wizResumeDraft: { en: 'Resume draft', ar: 'استئناف المسوّدة' },
    wizDiscardDraft: { en: 'Discard draft', ar: 'تجاهل المسوّدة' },
    wizSaved: { en: 'Draft saved', ar: 'تم حفظ المسوّدة' },
    wizLoadDraftQ: {
      en: 'A saved assessment draft was found. Resume it, or start a new assessment?',
      ar: 'تم العثور على مسوّدة تقييم محفوظة. هل تريد استئنافها أم بدء تقييم جديد؟'
    },
    wizDraftNone: { en: 'No saved draft.', ar: 'لا توجد مسوّدة محفوظة.' },
    wizRequired: { en: 'Required', ar: 'مطلوب' },
    wizOptional: { en: 'Optional', ar: 'اختياري' },
    wizYes: { en: 'Yes', ar: 'نعم' },
    wizNo: { en: 'No', ar: 'لا' },
    wizOther: { en: 'Other', ar: 'أخرى' },
    wizSpecify: { en: 'Please specify', ar: 'يرجى التحديد' },
    wizNothingRecorded: { en: 'Nothing recorded yet.', ar: 'لم يُسجَّل شيء بعد.' },
    wizLoading: { en: 'Loading step…', ar: 'جارٍ تحميل الخطوة…' },
    wizConfirmLeaveTitle: { en: 'Incomplete assessment', ar: 'تقييم غير مكتمل' },
    wizConfirmLeaveBody: {
      en: 'This assessment is not finished. Leaving now keeps your draft, but the summary will not be generated. Continue?',
      ar: 'هذا التقييم غير مكتمل. المغادرة الآن تحتفظ بمسوّدتك، لكن لن يُنشأ الملخّص. هل تريد المتابعة؟'
    },
    wizConfirmResetTitle: { en: 'Start a new assessment', ar: 'بدء تقييم جديد' },
    wizConfirmResetBody: {
      en: 'This clears every field of the current assessment. This cannot be undone. Continue?',
      ar: 'سيؤدي هذا إلى مسح كل حقول التقييم الحالي. لا يمكن التراجع عنه. هل تريد المتابعة؟'
    },
    wizNewAssessment: { en: 'New assessment', ar: 'تقييم جديد' },

    /* ---------------------------------------------------- step titles */
    stPatient: { en: 'Patient information', ar: 'معلومات المريض' },
    stHistory: { en: 'Chronic diseases &amp; medical history', ar: 'الأمراض المزمنة والتاريخ الطبي' },
    stMeds: { en: 'Medications &amp; risk factors', ar: 'الأدوية وعوامل الخطر' },
    stLocation: { en: 'Pain location', ar: 'موضع الألم' },
    stSource: { en: 'Anatomical / tissue source', ar: 'المصدر التشريحي / النسيجي' },
    stClass: { en: 'Pain classification / mechanism', ar: 'تصنيف الألم / الآلية' },
    stChars: { en: 'Pain characteristics', ar: 'خصائص الألم' },
    stIntensity: { en: 'Intensity &amp; time course', ar: 'الشدّة والتطوّر الزمني' },
    stRad: { en: 'Radiation &amp; factors', ar: 'الانتشار والعوامل' },
    stSymptoms: { en: 'Associated symptoms', ar: 'الأعراض المرافقة' },
    stImpact: { en: 'Functional impact', ar: 'التأثير الوظيفي' },
    stPrevious: { en: 'Previous pain history', ar: 'التاريخ السابق للألم' },
    stAlerts: { en: 'Clinical alerts / red flags', ar: 'التنبيهات السريرية / العلامات الخطيرة' },
    stSummary: { en: 'Assessment summary', ar: 'ملخّص التقييم' },

    /* ---------------------------------------------------- 1 patient */
    fAge: { en: 'Age', ar: 'العمر' },
    fAgeUnit: { en: 'Unit', ar: 'الوحدة' },
    ageYears: { en: 'years', ar: 'سنوات' },
    ageMonths: { en: 'months', ar: 'أشهر' },
    fSex: { en: 'Sex', ar: 'الجنس' },
    fHeight: { en: 'Height (optional)', ar: 'الطول (اختياري)' },
    fWeight: { en: 'Weight (optional)', ar: 'الوزن (اختياري)' },
    fPregnancy: { en: 'Pregnancy status', ar: 'حالة الحمل' },
    fPregnancyHint: {
      en: 'Shown only when clinically relevant — recorded by the physician.',
      ar: 'يظهر فقط عندما يكون ذلك ذا صلة سريرية — يُسجِّله الطبيب.'
    },
    fGestAge: { en: 'Gestational age (optional)', ar: 'عمر الحمل (اختياري)' },
    fPatientHint: {
      en: 'Demographic context for the assessment. No diagnosis is derived from these fields.',
      ar: 'السياق الديموغرافي للتقييم. لا يُشتقّ أي تشخيص من هذه الحقول.'
    },

    /* ---------------------------------------------------- 2 history */
    fHasChronic: { en: 'Does the patient have chronic diseases?', ar: 'هل يعاني المريض من أمراض مزمنة؟' },
    fChronicPick: { en: 'Select all that apply', ar: 'حدِّد كل ما ينطبق' },
    fChronicOther: { en: 'Other chronic disease', ar: 'مرض مزمن آخر' },
    fChronicOtherHint: { en: 'Free text — record any condition not listed above.', ar: 'نص حر — سجِّل أي حالة غير مذكورة أعلاه.' },
    fHistoryHint: {
      en: 'Comorbidities are documentation context only. They never by themselves establish the cause of the pain.',
      ar: 'الأمراض المرافقة هي سياق توثيقي فقط. لا تُثبت بمفردها سبب الألم أبدًا.'
    },

    /* ---------------------------------------------------- 3 medications */
    fTakesMeds: { en: 'Does the patient currently take medications?', ar: 'هل يتناول المريض الأدوية حاليًا؟' },
    fMedAdd: { en: '+ Add medication', ar: '+ إضافة دواء' },
    fMedRemove: { en: 'Remove', ar: 'إزالة' },
    fMedEmpty: { en: 'No medications recorded yet.', ar: 'لم يُسجَّل أي دواء بعد.' },
    fMedName: { en: 'Medication name', ar: 'اسم الدواء' },
    fMedIngredient: { en: 'Active ingredient (optional)', ar: 'المادة الفعّالة (اختياري)' },
    fMedCategory: { en: 'Category', ar: 'الفئة' },
    fMedDose: { en: 'Dose', ar: 'الجرعة' },
    fMedFreq: { en: 'Frequency', ar: 'تكرار الجرعة' },
    fMedDuration: { en: 'Duration', ar: 'مدة الاستخدام' },
    fMedReason: { en: 'Reason for use', ar: 'سبب الاستخدام' },
    fMedRegularity: { en: 'Regular / irregular', ar: 'منتظم / غير منتظم' },
    fMedsHint: {
      en: 'Documentation of the current medication list only. This tool does not recommend, adjust or stop any treatment.',
      ar: 'توثيق لقائمة الأدوية الحالية فقط. لا توصي هذه الأداة بأي علاج ولا تعدّله ولا توقفه.'
    },

    /* ---------------------------------------------------- 3b risk factors */
    fSmoking: { en: 'Smoking', ar: 'التدخين' },
    fCigsPerDay: { en: 'Cigarettes per day', ar: 'عدد السجائر يوميًا' },
    fYearsSmoking: { en: 'Years of smoking', ar: 'عدد سنوات التدخين' },
    fAlcohol: { en: 'Alcohol use', ar: 'استخدام الكحول' },
    fSubstances: { en: 'Other substance use', ar: 'استخدام مواد أخرى' },
    fSubstanceNote: { en: 'Substance details (optional)', ar: 'تفاصيل المادة (اختياري)' },
    fDisability: { en: 'Visible disability', ar: 'إعاقة ظاهرة' },
    fDisabilityHint: { en: 'Select all that apply', ar: 'حدِّد كل ما ينطبق' },
    fCommunication: { en: 'Communication difficulty', ar: 'صعوبة التواصل' },
    fRiskHint: {
      en: 'Functional and social context. It informs the physician’s documentation, not the diagnosis.',
      ar: 'السياق الوظيفي والاجتماعي. يُغذّي توثيق الطبيب، لا التشخيص.'
    },

    /* ---------------------------------------------------- 4 location */
    fLocationHint: {
      en: 'Click a region on the figure to mark it as painful. Click it again to remove it. Both views are available, and every region may be lateralised.',
      ar: 'انقر على منطقة على الشكل لتمييزها كمؤلمة. انقر عليها مرة أخرى لإزالتها. كلا المنظرين متاحان، ويمكن تحديد الجانب لكل منطقة.'
    },
    fLaterality: { en: 'Laterality', ar: 'الجانب' },
    fLocationManual: { en: 'Manual exact location (optional)', ar: 'موضع دقيق يدوي (اختياري)' },
    fLocationManualHint: {
      en: 'Free text, e.g. “Lower back + right leg”. Shown verbatim in the summary.',
      ar: 'نص حر، مثال: «أسفل الظهر + الساق اليمنى». يظهر كما هو في الملخّص.'
    },
    fLocationPicked: { en: 'Painful regions', ar: 'المناطق المؤلمة' },
    fLocationNone: { en: 'No region selected yet — click the figure above.', ar: 'لم تُحدَّد أي منطقة بعد — انقر الشكل أعلاه.' },
    fSideHint: {
      en: 'Left / right refer to the patient’s side.',
      ar: 'الأيسر / الأيمن يشيران إلى جهة المريض.'
    },

    /* ---------------------------------------------------- 5 source */
    fSourceQ: { en: 'What tissue or anatomical structure appears clinically related to the pain?', ar: 'ما هو النسيج أو البنية التشريحية التي تبدو ذات صلة سريرية بالألم؟' },
    fSourceHint: {
      en: 'Anatomical source is recorded separately from pain mechanism (next step). This is the physician’s clinical impression, not a scan finding.',
      ar: 'يُسجَّل المصدر التشريحي بشكل مستقل عن آلية الألم (الخطوة التالية). هذا هو الانطباع السريري للطبيب، وليس نتيجة تصوير.'
    },

    /* ---------------------------------------------------- 6 classification */
    fMechQ: { en: 'Pain classification / mechanism', ar: 'تصنيف الألم / الآلية' },
    fMechHint: {
      en: 'Select the mechanism(s) that best describe this pain, as judged clinically. Descriptors alone (such as “burning”) do not determine the mechanism.',
      ar: 'حدِّد الآلية (الآليات) التي تصف هذا الألم على أفضل وجه، وفق الحكم السريري. الأوصاف وحدها (مثل «حارق») لا تحدِّد الآلية.'
    },
    fMechMulti: { en: 'Multiple selections are allowed where more than one mechanism applies.', ar: 'يُسمح بالتحديد المتعدد عندما تنطبق أكثر من آلية.' },

    /* ---------------------------------------------------- 7 characteristics */
    fQuality: { en: 'Pain quality — select all descriptors the patient uses', ar: 'طبيعة الألم — حدِّد كل الأوصاف التي يستخدمها المريض' },
    fQualityOther: { en: 'Custom descriptor', ar: 'وصف مخصّص' },
    fQualityHint: {
      en: 'These are the patient’s words, recorded verbatim. They do not by themselves classify the pain.',
      ar: 'هذه كلمات المريض، تُسجَّل كما هي. لا تصنِّف الألم بمفردها.'
    },

    /* ---------------------------------------------------- 8 intensity */
    fOnsetDate: { en: 'Onset date', ar: 'تاريخ بدء الألم' },
    fOnsetApprox: { en: 'Approximate date (exact date unknown)', ar: 'تاريخ تقريبي (التاريخ الدقيق غير معروف)' },
    fOnsetType: { en: 'Beginning', ar: 'طريقة البدء' },
    fTrigger: { en: 'Possible trigger', ar: 'محفِّز محتمل' },
    fTriggerOther: { en: 'Trigger details', ar: 'تفاصيل المحفِّز' },
    fPattern: { en: 'Pattern', ar: 'النمط' },
    fEvolution: { en: 'Evolution', ar: 'التطوّر' },
    fEpisodeDur: { en: 'Episode duration (when applicable)', ar: 'مدة النوبة (عند الحاجة)' },
    fEpisodeDurHint: { en: 'e.g. seconds, minutes, hours, days', ar: 'مثال: ثوانٍ، دقائق، ساعات، أيام' },
    fIntensity: { en: 'Pain intensity — 0–10 numeric rating scale', ar: 'شدّة الألم — مقياس رقمي من 0 إلى 10' },
    fIntensityNow: { en: 'Pain now', ar: 'الألم الآن' },
    fIntensityMin: { en: 'Minimum pain in the last 24 hours', ar: 'أقل ألم خلال آخر 24 ساعة' },
    fIntensityMax: { en: 'Maximum pain in the last 24 hours', ar: 'أشدّ ألم خلال آخر 24 ساعة' },
    fIntensityAvg: { en: 'Average pain', ar: 'متوسط الألم' },
    nrsNone: { en: 'No pain', ar: 'لا ألم' },
    nrsMild: { en: 'Mild', ar: 'خفيف' },
    nrsModerate: { en: 'Moderate', ar: 'متوسط' },
    nrsSevere: { en: 'Severe', ar: 'شديد' },
    nrsWorst: { en: 'Worst imaginable', ar: 'الأسوأ الذي يمكن تخيّله' },
    nrsLevel: { en: 'Level {n} — {s}', ar: 'المستوى {n} — {s}' },

    /* ---------------------------------------------------- 9 radiation */
    fRadiates: { en: 'Does the pain radiate?', ar: 'هل ينتشر الألم؟' },
    fRadOrigin: { en: 'Origin', ar: 'المنشأ' },
    fRadDest: { en: 'Destination', ar: 'الوجهة' },
    fRadDir: { en: 'Direction', ar: 'الاتجاه' },
    fRadDiagram: { en: 'Radiation pathway', ar: 'مسار الانتشار' },
    fRadHint: {
      en: 'e.g. Lower back → Right leg. Use the manual fields or the region pickers below.',
      ar: 'مثال: أسفل الظهر ← الساق اليمنى. استخدم الحقول اليدوية أو أزرار المناطق أدناه.'
    },
    fAgg: { en: 'Aggravating factors', ar: 'العوامل التي تزيد الألم' },
    fRel: { en: 'Relieving factors', ar: 'العوامل التي تخفّف الألم' },

    /* ---------------------------------------------------- 10 symptoms */
    fSymptoms: { en: 'Associated symptoms — select all that apply', ar: 'الأعراض المرافقة — حدِّد كل ما ينطبق' },
    fSymptomsOther: { en: 'Other symptom details', ar: 'تفاصيل الأعراض الأخرى' },

    /* ---------------------------------------------------- 11 impact */
    fImpact: { en: 'How does the pain affect each domain?', ar: 'كيف يؤثر الألم في كل مجال؟' },
    fImpactScale: { en: 'Scale: none → prevents activity', ar: 'المقياس: لا تأثير ← يمنع النشاط' },

    /* ---------------------------------------------------- 12 previous */
    fPrevSimilar: { en: 'Previous similar pain?', ar: 'هل حدث ألم مشابه سابقًا؟' },
    fPrevDiagnosis: { en: 'Previous diagnosis if known', ar: 'التشخيص السابق إن وُجد' },
    fPrevDiagnosisHint: {
      en: 'Free text. As reported for the patient — not inferred by this tool.',
      ar: 'نص حر. كما هو مُبلَّغ عن المريض — وليس مما تستنتجه هذه الأداة.'
    },
    fPrevSurgery: { en: 'Previous surgery', ar: 'جراحة سابقة' },
    fPrevTrauma: { en: 'Previous trauma', ar: 'رضّ / صدمة سابقة' },
    fPrevTreatment: { en: 'Previous treatment', ar: 'العلاج السابق' },
    fPrevResponse: { en: 'Previous response to treatment', ar: 'الاستجابة السابقة للعلاج' },
    fPrevAdverse: { en: 'Side effects / adverse effects', ar: 'الآثار الجانبية / التأثيرات الضارّة' },
    fPrevHint: {
      en: 'Documentation of prior care. No treatment recommendation is made or implied.',
      ar: 'توثيق للرعاية السابقة. لا تُقدَّم أي توصية علاجية ولا تُوحى.'
    },

    /* ---------------------------------------------------- 13 alerts */
    fAlertsTitle: { en: 'Clinical information requiring physician review', ar: 'معلومات سريرية تتطلب مراجعة الطبيب' },
    fAlertsHint: {
      en: 'Record findings that warrant clinical attention. These are recorded findings only — this interface does not state that the patient has any disease.',
      ar: 'سجِّل النتائج التي تستوجب الانتباه السريري. هذه نتائج مُسجَّلة فقط — لا تذكر هذه الواجهة أن المريض مصاب بأي مرض.'
    },
    fAlertsOther: { en: 'Other institution-defined finding', ar: 'نتيجة أخرى مُحدَّدة من قبل المؤسسة' },
    fAlertsNone: { en: 'No alert findings recorded.', ar: 'لم تُسجَّل أي نتائج تنبيهية.' },

    /* ---------------------------------------------------- 14 summary */
    sumTitle: { en: 'Pain assessment summary', ar: 'ملخّص تقييم الألم' },
    sumGenerated: { en: 'Structured presentation of the clinician’s entries', ar: 'عرض منظَّم لإدخالات الطبيب' },
    sumEdit: { en: 'Edit', ar: 'تعديل' },
    sumNotRecorded: { en: 'Not recorded', ar: 'غير مُسجَّل' },
    sumPatient: { en: 'Patient', ar: 'المريض' },
    sumMedical: { en: 'Medical context', ar: 'السياق الطبي' },
    sumPain: { en: 'Pain', ar: 'الألم' },
    sumAlerts: { en: 'Clinical alerts', ar: 'التنبيهات السريرية' },
    sumPrint: { en: 'Print / export', ar: 'طباعة / تصدير' },
    sumDraftNote: {
      en: 'Assessment incomplete — some sections are not yet recorded.',
      ar: 'التقييم غير مكتمل — بعض الأقسام لم تُسجَّل بعد.'
    },
    sumDisclaimer: {
      en: 'This summary is a structured record of the clinician’s selections. It is not a diagnosis, a pain score produced by a device, or a treatment recommendation.',
      ar: 'هذا الملخّص سجلّ منظَّم لاختيارات الطبيب. ليس تشخيصًا، وليس نتيجة جهاز لقياس الألم، وليس توصية علاجية.'
    },
    sumChronic: { en: 'Chronic diseases', ar: 'الأمراض المزمنة' },
    sumMeds: { en: 'Medications', ar: 'الأدوية' },
    sumRisk: { en: 'Risk factors', ar: 'عوامل الخطر' },
    sumDisability: { en: 'Disability / communication', ar: 'الإعاقة / التواصل' },
    sumLocation: { en: 'Location', ar: 'الموضع' },
    sumSource: { en: 'Anatomical source', ar: 'المصدر التشريحي' },
    sumMech: { en: 'Mechanism', ar: 'الآلية' },
    sumQuality: { en: 'Quality', ar: 'طبيعة الألم' },
    sumOnset: { en: 'Onset &amp; course', ar: 'البداية والتطوّر' },
    sumIntensity: { en: 'Intensity (0–10)', ar: 'الشدّة (0–10)' },
    sumRadiation: { en: 'Radiation', ar: 'الانتشار' },
    sumAgg: { en: 'Aggravating', ar: 'العوامل المزيدة' },
    sumRel: { en: 'Relieving', ar: 'العوامل المخفّفة' },
    sumSymptoms: { en: 'Associated symptoms', ar: 'الأعراض المرافقة' },
    sumImpact: { en: 'Functional impact', ar: 'التأثير الوظيفي' },
    sumPrevious: { en: 'Previous history', ar: 'التاريخ السابق' },
    sumAge: { en: 'Age', ar: 'العمر' },
    sumSex: { en: 'Sex', ar: 'الجنس' },
    sumHeight: { en: 'Height', ar: 'الطول' },
    sumWeight: { en: 'Weight', ar: 'الوزن' },
    sumPregnancy: { en: 'Pregnancy', ar: 'الحمل' },
    sumMedCount: { en: '{n} medication(s) recorded', ar: '{n} دواء مُسجَّل' },
    sumNoneRecorded: { en: 'None recorded', ar: 'لم يُسجَّل شيء' },

    /* ---------------------------------------------------- validation */
    errFix: {
      en: 'Please correct the highlighted fields before continuing.',
      ar: 'يرجى تصحيح الحقول المميَّزة قبل المتابعة.'
    },
    errAge: { en: 'Enter the patient’s age.', ar: 'أدخِل عمر المريض.' },
    errAgeRange: { en: 'Age must be between 0 and 120.', ar: 'يجب أن يكون العمر بين 0 و120.' },
    errSex: { en: 'Select the patient’s sex.', ar: 'اختر جنس المريض.' },
    errPregnancy: { en: 'Record the pregnancy status.', ar: 'سجِّل حالة الحمل.' },
    errHasChronic: { en: 'Select whether the patient has chronic diseases.', ar: 'حدِّد ما إذا كان المريض يعاني من أمراض مزمنة.' },
    errChronicOne: {
      en: 'Select at least one chronic disease, or describe it under “Other chronic disease”.',
      ar: 'حدِّد مرضًا مزمنًا واحدًا على الأقل، أو صِفه تحت «مرض مزمن آخر».'
    },
    errTakesMeds: { en: 'Select whether the patient takes medications.', ar: 'حدِّد ما إذا كان المريض يتناول أدوية.' },
    errMedRow: {
      en: 'Medication #{n}: name, dose and frequency are required.',
      ar: 'الدواء رقم {n}: الاسم والجرعة وتكرار الجرعة مطلوبة.'
    },
    errSmoking: { en: 'Select the smoking status.', ar: 'حدِّد حالة التدخين.' },
    errSmokingDetail: {
      en: 'For a current smoker, enter cigarettes per day and years of smoking.',
      ar: 'بالنسبة للمدخّن الحالي، أدخِل عدد السجائر يوميًا وعدد سنوات التدخين.'
    },
    errLocation: {
      en: 'Mark at least one painful region on the figure, or describe the location in the manual field.',
      ar: 'علِّم منطقة مؤلمة واحدة على الأقل على الشكل، أو صِف الموضع في الحقل اليدوي.'
    },
    errSource: {
      en: 'Select the tissue or anatomical structure that appears related to the pain.',
      ar: 'حدِّد النسيج أو البنية التشريحية التي تبدو ذات صلة بالألم.'
    },
    errMech: { en: 'Select at least one pain mechanism.', ar: 'حدِّد آلية ألم واحدة على الأقل.' },
    errQuality: {
      en: 'Select at least one pain-quality descriptor, or enter a custom one.',
      ar: 'حدِّد وصفًا واحدًا على الأقل لطبيعة الألم، أو أدخِل وصفًا مخصّصًا.'
    },
    errOnsetDate: {
      en: 'Enter the onset date (mark it approximate if the exact date is unknown).',
      ar: 'أدخِل تاريخ بدء الألم (علِّمه تقريبيًا كان التاريخ الدقيق غير معروف).'
    },
    errOnsetType: { en: 'Select how the pain began.', ar: 'حدِّد كيف بدأ الألم.' },
    errPattern: { en: 'Select the pain pattern.', ar: 'حدِّد نمط الألم.' },
    errEvolution: { en: 'Select the evolution of the pain.', ar: 'حدِّد تطوّر الألم.' },
    errIntensityNow: { en: 'Record the current pain intensity (0–10).', ar: 'سجِّل شدّة الألم الحالية (0–10).' },
    errRadiates: { en: 'Select whether the pain radiates.', ar: 'حدِّد ما إذا كان الألم ينتشر.' },
    errRadPath: {
      en: 'Record where the radiation starts and where it is felt.',
      ar: 'سجِّل من أين يبدأ الانتشار وأين يُحَسّ.'
    },
    errImpact: {
      en: 'Record the functional impact for every domain.',
      ar: 'سجِّل التأثير الوظيفي لكل مجال.'
    },
    errPrevSimilar: {
      en: 'Select whether the patient has had previous similar pain.',
      ar: 'حدِّد ما إذا كان المريض قد تعرّض سابقًا لألم مشابه.'
    },
    errRadioRequired: { en: 'This field is required.', ar: 'هذا الحقل مطلوب.' }
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

  /* Generic bilingual option lookup: given an {id, en, ar} option, return the
   * label for the active language (falling back to English). */
  function optLabel(opt) {
    if (!opt) return '';
    return isAr() && opt.ar ? opt.ar : opt.en;
  }

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
    catAr: catAr,
    optLabel: optLabel
  };
})();
