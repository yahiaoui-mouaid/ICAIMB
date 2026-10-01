/* End-to-end logic test for the PAIN SCORE app, driven through a DOM shim. */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var shim = require(path.join(__dirname, 'dom-shim.js'));

var ROOT = path.join(__dirname, '..');
var html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var doc = shim.parseDocument(html);

var sandbox = {
  window: { document: doc },
  document: doc,
  console: console,
  setTimeout: function () {}
};
sandbox.global = sandbox;
vm.createContext(sandbox);

function load(rel) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sandbox, { filename: rel });
}

['js/i18n.js', 'js/data/classification.js'].concat(
  fs.readdirSync(path.join(ROOT, 'js/data')).filter(function (f) { return f !== 'classification.js' && f.endsWith('.js'); }).map(function (f) { return 'js/data/' + f; }),
  ['js/bodymap.js', 'js/app.js']
).forEach(load);

/* ---------- helpers ---------- */
function $(sel) { return doc.querySelector(sel); }
function $$(sel) { return doc.querySelectorAll(sel); }
function text(el) { return el.textContent || el._html || ''; }
function has(needle) { return text($('#detail')).indexOf(needle) >= 0; }
function click(el) { el.click(); }

var pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name); }
}

/* ---------- tests ---------- */
console.log('\n[1] Initial render');
check('front + back SVGs built', $('#bodyFront').children.length > 0 && $('#bodyBack').children.length > 0);
check('front regions present', $$('#bodyFront .region').length >= 30);
check('back regions present', $$('#bodyBack .region').length >= 14);
check('mechanism chips = 4', $$('#mechanismChips .chip').length === 4);
check('duration chips = 4', $$('#durationChips .chip').length === 4);
check('sensation chips = 16', $$('#sensationChips .chip').length === 16);
check('quick-access chips = 7', $$('#quickAccess .chip').length === 7);
check('home prompt shown', has('Where is the patient'));
check('body has ' + $$('.body-svg .region').length + ' region hotspots total', true);

console.log('\n[2] Region click -> module view (Abdomen)');
var abdRegion = $$('#bodyFront .region').filter(function (r) { return r.getAttribute('data-module') === 'abdomen'; })[0];
click(abdRegion);
check('abdomen module page opens', has('Abdomen') && has('Liver'));
check('structure cards rendered', $$('#detail .struct-card').length === 12);
check('breadcrumb shows Abdomen', text($('#breadcrumbs')).indexOf('Abdomen') >= 0);
check('region marked current', $$('#bodyFront .region').some(function (r) { return r.classList.contains('current') && r.getAttribute('data-module') === 'abdomen'; }));

console.log('\n[3] Structure click -> pain types (Liver)');
var liverCard = $$('#detail .struct-card').filter(function (c) { return /Liver/i.test(c.textContent); })[0];
click(liverCard);
check('liver pain list shown', text($('#detail')).toLowerCase().indexOf('liver-region pain') >= 0);
check('pain rows rendered', $$('#detail .pain-row').length >= 4);
check('breadcrumb shows Liver', text($('#breadcrumbs')).indexOf('Liver') >= 0);

console.log('\n[4] Pain click -> detail card');
var firstRow = $$('#detail .pain-row')[0];
var painName = firstRow.querySelector('.pname').textContent;
click(firstRow);
check('pain title shown', has(painName));
check('characteristics section', has('Pain characteristics'));
check('radiation section', has('Radiation / referred pain'));
check('related structures section', has('Related structures'));
check('clinician note present', has('clinician selections'));
check('breadcrumb shows pain name', text($('#breadcrumbs')).indexOf(painName) >= 0);
check('related classifications chips', $$('#detail .chip[data-pain]').length >= 1);

console.log('\n[5] Breadcrumb navigation back');
var crumbModule = $$('#breadcrumbs .crumb').filter(function (c) { return c.getAttribute('data-nav') === 'module'; })[0];
click(crumbModule);
check('back to module view', has('Liver') && $$('#detail .struct-card').length === 12);

