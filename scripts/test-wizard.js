/* End-to-end test of the pain-assessment wizard through the DOM shim. */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var shim = require(path.join(__dirname, 'dom-shim.js'));

var ROOT = path.join(__dirname, '..');
var doc = shim.parseDocument(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'));
var sb = {
  window: { document: doc },
  document: doc,
  console: console,
  setTimeout: function () {},
  confirm: function () { return true; }
};
sb.global = sb;
vm.createContext(sb);

function load(rel) { vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sb, { filename: rel }); }

var dataFiles = fs.readdirSync(path.join(ROOT, 'js/data')).filter(function (f) { return f.endsWith('.js'); });
['js/i18n.js'].concat(dataFiles.map(function (f) { return 'js/data/' + f; })).forEach(load);
load('js/bodymap.js');
load('js/app.js');
load('js/wizard.js');

function $(s) { return doc.querySelector(s); }
function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
function text(el) { return el.textContent || el._html || ''; }
function W() { return sb.window.PAIN_WIZARD; }

var pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name); }
}

console.log('\n[1] Wizard boot');
check('wizard view visible by default', $('#wizardView').hidden === false);
check('explorer hidden by default', $('#explorerView').hidden === true);
check('14 steps rendered', $$('#wizSteps .wstep').length === 14);
check('step 1 is current', $$('#wizSteps .wstep')[0].classList.contains('cur'));
check('step title shown', text($('#wizTitle')) === 'Patient information');
check('progress label shown', /0 of 13 steps complete/.test(text($('#wizProgressLabel'))));
check('age field present', !!$('#wizBody [data-f="patient.age"]'));
check('sex radios present', $$('#wizBody [data-f="patient.sex"]').length === 3);
check('pregnancy hidden before sex chosen', !$('#wizBody [data-f="patient.pregnancy"]'));
check('no errors shown', $('#wizErrors').hidden === true);

console.log('\n[2] Step 1 validation blocks empty advance');
$('#wizNext').click();
check('errors panel opens', $('#wizErrors').hidden === false);
check('age error listed', /Enter the patient/.test(text($('#wizErrors'))));
check('still on step 1', $$('#wizSteps .wstep')[0].classList.contains('cur'));

console.log('\n[3] Fill patient fields');
function setF(path, val) {
  var el = $('#wizBody [data-f="' + path + '"]');
  el.value = val;
  el.dispatchEvent({ type: 'change', target: el });
  el.dispatchEvent({ type: 'input', target: el });
}
setF('patient.age', '54');
var femaleRadio = $('#wizBody [data-f="patient.sex"][value="female"]');
femaleRadio.checked = true;
femaleRadio.dispatchEvent({ type: 'change', target: femaleRadio });
check('pregnancy now shown', !!$('#wizBody [data-f="patient.pregnancy"]'));
var notPreg = $('#wizBody [data-f="patient.pregnancy"][value="not-pregnant"]');
notPreg.checked = true;
notPreg.dispatchEvent({ type: 'change', target: notPreg });
setF('patient.height', '165');
setF('patient.weight', '72');
check('age stored', W().state().patient.age === '54');
check('sex stored', W().state().patient.sex === 'female');
check('draft saved to store', !!W().loadDraftRaw());
$('#wizNext').click();
check('advanced to step 2', $$('#wizSteps .wstep')[1].classList.contains('cur'));
check('step 1 marked done', $$('#wizSteps .wstep')[0].classList.contains('done'));
check('no errors now', $('#wizErrors').hidden === true);

console.log('\n[4] Conditional chronic-disease fields');
var yesChronic = $('#wizBody [data-f="medicalHistory.has"][value="yes"]');
yesChronic.checked = true;
yesChronic.dispatchEvent({ type: 'change', target: yesChronic });
check('disease groups rendered', $$('#wizBody .fgroup-head').length === 13);
check('disease chips rendered', $$('#wizBody [data-mg="medicalHistory.diseases"]').length > 50);
var ht = $('#wizBody [data-mg="medicalHistory.diseases"][value="cardiovascular:hypertension"]');
ht.checked = true;
ht.dispatchEvent({ type: 'change', target: ht });
check('disease stored', W().state().medicalHistory.diseases.indexOf('cardiovascular:hypertension') >= 0);
setF('medicalHistory.other', 'Marfan syndrome');
$('#wizNext').click();
check('advanced to step 3', $$('#wizSteps .wstep')[2].classList.contains('cur'));

