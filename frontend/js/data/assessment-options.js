/*
 * PAIN SCORE — pain-assessment option sets (static, frontend-only).
 *
 * Closed option sets used by the assessment wizard (js/wizard.js). Every
 * option carries an English label and a Modern Standard Arabic translation.
 *
 * This file holds the *medical context* option sets: patient demographics,
 * chronic diseases, medications, risk factors, anatomical source, pain
 * mechanism, previous treatment and clinical-alert lists. Symptom and
 * descriptor sets live in pain-descriptors.js. The pain *taxonomy* itself
 * (region → structure → pain type) lives in the other js/data modules and is
 * consumed read-only.
 *
 * No backend, no AI. These are documentation options only — the physician
 * selects everything; this file never implies a diagnosis or a treatment
 * recommendation.
 */
(function () {
  'use strict';

  /* Simple flat option: { id, en, ar } */
  function o(id, en, ar) { return { id: id, en: en, ar: ar }; }

  /* Grouped option: { id, en, ar, items: [ {id, en, ar}, ... ] } */
  function g(id, en, ar, items) { return { id: id, en: en, ar: ar, items: items }; }

  var OPTIONS = {
    /* ---------------------------------------------------- 1. patient */
    sex: [
      o('male', 'Male', 'ذكر'),
      o('female', 'Female', 'أنثى'),
      o('unknown', 'Unknown / not specified', 'غير معروف / غير محدد')
    ],
    /* Pregnancy status is only relevant for female patients (shown conditionally). */
    pregnancy: [
      o('not-pregnant', 'Not pregnant', 'غير حامل'),
      o('pregnant', 'Pregnant', 'حامل'),
      o('possible', 'Possibly pregnant / unsure', 'ربما حامل / غير متأكد'),
      o('not-applicable', 'Not applicable', 'لا ينطبق')
    ],

    /* ---------------------------------------------------- 2. tri-state */
    yesNoUnknown: [
      o('yes', 'Yes', 'نعم'),
      o('no', 'No', 'لا'),
      o('unknown', 'Unknown', 'غير معروف')
    ],

    /* ---------------------------------------------------- 2. chronic diseases */
    hasChronic: [
      o('yes', 'Yes', 'نعم'),
      o('no', 'No', 'لا'),
      o('unknown', 'Unknown', 'غير معروف')
    ],

    chronicDiseases: [
      g('cardiovascular', 'Cardiovascular', 'أمراض القلب والأوعية', [
        o('hypertension', 'Hypertension', 'ارتفاع ضغط الدم'),
        o('coronary-artery-disease', 'Coronary artery disease', 'أمراض الشرايين التاجية'),
        o('heart-failure', 'Heart failure', 'فشل القلب'),
        o('arrhythmia', 'Arrhythmia', 'اضطرابات نظم القلب'),
        o('peripheral-vascular-disease', 'Peripheral vascular disease', 'أمراض الأوعية المحيطية'),
        o('other', 'Other', 'أخرى')
      ]),
      g('endocrine', 'Endocrine / Metabolic', 'أمراض الغدد الصماء والاستقلاب', [
        o('diabetes', 'Diabetes', 'السكري'),
        o('thyroid-disease', 'Thyroid disease', 'أمراض الغدة الدرقية'),
        o('obesity', 'Obesity', 'السمنة'),
        o('dyslipidemia', 'Dyslipidemia', 'اضطراب شحوم الدم'),
        o('other', 'Other', 'أخرى')
      ]),
      g('respiratory', 'Respiratory', 'أمراض الجهاز التنفسي', [
        o('asthma', 'Asthma', 'الربو'),
        o('copd', 'COPD', 'داء الانسداد الرئوي المزمن (COPD)'),
        o('chronic-lung-disease', 'Chronic lung disease', 'أمراض الرئة المزمنة'),
        o('sleep-apnea', 'Sleep apnea', 'انقطاع النفس الانسدادي النومي'),
        o('other', 'Other', 'أخرى')
      ]),
      g('neurological', 'Neurological', 'أمراض الجهاز العصبي', [
        o('epilepsy', 'Epilepsy', 'الصرع'),
        o('previous-stroke', 'Previous stroke', 'سكتة دماغية سابقة'),
        o('neuropathy', 'Neuropathy', 'اعتلال الأعصاب'),
        o('multiple-sclerosis', 'Multiple sclerosis', 'التصلب اللويحي المتعدد'),
        o('spinal-cord-injury', 'Spinal cord injury', 'إصابة الحبل الشوكي'),
        o('other', 'Other', 'أخرى')
      ]),
      g('musculoskeletal', 'Musculoskeletal', 'أمراض الجهاز العضلي الهيكلي', [
        o('osteoarthritis', 'Osteoarthritis', 'الخشونة (الفصال العظمي)'),
        o('rheumatoid-arthritis', 'Rheumatoid arthritis', 'التهاب المفاصل الروماتويدي'),
        o('osteoporosis', 'Osteoporosis', 'هشاشة العظام'),
        o('chronic-back-disease', 'Chronic back disease', 'أمراض الظهر المزمنة'),
        o('chronic-msk-pain', 'Chronic musculoskeletal pain', 'ألم عضلي هيكلي مزمن'),
        o('other', 'Other', 'أخرى')
      ]),
      g('renal', 'Renal', 'أمراض الكلى', [
        o('chronic-kidney-disease', 'Chronic kidney disease', 'أمراض الكلى المزمنة'),
        o('kidney-stones', 'Recurrent kidney stones', 'حصيات الكلى المتكررة'),
        o('renal-failure', 'Renal failure', 'القصور الكلوي'),
        o('other', 'Other', 'أخرى')
      ]),
      g('hepatic', 'Hepatic', 'أمراض الكبد', [
        o('hepatitis', 'Hepatitis', 'التهاب الكبد'),
        o('fatty-liver', 'Fatty liver disease', 'مرض الكبد الدهني'),
        o('cirrhosis', 'Cirrhosis', 'تشمع الكبد'),
        o('other', 'Other', 'أخرى')
      ]),
      g('gastrointestinal', 'Gastrointestinal', 'أمراض الجهاز الهضمي', [
        o('peptic-ulcer', 'Peptic ulcer disease', 'داء القرحة الهضمية'),
        o('gerd', 'GERD', 'ارتجاع المريء (GERD)'),
        o('ibd', 'Inflammatory bowel disease', 'أمراض الأمعاء الالتهابية'),
        o('ibs', 'Irritable bowel syndrome', 'متلازمة الأمعاء الهيوجة'),
        o('other', 'Other', 'أخرى')
      ]),
      g('autoimmune', 'Autoimmune / Rheumatologic', 'أمراض المناعة الذاتية والروماتيزم', [
        o('lupus', 'Lupus', 'الذئبة الحمراء'),
        o('rheumatoid-disease', 'Rheumatoid disease', 'الروماتويدي'),
        o('vasculitis', 'Vasculitis', 'التهاب الأوعية الدموية'),
        o('other', 'Other', 'أخرى')
      ]),
      g('oncological', 'Oncological', 'الأمراض السرطانية', [
        o('current-cancer', 'Current cancer', 'سرطان حالي'),
        o('previous-cancer', 'Previous cancer', 'سرطان سابق'),
        o('metastasis', 'Known metastasis', 'انتقالات معروفة'),
        o('other', 'Other', 'أخرى')
      ]),
      g('hematological', 'Hematological', 'أمراض الدم', [
        o('anemia', 'Anemia', 'فقر الدم (الأنيميا)'),
        o('bleeding-disorder', 'Bleeding / clotting disorder', 'اضطراب النزيف / التخثر'),
        o('other', 'Other', 'أخرى')
      ]),
      g('dermatological', 'Dermatological', 'أمراض الجلد', [
        o('psoriasis', 'Psoriasis', 'الصدفية'),
        o('eczema', 'Eczema', 'الإكزيما'),
        o('other', 'Other', 'أخرى')
      ]),
      g('psychiatric', 'Psychiatric / Neuropsychiatric', 'أمراض نفسية وعصبية نفسية', [
        o('anxiety', 'Anxiety', 'القلق'),
        o('depression', 'Depression', 'الاكتئاب'),
        o('other', 'Other', 'أخرى')
      ])
    ],

    /* ---------------------------------------------------- 3. medications */
    takesMedication: [
      o('yes', 'Yes', 'نعم'),
      o('no', 'No', 'لا'),
      o('unknown', 'Unknown', 'غير معروف')
    ],
    medicationRegularity: [
      o('regular', 'Regular', 'منتظم'),
      o('irregular', 'Irregular', 'غير منتظم')
    ],
    /* Selectable categories for commonly relevant medications. Documentation
       only — never a dosing or treatment recommendation. */
    medicationCategories: [
      o('paracetamol', 'Paracetamol', 'الباراسيتامول (الأسيتامينوفين)'),
      o('nsaids', 'NSAIDs', 'مضادات الالتهاب غير الستيرويدية (NSAIDs)'),
      o('opioids', 'Opioids', 'أدوية الألم الأفيونية'),
      o('antidepressants', 'Antidepressants', 'مضادات الاكتئاب'),
      o('anticonvulsants', 'Anticonvulsants / neuropathic-pain medication', 'مضادات الصرع / أدوية الألم العصبي'),
      o('corticosteroids', 'Corticosteroids', 'الستيرويدات القشرية (الكورتيكوستيرويدات)'),
      o('other', 'Other', 'أخرى')
    ],
    medicationFrequency: [
      o('once-daily', 'Once daily', 'مرة واحدة يوميًا'),
      o('twice-daily', 'Twice daily', 'مرتين يوميًا'),
      o('three-times-daily', 'Three times daily', 'ثلاث مرات يوميًا'),
      o('four-times-daily', 'Four times daily', 'أربع مرات يوميًا'),
      o('as-needed', 'As needed (PRN)', 'عند الحاجة (PRN)'),
      o('weekly', 'Weekly', 'أسبوعيًا'),
      o('monthly', 'Monthly', 'شهريًا'),
      o('continuous-infusion', 'Continuous infusion / patch', 'تسريب مستمر / لاصقة'),
      o('other', 'Other', 'أخرى')
    ],

    /* ---------------------------------------------------- 4. risk factors */
    smokingStatus: [
      o('never', 'Never', 'لم يدخّن أبدًا'),
      o('current', 'Current smoker', 'مدخّن حالي'),
      o('former', 'Former smoker', 'مدخّن سابق'),
      o('unknown', 'Unknown', 'غير معروف')
    ],
    alcoholUse: [
      o('no', 'No', 'لا'),
      o('yes', 'Yes', 'نعم'),
      o('unknown', 'Unknown', 'غير معروف')
    ],
    substanceUse: [
      o('no', 'No', 'لا'),
      o('yes', 'Yes', 'نعم'),
      o('unknown', 'Unknown', 'غير معروف')
    ],
    visibleDisability: [
      o('none', 'None', 'لا يوجد'),
      o('mobility', 'Mobility disability', 'إعاقة حركية'),
      o('visual', 'Visual disability', 'إعاقة بصرية'),
      o('hearing', 'Hearing disability', 'إعاقة سمعية'),
      o('amputation', 'Amputation', 'بتر'),
      o('wheelchair', 'Wheelchair', 'كرسي متحرك'),
      o('prosthesis', 'Prosthesis', 'طرف صناعي'),
      o('other', 'Other', 'أخرى')
    ],
    communicationDifficulty: [
      o('no', 'No', 'لا'),
      o('yes', 'Yes', 'نعم'),
      o('unable', 'Unable to adequately communicate pain', 'غير قادر على توصيل الألم بشكل كافٍ')
    ],

    /* ---------------------------------------------------- 6. anatomical source */
    /* Deliberately kept separate from pain mechanism (step 7). */
    painSource: [
      o('skin-superficial', 'Skin / superficial tissue', 'الجلد / الأنسجة السطحية'),
      o('muscle', 'Muscle', 'العضلات'),
      o('joint', 'Joint', 'المفصل'),
      o('bone', 'Bone', 'العظم'),
      o('nerve', 'Nerve / nerve distribution', 'العصب / منطقة توزيع العصب'),
      o('spine', 'Spine', 'العمود الفقري'),
      o('soft-tissue', 'Soft tissue', 'الأنسجة الرخوة'),
      o('visceral', 'Internal organs / visceral', 'أعضاء داخلية / حشوي'),
      o('unclear', 'Unclear', 'غير واضح'),
      o('multiple', 'Multiple possible sources', 'مصادر محتملة متعددة')
    ],

    /* ---------------------------------------------------- 7. pain mechanism */
    /* Extends the taxonomy mechanisms from classification.js with the
       sub-classification and mixed combinations the assessment needs. */
    painMechanism: [
      o('nociceptive-somatic', 'Nociceptive — Somatic', 'مستقبِلي — جسدي'),
      o('nociceptive-visceral', 'Nociceptive — Visceral', 'مستقبِلي — حشوي'),
      o('neuropathic', 'Neuropathic', 'عصبي'),
      o('nociplastic', 'Nociplastic', 'نوسيبلاستيكي'),
      o('mixed-noci-neuro', 'Mixed — Nociceptive + Neuropathic', 'مختلط — مستقبِلي + عصبي'),
      o('mixed-noci-noci', 'Mixed — Nociceptive + Nociplastic', 'مختلط — مستقبِلي + نوسيبلاستيكي'),
      o('mixed-neuro-noci', 'Mixed — Neuropathic + Nociplastic', 'مختلط — عصبي + نوسيبلاستيكي'),
      o('mixed-other', 'Other mixed', 'مختلط آخر'),
      o('unclear', 'Unclear', 'غير واضح')
    ],

    /* ---------------------------------------------------- 9. onset / course */
    onsetType: [
      o('sudden', 'Sudden', 'مفاجئ'),
      o('gradual', 'Gradual', 'تدريجي')
    ],
    onsetTrigger: [
      o('trauma', 'Trauma', 'رضّ / صدمة'),
      o('surgery', 'Surgery', 'جراحة'),
      o('infection', 'Infection / illness', 'عدوى / مرض'),
      o('physical-activity', 'Physical activity', 'نشاط بدني'),
      o('unknown', 'Unknown', 'غير معروف'),
      o('other', 'Other', 'أخرى')
    ],
    painPattern: [
      o('continuous', 'Continuous', 'مستمر'),
      o('intermittent', 'Intermittent', 'متقطّع'),
      o('episodic', 'Episodic', 'على شكل نوبات')
    ],
    painEvolution: [
      o('increasing', 'Increasing', 'يتزايد'),
      o('decreasing', 'Decreasing', 'يتناقص'),
      o('stable', 'Stable', 'مستقر'),
      o('fluctuating', 'Fluctuating', 'متذبذب')
    ],

    /* ---------------------------------------------------- 11. radiation */
    radiates: [
      o('no', 'No', 'لا'),
      o('yes', 'Yes', 'نعم')
    ],
    radiationDirection: [
      o('proximal', 'Proximal (towards the trunk)', 'قريب (نحو الجذع)'),
      o('distal', 'Distal (away from the trunk)', 'بعيد (بعيدًا عن الجذع)'),
      o('superficial', 'Superficial / across the surface', 'سطحي / عبر السطح'),
      o('deep', 'Deep / through the body', 'عميق / عبر الجسم'),
      o('other', 'Other', 'أخرى')
    ],

    /* ---------------------------------------------------- 15. functional impact */
    functionalDomains: [
      o('mobility', 'Mobility', 'الحركة والتنقل'),
      o('sleep', 'Sleep', 'النوم'),
      o('work-study', 'Work / study', 'العمل / الدراسة'),
      o('adl', 'Activities of daily living', 'أنشطة الحياة اليومية'),
      o('mood', 'Mood', 'المزاج')
    ],
    /* One consistent scale shared by every functional domain. */
    impactScale: [
      o('none', 'None', 'لا تأثير'),
      o('mild', 'Mild', 'طفيف'),
      o('moderate', 'Moderate', 'متوسط'),
      o('severe', 'Severe', 'شديد'),
      o('prevents', 'Prevents activity', 'يمنع النشاط')
    ],

    /* ---------------------------------------------------- 16. previous history */
    previousSimilar: [
      o('yes', 'Yes', 'نعم'),
      o('no', 'No', 'لا'),
      o('unknown', 'Unknown', 'غير معروف')
    ],
    previousTreatment: [
      o('paracetamol', 'Paracetamol', 'الباراسيتامول'),
      o('nsaids', 'NSAIDs', 'مضادات الالتهاب غير الستيرويدية'),
      o('opioids', 'Opioids', 'أدوية الألم الأفيونية'),
      o('physiotherapy', 'Physiotherapy', 'العلاج الفيزيائي'),
      o('surgery', 'Surgery', 'الجراحة'),
      o('injection', 'Injection', 'الحقن'),
      o('nerve-block', 'Nerve block', 'حصار العصب'),
      o('rest', 'Rest', 'الراحة'),
      o('heat-cold', 'Heat / cold', 'الحرارة / البرودة'),
      o('other', 'Other', 'أخرى')
    ],
    treatmentResponse: [
      o('significant', 'Significant improvement', 'تحسّن كبير'),
      o('mild', 'Mild improvement', 'تحسّن طفيف'),
      o('none', 'No improvement', 'لا تحسّن'),
      o('worse', 'Symptoms worsened', 'سوء الأعراض'),
      o('unknown', 'Unknown', 'غير معروف')
    ],

    /* ---------------------------------------------------- 17. clinical alerts */
    /* Findings the physician records for review. Never phrased as a
       diagnosis of the patient. */
    clinicalAlerts: [
      o('sudden-severe', 'Sudden severe pain', 'ألم شديد مفاجئ'),
      o('new-neuro-deficit', 'New neurological deficit', 'عجز عصبي جديد'),
      o('new-sensory-loss', 'New sensory loss', 'فقدان حسّي جديد'),
      o('new-weakness', 'New significant weakness', 'ضعف كبير جديد'),
      o('chest-pain', 'Chest pain', 'ألم في الصدر'),
      o('breathing-difficulty', 'Breathing difficulty', 'صعوبة في التنفس'),
      o('major-trauma', 'Major trauma', 'رضّ كبير'),
      o('bleeding', 'Bleeding', 'نزيف'),
      o('severe-fever', 'Severe fever', 'حمى شديدة'),
      o('rapid-deterioration', 'Rapid deterioration', 'تدهور سريع'),
      o('cancer-history', 'Relevant cancer history', 'تاريخ سرطاني ذو صلة'),
      o('immunocompromised', 'Immunocompromised status', 'نقص المناعة'),
      o('other', 'Other (institution-defined finding)', 'أخرى (نتيجة مُحدَّدة من قبل المؤسسة)')
    ]
  };

  window.ASSESSMENT_OPTIONS = OPTIONS;
})();
