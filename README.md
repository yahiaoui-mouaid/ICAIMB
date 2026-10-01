# PAIN SCORE — Doctor Interface

Frontend-only interactive **medical anatomy and pain-classification** reference for
clinicians, with a structured **clinical pain-assessment wizard**. A doctor navigates
a human body model, selects an anatomical region and structure, then reviews the pain
categories, pain types and their characteristics (mechanism, duration, sensations,
radiation, related structures) — all from static data files. The assessment wizard
walks the same clinician through 14 steps of structured documentation and produces a
printable summary.

> **Clinician-driven selection.** This interface does not detect, predict, score,
> or diagnose pain. There is no AI, no machine learning, no sensor integration and
> no backend. Every selection is made by the clinician.

## How to run

No build step, no dependencies.

1. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari), **or**
2. Serve the folder with any static server, e.g.
   - Python: `python -m http.server 8000` → http://localhost:8000
   - Node: `npx serve` or `npx http-server`

Desktop and tablet layouts are supported.

## How it works

```
Interactive anatomy (front / back)
        │  click a region
        ▼
Anatomical region (module)          e.g. Abdomen
        │  click a structure card
        ▼
Organ / structure                   e.g. Liver
        │  click a pain type
        ▼
Pain detail card                    e.g. Liver-region pain
   mechanisms · characteristics · duration · radiation · related structures
```

### Interface

