/* Manual end-to-end check of the Arabic render path against real translated data. */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var shim = require(path.join(__dirname, 'dom-shim.js'));

var ROOT = path.join(__dirname, '..');
var doc = shim.parseDocument(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'));
var sb = { window: { document: doc }, document: doc, console: console, setTimeout: function () {} };
sb.global = sb;
vm.createContext(sb);

function load(rel) { vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sb, { filename: rel }); }
['js/i18n.js', 'js/data/classification.js']
  .concat(fs.readdirSync(path.join(ROOT, 'js/data')).filter(function (f) { return f.endsWith('.js') && f !== 'classification.js'; }).map(function (f) { return 'js/data/' + f; }))
  .forEach(load);
load('js/bodymap.js');
load('js/app.js');

function $(s) { return doc.querySelector(s); }
function log(k, v) { console.log(k + ': ' + v); }

/* switch to Arabic */
$('#langBtn').click();
log('dir', doc.documentElement.getAttribute('dir'));

/* open the chest region (translated by the finished agent) */
var chest = doc.querySelectorAll('#bodyFront .region').filter(function (e) { return e.getAttribute('data-module') === 'chest'; })[0];
chest.click();
log('chest page Arabic', $('#detail').textContent.indexOf('الصدر') >= 0);
log('struct cards', doc.querySelectorAll('#detail .struct-card').length);

var card = doc.querySelectorAll('#detail .struct-card')[0];
log('first card', card.querySelector('h4').textContent + ' | ' + card.querySelector('.count').textContent);
card.click();
log('pain rows', doc.querySelectorAll('#detail .pain-row').length);
log('first pain', doc.querySelectorAll('#detail .pain-row .pname')[0].textContent);

doc.querySelectorAll('#detail .pain-row')[0].click();
log('detail title', $('.pd-title').textContent);
log('mech badges', Array.prototype.map.call(doc.querySelectorAll('.pd-badges .badge'), function (b) { return b.textContent; }).join(' / '));
log('list items', Array.prototype.map.call(doc.querySelectorAll('.pd-list li'), function (l) { return l.textContent; }).slice(0, 6).join('، '));
log('clinician note', $('.pd-note') ? $('.pd-note').textContent.slice(0, 70) : '(none)');

/* also exercise an untranslated module (should fall back to English gracefully) */
$('#homeBtn').click();
var eye = doc.querySelectorAll('#bodyFront .region').filter(function (e) { return e.getAttribute('data-module') === 'eye'; })[0];
eye.click();
log('eye page renders', doc.querySelectorAll('#detail .struct-card').length + ' cards; title="' + $('.module-head h2').textContent + '"');

$('#langBtn').click();
log('back to LTR', doc.documentElement.getAttribute('dir'));
process.exit(0);
