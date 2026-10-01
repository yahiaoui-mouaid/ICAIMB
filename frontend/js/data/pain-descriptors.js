/*
 * PAIN SCORE — pain descriptor / symptom option sets (static, frontend-only).
 *
 * Holds the *patient-reported character* option sets used by the assessment
 * wizard: pain-quality descriptors, aggravating and relieving factors,
 * associated symptoms, and laterality. Medical-context sets (diseases,
 * medications, mechanisms…) live in assessment-options.js.
 *
 * Every option carries an English label and Modern Standard Arabic.
 *
 * These are documentation options only. Selecting a descriptor such as
 * "burning" does NOT imply any diagnosis or mechanism — the physician decides
 * the classification separately in step 6.
 */
(function () {
  'use strict';

  function o(id, en, ar) { return { id: id, en: en, ar: ar }; }

  var DESC = {
    /* ---------------------------------------------------- 8. pain quality */
    /* Deliberately separate from the taxonomy "sensations" in
       classification.js: these are the descriptors the patient uses, as
       recorded by the physician, not taxonomy characteristic tags. */
    painQuality: [
      o('burning', 'Burning', 'حارق'),
      o('aching', 'Aching', 'موجِع'),
      o('cramping', 'Cramping', 'تشنّجي'),
      o('pressure', 'Pressure', 'ضاغط'),
      o('tightness', 'Tightness', 'شدّ / انقباض'),
      o('stabbing', 'Stabbing', 'طاعن'),
      o('shooting', 'Shooting', 'سارٍ'),
      o('throbbing', 'Throbbing', 'نابض'),
      o('electric', 'Electric-shock-like', 'كهربائي / مثل الصدمة الكهربائية'),
      o('tingling', 'Tingling', 'تنميل'),
      o('pins-needles', 'Pins and needles', 'وخز كالإبر'),
      o('numbness', 'Numbness', 'خدر'),
      o('itching', 'Itching', 'حكّة'),
      o('squeezing', 'Squeezing', 'عاصر / ضاغط بقوة'),
      o('radiating', 'Radiating', 'منتشر'),
      o('other', 'Other', 'أخرى')
    ],

    /* ---------------------------------------------------- 5. laterality */
    laterality: [
      o('left', 'Left', 'أيسر'),
      o('right', 'Right', 'أيمن'),
      o('bilateral', 'Bilateral', 'ثنائي الجانب'),
      o('midline', 'Midline', 'خطّ الوسط')
    ],

    /* ---------------------------------------------------- 12. aggravating */
    aggravatingFactors: [
      o('movement', 'Movement', 'الحركة'),
      o('walking', 'Walking', 'المشي'),
      o('running', 'Running', 'الركض'),
      o('standing', 'Standing', 'الوقوف'),
      o('sitting', 'Sitting', 'الجلوس'),
      o('lying', 'Lying down', 'الاستلقاء'),
      o('coughing', 'Coughing', 'السعال'),
      o('breathing', 'Breathing', 'التنفس'),
      o('touch', 'Touch', 'اللمس'),
      o('pressure', 'Pressure', 'الضغط'),
      o('eating', 'Eating', 'تناول الطعام'),
      o('defecation', 'Defecation', 'التبرّز'),
      o('urination', 'Urination', 'التبوّل'),
      o('physical-activity', 'Physical activity', 'النشاط البدني'),
      o('night', 'Night', 'الليل'),
      o('morning', 'Morning', 'الصباح'),
      o('heat', 'Heat', 'الحرارة'),
      o('cold', 'Cold', 'البرودة'),
      o('stress', 'Stress', 'التوتر'),
      o('other', 'Other', 'أخرى'),
      o('unknown', 'Unknown', 'غير معروف')
    ],

    /* ---------------------------------------------------- 13. relieving */
    relievingFactors: [
      o('rest', 'Rest', 'الراحة'),
      o('sleep', 'Sleep', 'النوم'),
      o('position-change', 'Position change', 'تغيير الوضعية'),
      o('movement', 'Movement', 'الحركة'),
      o('heat', 'Heat', 'الحرارة'),
      o('cold', 'Cold', 'البرودة'),
      o('massage', 'Massage', 'التدليك'),
      o('medication', 'Medication', 'الدواء'),
      o('food', 'Food', 'الطعام'),
      o('other', 'Other', 'أخرى'),
      o('none', 'None known', 'لا يوجد ما يُخفّفه')
    ],

    /* ---------------------------------------------------- 14. associated symptoms */
    /* Neuropathic / urinary / vascular / ENT / eye symptom wording follows the
       domain modules in js/data but is kept as a flat recording list here so
       the physician does not have to navigate the taxonomy. */
    associatedSymptoms: [
      o('numbness', 'Numbness', 'خدر'),
      o('tingling', 'Tingling', 'تنميل'),
      o('weakness', 'Weakness', 'ضعف'),
      o('swelling', 'Swelling', 'تورّم'),
      o('redness', 'Redness', 'احمرار'),
      o('warmth', 'Local warmth', 'سخونة موضعية'),
      o('coldness', 'Coldness', 'برودة'),
      o('skin-color-change', 'Skin-color change', 'تغيّر لون الجلد'),
      o('fever', 'Fever', 'حمى'),
      o('nausea', 'Nausea', 'غثيان'),
      o('vomiting', 'Vomiting', 'تقيّؤ'),
      o('dizziness', 'Dizziness', 'دوخة'),
      o('breathlessness', 'Shortness of breath', 'ضيق التنفس'),
      o('sweating', 'Sweating', 'تعرّق'),
      o('appetite-change', 'Appetite changes', 'تغيّر الشهية'),
      o('sleep-disturbance', 'Sleep disturbance', 'اضطراب النوم'),
      o('urinary-symptoms', 'Urinary symptoms', 'أعراض بولية'),
      o('gi-symptoms', 'Gastrointestinal symptoms', 'أعراض هضمية'),
      o('other', 'Other', 'أخرى')
    ]
  };

  window.PAIN_DESCRIPTORS = DESC;
})();
