/* Audit Arabic translation coverage in the data modules. */
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var DATA = path.join(__dirname, '..', 'js', 'data');
var ctx = { window: {} };
vm.createContext(ctx);
fs.readdirSync(DATA).filter(function (f) { return f.endsWith('.js'); }).forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), 'utf8'), ctx, { filename: f });
});
var M = ctx.window.PAIN_DATA_MODULES;

var AR = /[\u0600-\u06FF]/;
var totalS = 0, totalP = 0;
var missS = 0, missP = 0, lenBad = 0, notAr = 0;

Object.keys(M).forEach(function (mid) {
  (M[mid].structures || []).forEach(function (s) {
    totalS++;
    if (!s.nameAr) { missS++; console.log('[' + mid + '] structure missing nameAr: ' + s.name); }
    else if (!AR.test(s.nameAr)) { notAr++; console.log('[' + mid + '] nameAr not Arabic: ' + s.nameAr); }

    (s.painTypes || []).forEach(function (p) {
      totalP++;
      var problems = [];
      if (!p.nameAr) problems.push('nameAr');
      else if (!AR.test(p.nameAr)) problems.push('nameAr not Arabic script');
      if (p.description && !p.descriptionAr) problems.push('descriptionAr (English description exists)');
      if (!p.radiationAr) problems.push('radiationAr');
      else if (p.radiationAr.length !== p.radiation.length) problems.push('radiationAr length ' + p.radiationAr.length + ' vs ' + p.radiation.length);
      if (!p.relatedAr) problems.push('relatedAr');
      else if (p.relatedAr.length !== p.related.length) problems.push('relatedAr length ' + p.relatedAr.length + ' vs ' + p.related.length);
      if (problems.length) {
        missP++;
        if (missP <= 40) console.log('[' + mid + '/' + s.id + '/' + p.id + '] ' + problems.join(', '));
      }
    });
  });
});

console.log('\n==== Arabic coverage ====');
console.log('structures: ' + (totalS - missS) + '/' + totalS + ' with nameAr');
console.log('pain types: ' + (totalP - missP) + '/' + totalP + ' fully translated');
process.exit(missS || missP || notAr || lenBad ? 1 : 0);
