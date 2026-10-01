/* Structural integrity check of the pain data (English fields + Arabic parity). */
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var D = path.join(__dirname, '..', 'js', 'data');
var ctx = { window: {} };
vm.createContext(ctx);
fs.readdirSync(D).filter(function (f) { return f.endsWith('.js'); }).forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(D, f), 'utf8'), ctx, { filename: f });
});
var M = ctx.window.PAIN_DATA_MODULES;

var errs = 0;
var AR = /[\u0600-\u06FF]/;

Object.keys(M).forEach(function (mid) {
  (M[mid].structures || []).forEach(function (s) {
    if (!s.id || typeof s.name !== 'string') { errs++; console.log('bad structure in ' + mid); return; }
    if (s.nameAr && !AR.test(s.nameAr)) { errs++; console.log('nameAr not Arabic: ' + mid + '/' + s.id); }
    if (s.group && !s.groupAr) { errs++; console.log('groupAr missing: ' + mid + '/' + s.id); }
    if (s.groupAr && !AR.test(s.groupAr)) { errs++; console.log('groupAr not Arabic: ' + mid + '/' + s.id); }

    (s.painTypes || []).forEach(function (p) {
      ['id', 'name', 'category', 'mechanisms', 'characteristics', 'duration', 'radiation', 'related']
        .forEach(function (k) {
          if (!(k in p)) { errs++; if (errs < 15) console.log('MISSING ' + k + ' in ' + mid + '/' + s.id + '/' + p.id); }
        });
      if (!Array.isArray(p.mechanisms) || p.mechanisms.length < 1 || p.mechanisms.length > 2) errs++;
      if (!Array.isArray(p.characteristics) || p.characteristics.length < 1) errs++;
      if (!Array.isArray(p.duration) || p.duration.length < 1) errs++;
      if (!Array.isArray(p.radiation) || !Array.isArray(p.related)) errs++;
      if (p.nameAr && !AR.test(p.nameAr)) { errs++; console.log('nameAr not Arabic: ' + p.id); }
      if (p.radiationAr && p.radiationAr.length !== p.radiation.length) { errs++; console.log('LEN MISMATCH radiation ' + p.id); }
      if (p.relatedAr && p.relatedAr.length !== p.related.length) { errs++; console.log('LEN MISMATCH related ' + p.id); }
    });
  });
});

console.log('structural errors: ' + errs);
process.exit(errs ? 1 : 0);