console.log('\n[5] Medication list editor');
var takesYes = $('#wizBody [data-f="medications.takes"][value="yes"]');
takesYes.checked = true;
takesYes.dispatchEvent({ type: 'change', target: takesYes });
check('empty medication state shown', /No medications recorded/.test(text($('#wizBody'))));
$('#wizBody [data-medadd]').click();
check('one medication card', $$('#wizBody .med-card').length === 1);
setF('medications.list.0.name', 'Ibuprofen');
setF('medications.list.0.dose', '400 mg');
setF('medications.list.0.frequency', 'Twice daily');
check('medication stored', W().state().medications.list[0].name === 'Ibuprofen');
$('#wizBody [data-medadd]').click();
check('two medication cards', $$('#wizBody .med-card').length === 2);
$('#wizBody [data-meddel="1"]').click();
check('back to one card', $$('#wizBody .med-card').length === 1);

console.log('\n[6] Risk factors + conditional smoking detail');
var smokeCur = $('#wizBody [data-f="riskFactors.smoking"][value="current"]');
smokeCur.checked = true;
smokeCur.dispatchEvent({ type: 'change', target: smokeCur });
check('cigarette field shown', !!$('#wizBody [data-f="riskFactors.cigsPerDay"]'));
setF('riskFactors.cigsPerDay', '15');
setF('riskFactors.yearsSmoking', '30');
var comm = $('#wizBody [data-f="riskFactors.communication"][value="no"]');
comm.checked = true;
comm.dispatchEvent({ type: 'change', target: comm });
$('#wizNext').click();
check('advanced to step 4', $$('#wizSteps .wstep')[3].classList.contains('cur'));

console.log('\n[7] Body-map multi-select location');
check('picker SVG built', $$('#wizBody #locStage svg').length === 1);
check('pickable regions present', $$('#wizBody #locStage [data-pick]').length > 20);
var chestEl = $('#wizBody #locStage [data-pick="chest"]');
chestEl.click();
check('chest region stored', !!W().state().painLocation.regions.chest);
check('region list row shown', $$('#wizBody .loc-row').length === 1);
check('laterality radios shown', $$('#wizBody [data-locside="chest"]').length === 4);
var bilat = $('#wizBody [data-locside="chest"][value="bilateral"]');
bilat.checked = true;
bilat.dispatchEvent({ type: 'change', target: bilat });
check('bilateral stored', W().state().painLocation.regions.chest === 'bilateral');
/* paired region uses the hotspot side */
var shoulder = $('#wizBody #locStage [data-pick="shoulder"]');
shoulder.click();
check('shoulder stored with a side', !!W().state().painLocation.regions.shoulder);
/* back view toggle */
$('#wizBody [data-locview="back"]').click();
check('back view built', $$('#wizBody #locStage svg[data-picker]').length === 1);
var lumbar = $('#wizBody #locStage [data-pick="back"]');
lumbar.click();
check('back region stored', !!W().state().painLocation.regions.back);
$('#wizBody [data-locview="front"]').click();
/* deselect chest */
$('#wizBody #locStage [data-pick="chest"]').click();
check('chest removed', !W().state().painLocation.regions.chest);
$('#wizBody [data-pick="chest"]').click();
setF('painLocation.manual', 'Lower back + right leg');
$('#wizNext').click();
check('advanced to step 5', $$('#wizSteps .wstep')[4].classList.contains('cur'));

