/* Add module-level nameAr/blurbAr to every data module (idempotent).
 * Run AFTER the translation subagents have finished editing the pain-type rows,
 * so it does not race with their writes. */
var fs = require('fs');
var path = require('path');

var DATA = path.join(__dirname, '..', 'js', 'data');

var TRANSLATIONS = {
  'abdomen': {
    nameAr: 'البطن',
    blurbAr: 'ألم ينشأ من جدار البطن والأحشاء داخل البطن، ويشمل الألم الجسدي العضلي الهيكلي والألم الحشوي.'
  },
  'back': {
    nameAr: 'الظهر والعمود الفقري',
    blurbAr: 'ألم ينشأ من العمود الفقري والجذع الخلفي: الفقرات الرقبية والصدرية والقطنية والعجزية، مع الانتشار الجذري.'
  },
  'chest': {
    nameAr: 'الصدر',
    blurbAr: 'ألم ينشأ من الصدر: جدار الصدر والقفص الصدري، والقلب والأوعية الكبيرة، والرئتين والجنب، والمريء، والثدي.'
  },
  'ent': {
    nameAr: 'الأذن والأنف والجيوب',
    blurbAr: 'ألم الأذن والأنف والجيوب الأنفية المجاورة، بما في ذلك ألم الأذن المُحال وألم الوجه المرتبط بالجيوب.'
  },
  'eye': {
    nameAr: 'العين ومحيطها',
    blurbAr: 'ألم العين ومحيطها، من تهيّج القرنية السطحي إلى الألم العنبي أو الزرقي العميق وألم الحجاج.'
  },
  'generalized': {
    nameAr: 'الألم المنتشر والمُعمَّم',
    blurbAr: 'ألم يُختبر عبر عدة مناطق في الجسم أو في الجسم كله، وغالبًا ما يكون مدفوعًا بالتحسس المركزي والمعالجة النوسيبلاستيكية للألم.'
  },
  'head-face': {
    nameAr: 'الرأس والوجه',
    blurbAr: 'ألم الرأس والوجه ومنطقة الفم والبلعوم، ويشمل متلازمات الصداع الأولية والتنكّسات القحفية والبنى الوجهية العضلية الهيكلية.'
  },
  'lower-limb': {
    nameAr: 'الطرف السفلي',
    blurbAr: 'ألم الطرف السفلي من الورك إلى أصابع القدم، ويشمل المفاصل والعظام والعضلات والأوتار والأربطة والأعصاب.'
  },
  'musculoskeletal': {
    nameAr: 'الجهاز العضلي الهيكلي',
    blurbAr: 'ألم ينشأ من العظام والمفاصل والعضلات والأوتار والأربطة والغضاريف للجهاز العضلي الهيكلي.'
  },
  'neck': {
    nameAr: 'الرقبة',
    blurbAr: 'ألم ينشأ من المنطقة الرقبية: عضلات الرقبة، والمفاصل الوجهية والأقراص في العمود الفقري الرقبي، مع الانتشار إلى الطرف العلوي.'
  },
  'neuropathic': {
    nameAr: 'ألم الأعصاب (العصبي)',
    blurbAr: 'ألم ينشأ من إصابة أو مرض في الجهاز العصبي المحيطي أو المركزي، ويكون عادةً حارقًا أو ساريًا أو كهربائيًا.'
  },
  'pelvis-repro': {
    nameAr: 'الحوض والجهاز التناسلي',
    blurbAr: 'ألم الأعضاء الحوضية والتناسلية، ويشمل البنى التناسلية الأنثوية والذكرية وألم الحوض المزمن.'
  },
  'skin-soft-tissue': {
    nameAr: 'الجلد والأنسجة الرخوة',
    blurbAr: 'ألم ينشأ من الجلد والأنسجة الرخوة تحت الجلد، بما في ذلك الحروق والجروح والقرحات والندبات.'
  },
  'upper-limb': {
    nameAr: 'الطرف العلوي',
    blurbAr: 'ألم حزام الكتف والطرف العلوي من العضد إلى أصابع اليد، ويشمل المفاصل والعظام والعضلات والأوتار والأعصاب.'
  },
  'urinary': {
    nameAr: 'الجهاز البولي',
    blurbAr: 'ألم ينشأ من السبيل البولي العلوي والسفلي، ويشمل الكلى وأحواضها والحالبين والمثانة والإحليل.'
  },
  'vascular': {
    nameAr: 'الألم الوعائي',
    blurbAr: 'ألم ينشأ من أمراض الشرايين أو الأوردة أو الأوعية الدقيقة، ويغلب عليه الطابع التشنجي ونقص التروية.'
  }
};

/* Only process modules given on the command line, or all if none given. */
var only = process.argv.slice(2);

Object.keys(TRANSLATIONS).forEach(function (mid) {
  if (only.length && only.indexOf(mid) < 0) return;
  var file = path.join(DATA, mid + '.js');
  if (!fs.existsSync(file)) { console.log('SKIP missing ' + mid); return; }
  var src = fs.readFileSync(file, 'utf8');
  if (src.indexOf('blurbAr') >= 0) { console.log('SKIP already translated ' + mid); return; }

  var tr = TRANSLATIONS[mid];
  /* Insert nameAr after the module's name: line (first one after the registration). */
  var regRe = new RegExp("PAIN_DATA_MODULES\\['" + mid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'\\]");
  var regIdx = src.search(regRe);
  if (regIdx < 0) { console.log('!! registration not found in ' + mid); return; }
  var nameIdx = src.indexOf('name:', regIdx);
  if (nameIdx < 0) { console.log('!! name not found in ' + mid); return; }
  var lineEnd = src.indexOf('\n', nameIdx);
  var updated = src.slice(0, lineEnd + 1) +
    "  nameAr: '" + tr.nameAr + "',\n" +
    src.slice(lineEnd + 1);
  if (updated === src) { console.log('!! name not found in ' + mid); return; }

  var blurbIdx = updated.indexOf('blurb:', regIdx);
  if (blurbIdx < 0) { console.log('!! blurb not found in ' + mid); return; }
  var bEnd = updated.indexOf('\n', blurbIdx);
  updated = updated.slice(0, bEnd + 1) +
    "  blurbAr: '" + tr.blurbAr + "',\n" +
    updated.slice(bEnd + 1);
  if (updated.indexOf('blurbAr') < 0) { console.log('!! blurb not found in ' + mid); return; }

  fs.writeFileSync(file, updated);
  console.log('updated ' + mid);
});