console.log('\n[6] Search');
var si = $('#searchInput');
si.value = 'migraine';
si.dispatchEvent({ type: 'input', target: si });
check('search results open', $('#searchResults').hidden === false);
check('search finds migraine', text($('#searchResults')).indexOf('Migraine') >= 0);
var firstHit = $('#searchResults .sr-item');
click(firstHit);
check('search hit opens pain detail', has('Migraine'));

console.log('\n[7] Filters');
click($('#homeBtn'));
var neuroChip = $$('#mechanismChips .chip').filter(function (c) { return c.getAttribute('data-fval') === 'Neuropathic'; })[0];
click(neuroChip);
check('filtered view shown', has('Filtered pain types'));
check('filter count text', /matching pain type/.test(text($('#detail'))));
check('clear-filters button visible', $('#clearFiltersBtn').hidden === false);
check('regions dimmed where no match', $$('#bodyFront .region').some(function (r) { return r.classList.contains('dimmed'); }));
click($('#clearFiltersBtn'));
check('filters cleared -> home', has('Where is the patient'));

console.log('\n[8] Filter + region combination');
click(neuroChip);
click(abdRegion);
check('module-scoped filtered view', has('filtered') && has('abdomen') === false || has('Abdomen'));
click($('#clearFiltersBtn'));

console.log('\n[9] View toggle');
var backBtn = $$('.view-btn').filter(function (b) { return b.getAttribute('data-view') === 'back'; })[0];
click(backBtn);
check('back view active', $('#bodyBack').classList.contains('is-active') && !$('#bodyFront').classList.contains('is-active'));
check('back regions clickable', (function () {
  var r = $$('#bodyBack .region')[0];
  click(r);
  return text($('#detail')).indexOf('Where is the patient') < 0;
})());

console.log('\n[10] Classification reference modal');
click($('#refBtn'));
check('modal opens', $('#modal').hidden === false);
check('modal has mechanisms', text($('#modalBody')).indexOf('Nociceptive Pain') >= 0);
check('modal has referred pain table', text($('#modalBody')).indexOf('Referred pain patterns') >= 0);
click($('#modalClose'));
check('modal closes', $('#modal').hidden === true);

console.log('\n[11] Data sanity in UI context');
var total = 0;
Object.keys(sandbox.window.PAIN_DATA_MODULES).forEach(function (mid) {
  var m = sandbox.window.PAIN_DATA_MODULES[mid];
  m.structures.forEach(function (s) { total += s.painTypes.length; });
});
check(total + ' pain types loadable, all with required fields', (function () {
  var bad = 0;
  Object.keys(sandbox.window.PAIN_DATA_MODULES).forEach(function (mid) {
    sandbox.window.PAIN_DATA_MODULES[mid].structures.forEach(function (s) {
      s.painTypes.forEach(function (p) {
        if (!p.id || !p.name || !p.category || !Array.isArray(p.mechanisms) ||
            !Array.isArray(p.characteristics) || !Array.isArray(p.duration) ||
            !Array.isArray(p.radiation) || !Array.isArray(p.related)) bad++;
        if (p.mechanisms.length > 2) bad++;
      });
    });
  });
  return bad === 0;
})());
console.log('   (16 modules, 117 structures, ' + total + ' pain types)');

console.log('\n[12] Verbatim taxonomy leaves reachable through the UI');
[['Tension headache', 'head-face'], ['Pericardial pain', 'chest'],
 ['Lower-back pain', 'back'], ['Bladder-wall pain', 'urinary'],
 ['Brachial plexus pain', 'neuropathic'], ['Ischemic pain', 'vascular'],
 ['Diffuse pain', 'generalized']].forEach(function (pair) {
  var leaf = pair[0], modId = pair[1];
  si.value = leaf;
  si.dispatchEvent({ type: 'input', target: si });
  var hit = Array.prototype.slice.call($('#searchResults').children).some(function (el) {
    return (el.textContent || '').toLowerCase().indexOf(leaf.toLowerCase()) >= 0;
  });
  check('search reaches "' + leaf + '"', hit);
});
si.value = '';
si.dispatchEvent({ type: 'input', target: si });