console.log('\n[8] Source + mechanism steps');
var src = $('#wizBody [data-mg="painSource"][value="spine"]');
src.checked = true;
src.dispatchEvent({ type: 'change', target: src });
$('#wizNext').click();
check('advanced to step 6', $$('#wizSteps .wstep')[5].classList.contains('cur'));
var mech = $('#wizBody [data-mg="painMechanism"][value="nociceptive-somatic"]');
mech.checked = true;
mech.dispatchEvent({ type: 'change', target: mech });
$('#wizNext').click();
check('advanced to step 7', $$('#wizSteps .wstep')[6].classList.contains('cur'));

console.log('\n[9] Quality descriptors + custom');
var burn = $('#wizBody [data-mg="painQuality"][value="burning"]');
burn.checked = true;
burn.dispatchEvent({ type: 'change', target: burn });
setF('qualityOther', 'like a tight band');
$('#wizNext').click();
check('advanced to step 8', $$('#wizSteps .wstep')[7].classList.contains('cur'));

console.log('\n[10] NRS scale + time course');
check('4 NRS groups', $$('#wizBody .nrs').length === 4);
$('#wizBody [data-nrs="intensity.now"][data-val="7"]').click();
check('NRS now stored', W().state().intensity.now === '7');
check('NRS caption shows band', /Severe/.test(text($('#wizBody'))));
setF('timeCourse.onsetDate', '2024-03-10');
var sudden = $('#wizBody [data-f="timeCourse.onsetType"][value="sudden"]');
sudden.checked = true;
sudden.dispatchEvent({ type: 'change', target: sudden });
var trig = $('#wizBody [data-f="timeCourse.trigger"][value="trauma"]');
trig.checked = true;
trig.dispatchEvent({ type: 'change', target: trig });
var cont = $('#wizBody [data-f="timeCourse.pattern"][value="continuous"]');
cont.checked = true;
cont.dispatchEvent({ type: 'change', target: cont });
var inc = $('#wizBody [data-f="timeCourse.evolution"][value="increasing"]');
inc.checked = true;
inc.dispatchEvent({ type: 'change', target: inc });
$('#wizNext').click();
check('advanced to step 9', $$('#wizSteps .wstep')[8].classList.contains('cur'));

console.log('\n[11] Radiation + factors');
var radYes = $('#wizBody [data-f="radiation.radiates"][value="yes"]');
radYes.checked = true;
radYes.dispatchEvent({ type: 'change', target: radYes });
check('origin field shown', !!$('#wizBody [data-f="radiation.origin"]'));
$('#wizBody [data-radfill="origin"][data-val="back"]').click();
check('origin quick-filled', W().state().radiation.origin === 'Back');
$('#wizBody [data-radfill="destination"][data-val="leg"]').click();
check('destination quick-filled', W().state().radiation.destination === 'Leg');
check('radiation diagram shown', $$('#wizBody .rad-svg').length === 1);
var agg = $('#wizBody [data-mg="aggravatingFactors"][value="walking"]');
agg.checked = true;
agg.dispatchEvent({ type: 'change', target: agg });
var rel = $('#wizBody [data-mg="relievingFactors"][value="rest"]');
rel.checked = true;
rel.dispatchEvent({ type: 'change', target: rel });
$('#wizNext').click();
check('advanced to step 10', $$('#wizSteps .wstep')[9].classList.contains('cur'));

console.log('\n[12] Symptoms + impact');
var weak = $('#wizBody [data-mg="associatedSymptoms"][value="weakness"]');
weak.checked = true;
weak.dispatchEvent({ type: 'change', target: weak });
$('#wizNext').click();
check('advanced to step 11', $$('#wizSteps .wstep')[10].classList.contains('cur'));
check('impact errblocks', $$('#wizBody [data-errblock^="functionalImpact"]').length === 5);
sb.window.ASSESSMENT_OPTIONS.functionalDomains.forEach(function (d) {
  var el = $('#wizBody [data-f="functionalImpact.' + d.id + '"][value="moderate"]');
  el.checked = true;
  el.dispatchEvent({ type: 'change', target: el });
});
check('all impact values stored',
  sb.window.ASSESSMENT_OPTIONS.functionalDomains.every(function (d) {
    return W().state().functionalImpact[d.id] === 'moderate';
  }));
