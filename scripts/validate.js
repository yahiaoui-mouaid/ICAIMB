/* Validation harness for the PAIN SCORE static data (run with node). */
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var DATA_DIR = path.join(__dirname, '..', 'js', 'data');
var ctx = { window: {} };
vm.createContext(ctx);

var files = fs.readdirSync(DATA_DIR).filter(function (f) { return f.endsWith('.js'); }).sort();
files.forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'), ctx, { filename: f });
});

var M = ctx.window.PAIN_DATA_MODULES;
var CL = ctx.window.PAIN_CLASSIFICATION;
var errors = [];
var stats = [];

var MECH = ['Nociceptive', 'Neuropathic', 'Nociplastic', 'Mixed'];
var DUR = ['Acute', 'Chronic', 'Episodic', 'Recurrent'];

var ids = {};
var totalPains = 0, totalStructs = 0;

Object.keys(M).forEach(function (mid) {
  var m = M[mid];
  if (m.id !== mid) errors.push(mid + ': module.id mismatch (' + m.id + ')');
  if (!Array.isArray(m.structures)) errors.push(mid + ': structures not an array');
  var pcount = 0;
  (m.structures || []).forEach(function (s) {
    totalStructs++;
    if (!s.id || !s.name) errors.push(mid + ': structure missing id/name');
    (s.painTypes || []).forEach(function (p) {
      totalPains++; pcount++;
      if (!p.id || !p.name) errors.push(mid + '/' + s.id + ': pain missing id/name');
      if (ids[p.id]) errors.push('DUPLICATE pain id: ' + p.id + ' (in ' + mid + ' and ' + ids[p.id] + ')');
      ids[p.id] = mid;
      if (!Array.isArray(p.mechanisms) || !p.mechanisms.length) errors.push(p.id + ': mechanisms missing');
      p.mechanisms.forEach(function (x) { if (MECH.indexOf(x) < 0) errors.push(p.id + ': bad mechanism ' + x); });
      if (p.mechanisms.length > 2) errors.push(p.id + ': more than 2 mechanisms — use \'Mixed\' instead');
      if (!Array.isArray(p.characteristics) || !p.characteristics.length) errors.push(p.id + ': characteristics missing');
      if (!Array.isArray(p.duration) || !p.duration.length) errors.push(p.id + ': duration missing');
      p.duration.forEach(function (x) { if (DUR.indexOf(x) < 0) errors.push(p.id + ': bad duration ' + x); });
      ['radiation', 'related'].forEach(function (k) { if (!Array.isArray(p[k])) errors.push(p.id + ': ' + k + ' not array'); });
      if (!p.category) errors.push(p.id + ': category missing');
    });
  });
  stats.push(mid + ': ' + (m.structures || []).length + ' structures, ' + pcount + ' pain types');
});

/* structure-id uniqueness within module */
Object.keys(M).forEach(function (mid) {
  var seen = {};
  (M[mid].structures || []).forEach(function (s) {
    if (seen[s.id]) errors.push(mid + ': DUPLICATE structure id ' + s.id);
    seen[s.id] = true;
  });
});

/* Hotspot structure hints used by bodymap.js */
var HOTSPOTS = {
  'head-face': ['Scalp', 'Facial Pain', 'Jaw', 'Mouth & Dental'],
  'eye': ['Eye'],
  'ent': ['Ear', 'Nose', 'Sinuses'],
  'back': ['Thoracic Spine', 'Lumbar Spine', 'Sacral'],
  'urinary': ['Kidney'],
  'upper-limb': ['Upper Arm', 'Elbow', 'Forearm', 'Wrist', 'Hand', 'Fingers'],
  'lower-limb': ['Hip', 'Thigh', 'Knee', 'Lower Leg', 'Ankle', 'Foot', 'Toes']
};
function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
Object.keys(HOTSPOTS).forEach(function (mid) {
  var m = M[mid]; if (!m) { errors.push('MISSING MODULE ' + mid); return; }
  HOTSPOTS[mid].forEach(function (hint) {
    var hit = m.structures.some(function (s) {
      return norm(s.name) === norm(hint) || norm(s.id) === norm(hint) ||
             norm(s.name).indexOf(norm(hint)) === 0 || norm(hint).indexOf(norm(s.name)) === 0;
    });
    if (!hit) errors.push('HOTSPOT UNRESOLVED: ' + mid + ' -> ' + hint);
  });
});

console.log('=== module stats ===');
console.log(stats.join('\n'));
console.log('\nTOTALS: ' + Object.keys(M).length + ' modules, ' + totalStructs + ' structures, ' + totalPains + ' pain types');
console.log('Sensations defined: ' + (CL && CL.sensations ? CL.sensations.length : 'n/a'));
console.log('\n=== errors (' + errors.length + ') ===');
errors.slice(0, 60).forEach(function (e) { console.log(' - ' + e); });
process.exit(errors.length ? 1 : 0);
