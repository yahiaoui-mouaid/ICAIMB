/*
 * PAIN SCORE — pain-assessment wizard (frontend-only).
 *
 * Implements the 14-step structured pain assessment on top of the existing
 * app. Owns the assessment state model, step navigation, validation, draft
 * save/resume, and the final summary.
 *
 *   js/app.js        mode switching; calls PAIN_WIZARD.refresh() on language change
 *   js/bodymap.js    BODY_MAP.buildPicker() + region pickers
 *   js/i18n.js       every user-facing string
 *   js/data/assessment-options.js, js/data/pain-descriptors.js   option sets
 *
 * No backend, no AI, no sensors. The wizard documents the clinician's
 * selections; it never diagnoses, scores with a device, or recommends
 * treatment.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------- env helpers */

  function T(k) { return window.I18N ? window.I18N.t(k) : k; }
  function TF(k, vars) { return window.I18N ? window.I18N.tFmt(k, vars) : k; }
  function isAr() { return !!(window.I18N && window.I18N.isAr()); }
  function OL(opt) { return window.I18N ? window.I18N.optLabel(opt) : (opt ? opt.en : ''); }

  function OPT(group) { return (window.ASSESSMENT_OPTIONS || {})[group] || []; }
  function DES(group) { return (window.PAIN_DESCRIPTORS || {})[group] || []; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ------------------------------------------------------------- state model */

  function blankAssessment() {
    return {
      patient: { age: '', ageUnit: 'years', sex: '', height: '', weight: '', pregnancy: '', gestAge: '' },
      medicalHistory: { has: '', diseases: [], other: '' },
      medications: { takes: '', list: [] },
      riskFactors: {
        smoking: '', cigsPerDay: '', yearsSmoking: '',
        alcohol: '', substances: '', substanceNote: '',
        disability: [], communication: ''
      },
      painLocation: { regions: {}, manual: '' },
      painSource: [],
      painMechanism: [],
      painQuality: [],
      qualityOther: '',
      timeCourse: {
        onsetDate: '', approx: false, onsetType: '', trigger: '', triggerOther: '',
        pattern: '', evolution: '', episodeDuration: ''
      },
      intensity: { now: '', min: '', max: '', avg: '' },
      radiation: { radiates: '', origin: '', destination: '', direction: '' },
      aggravatingFactors: [],
      relievingFactors: [],
      associatedSymptoms: [],
      associatedOther: '',
      functionalImpact: { mobility: '', sleep: '', 'work-study': '', adl: '', mood: '' },
      previousHistory: {
        similar: '', diagnosis: '', surgery: '', trauma: '',
        treatment: [], response: '', adverse: ''
      },
      clinicalAlerts: [],
      alertsOther: '',
      meta: { startedAt: '', updatedAt: '' }
    };
  }

  var ASSESS = blankAssessment();
  var cur = 0;                    /* current step index */
  var locView = 'front';          /* body-map view on the location step */
  var draftBarVisible = false;

  function getPath(obj, path) {
    var parts = String(path).split('.');
    var out = obj;
    for (var i = 0; i < parts.length; i++) {
      if (out === null || out === undefined) return undefined;
      out = out[parts[i]];
    }
    return out;
  }
  function setPath(obj, path, val) {
    var parts = String(path).split('.');
    var node = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]] || typeof node[parts[i]] !== 'object') node[parts[i]] = {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = val;
  }

  function toggleArray(arr, val, on) {
    var i = arr.indexOf(val);
    if (on && i < 0) arr.push(val);
    if (!on && i >= 0) arr.splice(i, 1);
  }

  /* ------------------------------------------------------------- draft store */

  var DRAFT_KEY = 'painScore.assessment.draft.v1';
  /* localStorage is absent under file:// and in the node test harness — fall
   * back to an in-memory store that quacks like Storage. */
  var memStore = {
    _d: {},
    setItem: function (k, v) { this._d[k] = String(v); },
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
    removeItem: function (k) { delete this._d[k]; }
  };
  function storage() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) return localStorage;
    } catch (e) { /* private mode / file:// */ }
    return memStore;
  }
  function saveDraft() {
    ASSESS.meta.updatedAt = new Date().toISOString();
    try { storage().setItem(DRAFT_KEY, JSON.stringify(ASSESS)); return true; }
    catch (e) { return false; }
  }
  function loadDraftRaw() {
    try {
      var s = storage().getItem(DRAFT_KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  }
  function clearDraft() { try { storage().removeItem(DRAFT_KEY); } catch (e) {} }

  /* ------------------------------------------------------------- label lookups */

  function optById(group, id) {
    var list = OPT(group);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function desById(group, id) {
    var list = DES(group);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function anyLabel(group, id) {
    var o = optById(group, id) || desById(group, id);
    return o ? OL(o) : id;
  }
  function regionLabel(id) {
    var r = window.BODY_MAP ? window.BODY_MAP.pickRegionLabel(id) : null;
    return r ? (isAr() && r.labelAr ? r.labelAr : r.label) : id;
  }
  function listJoin(arr) {
    return arr.map(function (x) { return esc(String(x)); }).join(isAr() ? '، ' : ', ');
  }
  function nrsBand(v) {
    v = Number(v);
    if (isNaN(v)) return '';
    if (v === 0) return T('nrsNone');
    if (v <= 3) return T('nrsMild');
    if (v <= 6) return T('nrsModerate');
    if (v <= 9) return T('nrsSevere');
    return T('nrsWorst');
  }

  /* ------------------------------------------------------------- field builders */

  var REQ = ' <span class="req" aria-hidden="true">*</span>';

  function fText(path, label, opts) {
    opts = opts || {};
    var v = getPath(ASSESS, path) || '';
    return '<div class="fblock' + (opts.inline ? ' fblock-inline' : '') + '">' +
      '<label class="flabel" for="f-' + path.replace(/\./g, '-') + '">' + esc(label) +
        (opts.req ? REQ : '') + '</label>' +
      '<input class="finput" id="f-' + path.replace(/\./g, '-') + '" type="text" data-f="' + path + '"' +
        ' value="' + esc(v) + '"' + (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') +
        (opts.inputmode ? ' inputmode="' + opts.inputmode + '"' : '') +
        (opts.req ? ' aria-required="true"' : '') + '>' +
      (opts.hint ? '<div class="fhint">' + esc(opts.hint) + '</div>' : '') +
    '</div>';
  }

  function fNumber(path, label, opts) {
    opts = opts || {};
    var v = getPath(ASSESS, path) || '';
    return '<div class="fblock' + (opts.inline ? ' fblock-inline' : '') + '">' +
      '<label class="flabel" for="f-' + path.replace(/\./g, '-') + '">' + esc(label) +
        (opts.req ? REQ : '') + '</label>' +
      '<input class="finput" id="f-' + path.replace(/\./g, '-') + '" type="number" min="' + (opts.min != null ? opts.min : '0') + '"' +
        (opts.max != null ? ' max="' + opts.max + '"' : '') +
        ' data-f="' + path + '" value="' + esc(v) + '"' +
        (opts.req ? ' aria-required="true"' : '') + '>' +
      (opts.hint ? '<div class="fhint">' + esc(opts.hint) + '</div>' : '') +
    '</div>';
  }

  function fDate(path, label, opts) {
    opts = opts || {};
    var v = getPath(ASSESS, path) || '';
    return '<div class="fblock' + (opts.inline ? ' fblock-inline' : '') + '">' +
      '<label class="flabel" for="f-' + path.replace(/\./g, '-') + '">' + esc(label) +
        (opts.req ? REQ : '') + '</label>' +
      '<input class="finput" id="f-' + path.replace(/\./g, '-') + '" type="date" data-f="' + path + '" value="' + esc(v) + '"' +
        (opts.req ? ' aria-required="true"' : '') + '>' +
      (opts.hint ? '<div class="fhint">' + esc(opts.hint) + '</div>' : '') +
    '</div>';
  }

  function fTextarea(path, label, opts) {
    opts = opts || {};
    var v = getPath(ASSESS, path) || '';
    return '<div class="fblock">' +
      '<label class="flabel" for="f-' + path.replace(/\./g, '-') + '">' + esc(label) +
        (opts.req ? REQ : '') + '</label>' +
      '<textarea class="finput farea" id="f-' + path.replace(/\./g, '-') + '" data-f="' + path + '"' +
        ' rows="' + (opts.rows || 2) + '"' + (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') +
        (opts.req ? ' aria-required="true"' : '') + '>' + esc(v) + '</textarea>' +
      (opts.hint ? '<div class="fhint">' + esc(opts.hint) + '</div>' : '') +
    '</div>';
  }

  /* Single-select radio list. opts.reload re-renders the step on change (used
   * by fields that conditionally reveal other fields). */
  function fRadio(path, label, options, opts) {
    opts = opts || {};
    var curV = getPath(ASSESS, path);
    var html = '<div class="fblock' + (opts.inline ? ' fblock-inline' : '') + '"' +
      (opts.err ? ' data-errblock="' + path + '"' : '') + '>' +
      '<fieldset class="fradio-set"><legend class="flabel">' + esc(label) +
        (opts.req ? REQ : '') + '</legend><div class="fradio' + (opts.wrap ? ' fradio-wrap' : '') + '">';
    options.forEach(function (o) {
      var id = 'r-' + path.replace(/\./g, '-') + '-' + o.id;
      var on = curV === o.id;
      html += '<label class="rlab' + (on ? ' on' : '') + '">' +
        '<input type="radio" name="' + path + '" id="' + id + '" value="' + o.id + '"' +
        ' data-f="' + path + '"' + (on ? ' checked' : '') +
        (opts.reload ? ' data-reload="1"' : '') +
        (opts.req ? ' aria-required="true"' : '') + '>' +
        '<span>' + esc(OL(o)) + '</span></label>';
    });
    html += '</div></fieldset></div>';
    return html;
  }

  /* Multi-select toggle chips. `group` is the state array path. */
  function fChips(group, label, options, opts) {
    opts = opts || {};
    var sel = getPath(ASSESS, group) || [];
    var html = '<div class="fblock"' + (opts.err ? ' data-errblock="' + group + '"' : '') + '>' +
      '<fieldset class="fradio-set"><legend class="flabel">' + esc(label) +
        (opts.req ? REQ : '') + '</legend><div class="chips chips-wrap fchips">';
    options.forEach(function (o) {
      var on = sel.indexOf(o.id) >= 0;
      html += '<label class="chip' + (on ? ' on' : '') + '">' +
        '<input type="checkbox" data-mg="' + group + '" value="' + o.id + '"' + (on ? ' checked' : '') + '>' +
        '<span>' + esc(OL(o)) + '</span></label>';
    });
    html += '</div></fieldset></div>';
    return html;
  }

  /* Multi-select chips grouped under sub-headings (chronic diseases). */
  function fGroupedChips(group, label, groups, opts) {
    opts = opts || {};
    var sel = getPath(ASSESS, group) || [];
    var html = '<div class="fblock"' + (opts.err ? ' data-errblock="' + group + '"' : '') + '>' +
      '<fieldset class="fradio-set"><legend class="flabel">' + esc(label) + '</legend>';
    groups.forEach(function (g) {
      html += '<div class="fgroup-head">' + esc(OL(g)) + '</div><div class="chips chips-wrap fchips">';
      g.items.forEach(function (o) {
        var on = sel.indexOf(g.id + ':' + o.id) >= 0;
        html += '<label class="chip' + (on ? ' on' : '') + '">' +
          '<input type="checkbox" data-mg="' + group + '" value="' + g.id + ':' + o.id + '"' + (on ? ' checked' : '') + '>' +
          '<span>' + esc(OL(o)) + '</span></label>';
      });
      html += '</div>';
    });
    html += '</fieldset></div>';
    return html;
  }

  /* 0–10 numeric rating scale. Numbers carry the severity band as text so
   * severity is never communicated by colour alone. */
  function fNRS(path, label, req) {
    var v = getPath(ASSESS, path);
    var has = v !== '' && v !== null && v !== undefined;
    var html = '<div class="fblock"' + (req ? ' data-errblock="' + path + '"' : '') + '>' +
      '<div class="flabel" id="nrs-lab-' + path.replace(/\./g, '-') + '">' + esc(label) +
        (req ? REQ : '') + '</div>' +
      '<div class="nrs" role="radiogroup" aria-labelledby="nrs-lab-' + path.replace(/\./g, '-') + '">';
    for (var i = 0; i <= 10; i++) {
      var on = has && Number(v) === i;
      html += '<button class="nrs-btn band-' + bandClass(i) + (on ? ' sel' : '') + '" type="button"' +
        ' role="radio" aria-checked="' + (on ? 'true' : 'false') + '"' +
        ' data-nrs="' + path + '" data-val="' + i + '"' +
        ' aria-label="' + esc(TF('nrsLevel', { n: i, s: nrsBand(i) })) + '">' + i + '</button>';
    }
    html += '</div>' +
      '<div class="nrs-caption band-text-' + bandClass(has ? Number(v) : -1) + '">' +
        (has ? esc(TF('nrsLevel', { n: v, s: nrsBand(v) }))
             : '<span class="nrs-none">' + esc(T('wizNothingRecorded')) + '</span>') +
      '</div></div>';
    return html;
  }
  function bandClass(v) {
    v = Number(v);
    if (isNaN(v)) return 'x';
    if (v === 0) return '0';
    if (v <= 3) return '1-3';
    if (v <= 6) return '4-6';
    if (v <= 9) return '7-9';
    return '10';
  }

  /* ------------------------------------------------------------- steps */

  var STEPS = [
    { id: 'patient',   title: 'stPatient',   render: stepPatient,   validate: vPatient },
    { id: 'history',   title: 'stHistory',   render: stepHistory,   validate: vHistory },
    { id: 'meds',      title: 'stMeds',      render: stepMeds,      validate: vMeds },
    { id: 'location',  title: 'stLocation',  render: stepLocation,  validate: vLocation },
    { id: 'source',    title: 'stSource',    render: stepSource,    validate: vSource },
    { id: 'class',     title: 'stClass',     render: stepClass,     validate: vClass },
    { id: 'chars',     title: 'stChars',     render: stepChars,     validate: vChars },
    { id: 'intensity', title: 'stIntensity', render: stepIntensity, validate: vIntensity },
    { id: 'rad',       title: 'stRad',       render: stepRad,       validate: vRad },
    { id: 'symptoms',  title: 'stSymptoms',  render: stepSymptoms,  validate: vNone },
    { id: 'impact',    title: 'stImpact',    render: stepImpact,    validate: vImpact },
    { id: 'previous',  title: 'stPrevious',  render: stepPrevious,  validate: vPrevious },
    { id: 'alerts',    title: 'stAlerts',    render: stepAlerts,    validate: vNone },
    { id: 'summary',   title: 'stSummary',   render: stepSummary,   validate: vNone }
  ];

  /* Which steps count towards "complete"? A step that validates and has
   * something recorded in it — optional steps left blank never inflate the
   * progress bar, which keeps the indicator honest for the clinician. */
  var STEP_FILLED = {
    patient: function () { var p = ASSESS.patient; return !!(p.age || p.sex || p.height || p.weight || p.pregnancy); },
    history: function () { var h = ASSESS.medicalHistory; return !!(h.has || (h.diseases || []).length || (h.other || '').trim()); },
    meds: function () { var m = ASSESS.medications; return !!(m.takes || m.list.length); },
    location: function () { var l = ASSESS.painLocation; return !!(Object.keys(l.regions).length || (l.manual || '').trim()); },
    source: function () { return ASSESS.painSource.length > 0; },
    class: function () { return ASSESS.painMechanism.length > 0; },
    chars: function () { return ASSESS.painQuality.length > 0 || (ASSESS.qualityOther || '').trim() !== ''; },
    intensity: function () { var t = ASSESS.timeCourse, i = ASSESS.intensity;
      return !!(i.now !== '' || i.min !== '' || i.max !== '' || i.avg !== '' || t.onsetDate || t.onsetType || t.pattern || t.evolution); },
    rad: function () { var r = ASSESS.radiation;
      return !!(r.radiates || ASSESS.aggravatingFactors.length || ASSESS.relievingFactors.length); },
    symptoms: function () { return ASSESS.associatedSymptoms.length > 0 || (ASSESS.associatedOther || '').trim() !== ''; },
    impact: function () { return OPT('functionalDomains').some(function (d) { return !!ASSESS.functionalImpact[d.id]; }); },
    previous: function () { var p = ASSESS.previousHistory; return !!(p.similar || p.treatment.length || (p.diagnosis || '').trim()); },
    alerts: function () { return ASSESS.clinicalAlerts.length > 0 || (ASSESS.alertsOther || '').trim() !== ''; }
  };

  /* ------------------------------------------------------------- step 1: patient */

  function stepPatient() {
    var p = ASSESS.patient;
    var html = '<div class="fhint-top">' + T('fPatientHint') + '</div>';
    html += '<div class="frow">';
    html += fNumber('patient.age', T('fAge'), { req: true, min: 0, max: 120, inline: true });
    html += '<div class="fblock fblock-inline">' +
      '<label class="flabel" for="f-ageunit">' + T('fAgeUnit') + '</label>' +
      '<select class="finput" id="f-ageunit" data-f="patient.ageUnit">' +
      '<option value="years"' + (p.ageUnit === 'years' ? ' selected' : '') + '>' + T('ageYears') + '</option>' +
      '<option value="months"' + (p.ageUnit === 'months' ? ' selected' : '') + '>' + T('ageMonths') + '</option>' +
      '</select></div>';
    html += '</div>';

    html += fRadio('patient.sex', T('fSex'), OPT('sex'), { req: true, reload: true, wrap: true });

    html += '<div class="frow">';
    html += fText('patient.height', T('fHeight'), { inline: true });
    html += fText('patient.weight', T('fWeight'), { inline: true });
    html += '</div>';

    /* Pregnancy is only relevant for female patients. */
    if (p.sex === 'female') {
      html += fRadio('patient.pregnancy', T('fPregnancy'), OPT('pregnancy'), { req: true, wrap: true });
      html += '<div class="fhint">' + T('fPregnancyHint') + '</div>';
      html += fText('patient.gestAge', T('fGestAge'), { inline: true });
    } else if (!p.sex) {
      html += '<div class="fhint">' +
        (isAr()
          ? 'حدِّد الجنس لإتاحة تسجيل حالة الحمل عندما يكون ذلك ذا صلة سريرية.'
          : 'Select sex to enable pregnancy status when clinically relevant.') +
        '</div>';
    }
    return html;
  }

  function vPatient() {
    var p = ASSESS.patient, e = [];
    if (p.age === '' || p.age === null) e.push({ path: 'patient.age', msg: T('errAge') });
    else if (Number(p.age) < 0 || Number(p.age) > 120) e.push({ path: 'patient.age', msg: T('errAgeRange') });
    if (!p.sex) e.push({ path: 'patient.sex', msg: T('errSex') });
    if (p.sex === 'female' && !p.pregnancy) e.push({ path: 'patient.pregnancy', msg: T('errPregnancy') });
    return e;
  }

  /* ------------------------------------------------------------- step 2: history */

  function stepHistory() {
    var h = ASSESS.medicalHistory;
    var html = '<div class="fhint-top">' + T('fHistoryHint') + '</div>';
    html += fRadio('medicalHistory.has', T('fHasChronic'), OPT('hasChronic'), { req: true, reload: true, wrap: true });
    if (h.has === 'yes') {
      html += fGroupedChips('medicalHistory.diseases', T('fChronicPick'), OPT('chronicDiseases'), { req: true });
      html += fTextarea('medicalHistory.other', T('fChronicOther'), { hint: T('fChronicOtherHint'), rows: 2 });
    } else if (h.has === 'no' || h.has === 'unknown') {
      html += '<div class="fhint">' + (isAr()
        ? 'سُجِّل أي حالة عند ظهورها في الخطوات اللاحقة.'
        : 'Record any condition if it emerges in later steps.') + '</div>';
    }
    return html;
  }

  function vHistory() {
    var h = ASSESS.medicalHistory, e = [];
    if (!h.has) e.push({ path: 'medicalHistory.has', msg: T('errHasChronic') });
    if (h.has === 'yes') {
      var n = (h.diseases || []).length + ((h.other || '').trim() ? 1 : 0);
      if (!n) e.push({ path: 'medicalHistory.diseases', msg: T('errChronicOne') });
    }
    return e;
  }

  /* ------------------------------------------------------------- step 3: medications & risk */

  function stepMeds() {
    var m = ASSESS.medications, r = ASSESS.riskFactors;
    var html = '<div class="fhint-top">' + T('fMedsHint') + '</div>';
    html += fRadio('medications.takes', T('fTakesMeds'), OPT('takesMedication'), { req: true, reload: true, wrap: true });

    if (m.takes === 'yes') {
      html += '<div class="fblock" data-errblock="medications.list">';
      html += '<div class="flabel">' + T('sumMeds') + '</div>';
      if (!m.list.length) {
        html += '<div class="fempty">' + T('fMedEmpty') + '</div>';
      } else {
        m.list.forEach(function (med, i) {
          html += '<div class="med-card" data-med="' + i + '">' +
            '<div class="med-head"><span class="med-no">' + (i + 1) + '</span>' +
            '<button class="btn btn-tiny med-del" type="button" data-meddel="' + i + '">' + T('fMedRemove') + '</button></div>' +
            '<div class="frow frow-2">' +
              fText('medications.list.' + i + '.name', T('fMedName'), { req: true, inline: true }) +
              fText('medications.list.' + i + '.ingredient', T('fMedIngredient'), { inline: true }) +
            '</div>' +
            '<div class="frow frow-2">' +
              fText('medications.list.' + i + '.dose', T('fMedDose'), { req: true, inline: true }) +
              fText('medications.list.' + i + '.frequency', T('fMedFreq'), { req: true, inline: true }) +
            '</div>' +
            '<div class="frow frow-2">' +
              fText('medications.list.' + i + '.duration', T('fMedDuration'), { inline: true }) +
              fText('medications.list.' + i + '.reason', T('fMedReason'), { inline: true }) +
            '</div>' +
            '<div class="frow frow-2">' +
              fChips('medications.list.' + i + '.category', T('fMedCategory'), OPT('medicationCategories'), { inline: true }) +
              fRadio('medications.list.' + i + '.regularity', T('fMedRegularity'), OPT('medicationRegularity'), { inline: true, wrap: true }) +
            '</div>' +
          '</div>';
        });
      }
      html += '<button class="btn btn-tiny med-add" type="button" data-medadd="1">' + T('fMedAdd') + '</button>';
      html += '</div>';
    }

    html += '<div class="fseparate"></div>';
    html += '<div class="fhint-top">' + T('fRiskHint') + '</div>';

    html += fRadio('riskFactors.smoking', T('fSmoking'), OPT('smokingStatus'), { req: true, reload: true, wrap: true });
    if (r.smoking === 'current' || r.smoking === 'former') {
      html += '<div class="frow">';
      html += fNumber('riskFactors.cigsPerDay', T('fCigsPerDay'), { req: r.smoking === 'current', min: 0, inline: true });
      html += fNumber('riskFactors.yearsSmoking', T('fYearsSmoking'), { req: r.smoking === 'current', min: 0, inline: true });
      html += '</div>';
    }

    html += '<div class="frow">';
    html += fRadio('riskFactors.alcohol', T('fAlcohol'), OPT('alcoholUse'), { inline: true, wrap: true });
    html += fRadio('riskFactors.substances', T('fSubstances'), OPT('substanceUse'), { inline: true, reload: true, wrap: true });
    html += '</div>';
    if (r.substances === 'yes') {
      html += fText('riskFactors.substanceNote', T('fSubstanceNote'), { inline: true });
    }

    html += fChips('riskFactors.disability', T('fDisability'), OPT('visibleDisability'), { hint: T('fDisabilityHint') });
    html += fRadio('riskFactors.communication', T('fCommunication'), OPT('communicationDifficulty'), { wrap: true });
    return html;
  }

  function vMeds() {
    var e = [];
    var m = ASSESS.medications, r = ASSESS.riskFactors;
    if (!m.takes) e.push({ path: 'medications.takes', msg: T('errTakesMeds') });
    if (m.takes === 'yes') {
      m.list.forEach(function (med, i) {
        if (!med.name || !med.dose || !med.frequency) {
          e.push({ path: 'medications.list', msg: TF('errMedRow', { n: i + 1 }) });
        }
      });
    }
    if (!r.smoking) e.push({ path: 'riskFactors.smoking', msg: T('errSmoking') });
    if (r.smoking === 'current' && (!r.cigsPerDay || !r.yearsSmoking)) {
      e.push({ path: 'riskFactors.cigsPerDay', msg: T('errSmokingDetail') });
    }
    return e;
  }

  /* ------------------------------------------------------------- step 4: location */

  function lateralityOptions() { return DES('laterality'); }

  function stepLocation() {
    var L = ASSESS.painLocation;
    var html = '<div class="fhint-top">' + T('fLocationHint') + '</div>';

    html += '<div class="loc-wrap"' + (isAr() ? ' dir="ltr"' : '') + '>' +
      '<div class="view-toggle loc-toggle" role="tablist" aria-label="' + T('bodyAria') + '">' +
        '<button class="view-btn' + (locView === 'front' ? ' active' : '') + '" data-locview="front" role="tab"' +
          ' aria-selected="' + (locView === 'front') + '" type="button">' + T('frontView') + '</button>' +
        '<button class="view-btn' + (locView === 'back' ? ' active' : '') + '" data-locview="back" role="tab"' +
          ' aria-selected="' + (locView === 'back') + '" type="button">' + T('backView') + '</button>' +
      '</div>' +
      '<div class="loc-stage" id="locStage"></div>' +
      '</div>';

    /* Selected regions with per-region laterality. */
    var ids = Object.keys(L.regions);
    html += '<div class="fblock" data-errblock="painLocation.regions">';
    html += '<div class="flabel">' + T('fLocationPicked') +
      ' <span class="fcount">(' + ids.length + ')</span></div>';
    if (!ids.length) {
      html += '<div class="fempty">' + T('fLocationNone') + '</div>';
    } else {
      html += '<div class="loc-list">';
      ids.forEach(function (rid) {
        html += '<div class="loc-row" data-locrow="' + rid + '">' +
          '<span class="loc-name">' + esc(regionLabel(rid)) + '</span>' +
          '<div class="loc-side" role="radiogroup" aria-label="' + esc(regionLabel(rid)) + ' — ' + T('fLaterality') + '">';
        lateralityOptions().forEach(function (o) {
          var on = L.regions[rid] === o.id;
          html += '<label class="chip' + (on ? ' on' : '') + '">' +
            '<input type="radio" name="locside-' + rid + '" value="' + o.id + '"' +
            ' data-locside="' + rid + '"' + (on ? ' checked' : '') + '>' +
            '<span>' + esc(OL(o)) + '</span></label>';
        });
        html += '<button class="btn btn-tiny loc-del" type="button" data-locdel="' + rid + '">' +
          (isAr() ? 'إزالة' : 'Remove') + '</button>';
        html += '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="fhint">' + T('fSideHint') + '</div>';

    html += fTextarea('painLocation.manual', T('fLocationManual'),
      { hint: T('fLocationManualHint'), placeholder: (isAr() ? 'مثال: أسفل الظهر + الساق اليمنى' : 'e.g. Lower back + right leg') });
    return html;
  }

  function vLocation() {
    var L = ASSESS.painLocation;
    if (!Object.keys(L.regions).length && !(L.manual || '').trim()) {
      return [{ path: 'painLocation.regions', msg: T('errLocation') }];
    }
    return [];
  }

  /* ------------------------------------------------------------- step 5: source */

  function stepSource() {
    return '<div class="fhint-top">' + T('fSourceHint') + '</div>' +
      fChips('painSource', T('fSourceQ'), OPT('painSource'), { req: true });
  }
  function vSource() {
    return ASSESS.painSource.length ? [] : [{ path: 'painSource', msg: T('errSource') }];
  }

  /* ------------------------------------------------------------- step 6: classification */

  function stepClass() {
    return '<div class="fhint-top">' + T('fMechHint') + '</div>' +
      fChips('painMechanism', T('fMechQ'), OPT('painMechanism'), { req: true }) +
      '<div class="fhint">' + T('fMechMulti') + '</div>';
  }
  function vClass() {
    return ASSESS.painMechanism.length ? [] : [{ path: 'painMechanism', msg: T('errMech') }];
  }

  /* ------------------------------------------------------------- step 7: characteristics */

  function stepChars() {
    return '<div class="fhint-top">' + T('fQualityHint') + '</div>' +
      fChips('painQuality', T('fQuality'), DES('painQuality'), { req: true }) +
      fText('qualityOther', T('fQualityOther'), { placeholder: T('wizSpecify') });
  }
  function vChars() {
    if (ASSESS.painQuality.length || (ASSESS.qualityOther || '').trim()) return [];
    return [{ path: 'painQuality', msg: T('errQuality') }];
  }

  /* ------------------------------------------------------------- step 8: intensity & time course */

  function stepIntensity() {
    var tc = ASSESS.timeCourse;
    var html = '';
    html += '<div class="frow">';
    html += fDate('timeCourse.onsetDate', T('fOnsetDate'), { req: true, inline: true });
    html += '<div class="fblock fblock-inline"><label class="fcheck">' +
      '<input type="checkbox" data-f="timeCourse.approx"' + (tc.approx ? ' checked' : '') + '>' +
      '<span>' + T('fOnsetApprox') + '</span></label></div>';
    html += '</div>';
    html += '<div class="frow">';
    html += fRadio('timeCourse.onsetType', T('fOnsetType'), OPT('onsetType'), { req: true, inline: true, wrap: true });
    html += fRadio('timeCourse.trigger', T('fTrigger'), OPT('onsetTrigger'), { inline: true, reload: true, wrap: true });
    html += '</div>';
    if (tc.trigger === 'other') {
      html += fText('timeCourse.triggerOther', T('fTriggerOther'), { inline: true, placeholder: T('wizSpecify') });
    }
    html += '<div class="frow">';
    html += fRadio('timeCourse.pattern', T('fPattern'), OPT('painPattern'), { req: true, inline: true, wrap: true });
    html += fRadio('timeCourse.evolution', T('fEvolution'), OPT('painEvolution'), { req: true, inline: true, wrap: true });
    html += '</div>';
    html += fText('timeCourse.episodeDuration', T('fEpisodeDur'), { inline: true, hint: T('fEpisodeDurHint') });

    html += '<div class="fseparate"></div>';
    html += '<div class="fhint-top">' + T('fIntensity') + '</div>';
    html += '<div class="frow frow-2">';
    html += fNRS('intensity.now', T('fIntensityNow'), true);
    html += fNRS('intensity.max', T('fIntensityMax'), false);
    html += '</div>';
    html += '<div class="frow frow-2">';
    html += fNRS('intensity.min', T('fIntensityMin'), false);
    html += fNRS('intensity.avg', T('fIntensityAvg'), false);
    html += '</div>';
    return html;
  }

  function vIntensity() {
    var tc = ASSESS.timeCourse, e = [];
    if (!tc.onsetDate) e.push({ path: 'timeCourse.onsetDate', msg: T('errOnsetDate') });
    if (!tc.onsetType) e.push({ path: 'timeCourse.onsetType', msg: T('errOnsetType') });
    if (!tc.pattern) e.push({ path: 'timeCourse.pattern', msg: T('errPattern') });
    if (!tc.evolution) e.push({ path: 'timeCourse.evolution', msg: T('errEvolution') });
    if (ASSESS.intensity.now === '' || ASSESS.intensity.now === null) {
      e.push({ path: 'intensity.now', msg: T('errIntensityNow') });
    }
    return e;
  }

  /* ------------------------------------------------------------- step 9: radiation & factors */

  function stepRad() {
    var rad = ASSESS.radiation;
    var html = fRadio('radiation.radiates', T('fRadiates'), OPT('radiates'), { req: true, reload: true, wrap: true });
    if (rad.radiates === 'yes') {
      html += '<div class="fhint">' + T('fRadHint') + '</div>';
      html += '<div class="frow frow-2">';
      html += fText('radiation.origin', T('fRadOrigin'), { inline: true, placeholder: (isAr() ? 'مثال: أسفل الظهر' : 'e.g. Lower back') });
      html += fText('radiation.destination', T('fRadDest'), { inline: true, placeholder: (isAr() ? 'مثال: الساق اليمنى' : 'e.g. Right leg') });
      html += '</div>';
      html += fRadio('radiation.direction', T('fRadDir'), OPT('radiationDirection'), { inline: true, wrap: true });

      /* Optional body-map visualisation of the recorded pathway. */
      if ((rad.origin || '').trim() && (rad.destination || '').trim()) {
        var svg = window.BODY_MAP.radiationDiagram(rad.origin, rad.destination, {
          dirLabel: rad.direction ? anyLabel('radiationDirection', rad.direction) : '',
          aria: T('fRadDiagram')
        });
        html += '<div class="fblock"><div class="flabel">' + T('fRadDiagram') + '</div>' +
          '<div class="rad-wrap" id="radDiagram">' + svg.outerHTML + '</div></div>';
      }

      /* Quick region pickers that fill the origin / destination fields. */
      html += '<div class="fblock"><div class="flabel">' +
        (isAr() ? 'تعبئة سريعة من خريطة الجسم' : 'Quick fill from the body map') + '</div>' +
        '<div class="chips chips-wrap fchips">' +
        (window.BODY_MAP ? window.BODY_MAP.pickRegions : []).map(function (r) {
          return '<button class="chip" type="button" data-radfill="origin" data-val="' + r.id + '">' +
            esc(isAr() && r.labelAr ? r.labelAr : r.label) + ' →</button>';
        }).join('') +
        '</div><div class="chips chips-wrap fchips" style="margin-top:6px">' +
        (window.BODY_MAP ? window.BODY_MAP.pickRegions : []).map(function (r) {
          return '<button class="chip" type="button" data-radfill="destination" data-val="' + r.id + '">' +
            '→ ' + esc(isAr() && r.labelAr ? r.labelAr : r.label) + '</button>';
        }).join('') +
        '</div></div>';
    }

    html += '<div class="fseparate"></div>';
    html += fChips('aggravatingFactors', T('fAgg'), DES('aggravatingFactors'));
    html += fChips('relievingFactors', T('fRel'), DES('relievingFactors'));
    return html;
  }

  function vRad() {
    var rad = ASSESS.radiation, e = [];
    if (!rad.radiates) { e.push({ path: 'radiation.radiates', msg: T('errRadiates') }); return e; }
    if (rad.radiates === 'yes' && (!(rad.origin || '').trim() || !(rad.destination || '').trim())) {
      e.push({ path: 'radiation.origin', msg: T('errRadPath') });
    }
    return e;
  }

  /* ------------------------------------------------------------- step 10: symptoms */

  function stepSymptoms() {
    return fChips('associatedSymptoms', T('fSymptoms'), DES('associatedSymptoms')) +
      fTextarea('associatedOther', T('fSymptomsOther'), { rows: 2, placeholder: T('wizSpecify') });
  }

  /* ------------------------------------------------------------- step 11: functional impact */

  function stepImpact() {
    var html = '<div class="fhint-top">' + T('fImpactScale') + '</div>';
    OPT('functionalDomains').forEach(function (d) {
      html += fRadio('functionalImpact.' + d.id, OL(d), OPT('impactScale'), { req: true, wrap: true, err: true });
    });
    return html;
  }

  function vImpact() {
    var e = [];
    OPT('functionalDomains').forEach(function (d) {
      if (!ASSESS.functionalImpact[d.id]) {
        e.push({ path: 'functionalImpact.' + d.id, msg: T('errImpact') });
      }
    });
    return e;
  }

  /* ------------------------------------------------------------- step 12: previous history */

  function stepPrevious() {
    var ph = ASSESS.previousHistory;
    var html = '<div class="fhint-top">' + T('fPrevHint') + '</div>';
    html += fRadio('previousHistory.similar', T('fPrevSimilar'), OPT('previousSimilar'), { req: true, wrap: true });
    html += fText('previousHistory.diagnosis', T('fPrevDiagnosis'), { hint: T('fPrevDiagnosisHint') });
    html += '<div class="frow">';
    html += fRadio('previousHistory.surgery', T('fPrevSurgery'), OPT('yesNoUnknown'), { inline: true, wrap: true });
    html += fRadio('previousHistory.trauma', T('fPrevTrauma'), OPT('yesNoUnknown'), { inline: true, wrap: true });
    html += '</div>';
    html += fChips('previousHistory.treatment', T('fPrevTreatment'), OPT('previousTreatment'));
    html += fRadio('previousHistory.response', T('fPrevResponse'), OPT('treatmentResponse'), { wrap: true });
    html += fTextarea('previousHistory.adverse', T('fPrevAdverse'), { rows: 2 });
    return html;
  }

  function vPrevious() {
    if (!ASSESS.previousHistory.similar) {
      return [{ path: 'previousHistory.similar', msg: T('errPrevSimilar') }];
    }
    return [];
  }

  /* ------------------------------------------------------------- step 13: clinical alerts */

  function stepAlerts() {
    var html = '<div class="falert-top">' + T('fAlertsTitle') + '</div>';
    html += '<div class="fhint-top">' + T('fAlertsHint') + '</div>';
    html += fChips('clinicalAlerts', T('fAlertsTitle'), OPT('clinicalAlerts'));
    html += fText('alertsOther', T('fAlertsOther'), { placeholder: T('wizSpecify') });
    if (!ASSESS.clinicalAlerts.length && !(ASSESS.alertsOther || '').trim()) {
      html += '<div class="fempty">' + T('fAlertsNone') + '</div>';
    }
    return html;
  }

  function vNone() { return []; }

  /* ------------------------------------------------------------- step 14: summary */

  function dlRow(label, value) {
    return '<div class="dl-row"><span class="dl-k">' + esc(label) + '</span>' +
      '<span class="dl-v' + (value === '' || value === null || value === undefined ? ' empty' : '') + '">' +
      (value === '' || value === null || value === undefined ? esc(T('sumNotRecorded')) : value) +
      '</span></div>';
  }

  function sumSection(stepIdx, title, inner) {
    return '<section class="sum-card">' +
      '<header class="sum-head"><h3>' + title + '</h3>' +
      '<button class="btn btn-tiny sum-edit" type="button" data-goto="' + stepIdx + '">' + T('sumEdit') + '</button>' +
      '</header><div class="sum-body">' + inner + '</div></section>';
  }

  function stepSummary() {
    var p = ASSESS.patient, m = ASSESS.medicalHistory, meds = ASSESS.medications, r = ASSESS.riskFactors;
    var L = ASSESS.painLocation, rad = ASSESS.radiation, ph = ASSESS.previousHistory;
    var html = '';

    html += '<div class="sum-note">' + T('sumGenerated') + '</div>';
    if (!allComplete()) html += '<div class="sum-warn">' + T('sumDraftNote') + '</div>';

    /* ---- Patient */
    html += sumSection(0, T('sumPatient'),
      dlRow(T('sumAge'), p.age === '' ? '' : p.age + ' ' + (p.ageUnit === 'months' ? T('ageMonths') : T('ageYears'))) +
      dlRow(T('sumSex'), p.sex ? anyLabel('sex', p.sex) : '') +
      dlRow(T('sumHeight'), p.height) +
      dlRow(T('sumWeight'), p.weight) +
      (p.sex === 'female' ? dlRow(T('sumPregnancy'), p.pregnancy ? anyLabel('pregnancy', p.pregnancy) : '') +
        dlRow(T('fGestAge'), p.gestAge) : '')
    );

    /* ---- Medical context */
    var dis = (m.diseases || []).map(function (k) {
      var parts = k.split(':');
      var grp = optById('chronicDiseases', parts[0]);
      var it = null;
      if (grp) for (var i = 0; i < grp.items.length; i++) if (grp.items[i].id === parts[1]) it = grp.items[i];
      var gname = grp ? OL(grp) : parts[0];
      var iname = it ? OL(it) : parts[1];
      return gname + ' — ' + iname;
    });
    if ((m.other || '').trim()) dis.push(T('wizOther') + ': ' + m.other);
    var medRows = meds.list.map(function (med) {
      var bits = [med.name, med.dose, med.frequency].filter(function (x) { return (x || '').trim(); });
      if (med.regularity) bits.push(anyLabel('medicationRegularity', med.regularity));
      return esc(bits.join(' · '));
    });
    html += sumSection(1, T('sumMedical'),
      dlRow(T('sumChronic'), m.has === 'yes' ? listJoin(dis) : (m.has ? anyLabel('hasChronic', m.has) : '')) +
      dlRow(T('sumMeds'), meds.takes === 'yes' && medRows.length ? medRows.join('<br>') : (meds.takes ? anyLabel('takesMedication', meds.takes) : '')) +
      dlRow(T('sumRisk'),
        (r.smoking ? anyLabel('smokingStatus', r.smoking) : '') +
        (r.smoking === 'current' && r.cigsPerDay && r.yearsSmoking
          ? ' (' + esc(r.cigsPerDay) + '/' + (isAr() ? 'يوميًا' : 'day') + ', ' + esc(r.yearsSmoking) + ' ' + (isAr() ? 'سنة' : 'yrs') + ')' : '') +
        (r.alcohol ? ' · ' + anyLabel('alcoholUse', r.alcohol) : '') +
        (r.substances ? ' · ' + anyLabel('substanceUse', r.substances) : '')) +
      dlRow(T('sumDisability'),
        (r.disability.length ? listJoin(r.disability.map(function (x) { return anyLabel('visibleDisability', x); })) : '') +
        (r.communication ? ' · ' + anyLabel('communicationDifficulty', r.communication) : ''))
    );

    /* ---- Pain */
    var locs = Object.keys(L.regions).map(function (rid) {
      return regionLabel(rid) + ' (' + anyLabel('laterality', L.regions[rid]) + ')';
    });
    if ((L.manual || '').trim()) locs.push(esc(L.manual));
    var onset = ASSESS.timeCourse;
    var onsetBits = [];
    if (onset.onsetDate) onsetBits.push(esc(onset.onsetDate) + (onset.approx ? ' (' + (isAr() ? 'تقريبي' : 'approx.') + ')' : ''));
    if (onset.onsetType) onsetBits.push(anyLabel('onsetType', onset.onsetType));
    if (onset.trigger) onsetBits.push(anyLabel('onsetTrigger', onset.trigger) + (onset.trigger === 'other' && onset.triggerOther ? ': ' + esc(onset.triggerOther) : ''));
    if (onset.pattern) onsetBits.push(anyLabel('painPattern', onset.pattern));
    if (onset.evolution) onsetBits.push(anyLabel('painEvolution', onset.evolution));
    if (onset.episodeDuration) onsetBits.push(esc(onset.episodeDuration));

    var intBits = [];
    ['now', 'min', 'max', 'avg'].forEach(function (k) {
      var v = ASSESS.intensity[k];
      if (v !== '' && v !== null && v !== undefined) {
        intBits.push(T({ now: 'fIntensityNow', min: 'fIntensityMin', max: 'fIntensityMax', avg: 'fIntensityAvg' }[k]) +
          ': ' + v + '/10 (' + nrsBand(v) + ')');
      }
    });

    var radTxt = rad.radiates === 'yes'
      ? esc(rad.origin) + ' → ' + esc(rad.destination) +
        (rad.direction ? ' (' + anyLabel('radiationDirection', rad.direction) + ')' : '')
      : (rad.radiates ? anyLabel('radiates', rad.radiates) : '');

    var prevBits = [];
    if (ph.similar) prevBits.push(anyLabel('previousSimilar', ph.similar));
    if ((ph.diagnosis || '').trim()) prevBits.push(T('fPrevDiagnosis') + ': ' + esc(ph.diagnosis));
    if (ph.surgery) prevBits.push(T('fPrevSurgery') + ': ' + anyLabel('yesNoUnknown', ph.surgery));
    if (ph.trauma) prevBits.push(T('fPrevTrauma') + ': ' + anyLabel('yesNoUnknown', ph.trauma));
    if (ph.treatment.length) prevBits.push(T('fPrevTreatment') + ': ' + listJoin(ph.treatment.map(function (x) { return anyLabel('previousTreatment', x); })));
    if (ph.response) prevBits.push(T('fPrevResponse') + ': ' + anyLabel('treatmentResponse', ph.response));
    if ((ph.adverse || '').trim()) prevBits.push(T('fPrevAdverse') + ': ' + esc(ph.adverse));

    html += sumSection(3, T('sumPain'),
      dlRow(T('sumLocation'), listJoin(locs)) +
      dlRow(T('sumSource'), ASSESS.painSource.length ? listJoin(ASSESS.painSource.map(function (x) { return anyLabel('painSource', x); })) : '') +
      dlRow(T('sumMech'), ASSESS.painMechanism.length ? listJoin(ASSESS.painMechanism.map(function (x) { return anyLabel('painMechanism', x); })) : '') +
      dlRow(T('sumQuality'),
        (ASSESS.painQuality.length ? listJoin(ASSESS.painQuality.map(function (x) { return anyLabel('painQuality', x); })) : '') +
        ((ASSESS.qualityOther || '').trim() ? (ASSESS.painQuality.length ? ' · ' : '') + esc(ASSESS.qualityOther) : '')) +
      dlRow(T('sumOnset'), listJoin(onsetBits)) +
      dlRow(T('sumIntensity'), listJoin(intBits)) +
      dlRow(T('sumRadiation'), radTxt) +
      dlRow(T('sumAgg'), ASSESS.aggravatingFactors.length ? listJoin(ASSESS.aggravatingFactors.map(function (x) { return anyLabel('aggravatingFactors', x); })) : '') +
      dlRow(T('sumRel'), ASSESS.relievingFactors.length ? listJoin(ASSESS.relievingFactors.map(function (x) { return anyLabel('relievingFactors', x); })) : '') +
      dlRow(T('sumSymptoms'),
        (ASSESS.associatedSymptoms.length ? listJoin(ASSESS.associatedSymptoms.map(function (x) { return anyLabel('associatedSymptoms', x); })) : '') +
        ((ASSESS.associatedOther || '').trim() ? (ASSESS.associatedSymptoms.length ? ' · ' : '') + esc(ASSESS.associatedOther) : '')) +
      dlRow(T('sumImpact'),
        listJoin(OPT('functionalDomains').map(function (d) {
          var v = ASSESS.functionalImpact[d.id];
          return v ? OL(d) + ': ' + anyLabel('impactScale', v) : null;
        }).filter(Boolean))) +
      dlRow(T('sumPrevious'), listJoin(prevBits))
    );

    /* ---- Clinical alerts: only what the physician entered */
    var alerts = ASSESS.clinicalAlerts.map(function (x) { return anyLabel('clinicalAlerts', x); });
    if ((ASSESS.alertsOther || '').trim()) alerts.push(T('wizOther') + ': ' + ASSESS.alertsOther);
    html += sumSection(12, T('sumAlerts'),
      alerts.length
        ? '<ul class="alert-list">' + alerts.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>'
        : '<div class="fempty">' + T('fAlertsNone') + '</div>');

    html += '<div class="sum-disclaimer">' + T('sumDisclaimer') + '</div>';
    html += '<div class="sum-actions"><button class="btn btn-primary" type="button" data-print="1">' + T('sumPrint') + '</button></div>';
    return html;
  }

  /* ------------------------------------------------------------- navigation */

  function stepComplete(idx) {
    var st = STEPS[idx];
    try { return st.validate().length === 0; } catch (e) { return false; }
  }
  /* A step counts towards progress only when it validates AND has content. */
  function stepDone(idx) {
    if (idx >= STEPS.length - 1) return false;
    var filled = STEP_FILLED[STEPS[idx].id];
    return stepComplete(idx) && (!filled || filled());
  }
  function doneCount() {
    var n = 0;
    for (var i = 0; i < STEPS.length - 1; i++) if (stepDone(i)) n++;
    return n;
  }
  function allComplete() { return doneCount() === STEPS.length - 1; }

  /* Whether the clinician has entered anything worth confirming before
   * leaving. A brand-new empty assessment never blocks navigation. */
  function hasData() {
    var p = ASSESS.patient, m = ASSESS.medications, mh = ASSESS.medicalHistory;
    if (p.age !== '' || p.sex || p.height || p.weight || p.pregnancy) return true;
    if (mh.has || (mh.diseases || []).length || (mh.other || '').trim()) return true;
    if (m.takes || m.list.length) return true;
    if (Object.keys(ASSESS.painLocation.regions).length || (ASSESS.painLocation.manual || '').trim()) return true;
    if (ASSESS.painSource.length || ASSESS.painMechanism.length || ASSESS.painQuality.length ||
        (ASSESS.qualityOther || '').trim()) return true;
    if (ASSESS.timeCourse.onsetDate || ASSESS.timeCourse.pattern || ASSESS.timeCourse.evolution) return true;
    if (ASSESS.intensity.now !== '' || ASSESS.intensity.min !== '' || ASSESS.intensity.max !== '') return true;
    if (ASSESS.radiation.radiates || ASSESS.aggravatingFactors.length || ASSESS.relievingFactors.length) return true;
    if (ASSESS.associatedSymptoms.length || (ASSESS.associatedOther || '').trim()) return true;
    if (OPT('functionalDomains').some(function (d) { return !!ASSESS.functionalImpact[d.id]; })) return true;
    if (ASSESS.previousHistory.similar || ASSESS.previousHistory.treatment.length ||
        (ASSESS.previousHistory.diagnosis || '').trim()) return true;
    if (ASSESS.clinicalAlerts.length || (ASSESS.alertsOther || '').trim()) return true;
    return false;
  }

  function renderSidebar() {
    var box = $('#wizSteps');
    if (!box) return;
    var html = '';
    STEPS.forEach(function (st, i) {
      var cls = i === cur ? 'cur' : (stepDone(i) ? 'done' : '');
      var no = stepDone(i) ? '✓' : String(i + 1);
      html += '<li class="wstep ' + cls + '"' + (cls ? ' data-state="' + cls + '"' : '') + '>' +
        '<button class="wstep-btn" type="button" data-goto="' + i + '"' +
          ' aria-current="' + (i === cur) + '">' +
        '<span class="wstep-no">' + no + '</span>' +
        '<span class="wstep-t">' + T(st.title) + '</span>' +
        (i === cur ? '<span class="wstep-here">' + (isAr() ? 'الحالية' : 'current') + '</span>' : '') +
        '</button></li>';
    });
    box.innerHTML = html;

    var bar = $('#wizBar');
    var pct = Math.round((doneCount() / (STEPS.length - 1)) * 100);
    if (bar) {
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(pct));
    }
    var lab = $('#wizProgressLabel');
    if (lab) lab.textContent = TF('wizStepsDone', { n: doneCount(), m: STEPS.length - 1 });
    var thin = $('#wizBarThin');
    if (thin) thin.style.width = pct + '%';
    var barTop = $('#wizBar');
    if (barTop) barTop.setAttribute('aria-valuenow', String(pct));
  }

  function renderChrome() {
    var st = STEPS[cur];
    setText('#wizTitle', T(st.title));
    var badge = $('#wizBadge');
    if (badge) badge.textContent = TF('wizStepOf', { n: cur + 1, m: STEPS.length });
    var prev = $('#wizPrev');
    if (prev) {
      prev.textContent = T('wizPrev');
      prev.disabled = cur === 0;
    }
    var next = $('#wizNext');
    if (next) {
      next.textContent = cur === STEPS.length - 1 ? T('wizFinish') : T('wizNext');
    }
    renderSidebar();
  }

  function showErrors(errs) {
    var box = $('#wizErrors');
    if (!box) return;
    if (!errs.length) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    box.innerHTML = '<strong>' + T('errFix') + '</strong><ul>' +
      errs.map(function (e) { return '<li>' + esc(e.msg) + '</li>'; }).join('') + '</ul>';
    /* highlight the offending blocks */
    $$('#wizBody [data-errblock]').forEach(function (b) { b.classList.remove('has-err'); });
    errs.forEach(function (e) {
      var blk = $('#wizBody [data-errblock="' + e.path + '"]');
      if (blk) blk.classList.add('has-err');
    });
    box.focus && box.focus();
  }

  function clearErrors() {
    var box = $('#wizErrors');
    if (box) { box.hidden = true; box.innerHTML = ''; }
    $$('#wizBody [data-errblock]').forEach(function (b) { b.classList.remove('has-err'); });
  }

  function renderStep() {
    var body = $('#wizBody');
    if (!body) return;
    var st = STEPS[cur];
    body.innerHTML = '<div class="step-loading" hidden>' + T('wizLoading') + '</div>';
    clearErrors();
    var html = st.render();
    body.innerHTML = html;
    afterRender();
    renderChrome();
    var scroll = $('#wizBody');
    if (scroll) scroll.scrollTop = 0;
  }

  /* Step-specific post-render wiring (body map, focus handling). */
  function afterRender() {
    if (STEPS[cur].id === 'location') buildLocStage();
  }

  function buildLocStage() {
    var stage = $('#locStage');
    if (!stage || !window.BODY_MAP) return;
    stage.innerHTML = '';
    var selected = {};
    Object.keys(ASSESS.painLocation.regions).forEach(function (k) { selected[k] = true; });
    var svg = window.BODY_MAP.buildPicker(locView, selected);
    svg.setAttribute('aria-label', T('bodyAria'));
    stage.appendChild(svg);

    $$('.region[data-pick]', svg).forEach(function (el) {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      var rid = el.getAttribute('data-pick');
      var lab = regionLabel(rid);
      el.setAttribute('aria-label', lab + (isAr() ? ' — انقر لتحديد موضع الألم' : ' — click to mark as painful'));
      el.setAttribute('aria-pressed', selected[rid] ? 'true' : 'false');

      el.addEventListener('click', function () { toggleRegion(rid, el); });
      el.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.click(); }
      });
    });
  }

  /* Toggle a coarse region; default laterality comes from the hotspot the
   * physician actually clicked, with patient-side inversion in the back view. */
  function toggleRegion(rid, hotspotEl) {
    var regs = ASSESS.painLocation.regions;
    if (regs[rid]) {
      delete regs[rid];
    } else {
      var side = hotspotEl ? hotspotEl.getAttribute('data-side') : null;
      var view = locView;
      var lat;
      if (!side) lat = 'midline';
      else {
        var isRight = ((side === 'r') === (view === 'back'));
        lat = isRight ? 'right' : 'left';
      }
      regs[rid] = lat;
    }
    afterChange();
    renderStep();
  }

  function setLocLaterality(rid, val) {
    ASSESS.painLocation.regions[rid] = val;
    afterChange();
    renderStep();
  }
  function delLocRegion(rid) {
    delete ASSESS.painLocation.regions[rid];
    afterChange();
    renderStep();
  }

  /* ------------------------------------------------------------- change handling */

  function afterChange() {
    saveDraft();
    renderSidebar();
    var st = $('#wizSaveState');
    if (st) st.textContent = T('wizSaved');
  }

  function bindBody() {
    var body = $('#wizBody');
    if (!body || body.dataset.bound) return;
    body.dataset.bound = '1';

    /* text / number / date / textarea / select / radio */
    body.addEventListener('input', function (ev) {
      var el = ev.target;
      var f = el.getAttribute && el.getAttribute('data-f');
      if (!f) return;
      var val = el.type === 'checkbox' ? el.checked : el.value;
      setPath(ASSESS, f, val);
      afterChange();
      if (el.getAttribute('data-reload')) renderStep();
    });
    body.addEventListener('change', function (ev) {
      var el = ev.target;
      var mg = el.getAttribute && el.getAttribute('data-mg');
      if (mg) {
        var arr = getPath(ASSESS, mg) || [];
        toggleArray(arr, el.value, el.checked);
        setPath(ASSESS, mg, arr);
        afterChange();
        renderStep();   /* chips reflect selection state */
        return;
      }
      var f = el.getAttribute && el.getAttribute('data-f');
      if (f) {
        setPath(ASSESS, f, el.value);
        afterChange();
        if (el.getAttribute('data-reload')) renderStep();
      }
      /* per-region laterality radios */
      var ls = el.getAttribute && el.getAttribute('data-locside');
      if (ls) setLocLaterality(ls, el.value);
    });

    /* clicks: NRS buttons, medication add/remove, region remove, quick fill,
       summary edit, print */
    body.addEventListener('click', function (ev) {
      var nrs = ev.target.closest && ev.target.closest('[data-nrs]');
      if (nrs) {
        setPath(ASSESS, nrs.getAttribute('data-nrs'), nrs.getAttribute('data-val'));
        afterChange();
        renderStep();
        return;
      }
      var medAdd = ev.target.closest && ev.target.closest('[data-medadd]');
      if (medAdd) {
        ASSESS.medications.list.push({ name: '', ingredient: '', category: '', dose: '', frequency: '', duration: '', reason: '', regularity: '' });
        afterChange();
        renderStep();
        return;
      }
      var medDel = ev.target.closest && ev.target.closest('[data-meddel]');
      if (medDel) {
        ASSESS.medications.list.splice(Number(medDel.getAttribute('data-meddel')), 1);
        afterChange();
        renderStep();
        return;
      }
      var locDel = ev.target.closest && ev.target.closest('[data-locdel]');
      if (locDel) { delLocRegion(locDel.getAttribute('data-locdel')); return; }
      var radFill = ev.target.closest && ev.target.closest('[data-radfill]');
      if (radFill) {
        ASSESS.radiation[radFill.getAttribute('data-radfill')] = regionLabel(radFill.getAttribute('data-val'));
        afterChange();
        renderStep();
        return;
      }
      var goto = ev.target.closest && ev.target.closest('[data-goto]');
      if (goto) { go(Number(goto.getAttribute('data-goto'))); return; }
      var prn = ev.target.closest && ev.target.closest('[data-print]');
      if (prn) { printSummary(); return; }
      var lv = ev.target.closest && ev.target.closest('[data-locview]');
      if (lv) {
        locView = lv.getAttribute('data-locview');
        renderStep();
        return;
      }
    });

    /* keyboard support for the NRS groups (arrow keys move the level) */
    body.addEventListener('keydown', function (ev) {
      var btn = ev.target.closest && ev.target.closest('[data-nrs]');
      if (!btn) return;
      if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft' && ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown') return;
      ev.preventDefault();
      var path = btn.getAttribute('data-nrs');
      var v = Number(getPath(ASSESS, path));
      if (isNaN(v)) v = 0;
      var fwd = ev.key === 'ArrowRight' || ev.key === 'ArrowUp';
      if (isAr()) fwd = !fwd;   /* RTL: arrows run opposite */
      v = Math.min(10, Math.max(0, v + (fwd ? 1 : -1)));
      setPath(ASSESS, path, v);
      afterChange();
      renderStep();
      var again = $('#wizBody [data-nrs="' + path + '"][data-val="' + v + '"]');
      if (again && again.focus) again.focus();
    });
  }

  function printSummary() {
    document.body.classList.add('is-printing');
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      try { window.print(); } catch (e) {}
    }
  }

  /* ------------------------------------------------------------- confirm dialog */

  var pendingYes = null;
  function confirmDlg(title, bodyText, onYes) {
    var m = $('#wizConfirm');
    if (!m) { if (onYes) onYes(); return; }
    setText('#wizConfirmTitle', title);
    setText('#wizConfirmBody', bodyText);
    var yb = $('#wizConfirmYes');
    if (yb) yb.textContent = T('wizYes');
    var nb = $('#wizConfirmNo');
    if (nb) nb.textContent = T('wizNo');
    m.hidden = false;
    pendingYes = onYes;
  }
  function closeConfirm() {
    var m = $('#wizConfirm');
    if (m) m.hidden = true;
    pendingYes = null;
  }

  /* ------------------------------------------------------------- navigation actions */

  function go(idx) {
    if (idx < 0 || idx >= STEPS.length) return;
    cur = idx;
    renderStep();
  }
  function next() {
    var errs = STEPS[cur].validate();
    if (errs.length) { showErrors(errs); return; }
    if (cur < STEPS.length - 1) go(cur + 1);
  }
  function prev() {
    if (cur > 0) go(cur - 1);
  }

  function requestNewAssessment() {
    if (!allComplete()) {
      confirmDlg(T('wizConfirmResetTitle'), T('wizConfirmResetBody'), function () {
        ASSESS = blankAssessment();
        clearDraft();
        cur = 0;
        renderStep();
      });
    } else {
      ASSESS = blankAssessment();
      clearDraft();
      cur = 0;
      renderStep();
    }
  }

  /* ------------------------------------------------------------- draft bar */

  function renderDraftBar() {
    var bar = $('#wizDraftBar');
    if (!bar) return;
    var raw = loadDraftRaw();
    if (!raw || !raw.meta || !raw.meta.startedAt) { bar.hidden = true; bar.innerHTML = ''; return; }
    if (!draftBarVisible) { bar.hidden = true; return; }
    bar.hidden = false;
    bar.innerHTML = '<div class="draft-msg">' +
      esc(T('wizLoadDraftQ')) +
      ' <button class="btn btn-tiny" type="button" data-draft="resume">' + T('wizResumeDraft') + '</button>' +
      ' <button class="btn btn-tiny" type="button" data-draft="discard">' + T('wizDiscardDraft') + '</button>' +
      '</div>';
  }

  function setText(sel, val) { var el = $(sel); if (el) el.textContent = val; }

  /* ------------------------------------------------------------- init / api */

  var booted = false;
  function init() {
    if (booted) return;
    booted = true;
    if (!$('#wizardView')) return;   /* wizard markup absent — explorer only */
    bindBody();
    bindChrome();
    var raw = loadDraftRaw();
    if (raw && raw.meta && raw.meta.startedAt) {
      draftBarVisible = true;
      ASSESS.meta.startedAt = raw.meta.startedAt;
      renderDraftBar();
    } else {
      ASSESS.meta.startedAt = new Date().toISOString();
      saveDraft();
    }
    renderStep();
  }

  function bindChrome() {
    var prevBtn = $('#wizPrev'); if (prevBtn) prevBtn.addEventListener('click', prev);
    var nextBtn = $('#wizNext'); if (nextBtn) nextBtn.addEventListener('click', next);
    var save = $('#wizSaveDraft');
    if (save) save.addEventListener('click', function () {
      saveDraft();
      renderDraftBar();
      var st = $('#wizSaveState');
      if (st) st.textContent = T('wizSaved');
    });
    var nw = $('#wizNew'); if (nw) nw.addEventListener('click', requestNewAssessment);

    var steps = $('#wizSteps');
    if (steps) steps.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-goto]');
      if (b) go(Number(b.getAttribute('data-goto')));
    });

    var db = $('#wizDraftBar');
    if (db) db.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-draft]');
      if (!b) return;
      var act = b.getAttribute('data-draft');
      draftBarVisible = false;
      if (act === 'resume') {
        var raw = loadDraftRaw();
        if (raw) { ASSESS = raw; if (!ASSESS.meta) ASSESS.meta = {}; }
      } else {
        clearDraft();
        ASSESS.meta.startedAt = new Date().toISOString();
        saveDraft();
      }
      renderDraftBar();
      renderStep();
    });

    var cb = $('#wizConfirmNo');
    if (cb) cb.addEventListener('click', closeConfirm);
    var cy = $('#wizConfirmYes');
    if (cy) cy.addEventListener('click', function () {
      var fn = pendingYes; closeConfirm(); if (fn) fn();
    });
    var cbk = $('#wizConfirmBackdrop');
    if (cbk) cbk.addEventListener('click', closeConfirm);

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        if ($('#wizConfirm') && !$('#wizConfirm').hidden) closeConfirm();
      }
    });
  }

  /* Called by app.js whenever the language changes. Re-rendering preserves
   * the assessment state — only labels are retranslated. */
  function refresh() {
    if (!$('#wizardView')) return;
    renderDraftBar();
    renderStep();
  }

  /* Called by app.js when switching to assessment mode. */
  function activate() {
    renderStep();
  }

  window.PAIN_WIZARD = {
    init: init,
    refresh: refresh,
    activate: activate,
    state: function () { return ASSESS; },
    resetState: function () { ASSESS = blankAssessment(); },
    loadDraftRaw: loadDraftRaw,
    saveDraft: saveDraft,
    clearDraft: clearDraft,
    go: go,
    next: next,
    prev: prev,
    stepComplete: stepComplete,
    doneCount: doneCount,
    hasData: hasData
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