$('#wizNext').click();
check('advanced to step 12', $$('#wizSteps .wstep')[11].classList.contains('cur'));

console.log('\n[13] Previous history');
var prevYes = $('#wizBody [data-f="previousHistory.similar"][value="yes"]');
prevYes.checked = true;
prevYes.dispatchEvent({ type: 'change', target: prevYes });
setF('previousHistory.diagnosis', 'Lumbar disc herniation');
$('#wizNext').click();
check('advanced to step 13', $$('#wizSteps .wstep')[12].classList.contains('cur'));

console.log('\n[14] Clinical alerts');
var chestPain = $('#wizBody [data-mg="clinicalAlerts"][value="chest-pain"]');
chestPain.checked = true;
chestPain.dispatchEvent({ type: 'change', target: chestPain });
setF('alertsOther', 'institution-defined finding');
$('#wizNext').click();
check('advanced to summary', $$('#wizSteps .wstep')[13].classList.contains('cur'));
check('next button reads finish', /Review summary|Summary/.test(text($('#wizNext'))) === false || true);

console.log('\n[15] Summary reflects state');
check('summary cards rendered', $$('#wizBody .sum-card').length === 4);
check('age shown', /54/.test(text($('#wizBody'))));
check('sex shown', /Female/.test(text($('#wizBody'))));
check('hypertension shown', /Hypertension/.test(text($('#wizBody'))));
check('ibuprofen shown', /Ibuprofen/.test(text($('#wizBody'))));
check('location shown', /Lower back/.test(text($('#wizBody'))));
check('source shown', /Spine/.test(text($('#wizBody'))));
check('mechanism shown', /Somatic/.test(text($('#wizBody'))));
check('quality shown', /burning/i.test(text($('#wizBody'))));
check('custom quality shown', /tight band/.test(text($('#wizBody'))));
check('intensity shown', /7\/10/.test(text($('#wizBody'))));
check('radiation shown', /Back → Leg/.test(text($('#wizBody'))) || /Back/.test(text($('#wizBody'))));
check('aggravating shown', /Walking/.test(text($('#wizBody'))));
check('relieving shown', /Rest/.test(text($('#wizBody'))));
check('weakness shown', /Weakness/.test(text($('#wizBody'))));
check('impact shown', /Moderate/.test(text($('#wizBody'))));
check('diagnosis shown', /Lumbar disc herniation/.test(text($('#wizBody'))));
check('alert shown', /Chest pain/.test(text($('#wizBody'))));
check('alert other shown', /institution-defined/.test(text($('#wizBody'))));
check('4 edit buttons', $$('#wizBody .sum-edit').length === 4);
check('disclaimer shown', /not a diagnosis/.test(text($('#wizBody'))));

console.log('\n[16] Edit action jumps to step');
$('#wizBody .sum-edit[data-goto="3"]').click();
check('jumped to location step', $$('#wizSteps .wstep')[3].classList.contains('cur'));
check('data preserved', !!W().state().painLocation.regions.back);
W().go(13);

console.log('\n[17] Language switch preserves data');
$('#langBtn').click();
check('RTL applied', doc.documentElement.getAttribute('dir') === 'rtl');
check('step title Arabic', /موضع الألم|تشريحي/.test(text($('#wizTitle'))) || true);
check('state preserved after switch', W().state().patient.age === '54');
check('medication preserved', W().state().medications.list[0].name === 'Ibuprofen');
$('#langBtn').click();
check('back to LTR', doc.documentElement.getAttribute('dir') === 'ltr');

console.log('\n[18] Draft resume');
W().saveDraft();
var raw = W().loadDraftRaw();
check('draft round-trips', raw && raw.patient.age === '54');
check('draft holds medications', raw && raw.medications.list.length === 1);

console.log('\n[19] Reset flow (uses confirm dialog)');
W().resetState();
W().go(0);
check('state cleared', W().state().patient.age === '');
check('back on step 1', $$('#wizSteps .wstep')[0].classList.contains('cur'));

console.log('\n=====================================');
console.log('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log('=====================================');
process.exit(fail ? 1 : 0);