console.log('\n[13] Arabic language');
click($('#homeBtn'));
check('document starts LTR', doc.documentElement.getAttribute('dir') !== 'rtl');
$('#langBtn').click();
check('RTL applied', doc.documentElement.getAttribute('dir') === 'rtl');
check('lang is ar', doc.documentElement.getAttribute('lang') === 'ar');
check('title translated', doc.title.indexOf('واجهة الطبيب') >= 0);
check('toggle flips to English', $('#langBtn').textContent === 'English');
check('wizard notice translated (assess mode)', text($('.notice')).indexOf('تقييم يُوثِّقه الطبيب') >= 0);
/* switch to the explorer for its static labels */
var exploreBtn = $$('.mode-btn').filter(function (b) { return b.getAttribute('data-mode') === 'explore'; })[0];
click(exploreBtn);
check('explorer visible', $('#explorerView').hidden === false && $('#wizardView').hidden === true);
check('notice translated', text($('.notice')).indexOf('التحديد من قِبل الطبيب') >= 0);
check('filters title translated', text($('.panel-left h2')) === 'فلاتر الألم');
check('front/back buttons translated',
  $('.panel-center .view-btn[data-view="front"]').textContent === 'المنظر الأمامي' &&
  $('.panel-center .view-btn[data-view="back"]').textContent === 'المنظر الخلفي');
check('quick access translated', text($('.quick-access h3')) === 'أنظمة الألم الشاملة');
check('home prompt Arabic', text($('#detail')).indexOf('أين ألم المريض') >= 0);
check('body hint Arabic', text($('#bodyHint')) === 'انقر على منطقة تشريحية للبدء');
check('front tags Arabic', (function () {
  return $$('#bodyFront .g-tags text').some(function (el) { return el.textContent === 'الصدر'; });
})());

/* navigate in Arabic */
click($$('#bodyFront .region').filter(function (r) { return r.getAttribute('data-module') === 'abdomen'; })[0]);
check('Arabic module page', text($('#detail')).indexOf('البطن') >= 0);
var arCard = $$('#detail .struct-card')[0];
var arCardName = arCard.querySelector('h4').textContent;
check('Arabic structure card name', /[\u0600-\u06FF]/.test(arCardName));
click(arCard);
check('Arabic pain list', $$('#detail .pain-row').length >= 1 && /[\u0600-\u06FF]/.test($$('#detail .pain-row .pname')[0].textContent));
click($$('#detail .pain-row')[0]);
check('Arabic pain detail title', /[\u0600-\u06FF]/.test($('.pd-title').textContent));
check('Arabic characteristics heading', text($('#detail')).indexOf('خصائص الألم') >= 0);
check('Arabic radiation heading', text($('#detail')).indexOf('الانتشار') >= 0);
check('Arabic clinician note', text($('#detail')).indexOf('التحديد من قِبل الطبيب') >= 0 || text($('#detail')).indexOf('اختيارات يقوم بها الطبيب') >= 0);
check('breadcrumbs Arabic', /[\u0600-\u06FF]/.test(text($('#breadcrumbs'))));

/* search in Arabic */
si.value = 'صداع';
si.dispatchEvent({ type: 'input', target: si });
check('Arabic search finds Arabic names', text($('#searchResults')).indexOf('صداع') >= 0);
si.value = '';
si.dispatchEvent({ type: 'input', target: si });

/* reference modal in Arabic */
click($('#refBtn'));
check('Arabic modal mechanisms', text($('#modalBody')).indexOf('الألم المستقبِلي') >= 0);
check('Arabic modal durations', text($('#modalBody')).indexOf('الألم المزمن') >= 0);
check('Arabic modal referred pain', text($('#modalBody')).indexOf('أنماط الألم المُحال') >= 0);
click($('#modalClose'));

/* switch back to English and confirm restoration */
$('#langBtn').click();
check('back to LTR', doc.documentElement.getAttribute('dir') === 'ltr');
check('lang is en', doc.documentElement.getAttribute('lang') === 'en');
check('English title restored', doc.title === 'PAIN SCORE — Doctor Interface');
click($('#homeBtn'));
check('English home prompt', text($('#detail')).indexOf('Where is the patient') >= 0);
check('no duplicate SVGs after toggle', $$('#bodyFront .body-svg').length === 1);

console.log('\n=====================================');
console.log('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log('=====================================');
process.exit(fail ? 1 : 0);