| Area | What it does |
|---|---|
| **Body model (center)** | Front/back toggle. Click any colored region to open that anatomical module. Hover or focus a region to see its patient-side label (left/right is reported as the *patient's* side). |
| **Filters (left)** | Narrow the whole taxonomy by **mechanism** (Nociceptive, Neuropathic, Nociplastic, Mixed), **duration** (Acute, Chronic, Episodic, Recurrent) and **sensation** (16 descriptors). Regions dim when they have no matching pain types; the count of matches is shown. |
| **Detail panel (right)** | Breadcrumb navigation plus the current view: home prompt, module structure cards, structure pain list, or the pain detail card. Every level is reachable from the breadcrumbs. |
| **Search (top bar)** | Match pain types, structures and regions by name; grouped dropdown, Enter opens the first hit. |
| **Quick access (bottom center)** | Cross-cutting pain systems that span regions: Musculoskeletal, Skin & soft tissue, Vascular, Neuropathic, Generalized. |
| **Classification Reference** | Modal with the mechanism taxonomy, duration taxonomy, sensation vocabulary, referred-pain patterns and the nociception-vs-pain note. |
| **Reset** | Return to the home view and clear all filters. |
| **Language (العربية / English)** | Toggle the whole interface between English and Arabic. Arabic switches the layout to right-to-left; the anatomy diagram itself stays left-to-right. Labels, the classification reference, search, filters, region tooltips and pain detail all translate, and search matches either language. |

### Languages

English is the default. Click **العربية** in the top bar to switch to Arabic — the
entire interface flips to a right-to-left layout, including the pain taxonomy
(structure names, pain names, descriptions, radiation and related structures) and the
full assessment wizard (step titles, every field label, every option, the summary and
all validation messages). The clinician-driven wording is translated with equal care
in both languages, and the body figure's left/right tooltips always report the
*patient's* side.

## Assessment wizard

The mode switch in the top bar selects between **Pain Assessment** (default) and
**Anatomy & Pain Classification**. The wizard is a physician-facing documentation
instrument: it collects structured clinical information and produces a clear
assessment summary. It does **not** autonomously diagnose, prescribe, or claim a
disease is present.

### The 14 steps

```
01  Patient information          age · sex · height · weight · pregnancy
02  Medical history              13 grouped chronic-disease categories + free text
03  Medications & risk factors   dynamic medication list · smoking · alcohol ·
                                   substances · visible disability · communication
04  Pain location                multi-region body map (Left / Right / Bilateral /
                                   Midline) + free-text location
05  Pain source                  10 tissue sources
06  Pain classification          nociceptive (somatic/visceral) · neuropathic ·
                                   nociplastic · mixed combinations · unclear
07  Pain characteristics         16 quality descriptors + free text
08  Intensity & time course      0–10 NRS (now/min/max/avg) · onset · trigger ·
                                   pattern · evolution
09  Radiation / factors          origin → destination (+ schematic diagram) ·
                                   21 aggravating · 11 relieving factors
10  Associated symptoms          19 symptoms + free text
11  Functional impact            5 domains on a 5-point scale
12  Previous pain history        prior episodes · 10 treatments · 5 responses
13  Clinical alerts              13 findings flagged for physician review
14  Assessment summary           grouped summary with an Edit action per section
```

### Behaviour

| Feature | What it does |
|---|---|
| **Progress indicator** | The sidebar lists all 14 steps with current / completed / remaining states, a progress bar and an "n of 13 steps complete" label. A step only counts as complete when it validates *and* has something recorded — optional steps left blank never inflate the bar. |
| **Validation** | Required fields block the Next button and list the problems in an error panel that takes focus. Required fields are marked `*`; conditional fields appear only when their parent answer is given (pregnancy after *female*, disease groups after *yes*, smoking detail after *current smoker*, medication rows after *takes medication*). |
| **Navigation** | Previous / Next, jump to any step from the sidebar, and an **Edit** action on every summary section that jumps straight back to that step. Data is preserved across navigation because it lives in a state object, not the DOM. |
| **Drafts** | Every change auto-saves to `localStorage` (with an in-memory fallback). A draft bar offers resume / discard; switching to the anatomy explorer with an unfinished assessment asks for confirmation first. The draft itself is never lost. |
| **NRS scale** | 0–10 buttons acting as a radio group with full keyboard support (arrow keys, inverted under RTL). Severity bands are conveyed by position, label and caption text — never by colour alone. |
| **Body-map location** | Front/back toggle; clicking a region adds it with a default laterality taken from the hotspot's patient-side. Each recorded region can be switched to Left / Right / Bilateral / Midline or removed. |
| **Clinical alerts** | Presented as "Clinical information requiring physician review" — recorded findings, never statements that the patient has a condition. |
| **Summary** | Grouped into four cards (patient & history, pain profile, impact & history, alerts) with entered data clearly separated from the computed presentation, a disclaimer that the record is not a diagnosis, and a print action that produces a clean printed summary. |
| **Languages** | The whole wizard switches between English and Arabic. Assessment data survives the switch. |

### State model

The wizard keeps one serializable state object (also what the draft persists):

```js
{
  patient:        { age, ageUnit, sex, height, weight, pregnancy, gestAge },
  medicalHistory: { has, diseases: [], other },
  medications:    { takes, list: [{ name, ingredient, category, dose,
                                   frequency, duration, reason, regularity }] },
  riskFactors:    { smoking, cigsPerDay, yearsSmoking, alcohol, substances,
                    disability, communication },
  painLocation:   { regions: { regionId: 'left'|'right'|'bilateral'|'midline' },
                    manual },
  painSource:      [],
  painMechanism:   [],
  painQuality:     [], qualityOther,
  timeCourse:      { onsetDate, onsetType, trigger, pattern, evolution },
  intensity:       { now, min, max, avg },
  radiation:       { radiates, origin, destination, direction },
  aggravatingFactors: [], relievingFactors: [],
  associatedSymptoms: [], associatedOther,
  functionalImpact:  { mobility, sleep, workStudy, adl, mood },
  previousHistory:   { similar, treatment: [], response, diagnosis },
  clinicalAlerts:    [], alertsOther,
  meta:              { startedAt, updatedAt }
}
```

`window.PAIN_WIZARD` exposes `init`, `refresh`, `activate`, `state`, `resetState`,
`loadDraftRaw`, `saveDraft`, `clearDraft`, `go`, `next`, `prev`, `stepComplete`,
`doneCount` and `hasData`.

## Project structure

```
index.html               app shell (topbar, mode switch, three-panel explorer,
                         assessment wizard, confirm modal)
css/styles.css           medical UI theme, wizard styling, responsive desktop +
                         tablet, print-friendly summary, RTL
js/i18n.js               UI string dictionary (en/ar), language state, lookups
js/bodymap.js            programmatic SVG human figure (front + back views),
                         region picker + radiation diagram for the wizard
js/app.js                mode switching, navigation, filters, search,
                         breadcrumbs, rendering
js/wizard.js             14-step assessment wizard (state, validation, drafts,
                         summary, print)
js/data/classification.js  reference taxonomy: mechanisms, durations, sensations,
                           referred-pain patterns, cross-cutting module list
js/data/assessment-options.js  wizard option sets: history, medications, risk
                               factors, source, mechanism, treatments, alerts
js/data/pain-descriptors.js    wizard option sets: quality, laterality, factors,
                               symptoms, impact scales
js/data/*.js             16 region/system data modules
scripts/dom-shim.js      tiny DOM implementation used by the tests
scripts/validate.js      schema + bodymap hotspot validator (node)
scripts/test-app.js      end-to-end explorer logic test through the DOM shim
scripts/test-wizard.js   end-to-end assessment wizard test through the DOM shim
scripts/test-modes.js    mode-switch + language integration test (DOM shim)
scripts/audit-coverage.js  verbatim taxonomy leaf coverage audit (node)
scripts/audit-arabic.js   Arabic translation coverage across all modules
scripts/audit-structure.js  required English fields + Arabic array parity
scripts/check-ar.js       rendered-output Arabic smoke test
scripts/add-module-ar.js   one-shot: inject module-level nameAr/blurbAr (node)
```

## Data model

Each region module registers itself on `window.PAIN_DATA_MODULES`:

```js
window.PAIN_DATA_MODULES = window.PAIN_DATA_MODULES || {};
window.PAIN_DATA_MODULES['abdomen'] = {
  id: 'abdomen',
  name: 'Abdomen',
  nameAr: 'البطن',                     // optional Arabic translation
  blurb: '…',
  blurbAr: '…',                        // optional Arabic translation
  structures: [
    {
      id: 'liver',
      name: 'Liver',
      nameAr: 'الكبد',                 // optional
      group: 'Solid organs',           // optional
      groupAr: 'الأعضاء الصلبة',       // optional
      painTypes: [
        {
          id: 'liver-region-pain',
          name: 'Liver-region pain',
          nameAr: 'ألم منطقة الكبد',     // optional Arabic translation
          category: 'Visceral pain',        // driving the color badges
          mechanisms: ['Nociceptive'],
          characteristics: ['Aching', 'Continuous'],
          duration: ['Acute', 'Chronic'],
          radiation: ['Right shoulder', 'Right scapula'],
          radiationAr: ['الكتف الأيمن', 'لوح الكتف الأيمن'],  // mirror radiation[]
          related: ['Gallbladder', 'Biliary tract'],
          relatedAr: ['المرارة', 'الأقنية الصفراوية'],          // mirror related[]
          description: '…',                 // optional; auto-generated if absent
          descriptionAr: '…'                // optional Arabic translation
        }
      ]
    }
  ]
};
```

- `mechanisms` values must be one of `Nociceptive`, `Neuropathic`, `Nociplastic`, `Mixed` (at most two; use `Mixed` when more than one applies).
- `duration` values must be from `Acute`, `Chronic`, `Episodic`, `Recurrent`.
- `characteristics` entries come from the sensation vocabulary in
  `js/data/classification.js`.
- Every `*Ar` array must be the same length and order as its English counterpart.
  Arabic fields are all optional — the UI falls back to English where absent.
  Mechanisms, durations, sensations and categories are translated centrally by
  `js/i18n.js`, so only names, descriptions, radiation and related lists need
  per-entry translations.
- The body figure's clickable regions carry `data-module` / `data-structure` hints
  that resolve to structures by id, exact name, normalized name or prefix — so the
  figure and the data stay in sync even when a subagent authored the ids.

## Verifying

```bash
node scripts/validate.js          # schema checks + bodymap hotspot resolution
node scripts/test-app.js          # 78 end-to-end explorer checks (DOM shim)
node scripts/test-wizard.js       # 93 end-to-end assessment-wizard checks
node scripts/test-modes.js        # 15 mode-switch / language integration checks
node scripts/audit-coverage.js    # verbatim taxonomy leaf coverage per module
node scripts/audit-arabic.js      # Arabic translation coverage across all modules
node scripts/audit-structure.js   # required English fields + Arabic array parity
node scripts/check-ar.js          # rendered Arabic output smoke test
```

All are read-only with respect to the app. They need only node itself — no
npm install, no network.

## Content scale

16 modules, 117 anatomical structures, 869 classified pain types, covering head &
face, eye, ENT, neck, chest, back, abdomen, urinary, pelvis & reproductive, upper
limb, lower limb, musculoskeletal, skin & soft tissue, neuropathic, vascular and
generalized pain, plus the cross-cutting classification reference. Every structure
and pain type carries a full Arabic translation alongside the English, as does the
entire assessment wizard (14 step titles, ~90 field labels and hints, every option
in every option set, all validation messages and the summary).
