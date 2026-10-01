/*
 * PAIN SCORE — interactive body map (static SVG, frontend-only).
 *
 * Two photographic anatomy images (anterior / posterior) with clickable
 * hotspot regions traced on top of them. Both images are 900x1500 px
 * (aspect 3:5) and every coordinate below lives in the same 600x1000
 * viewBox, so the hotspots and the picture can never drift apart.
 *
 * Coordinates: midline regions list the figure's RIGHT half (screen right),
 * first and last point on the body axis, and are mirrored to a full loop.
 * `pair` regions list the full screen-right loop and are mirrored for the
 * other side. `ax` overrides the mirror axis for a region (the figures are
 * not perfectly symmetric). Every hotspot maps to a taxonomy module
 * (+ optional structure). No backend, no AI — pure navigation.
 */
(function () {
  'use strict';

  var VBW = 600, VBH = 1000;
  var AXIS = { front: 302, back: 312 };           // body midline x per view
  var IMAGES = {
    front: 'images/anatomy-front.png',
    back:  'images/anatomy-back.png'
  };

  function unit(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [dx / len, dy / len];
  }

  /* Closed path through points with rounded corners (quadratic at each vertex). */
  function smooth(pts, r) {
    var n = pts.length, d = '';
    for (var i = 0; i < n; i++) {
      var p = pts[i], pv = pts[(i + n - 1) % n], nx = pts[(i + 1) % n];
      var v1 = unit(pv, p), v2 = unit(p, nx);
      var l1 = Math.sqrt((p[0] - pv[0]) * (p[0] - pv[0]) + (p[1] - pv[1]) * (p[1] - pv[1]));
      var l2 = Math.sqrt((nx[0] - p[0]) * (nx[0] - p[0]) + (nx[1] - p[1]) * (nx[1] - p[1]));
      var rr = Math.min(r, l1 * 0.42, l2 * 0.42);
      var a = [p[0] - v1[0] * rr, p[1] - v1[1] * rr];
      var b = [p[0] + v2[0] * rr, p[1] + v2[1] * rr];
      d += (i === 0 ? 'M' : 'L') + a[0].toFixed(1) + ' ' + a[1].toFixed(1) +
           ' Q ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
    }
    return d + ' Z';
  }

  /* Right half including both axis endpoints -> symmetric full loop. */
  function sym(pts, ax) {
    var full = pts.slice();
    for (var i = pts.length - 2; i >= 1; i--) full.push([2 * ax - pts[i][0], pts[i][1]]);
    return full;
  }

  /* Expand specs: paired regions become right + left, midline regions get their axis. */
  function expand(specs, defaultAx) {
    var out = [];
    specs.forEach(function (s) {
      var ax = s.ax !== undefined ? s.ax : defaultAx;
      function m(x) { return 2 * ax - x; }
      if (!s.pair) { out.push(Object.assign({}, s, { ax: ax })); return; }
      var r = Object.assign({}, s, { id: s.id + '-r', side: 'r', ax: ax });
      var l = Object.assign({}, s, {
        id: s.id + '-l', side: 'l', ax: ax,
        pts: s.pts ? s.pts.map(function (p) { return [m(p[0]), p[1]]; }) : undefined,
        cx: s.cx !== undefined ? m(s.cx) : undefined
      });
      out.push(r, l);
    });
    return out;
  }

  var SVGNS = 'http://www.w3.org/2000/svg';

  function makeEl(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  /* ---------------------------------------------------------------- *
   * ANTERIOR (FRONT) VIEW — traced on images/anatomy-front.png       *
   * ---------------------------------------------------------------- */
  var FRONT_SPECS = expand([
    { id: "scalp", label: "Scalp / Cranium", labelAr: "فروة الرأس / القحف", module: "head-face", structure: "Scalp", ax: 300, pts: [[300,18], [322,22], [337,38], [342,58], [338,68], [318,64], [300,63]], r: 8 },
    { id: "face", label: "Face", labelAr: "الوجه", module: "head-face", structure: "Facial Pain", ax: 300, pts: [[300,63], [318,64], [338,68], [336,92], [328,112], [316,126], [300,130]], r: 8 },
    { id: "jaw", label: "Jaw", labelAr: "الفك", module: "head-face", structure: "Jaw", ax: 300, pts: [[300,110], [324,106], [330,116], [318,128], [300,132]], r: 6 },
    { id: "neck", label: "Neck", labelAr: "الرقبة", module: "neck", ax: 300, pts: [[300,128], [322,130], [330,152], [342,176], [322,184], [300,186]], r: 8 },
    { id: "chest", label: "Chest", labelAr: "الصدر", module: "chest", pts: [[302,180], [345,184], [385,190], [398,226], [396,262], [394,290], [302,292]], r: 12 },
    { id: "abdomen", label: "Abdomen", labelAr: "البطن", module: "abdomen", pts: [[302,290], [398,290], [392,318], [386,340], [382,370], [383,400], [382,424], [366,438], [336,448], [302,452]], r: 10 },
    { id: "pelvis", label: "Pelvis", labelAr: "الحوض", module: "pelvis-repro", pts: [[302,448], [352,440], [380,444], [390,460], [395,480], [372,504], [332,512], [302,512]], r: 8 },
    { id: "genital", label: "Genital region", labelAr: "المنطقة التناسلية", module: "pelvis-repro", shape: 'ellipse', cx: 302, cy: 512, rx: 16, ry: 13 },
    { id: "flank", label: "Flank (kidney angle)", labelAr: "الخاصرة (زاوية الكلية)", module: "urinary", structure: "Kidney", pair: true, pts: [[372,304], [392,316], [386,340], [381,372], [383,400], [376,414], [362,398], [366,356], [368,324]], r: 8 },
    { id: "shoulder", label: "Shoulder", labelAr: "الكتف", module: "upper-limb", pair: true, pts: [[384,182], [420,186], [446,204], [458,232], [462,268], [464,292], [408,292], [396,250], [388,214]], r: 10 },
    { id: "upperarm", label: "Upper arm", labelAr: "العضد", module: "upper-limb", structure: "Upper Arm", pair: true, ax: 301, pts: [[410,292], [466,292], [472,320], [474,345], [486,365], [496,384], [438,390], [432,360], [420,330], [412,308]], r: 9 },
    { id: "elbow", label: "Elbow", labelAr: "المرفق", module: "upper-limb", structure: "Elbow", pair: true, ax: 301, pts: [[437,384], [497,382], [503,408], [503,430], [446,430], [437,408]], r: 6 },
    { id: "forearm", label: "Forearm", labelAr: "الساعد", module: "upper-limb", structure: "Forearm", pair: true, ax: 301, pts: [[451,428], [502,428], [503,460], [505,490], [470,492], [463,462], [452,440]], r: 9 },
    { id: "wrist", label: "Wrist", labelAr: "الرسغ", module: "upper-limb", structure: "Wrist", pair: true, ax: 301, pts: [[470,490], [506,490], [508,508], [506,526], [480,528], [472,510]], r: 5 },
    { id: "hand", label: "Hand", labelAr: "اليد", module: "upper-limb", structure: "Hand", pair: true, ax: 301, pts: [[444,514], [476,526], [508,526], [513,552], [514,566], [476,566], [474,548], [450,534]], r: 8 },
    { id: "fingers", label: "Fingers", labelAr: "الأصابع", module: "upper-limb", structure: "Fingers", pair: true, ax: 301, pts: [[476,562], [514,562], [512,580], [503,596], [478,594], [473,578]], r: 5 },
    { id: "hip", label: "Hip", labelAr: "الورك", module: "lower-limb", structure: "Hip", pair: true, pts: [[376,456], [392,462], [396,482], [402,502], [402,540], [384,548], [368,520], [366,486]], r: 8 },
    { id: "thigh", label: "Thigh", labelAr: "الفخذ", module: "lower-limb", structure: "Thigh", pair: true, pts: [[310,520], [368,524], [402,540], [402,600], [398,650], [394,690], [343,694], [330,660], [321,600], [312,545]], r: 10 },
    { id: "knee", label: "Knee", labelAr: "الركبة", module: "lower-limb", structure: "Knee", pair: true, ax: 303, pts: [[341,690], [394,690], [397,716], [401,742], [336,742], [339,718]], r: 7 },
    { id: "lowerleg", label: "Lower leg", labelAr: "الساق", module: "lower-limb", structure: "Lower Leg", pair: true, ax: 306, pts: [[336,744], [402,744], [406,770], [404,792], [398,826], [394,860], [392,892], [360,898], [354,852], [344,820], [337,790], [335,764]], r: 9 },
    { id: "ankle", label: "Ankle", labelAr: "الكاحل", module: "lower-limb", structure: "Ankle", pair: true, ax: 306, pts: [[359,888], [393,888], [398,906], [400,920], [359,920]], r: 5 },
    { id: "foot", label: "Foot", labelAr: "القدم", module: "lower-limb", structure: "Foot", pair: true, ax: 312, pts: [[358,914], [398,914], [410,930], [422,944], [400,948], [392,960], [366,962], [358,942]], r: 7 },
    { id: "toes", label: "Toes", labelAr: "أصابع القدم", module: "lower-limb", structure: "Toes", pair: true, ax: 312, pts: [[400,946], [428,946], [438,958], [434,968], [402,968], [392,958]], r: 5 },
    { id: "eye", label: "Eye", labelAr: "العين", module: "eye", structure: "Eye", pair: true, shape: 'ellipse', ax: 304.5, cx: 322, cy: 68, rx: 13, ry: 9 },
    { id: "ear", label: "Ear", labelAr: "الأذن", module: "ent", structure: "Ear", pair: true, shape: 'ellipse', ax: 299, cx: 341, cy: 78, rx: 8, ry: 15 },
    { id: "nose", label: "Nose", labelAr: "الأنف", module: "ent", structure: "Nose", shape: 'ellipse', cx: 304, cy: 88, rx: 9, ry: 14 },
    { id: "cheek", label: "Cheek / sinus region", labelAr: "الخد / منطقة الجيب", module: "ent", structure: "Sinuses", pair: true, shape: 'ellipse', ax: 304.5, cx: 324, cy: 92, rx: 11, ry: 10 },
    { id: "mouth", label: "Mouth & dental", labelAr: "الفم والأسنان", module: "head-face", structure: "Mouth & Dental", shape: 'ellipse', cx: 304, cy: 108, rx: 16, ry: 8 }
  ], AXIS.front);

  /* ---------------------------------------------------------------- *
   * POSTERIOR (BACK) VIEW — traced on images/anatomy-back.png        *
   * ---------------------------------------------------------------- */
  var BACK_SPECS = expand([
    { id: "head-back", label: "Occiput / back of head", labelAr: "القفا / مؤخرة الرأس", module: "head-face", structure: "Scalp", pts: [[312,18], [332,24], [349,40], [358,62], [362,84], [356,106], [346,122], [312,130]], r: 13 },
    { id: "neck-back", label: "Neck (posterior)", labelAr: "الرقبة (الخلفية)", module: "neck", pts: [[312,120], [338,124], [346,148], [354,168], [330,184], [312,188]], r: 8 },
    { id: "upper-back", label: "Upper / mid back", labelAr: "أعلى / وسط الظهر", module: "back", structure: "Thoracic Spine", pts: [[312,176], [372,182], [400,198], [404,240], [404,282], [400,300], [392,318], [388,330], [312,334]], r: 13 },
    { id: "lumbar", label: "Lower back", labelAr: "أسفل الظهر", module: "back", structure: "Lumbar Spine", pts: [[312,330], [388,330], [384,350], [381,375], [385,396], [386,412], [312,414]], r: 11 },
    { id: "sacrum", label: "Sacrum", labelAr: "العجز", module: "back", structure: "Sacral", pts: [[312,408], [342,412], [354,436], [346,466], [312,480]], r: 9 },
    { id: "buttock", label: "Buttock / sacroiliac region", labelAr: "الآلية / منطقة الحرقفي العجزي", module: "back", structure: "Sacral", pair: true, pts: [[352,424], [388,426], [396,456], [400,500], [402,530], [386,544], [346,546], [322,536], [316,500], [318,462], [330,438]], r: 11 },
    { id: "shoulder", label: "Shoulder", labelAr: "الكتف", module: "upper-limb", pair: true, pts: [[400,186], [432,190], [450,212], [453,244], [457,270], [463,288], [418,296], [404,270], [402,230]], r: 10 },
    { id: "upperarm", label: "Upper arm", labelAr: "العضد", module: "upper-limb", structure: "Upper Arm", pair: true, ax: 308, pts: [[410,296], [468,290], [474,316], [484,334], [494,348], [440,350], [430,336], [420,316], [411,302]], r: 9 },
    { id: "elbow", label: "Elbow", labelAr: "المرفق", module: "upper-limb", structure: "Elbow", pair: true, ax: 305, pts: [[434,346], [494,346], [503,362], [512,378], [518,392], [462,394], [450,376], [440,360]], r: 6 },
    { id: "forearm", label: "Forearm", labelAr: "الساعد", module: "upper-limb", structure: "Forearm", pair: true, ax: 302, pts: [[462,394], [518,390], [526,406], [536,421], [546,436], [508,438], [492,420], [476,406]], r: 9 },
    { id: "hand", label: "Hand", labelAr: "اليد", module: "upper-limb", structure: "Hand", pair: true, ax: 300, pts: [[507,436], [546,436], [566,450], [578,466], [584,484], [582,498], [572,514], [548,512], [540,498], [528,476], [516,456]], r: 8 },
    { id: "thigh", label: "Thigh", labelAr: "الفخذ", module: "lower-limb", structure: "Thigh", pair: true, pts: [[314,544], [386,540], [402,556], [399,580], [397,600], [393,622], [388,642], [382,662], [378,684], [322,688], [319,650], [318,610], [314,570]], r: 11 },
    { id: "knee", label: "Knee", labelAr: "الركبة", module: "lower-limb", structure: "Knee", pair: true, pts: [[320,676], [380,676], [378,700], [376,728], [326,728], [322,702]], r: 7 },
    { id: "lowerleg", label: "Lower leg", labelAr: "الساق", module: "lower-limb", structure: "Lower Leg", pair: true, pts: [[326,726], [378,726], [381,760], [381,784], [377,806], [370,836], [364,866], [359,896], [326,898], [326,870], [324,830], [320,790], [320,756]], r: 9 },
    { id: "foot", label: "Foot (posterior / heel)", labelAr: "القدم (الخلفية / الكعب)", module: "lower-limb", structure: "Foot", pair: true, pts: [[322,898], [360,898], [364,920], [380,940], [394,956], [392,966], [326,968], [318,946], [322,920]], r: 7 }
  ], AXIS.back);

  /* ---------------------------------------------------------------- *
   * Builder                                                          *
   * ---------------------------------------------------------------- */
  function regionEl(spec) {
    var el;
    if (spec.shape === 'ellipse') {
      el = makeEl('ellipse', { cx: spec.cx, cy: spec.cy, rx: spec.rx, ry: spec.ry });
    } else if (spec.pair) {
      /* Paired outlines are already a complete loop on their own side. */
      el = makeEl('path', { d: smooth(spec.pts, spec.r || 8) });
    } else {
      /* Midline specs are given as a right half -> mirror to a full loop. */
      el = makeEl('path', { d: smooth(sym(spec.pts, spec.ax), spec.r || 8) });
    }
    el.setAttribute('class', 'region');
    el.setAttribute('data-region', spec.id);
    el.setAttribute('data-module', spec.module);
    if (spec.structure) el.setAttribute('data-structure', spec.structure);
    el.setAttribute('data-side', spec.side || '');
    el.setAttribute('data-label', spec.label);
    if (spec.labelAr) el.setAttribute('data-label-ar', spec.labelAr);
    return el;
  }

  function build(view) {
    var specs = view === 'back' ? BACK_SPECS : FRONT_SPECS;

    var svg = makeEl('svg', {
      viewBox: '0 0 ' + VBW + ' ' + VBH, class: 'body-svg', 'data-view': view,
      role: 'img', 'aria-label': 'Human body, ' + (view === 'back' ? 'posterior' : 'anterior') + ' view'
    });

    var gBody = makeEl('g', { class: 'g-body' });
    svg.appendChild(gBody);
    gBody.appendChild(makeEl('image', {
      href: IMAGES[view], x: 0, y: 0, width: VBW, height: VBH,
      preserveAspectRatio: 'xMidYMid meet'
    }));

    var gReg = makeEl('g', { class: 'g-regions' });
    gBody.appendChild(gReg);
    specs.forEach(function (s) { gReg.appendChild(regionEl(s)); });

    return svg;
  }

  function specsFor(view) { return view === 'back' ? BACK_SPECS : FRONT_SPECS; }

  /* ---------------------------------------------------------------- *
   * Assessment picker                                                *
   * ---------------------------------------------------------------- */

  /* Coarse regions the pain assessment collects (step 4). Every hotspot
     above rolls up into one of these, so the picker can offer the same 18
     regions the assessment expects while reusing the existing geometry. */
  var PICK_REGIONS = [
    { id: 'head',     label: 'Head',     labelAr: 'الرأس' },
    { id: 'face',     label: 'Face',     labelAr: 'الوجه' },
    { id: 'neck',     label: 'Neck',     labelAr: 'الرقبة' },
    { id: 'shoulder', label: 'Shoulder', labelAr: 'الكتف' },
    { id: 'arm',      label: 'Arm',      labelAr: 'الذراع' },
    { id: 'elbow',    label: 'Elbow',    labelAr: 'المرفق' },
    { id: 'forearm',  label: 'Forearm',  labelAr: 'الساعد' },
    { id: 'hand',     label: 'Hand',     labelAr: 'اليد' },
    { id: 'chest',    label: 'Chest',    labelAr: 'الصدر' },
    { id: 'abdomen',  label: 'Abdomen',  labelAr: 'البطن' },
    { id: 'back',     label: 'Back',     labelAr: 'الظهر' },
    { id: 'pelvis',   label: 'Pelvis',   labelAr: 'الحوض' },
    { id: 'hip',      label: 'Hip',      labelAr: 'الورك' },
    { id: 'thigh',    label: 'Thigh',    labelAr: 'الفخذ' },
    { id: 'knee',     label: 'Knee',     labelAr: 'الركبة' },
    { id: 'leg',      label: 'Leg',      labelAr: 'الساق' },
    { id: 'ankle',    label: 'Ankle',    labelAr: 'الكاحل' },
    { id: 'foot',     label: 'Foot',     labelAr: 'القدم' }
  ];

  /* Map every hotspot id (front + back) onto its coarse assessment region. */
  var PICK_MAP = {
    /* front */
    scalp: 'head', face: 'face', jaw: 'face', eye: 'face', ear: 'face', nose: 'face',
    cheek: 'face', mouth: 'face', neck: 'neck', chest: 'chest', abdomen: 'abdomen',
    pelvis: 'pelvis', genital: 'pelvis', flank: 'back',
    shoulder: 'shoulder', upperarm: 'arm', elbow: 'elbow', forearm: 'forearm',
    wrist: 'hand', hand: 'hand', fingers: 'hand',
    hip: 'hip', thigh: 'thigh', knee: 'knee', lowerleg: 'leg',
    ankle: 'ankle', foot: 'foot', toes: 'foot',
    /* back */
    'head-back': 'head', 'neck-back': 'neck', 'upper-back': 'back', lumbar: 'back',
    sacrum: 'back', buttock: 'back'
  };

  function pickRegionOf(spec) {
    /* Paired specs are expanded to '<id>-r' / '<id>-l' — strip the side
     * suffix so both halves map to the same coarse region. */
    var bare = String(spec.id).replace(/-(r|l)$/, '');
    return PICK_MAP[bare] || PICK_MAP[spec.id] || null;
  }

  function pickRegionLabel(id) {
    for (var i = 0; i < PICK_REGIONS.length; i++) {
      if (PICK_REGIONS[i].id === id) return PICK_REGIONS[i];
    }
    return null;
  }

  /* Build an SVG figure whose regions are toggleable assessment locations.
   * `selected` is a map of coarse-region id -> truthy. Hotspots belonging to
   * a selected coarse region get the .picked class so the highlight is
   * visible from whichever side the figure is shown. */
  function buildPicker(view, selected) {
    var specs = specsFor(view);
    var svg = build(view);
    svg.setAttribute('data-picker', 'true');

    specs.forEach(function (s) {
      var rid = pickRegionOf(s);
      if (!rid) return;
      var el = svg.querySelector('[data-region="' + s.id + '"]');
      if (!el) return;
      el.setAttribute('data-pick', rid);
      if (selected && selected[rid]) el.classList.add('picked');
    });

    return svg;
  }

  /* Small schematic used to visualise a radiation path (origin -> dest).
   * Two landmarks with a connecting dashed arrow. Labels are plain text so
   * the caller passes already-translated strings. */
  function radiationDiagram(originLabel, destLabel, opts) {
    opts = opts || {};
    var svg = makeEl('svg', {
      viewBox: '0 0 320 120', class: 'rad-svg', role: 'img',
      'aria-label': String(opts.aria || ('Radiation from ' + originLabel + ' to ' + destLabel))
    });
    var g = makeEl('g', {});
    svg.appendChild(g);
    g.appendChild(makeEl('rect', { x: 8, y: 8, width: 304, height: 104, rx: 12,
      fill: '#f6fafb', stroke: '#d9e4ea' }));

    var oX = 74, dX = 246, y = 60;
    g.appendChild(makeEl('circle', { cx: oX, cy: y, r: 13, fill: '#0e7c86' }));
    g.appendChild(makeEl('circle', { cx: dX, cy: y, r: 13, fill: '#c98a12' }));
    g.appendChild(makeEl('path', {
      d: 'M' + (oX + 15) + ' ' + y + ' L' + (dX - 18) + ' ' + y,
      fill: 'none', stroke: '#46627a', 'stroke-width': 2.4, 'stroke-dasharray': '6 4'
    }));
    g.appendChild(makeEl('path', {
      d: 'M' + (dX - 18) + ' ' + (y - 7) + ' L' + (dX - 2) + ' ' + y + ' L' + (dX - 18) + ' ' + (y + 7) + ' Z',
      fill: '#46627a'
    }));

    var t1 = makeEl('text', { x: oX, y: y + 34, 'text-anchor': 'middle', class: 'rad-lab' });
    t1.textContent = String(originLabel || '');
    var t2 = makeEl('text', { x: dX, y: y + 34, 'text-anchor': 'middle', class: 'rad-lab' });
    t2.textContent = String(destLabel || '');
    var mid = makeEl('text', { x: 160, y: y - 14, 'text-anchor': 'middle', class: 'rad-sub' });
    mid.textContent = String(opts.dirLabel || '');
    g.appendChild(t1); g.appendChild(t2); g.appendChild(mid);
    return svg;
  }

  window.BODY_MAP = {
    build: build,
    specsFor: specsFor,
    buildPicker: buildPicker,
    radiationDiagram: radiationDiagram,
    pickRegions: PICK_REGIONS,
    pickRegionLabel: pickRegionLabel,
    pickRegionOf: pickRegionOf
  };
})();