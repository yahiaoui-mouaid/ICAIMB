/*
 * PAIN SCORE — interactive body map (static SVG, frontend-only).
 *
 * Builds two stylized anatomical figures (anterior / posterior) from point
 * arrays. Every hotspot region maps to a taxonomy module (+ optional
 * structure). No backend, no AI — this is pure navigation.
 */
(function () {
  'use strict';

  var W = 360;

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

  /* Right half including both centre-line endpoints -> symmetric full loop. */
  function sym(pts) {
    var full = pts.slice();
    for (var i = pts.length - 2; i >= 1; i--) full.push([W - pts[i][0], pts[i][1]]);
    return full;
  }
  function mir(pts) { return pts.map(function (p) { return [W - p[0], p[1]]; }); }

  /* Expand a paired (side 'r') spec into right + left. */
  function expand(specs) {
    var out = [];
    specs.forEach(function (s) {
      if (!s.pair) { out.push(s); return; }
      var r = Object.assign({}, s, { id: s.id + '-r', side: 'r' });
      var l = Object.assign({}, s, {
        id: s.id + '-l', side: 'l',
        pts: s.pts ? mir(s.pts) : undefined,
        cx: s.cx !== undefined ? W - s.cx : undefined
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
   * ANTERIOR (FRONT) VIEW                                            *
   * ---------------------------------------------------------------- */
  var FRONT_SPECS = expand([
    { id: 'scalp', label: 'Scalp / Cranium', labelAr: 'فروة الرأس / القحف', module: 'head-face', structure: 'Scalp',
      pts: [[180, 26], [196, 28], [214, 38], [228, 58], [236, 86], [232, 102], [216, 108], [196, 106], [180, 106]], r: 11 },
    { id: 'face', label: 'Face', labelAr: 'الوجه', module: 'head-face', structure: 'Facial Pain',
      pts: [[180, 106], [198, 110], [214, 122], [222, 142], [214, 158], [196, 168], [180, 170]], r: 8 },
    { id: 'jaw', label: 'Jaw', labelAr: 'الفك', module: 'head-face', structure: 'Jaw',
      pts: [[180, 150], [196, 153], [210, 163], [206, 177], [192, 183], [180, 183]], r: 6 },
    { id: 'neck', label: 'Neck', labelAr: 'الرقبة', module: 'neck',
      pts: [[180, 158], [198, 162], [204, 182], [200, 204], [180, 206]], r: 8 },
    { id: 'chest', label: 'Chest', labelAr: 'الصدر', module: 'chest',
      pts: [[180, 200], [200, 204], [222, 214], [246, 220], [264, 236], [268, 258], [258, 280], [244, 292], [226, 296], [204, 296], [180, 296]], r: 12 },
    { id: 'abdomen', label: 'Abdomen', labelAr: 'البطن', module: 'abdomen',
      pts: [[180, 292], [202, 293], [226, 295], [246, 298], [253, 306], [254, 330], [250, 356], [244, 382], [232, 402], [210, 410], [180, 412]], r: 10 },
    { id: 'pelvis', label: 'Pelvis', labelAr: 'الحوض', module: 'pelvis-repro',
      pts: [[180, 410], [210, 414], [230, 426], [240, 448], [238, 472], [226, 494], [208, 506], [192, 512], [180, 513]], r: 8 },
    { id: 'genital', label: 'Genital region', labelAr: 'المنطقة التناسلية', module: 'pelvis-repro', shape: 'ellipse',
      cx: 180, cy: 520, rx: 21, ry: 13 },
    { id: 'flank', label: 'Flank (kidney angle)', labelAr: 'الخاصرة (زاوية الكلية)', module: 'urinary', structure: 'Kidney', pair: true,
      pts: [[236, 300], [254, 306], [260, 340], [254, 376], [240, 398], [228, 398], [232, 356], [230, 318]], r: 8 },
    { id: 'shoulder', label: 'Shoulder', labelAr: 'الكتف', module: 'upper-limb', pair: true,
      pts: [[262, 196], [274, 216], [274, 244], [262, 262], [246, 258], [240, 236], [246, 212]], r: 11 },
    { id: 'upperarm', label: 'Upper arm', labelAr: 'العضد', module: 'upper-limb', structure: 'Upper Arm', pair: true,
      pts: [[246, 236], [272, 246], [278, 300], [272, 356], [260, 380], [248, 378], [246, 320], [244, 270]], r: 9 },
    { id: 'elbow', label: 'Elbow', labelAr: 'المرفق', module: 'upper-limb', structure: 'Elbow', pair: true,
      pts: [[248, 378], [272, 356], [278, 382], [270, 406], [254, 408], [244, 394]], r: 6 },
    { id: 'forearm', label: 'Forearm', labelAr: 'الساعد', module: 'upper-limb', structure: 'Forearm', pair: true,
      pts: [[254, 408], [270, 406], [274, 460], [268, 514], [258, 532], [246, 530], [246, 470], [246, 416]], r: 9 },
    { id: 'wrist', label: 'Wrist', labelAr: 'الرسغ', module: 'upper-limb', structure: 'Wrist', pair: true,
      pts: [[246, 530], [268, 514], [274, 530], [266, 544], [250, 546], [242, 540]], r: 5 },
    { id: 'hand', label: 'Hand', labelAr: 'اليد', module: 'upper-limb', structure: 'Hand', pair: true,
      pts: [[250, 546], [266, 544], [274, 572], [268, 610], [254, 624], [242, 618], [242, 582], [244, 560]], r: 8 },
    { id: 'fingers', label: 'Fingers', labelAr: 'الأصابع', module: 'upper-limb', structure: 'Fingers', pair: true,
      pts: [[244, 618], [268, 610], [274, 636], [266, 652], [248, 654], [240, 644]], r: 5 },
    { id: 'hip', label: 'Hip', labelAr: 'الورك', module: 'lower-limb', structure: 'Hip', pair: true,
      pts: [[240, 448], [256, 454], [264, 480], [261, 506], [247, 514], [233, 496], [230, 470]], r: 8 },
    { id: 'thigh', label: 'Thigh', labelAr: 'الفخذ', module: 'lower-limb', structure: 'Thigh', pair: true,
      pts: [[244, 506], [258, 509], [263, 548], [258, 612], [240, 628], [228, 612], [230, 558], [231, 516]], r: 11 },
    { id: 'knee', label: 'Knee', labelAr: 'الركبة', module: 'lower-limb', structure: 'Knee', pair: true,
      pts: [[228, 612], [258, 612], [262, 646], [254, 672], [236, 676], [226, 652], [224, 630]], r: 7 },
    { id: 'lowerleg', label: 'Lower leg', labelAr: 'الساق', module: 'lower-limb', structure: 'Lower Leg', pair: true,
      pts: [[226, 652], [254, 672], [258, 724], [248, 782], [236, 794], [226, 790], [222, 742], [222, 676]], r: 9 },
    { id: 'ankle', label: 'Ankle', labelAr: 'الكاحل', module: 'lower-limb', structure: 'Ankle', pair: true,
      pts: [[226, 790], [248, 782], [254, 802], [246, 818], [230, 820], [220, 808]], r: 5 },
    { id: 'foot', label: 'Foot', labelAr: 'القدم', module: 'lower-limb', structure: 'Foot', pair: true,
      pts: [[220, 818], [250, 820], [258, 842], [250, 858], [230, 860], [216, 848], [214, 830]], r: 7 },
    { id: 'toes', label: 'Toes', labelAr: 'أصابع القدم', module: 'lower-limb', structure: 'Toes', pair: true,
      pts: [[230, 856], [258, 844], [262, 860], [254, 872], [234, 874], [222, 868]], r: 5 },
    /* Facial overlay hotspots */
    { id: 'eye', label: 'Eye', labelAr: 'العين', module: 'eye', structure: 'Eye', pair: true, shape: 'ellipse',
      cx: 202, cy: 124, rx: 16, ry: 11 },
    { id: 'ear', label: 'Ear', labelAr: 'الأذن', module: 'ent', structure: 'Ear', pair: true, shape: 'ellipse',
      cx: 232, cy: 122, rx: 10, ry: 15 },
    { id: 'nose', label: 'Nose', labelAr: 'الأنف', module: 'ent', structure: 'Nose', shape: 'ellipse',
      cx: 180, cy: 140, rx: 11, ry: 13 },
    { id: 'cheek', label: 'Cheek / sinus region', labelAr: 'الخد / منطقة الجيب', module: 'ent', structure: 'Sinuses', pair: true, shape: 'ellipse',
      cx: 212, cy: 146, rx: 12, ry: 10 },
    { id: 'mouth', label: 'Mouth & dental', labelAr: 'الفم والأسنان', module: 'head-face', structure: 'Mouth & Dental', shape: 'ellipse',
      cx: 180, cy: 158, rx: 18, ry: 10 }
  ]);

  /* Decorative facial features (non-interactive). */
  var FRONT_DECOR = [
    { el: 'ellipse', cx: 158, cy: 124, rx: 11, ry: 7 },
    { el: 'ellipse', cx: 202, cy: 124, rx: 11, ry: 7 },
    { el: 'path', d: 'M146 112 Q158 104 170 112' },
    { el: 'path', d: 'M190 112 Q202 104 214 112' },
    { el: 'path', d: 'M180 130 L175 142 Q180 147 185 142' },
    { el: 'path', d: 'M162 156 Q180 164 198 156' }
  ];

  var FRONT_TAGS = [
    { x: 180, y: 66, t: 'HEAD', tAr: 'الرأس' },
    { x: 180, y: 250, t: 'CHEST', tAr: 'الصدر' },
    { x: 180, y: 354, t: 'ABDOMEN', tAr: 'البطن' },
    { x: 180, y: 452, t: 'PELVIS', tAr: 'الحوض' },
    { x: 262, y: 312, t: 'ARM', tAr: 'الذراع' },
    { x: 262, y: 572, t: 'HAND', tAr: 'اليد' },
    { x: 248, y: 570, t: 'THIGH', tAr: 'الفخذ' },
    { x: 240, y: 730, t: 'LEG', tAr: 'الساق' }
  ];

  /* ---------------------------------------------------------------- *
   * POSTERIOR (BACK) VIEW                                            *
   * ---------------------------------------------------------------- */
  var BACK_SPECS = expand([
    { id: 'head-back', label: 'Occiput / back of head', labelAr: 'القفا / مؤخرة الرأس', module: 'head-face', structure: 'Scalp',
      pts: [[180, 26], [198, 30], [218, 42], [232, 64], [236, 90], [232, 110], [222, 136], [206, 148], [180, 150]], r: 13 },
    { id: 'neck-back', label: 'Neck (posterior)', labelAr: 'الرقبة (الخلفية)', module: 'neck',
      pts: [[180, 146], [198, 150], [204, 178], [200, 206], [180, 208]], r: 8 },
    { id: 'upper-back', label: 'Upper / mid back', labelAr: 'أعلى / وسط الظهر', module: 'back', structure: 'Thoracic Spine',
      pts: [[180, 200], [200, 204], [224, 216], [248, 222], [266, 240], [270, 262], [260, 284], [246, 294], [226, 298], [204, 298], [180, 298]], r: 13 },
    { id: 'lumbar', label: 'Lower back', labelAr: 'أسفل الظهر', module: 'back', structure: 'Lumbar Spine',
      pts: [[180, 292], [204, 293], [228, 295], [247, 298], [252, 308], [252, 336], [246, 366], [234, 392], [212, 404], [180, 406]], r: 11 },
    { id: 'sacrum', label: 'Sacrum', labelAr: 'العجز', module: 'back', structure: 'Sacral',
      pts: [[180, 408], [208, 412], [226, 426], [232, 450], [222, 470], [200, 478], [180, 480]], r: 9 },
    { id: 'buttock', label: 'Buttock / sacroiliac region', labelAr: 'الآلية / منطقة الحرقفي العجزي', module: 'back', structure: 'Sacral', pair: true,
      pts: [[232, 450], [248, 452], [258, 478], [252, 504], [238, 514], [224, 502], [222, 476]], r: 11 },
    { id: 'shoulder', label: 'Shoulder', labelAr: 'الكتف', module: 'upper-limb', pair: true,
      pts: [[260, 198], [272, 218], [272, 246], [260, 264], [246, 260], [240, 238], [246, 214]], r: 11 },
    { id: 'upperarm', label: 'Upper arm', labelAr: 'العضد', module: 'upper-limb', structure: 'Upper Arm', pair: true,
      pts: [[246, 238], [270, 248], [276, 302], [270, 358], [258, 382], [246, 380], [246, 322], [244, 272]], r: 9 },
    { id: 'elbow', label: 'Elbow', labelAr: 'المرفق', module: 'upper-limb', structure: 'Elbow', pair: true,
      pts: [[248, 380], [270, 358], [276, 384], [268, 408], [254, 410], [244, 396]], r: 6 },
    { id: 'forearm', label: 'Forearm', labelAr: 'الساعد', module: 'upper-limb', structure: 'Forearm', pair: true,
      pts: [[252, 410], [268, 408], [272, 462], [266, 516], [256, 534], [246, 532], [246, 472], [246, 420]], r: 9 },
    { id: 'hand', label: 'Hand', labelAr: 'اليد', module: 'upper-limb', structure: 'Hand', pair: true,
      pts: [[250, 548], [264, 546], [272, 574], [266, 612], [254, 626], [242, 620], [242, 584], [244, 562]], r: 8 },
    { id: 'thigh', label: 'Thigh', labelAr: 'الفخذ', module: 'lower-limb', structure: 'Thigh', pair: true,
      pts: [[244, 506], [258, 509], [263, 548], [258, 612], [240, 628], [228, 612], [230, 558], [231, 516]], r: 11 },
    { id: 'knee', label: 'Knee', labelAr: 'الركبة', module: 'lower-limb', structure: 'Knee', pair: true,
      pts: [[228, 612], [258, 612], [262, 646], [254, 672], [236, 676], [226, 652], [224, 630]], r: 7 },
    { id: 'lowerleg', label: 'Lower leg', labelAr: 'الساق', module: 'lower-limb', structure: 'Lower Leg', pair: true,
      pts: [[226, 652], [254, 672], [258, 724], [248, 782], [236, 794], [226, 790], [222, 742], [222, 676]], r: 9 },
    { id: 'foot', label: 'Foot (posterior / heel)', labelAr: 'القدم (الخلفية / الكعب)', module: 'lower-limb', structure: 'Foot', pair: true,
      pts: [[220, 818], [250, 820], [258, 844], [250, 862], [230, 864], [216, 852], [214, 832]], r: 7 }
  ]);

  var BACK_DECOR = [
    { el: 'path', d: 'M180 210 L180 400' },
    { el: 'path', d: 'M180 412 L180 476' },
    { el: 'path', d: 'M206 232 Q224 246 222 274' },
    { el: 'path', d: 'M154 232 Q136 246 138 274' }
  ];

  var BACK_TAGS = [
    { x: 180, y: 66, t: 'HEAD', tAr: 'الرأس' },
    { x: 180, y: 250, t: 'UPPER BACK', tAr: 'أعلى الظهر' },
    { x: 180, y: 354, t: 'LOWER BACK', tAr: 'أسفل الظهر' },
    { x: 180, y: 446, t: 'SACRUM', tAr: 'العجز' },
    { x: 262, y: 312, t: 'ARM', tAr: 'الذراع' },
    { x: 248, y: 570, t: 'THIGH', tAr: 'الفخذ' },
    { x: 240, y: 730, t: 'LEG', tAr: 'الساق' }
  ];

  /* ---------------------------------------------------------------- *
   * Builder                                                          *
   * ---------------------------------------------------------------- */
  function regionEl(spec) {
    var el;
    if (spec.shape === 'ellipse') {
      el = makeEl('ellipse', { cx: spec.cx, cy: spec.cy, rx: spec.rx, ry: spec.ry });
    } else if (spec.pair) {
      /* Paired limb outlines are already a complete loop (right side). */
      el = makeEl('path', { d: smooth(spec.pts, spec.r || 8) });
    } else {
      /* Midline specs are given as a right half -> mirror to a full loop. */
      el = makeEl('path', { d: smooth(sym(spec.pts), spec.r || 8) });
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
    var decor = view === 'back' ? BACK_DECOR : FRONT_DECOR;
    var tags = view === 'back' ? BACK_TAGS : FRONT_TAGS;

    var svg = makeEl('svg', {
      viewBox: '0 0 360 900', class: 'body-svg', 'data-view': view,
      role: 'img', 'aria-label': 'Human body, ' + (view === 'back' ? 'posterior' : 'anterior') + ' view'
    });

    var gBody = makeEl('g', { class: 'g-body' });
    svg.appendChild(gBody);

    /* Silhouette glow behind the figure */
    gBody.appendChild(makeEl('ellipse', { cx: 180, cy: 445, rx: 122, ry: 428, class: 'silhouette' }));

    specs.forEach(function (s) { gBody.appendChild(regionEl(s)); });

    var gDecor = makeEl('g', { class: 'g-decor' });
    svg.appendChild(gDecor);
    decor.forEach(function (d) {
      if (d.el === 'ellipse') gDecor.appendChild(makeEl('ellipse', { cx: d.cx, cy: d.cy, rx: d.rx, ry: d.ry }));
      else gDecor.appendChild(makeEl('path', { d: d.d }));
    });

    var gTags = makeEl('g', { class: 'g-tags' });
    svg.appendChild(gTags);
    tags.forEach(function (t) {
      if (!t.t) return;
      var text = makeEl('text', { x: t.x, y: t.y, 'text-anchor': 'middle' });
      text.textContent = (window.I18N && window.I18N.isAr() && t.tAr) ? t.tAr : t.t;
      gTags.appendChild(text);
    });

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
