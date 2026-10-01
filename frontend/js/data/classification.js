/*
 * PAIN SCORE — classification reference data (static, frontend-only).
 * Cross-cutting pain classifications used by the filters and the
 * "Classification Reference" dialog. No backend, no AI.
 */
window.PAIN_CLASSIFICATION = {
  mechanisms: [
    {
      id: 'Nociceptive',
      name: 'Nociceptive Pain',
      nameAr: 'الألم المستقبِلي',
      def: 'Pain associated with actual or threatened tissue injury and activation of nociceptive pathways.',
      defAr: 'ألم مرتبط بضرر فعلي أو مهدَّد في النسيج وتفعيل المسارات المستقبِلة للألم.',
      includes: [
        'Somatic — skin, subcutaneous tissue, muscle, bone, joint, tendon, ligament, connective tissue',
        'Visceral — internal organs, hollow organs, solid organs, visceral tissues'
      ],
      includesAr: [
        'جسدي — الجلد، الأنسجة تحت الجلد، العضلات، العظام، المفاصل، الأوتار، الأربطة، النسيج الضام',
        'حشوي — الأعضاء الداخلية، الأعضاء المجوّفة، الأعضاء الصلبة، الأنسجة الحشوية'
      ]
    },
    {
      id: 'Neuropathic',
      name: 'Neuropathic Pain',
      nameAr: 'الألم العصبي',
      def: 'Pain caused by a lesion or disease affecting the somatosensory nervous system.',
      defAr: 'ألم ناتج عن آفة أو مرض يصيب الجهاز العصبي الحسّي الجسدي.',
      includes: [
        'Peripheral neuropathy',
        'Diabetic neuropathy',
        'Trigeminal neuralgia',
        'Postherpetic neuralgia',
        'Radicular pain',
        'Some forms of central neuropathic pain'
      ],
      includesAr: [
        'اعتلال الأعصاب المحيطية',
        'اعتلال الأعصاب السكري',
        'الضَّرَب العصبي ثلاثي التوائم',
        'الضَّرَب العصبي عقب الهربس النطاقي',
        'الألم الجذري',
        'بعض أشكال الألم العصبي المركزي'
      ]
    },
    {
      id: 'Nociplastic',
      name: 'Nociplastic Pain',
      nameAr: 'الألم النوسيبلاستيكي',
      def: 'Pain associated with altered pain processing without a complete explanation from tissue damage or a clearly defined lesion or disease of the somatosensory system.',
      defAr: 'ألم مرتبط بتغيّر معالجة الألم دون تفسير كامل من ضرر النسيج أو وجود آفة أو مرض محدَّد بوضوح في الجهاز العصبي الحسّي الجسدي.',
      includes: [
        'Fibromyalgia',
        'Some chronic widespread pain conditions'
      ],
      includesAr: [
        'الألم العضلي الليفي',
        'بعض حالات الألم المزمن المنتشر'
      ]
    },
    {
      id: 'Mixed',
      name: 'Mixed Pain',
      nameAr: 'الألم المختلط',
      def: 'Pain in which multiple mechanisms may coexist.',
      defAr: 'ألم قد تتشارك فيه عدة آليات معًا.',
      includes: [
        'Nociceptive + neuropathic',
        'Tissue injury + nerve injury',
        'Chronic structural pain + altered pain processing'
      ],
      includesAr: [
        'مستقبِلي + عصبي',
        'ضرر نسيجي + إصالة عصبية',
        'ألم بنيوي مزمن + تغيّر معالجة الألم'
      ]
    }
  ],
  durations: [
    { id: 'Acute',    name: 'Acute Pain',    nameAr: 'الألم الحادّ',
      def: 'Sudden-onset pain — injury-, burn-, fracture-, inflammation-, procedure- or surgery-related.',
      defAr: 'ألم مفاجئ الظهور — مرتبط بالرضّ أو الحرق أو الكسر أو الالتهاب أو الإجراءات أو الجراحة.' },
    { id: 'Chronic',  name: 'Chronic Pain',  nameAr: 'الألم المزمن',
      def: 'Persistent or long-term pain — musculoskeletal, neuropathic, visceral or widespread.',
      defAr: 'ألم مستمر أو طويل الأمد — عضلي هيكلي أو عصبي أو حشوي أو منتشر.' },
    { id: 'Episodic', name: 'Episodic Pain', nameAr: 'الألم المتقطع',
      def: 'Recurrent attacks, intermittent pain, pain flares or discrete pain episodes.',
      defAr: 'نوبات متكررة، أو ألم متقطّع، أو وهجات ألم، أو نوبات ألم محدَّدة.' },
    { id: 'Recurrent',name: 'Recurrent Pain',nameAr: 'الألم المتكرر',
      def: 'Pain that returns after pain-free intervals.',
      defAr: 'ألم يعود بعد فترات خلوٍ من الألم.' }
  ],
  sensations: [
    'Sharp', 'Stabbing', 'Burning', 'Electric', 'Shooting', 'Throbbing',
    'Pressure', 'Crushing', 'Cramping', 'Deep', 'Aching', 'Pricking',
    'Stinging', 'Tingling-associated', 'Hyperalgesia', 'Allodynia'
  ],
  referredPain: [
    { from: 'Internal organ',  to: 'Back',                    example: 'Pancreatic pain radiating to the back',
      fromAr: 'عضو داخلي', toAr: 'الظهر', exampleAr: 'ألم البنكرياس ينتشر إلى الظهر' },
    { from: 'Internal organ',  to: 'Shoulder',                example: 'Liver / gallbladder pain referred to the right shoulder region',
      fromAr: 'عضو داخلي', toAr: 'الكتف', exampleAr: 'ألم الكبد / المرارة يُحال إلى منطقة الكتف الأيمن' },
    { from: 'Chest origin',    to: 'Arm',                     example: 'Cardiac ischemic pain radiating to the arm',
      fromAr: 'منشأ في الصدر', toAr: 'الذراع', exampleAr: 'ألم نقص تروية القلب ينتشر إلى الذراع' },
    { from: 'Internal organ',  to: 'Jaw',                     example: 'Cardiac ischemic pain radiating to the jaw',
      fromAr: 'عضو داخلي', toAr: 'الفك', exampleAr: 'ألم نقص تروية القلب ينتشر إلى الفك' },
    { from: 'Abdomen',         to: 'Another abdominal region',example: 'Appendiceal pain migrating toward the right lower quadrant',
      fromAr: 'البطن', toAr: 'منطقة أخرى في البطن', exampleAr: 'ألم الزائدة الدودية يهاجر نحو الربع السفلي الأيمن' },
    { from: 'Spinal nerve',    to: 'Limb',                    example: 'Lumbosacral nerve-root pain perceived in the leg (sciatica)',
      fromAr: 'عصب شوكي', toAr: 'الطرف', exampleAr: 'ألم جذر العصب القطني العجزي يُحَسّ في الساق (عرق النسا)' }
  ],
  note: 'Nociception and pain are distinct: nociception is a neurophysiological process, while pain is the conscious experience resulting from complex brain processing. Pain is subjective, difficult to quantify, and cannot be directly measured by a single physiological sensor.',
  noteAr: 'الاستقبال والألم مفهومان مختلفان: الاستقبال عملية فيزيولوجية عصبية، بينما الألم هو التجربة الواعية الناتجة عن معالجة معقدة في الدماغ. الألم ذاتيٌّ ويصعب قياسه، ولا يمكن قياسه مباشرةً بجهاز استشعار فسيولوجي واحد.'
};

/* Tissue-system modules that are cross-cutting (not a single body hotspot). */
window.CROSS_CUTTING_MODULES = [
  'musculoskeletal', 'skin-soft-tissue', 'vascular', 'neuropathic', 'generalized'
];
