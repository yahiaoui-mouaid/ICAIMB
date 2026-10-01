/* Coverage audit: check the taxonomy's verbatim leaf bullets exist in each module. */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var shim = require(path.join(__dirname, 'dom-shim.js'));

var DATA = path.join(__dirname, '..', 'js', 'data');
var ctx = { window: {} };
vm.createContext(ctx);
fs.readdirSync(DATA).filter(function (f) { return f.endsWith('.js'); }).forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), 'utf8'), ctx, { filename: f });
});
var M = ctx.window.PAIN_DATA_MODULES;

function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/ pain$/, '').trim(); }
function toks(s) { return norm(s).split(' ').filter(Boolean); }
/* expected leaf matches if its tokens appear consecutively inside the pain name tokens */
function matches(name, leaf) {
  var nt = toks(name), et = toks(leaf);
  if (!et.length || !nt.length) return false;
  if (et.length > nt.length) return false;
  for (var i = 0; i + et.length <= nt.length; i++) {
    var ok = true;
    for (var j = 0; j < et.length; j++) if (nt[i + j] !== et[j]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

/* verbatim leaf bullets per module, from the source taxonomy */
var EXPECT = {
  'head-face': [
    'Migraine', 'Tension headache', 'Cluster headache', 'Sinus-related headache', 'Fever-related headache',
    'Secondary headache', 'Neck-related headache', 'Vascular headache', 'Post-traumatic headache',
    'Skin pain', 'Subcutaneous tissue pain', 'Muscle pain', 'Superficial nerve pain',
    'Sinus-related pain', 'Nerve pain', 'Vascular pain', 'Skin and soft-tissue pain',
    'Neuropathic facial pain', 'Muscular facial pain', 'Joint-related pain', 'Dental pain', 'Eye-related pain', 'Soft-tissue pain',
    'Trigeminal neuralgia', 'Cheek pain', 'Jaw pain', 'Nose-region pain', 'Periorbital pain',
    'Temporomandibular joint pain', 'Masticatory muscle pain', 'Jaw-bone pain', 'Gum-related pain', 'Nerve-related pain',
    'Tooth pain', 'Gum pain', 'Pulp-related pain', 'Post-extraction pain', 'Upper-jaw pain', 'Lower-jaw pain',
    'Tongue pain', 'Palate pain', 'Oral mucosal pain', 'Mouth-ulcer pain'
  ],
  'eye': [
    'Ocular surface pain', 'Corneal pain', 'Conjunctival pain', 'Intraocular pain', 'Inflammatory eye pain',
    'Post-traumatic eye pain', 'Post-surgical eye pain',
    'Orbital pain', 'Periorbital nerve pain', 'Referred headache pain',
    'Pain with eye movement', 'Extraocular muscle-related pain'
  ],
  'ent': [
    'Outer-ear pain', 'Ear-canal pain', 'Middle-ear pain', 'Inner-ear pain', 'Eardrum-related pain', 'Post-traumatic ear pain',
    'Nasal skin pain', 'Nasal septum pain', 'Post-traumatic nasal pain', 'Inflammatory nasal pain',
    'Frontal sinus pain', 'Maxillary sinus pain', 'Ethmoid sinus pain', 'Sphenoid sinus pain',
    'Forehead pain', 'Cheek pain', 'Pain around the eyes', 'Root-of-nose pain', 'Upper dental pain'
  ],
  'neck': [
    'Superficial muscle pain', 'Deep muscle pain', 'Muscle spasm', 'Muscle strain',
    'Cervical vertebral pain', 'Cervical joint pain', 'Intervertebral disc pain',
    'Radicular pain', 'Radiculopathy', 'Shoulder-radiating pain', 'Arm-radiating pain', 'Hand-radiating pain',
    'Ligament pain', 'Tendon pain', 'Fascial pain', 'Joint pain'
  ],
  'chest': [
    'Pectoral muscle pain', 'Rib pain', 'Costal cartilage pain', 'Costovertebral joint pain', 'Skin pain', 'Subcutaneous tissue pain',
    'Cardiac ischemic pain', 'Pericardial pain', 'Pain radiating to the arm', 'Pain radiating to the shoulder',
    'Pain radiating to the jaw', 'Pain radiating to the back',
    'Pleural pain', 'Inflammatory pain', 'Post-traumatic pain', 'Post-procedural pain',
    'Esophageal pain', 'Esophageal spasm-related pain', 'Esophageal inflammatory pain', 'Reflux-associated retrosternal pain',
    'Breast tissue pain', 'Skin and soft-tissue pain', 'Musculoskeletal referred pain', 'Neuropathic breast-region pain'
  ],
  'back': [
    'Neck pain', 'Cervical vertebral pain', 'Cervical disc pain', 'Cervical joint pain',
    'Upper/mid-back pain', 'Thoracic vertebral pain', 'Thoracic disc pain', 'Thoracic joint pain',
    'Lower-back pain', 'Lumbar vertebral pain', 'Lumbar disc pain', 'Facet-joint pain', 'Muscle pain', 'Ligament pain',
    'Sacral bone pain', 'Sacroiliac-region pain', 'Soft-tissue pain',
    'Coccyx pain', 'Post-traumatic coccygeal pain',
    'Sciatica', 'Radicular leg pain', 'Nerve-root pain', 'Radiating pain'
  ],
  'urinary': [
    'Kidney-region pain', 'Renal-capsule pain', 'Inflammatory renal pain', 'Distension-related pain',
    'Renal-pelvis pain', 'Pressure-related pain', 'Colicky pain',
    'Ureteral pain', 'Renal colic', 'Flank pain', 'Lower-abdominal radiation', 'Groin-radiating pain',
    'Bladder-wall pain', 'Full-bladder pain', 'Inflammatory bladder pain', 'Pelvic bladder pain',
    'Urethral pain', 'Urination-associated pain', 'Inflammatory urethral pain'
  ],
  'pelvis-repro': [
    'Right ovarian pain', 'Left ovarian pain', 'Capsule-related pain', 'Cycle-related pain',
    'Uterine pain', 'Endometrial-related pain', 'Cervical pain',
    'Right fallopian-tube pain', 'Left fallopian-tube pain',
    'Vaginal-wall pain', 'Surrounding-tissue pain',
    'Vulvar skin pain', 'Mucosal pain', 'Nerve-related pain',
    'Acute pelvic pain', 'Chronic pelvic pain', 'Menstrual pain', 'Sexual-activity-associated pain',
    'Pregnancy-associated pain', 'Labor pain', 'Postpartum pain',
    'Right testicular pain', 'Left testicular pain',
    'Epididymal pain', 'Spermatic-cord pain',
    'Prostatic pain', 'Pelvic pain associated with the prostate',
    'Scrotal pain', 'Testicular referred pain',
    'Anterior pelvic pain', 'Posterior pelvic pain', 'Deep pelvic pain',
    'Perineal soft-tissue pain', 'Perineal nerve pain',
    'Anal-canal pain', 'Perianal pain', 'Rectal pain',
    'Pudendal nerve pain', 'Pelvic nerve pain', 'Radiating pelvic pain'
  ],
  'upper-limb': [
    'Joint capsule pain', 'Cartilage-related pain', 'Rotator cuff tendon pain', 'Biceps tendon pain',
    'Other periarticular tendon pain', 'Deltoid pain', 'Rotator-cuff muscle pain', 'Scapular muscle pain',
    'Peripheral nerve pain', 'Brachial plexus pain', 'Referred cervical pain',
    'Humerus-related pain', 'Tendon pain', 'Vascular pain', 'Skin pain',
    'Elbow joint pain', 'Ligament pain', 'Muscle pain',
    'Radius-related pain', 'Ulna-related pain',
    'Wrist joint pain', 'Soft-tissue pain',
    'Hand-bone pain', 'Joint pain', 'Finger-joint pain', 'Bone pain', 'Nail-related pain',
    'Nail pain'
  ],
  'lower-limb': [
    'Hip-joint pain', 'Femoral-head-related pain', 'Pelvic pain',
    'Femoral-bone pain', 'Tendon pain', 'Nerve pain', 'Vascular pain',
    'Knee-joint pain', 'Cartilage pain', 'Ligament pain', 'Meniscal pain', 'Tendon pain', 'Bone pain',
    'Tibial pain', 'Fibular pain', 'Muscle pain',
    'Ankle-joint pain', 'Ligament pain', 'Tendon pain', 'Bone pain',
    'Foot-bone pain', 'Joint pain', 'Plantar-fascia pain', 'Tendon pain', 'Muscle pain', 'Nerve pain', 'Skin pain',
    'Toe-joint pain', 'Bone pain', 'Tendon pain', 'Nail pain', 'Nerve pain'
  ],
  'musculoskeletal': [
    'Skull-bone pain', 'Jaw-bone pain', 'Maxillary pain', 'Other facial-bone pain',
    'Cervical vertebrae', 'Thoracic vertebrae', 'Lumbar vertebrae', 'Sacral bone',
    'Ribs', 'Sternum', 'Scapula', 'Humerus', 'Radius', 'Ulna', 'Hand bones',
    'Pelvic bone', 'Sacrum', 'Coccyx', 'Femur', 'Patella', 'Tibia', 'Fibula', 'Foot bones',
    'Fracture', 'Trauma', 'Inflammation/infection', 'Bone-related disease', 'Tumor-related pain',
    'Pain associated with adjacent joints or tissues',
    'Temporomandibular joint', 'Cervical joints', 'Thoracic joints', 'Lumbar facet joints', 'Sacroiliac joints',
    'Shoulder', 'Elbow', 'Wrist', 'Finger joints', 'Hip', 'Knee', 'Ankle', 'Toe joints',
    'Inflammatory pain', 'Mechanical pain', 'Movement-related pain', 'Rest pain', 'Load-bearing pain',
    'Pain with swelling', 'Pain with stiffness',
    'Muscle strain', 'Muscle spasm', 'Muscle fatigue', 'Muscle injury', 'Muscle tear',
    'Muscle inflammation', 'Diffuse muscle pain',
    'Shoulder tendons', 'Rotator-cuff tendons', 'Biceps tendon', 'Elbow tendons', 'Wrist tendons', 'Knee tendons',
    'Achilles tendon', 'Ankle tendons', 'Foot tendons',
    'Knee ligaments', 'Ankle ligaments', 'Shoulder ligaments', 'Spinal ligaments', 'Peripheral joint ligaments',
    'Articular cartilage', 'Menisci', 'Costal cartilage', 'Nasal cartilage', 'Other cartilage structures'
  ],
  'skin-soft-tissue': [
    'Cuts', 'Scratches', 'Inflammation', 'Dermatitis', 'Irritation',
    'Thermal burns', 'Chemical burns', 'Other skin injuries',
    'Superficial wounds', 'Deep wounds', 'Surgical wounds', 'Traumatic wounds',
    'Pressure ulcers', 'Skin ulcers', 'Other ulcerative lesions',
    'Painful scars', 'Nerve-related scar pain',
    'Fat tissue', 'Fascia', 'Soft tissue', 'Localized tenderness'
  ],
  'neuropathic': [
    'Single-nerve pain', 'Mononeuropathy', 'Nerve compression', 'Nerve injury',
    'Radicular pain', 'Radiculopathy',
    'Brachial plexus', 'Lumbar plexus', 'Sacral plexus',
    'Diabetic neuropathy',
    'Brain-related neuropathic pain', 'Spinal-cord-related neuropathic pain', 'Post-central-nervous-system injury pain',
    'Postherpetic neuralgia', 'Localized burning pain', 'Electric-shock-like pain', 'Sensitivity to touch',
    'Trigeminal neuralgia', 'Facial electric-shock-like pain', 'Triggered facial pain'
  ],
  'vascular': [
    'Ischemic pain', 'Exertional pain', 'Claudication', 'Reduced-blood-flow pain',
    'Venous congestion-associated pain', 'Inflammatory venous pain', 'Vascular-tissue pain',
    'Small-vessel-related pain',
    'Limb ischemia', 'Organ ischemia', 'Other circulation-related pain'
  ],
  'generalized': [
    'Generalized pain', 'Diffuse pain', 'Multifocal pain',
    'Head + neck', 'Back + limbs', 'Multiple joints', 'Multiple muscles', 'Multiple anatomical systems',
    'Persistent widespread pain', 'Multi-site musculoskeletal pain', 'Fibromyalgia-associated widespread pain'
  ]
};

var missing = 0, total = 0;
Object.keys(EXPECT).forEach(function (mid) {
  var mod = M[mid];
  if (!mod) { console.log('!! MISSING MODULE ' + mid); return; }
  var names = [];
  mod.structures.forEach(function (s) { s.painTypes.forEach(function (p) { names.push(p.name); }); });
  var miss = [];
  EXPECT[mid].forEach(function (leaf) {
    total++;
    if (!names.some(function (n) { return matches(n, leaf); })) miss.push(leaf);
  });
  if (miss.length) {
    missing += miss.length;
    console.log('\n[' + mid + '] missing ' + miss.length + '/' + EXPECT[mid].length + ':');
    console.log('   ' + miss.join(' | '));
  }
});
console.log('\n==== coverage: ' + (total - missing) + '/' + total + ' verbatim leaves matched (' + missing + ' unmatched) ====');
