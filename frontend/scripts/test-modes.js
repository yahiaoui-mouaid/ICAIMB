/* Final integration check: mode switching + wizard + language. */
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
var dataFiles = fs.readdirSync(path.join(ROOT, 'js/data')).filter(function (f) { return f.endsWith('.js'); });
['js/i18n.js'].concat(dataFiles.map(function (f) { return 'js/data/' + f; })).forEach(load);
load('js/bodymap.js');
load('js/app.js');
load('js/wizard.js');

function $(s) { return doc.querySelector(s); }
function txt(el) { return el.textContent || el._html || ''; }

var ok = 0, bad = 0;
function check(n, c) { if (c) { ok++; console.log('  PASS  ' + n); } else { bad++; console.log('  FAIL  ' + n); } }

console.log('[mode switching]');
check('assess is default', $('#wizardView').hidden === false && $('#explorerView').hidden === true);
check('assess button active', $('.mode-btn[data-mode="assess"]').classList.contains('active'));
check('wizard step present', $('#wizSteps').children.length === 14);

var explore = $('.mode-btn[data-mode="explore"]');
explore.click();
check('explorer shown', $('#explorerView').hidden === false && $('#wizardView').hidden === true);
check('explore button active', explore.classList.contains('active'));
check('explorer detail panel populated', $('#detail').children.length > 0);
check('body map built', $('#bodyFront').children.length > 0);

$('#langBtn').click();
check('RTL in explorer', doc.documentElement.getAttribute('dir') === 'rtl');
check('explorer still works in Arabic', $('#detail').children.length > 0);
check('mode buttons Arabic', /التصنيف/.test(txt($('.mode-btn[data-mode="explore"]'))));

var assess = $('.mode-btn[data-mode="assess"]');
assess.click();
check('wizard shown in Arabic', $('#wizardView').hidden === false);
check('wizard step title Arabic', /المريض/.test(txt($('#wizTitle'))));
check('sidebar Arabic', /خطوة/.test(txt($('#wizProgressLabel'))) || /مكتملة/.test(txt($('#wizProgressLabel'))));

$('#langBtn').click();
check('back to LTR', doc.documentElement.getAttribute('dir') === 'ltr');
check('wizard still on step 1', /Patient/.test(txt($('#wizTitle'))));

console.log('\n=====================================');
console.log('RESULT: ' + ok + ' passed, ' + bad + ' failed');
console.log('=====================================');
process.exit(bad ? 1 : 0);
