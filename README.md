# PAIN SCORE — Doctor Interface

Frontend-only interactive **medical anatomy and pain-classification** reference for
clinicians. A doctor navigates a human body model, selects an anatomical region and
structure, then reviews the pain categories, pain types and their characteristics
(mechanism, duration, sensations, radiation, related structures) — all from static
data files.

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
(structure names, pain names, descriptions, radiation and related structures).
The clinician-driven wording is translated with equal care in both languages, and
the body figure's left/right tooltips always report the *patient's* side.

## Project structure

```
index.html               app shell (topbar, three-panel layout, modal)
css/styles.css           medical UI theme, responsive desktop + tablet, RTL
js/i18n.js               UI string dictionary (en/ar), language state, lookups
js/bodymap.js            programmatic SVG human figure (front + back views)
js/app.js                navigation, filters, search, breadcrumbs, rendering
js/data/classification.js  reference taxonomy: mechanisms, durations, sensations,
                          referred-pain patterns, cross-cutting module list
js/data/*.js             16 region/system data modules
scripts/dom-shim.js      tiny DOM implementation used by the test
scripts/validate.js      schema + bodymap hotspot validator (node)
scripts/test-app.js      end-to-end logic test through the DOM shim (node)
scripts/audit-coverage.js  verbatim taxonomy leaf coverage audit (node)
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
node scripts/test-app.js          # 76 end-to-end interaction checks (DOM shim)
node scripts/audit-coverage.js    # verbatim taxonomy leaf coverage per module
node scripts/audit-arabic.js      # Arabic translation coverage across all modules
node scripts/audit-structure.js   # required English fields + Arabic array parity
```

All are read-only with respect to the app. They need only node itself — no
npm install, no network.

## Content scale

16 modules, 117 anatomical structures, 869 classified pain types, covering head &
face, eye, ENT, neck, chest, back, abdomen, urinary, pelvis & reproductive, upper
limb, lower limb, musculoskeletal, skin & soft tissue, neuropathic, vascular and
generalized pain, plus the cross-cutting classification reference. Every structure
and pain type carries a full Arabic translation alongside the English.
