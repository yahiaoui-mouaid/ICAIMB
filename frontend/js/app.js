/*
 * PAIN SCORE — application logic (frontend-only).
 *
 * Wires the interactive body map to the static pain taxonomy:
 *   Region → Structure / Organ → Pain category → Pain sub-types / characteristics
 *
 * No backend, no AI, no sensors. Every selection is made by the clinician.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------- data */

  var MODULE_ORDER = [
    'head-face', 'eye', 'ent', 'neck', 'chest', 'back', 'abdomen',
    'urinary', 'pelvis-repro', 'upper-limb', 'lower-limb',
    'musculoskeletal', 'skin-soft-tissue', 'vascular', 'neuropathic', 'generalized'
  ];

  var CL = window.PAIN_CLASSIFICATION || { mechanisms: [], durations: [], sensations: [], referredPain: [], note: '' };

  function modules() { return window.PAIN_DATA_MODULES || {}; }

  function moduleById(id) { return modules()[id]; }

  function moduleList() {
    return MODULE_ORDER.map(function (id) { return modules()[id]; }).filter(Boolean);
  }

  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

  /* Active-language helpers — fall back to English when a translation is absent. */
  function T(key) { return window.I18N ? window.I18N.t(key) : key; }
  function TF(key, vars) { return window.I18N ? window.I18N.tFmt(key, vars) : key; }
  function isAr() { return !!(window.I18N && window.I18N.isAr()); }

  function modName(m) { return isAr() && m.nameAr ? m.nameAr : m.name; }
  function structName(s) { return isAr() && s.nameAr ? s.nameAr : s.name; }
  function structGroup(s) { return isAr() && s.groupAr ? s.groupAr : s.group; }
  function painName(p) { return isAr() && p.nameAr ? p.nameAr : p.name; }
  function painCat(p) {
    if (isAr() && p.categoryAr) return p.categoryAr;
    if (isAr() && window.I18N) return window.I18N.catAr(p.category);
    return p.category;
  }
  function painDesc(entry) {
    var p = entry.pain;
    if (isAr() && p.descriptionAr) return p.descriptionAr;
    if (p.description) return p.description;
    return isAr()
      ? painName(p) + ' — ' + painCat(p) + ' يشمل ' + structName(entry.structure).toLowerCase() +
        ' في منطقة ' + modName(entry.module).toLowerCase() + '. يحدد الطبيب هذا التصنيف بناءً على الألم المُبلَّغ عنه أو المُلاحظ لدى المريض.'
      : p.name + ' — ' + p.category.toLowerCase() + ' pain involving the ' +
        entry.structure.name.toLowerCase() + ' of the ' + entry.module.name.toLowerCase() +
        ' region. The clinician selects this classification based on the patient\'s reported or observed pain.';
  }
  function mechLabel(m) { return isAr() && window.I18N ? window.I18N.mechAr(m) : m; }
  function durLabel(d) { return isAr() && window.I18N ? window.I18N.durAr(d) : d; }
  function sensLabel(c) { return isAr() && window.I18N ? window.I18N.sensAr(c) : c; }

  /* Resolve a structure by id or (fuzzy) name within a module. */
  function resolveStructure(mod, hint) {
    if (!mod || !hint) return null;
    var st = mod.structures.filter(function (s) { return s.id === hint; });
    if (st.length === 1) return st[0];
    st = mod.structures.filter(function (s) { return norm(s.name) === norm(hint); });
    if (st.length === 1) return st[0];
    st = mod.structures.filter(function (s) { return norm(s.name).replace(/ pain$/, '') === norm(hint).replace(/ pain$/, ''); });
    if (st.length === 1) return st[0];
    st = mod.structures.filter(function (s) { return norm(s.name).indexOf(norm(hint)) === 0 || norm(hint).indexOf(norm(s.name)) === 0; });
    return st.length === 1 ? st[0] : null;
  }

  /* Flatten every pain type with its module + structure context. */
  var ALL_PAINS = null;
  function allPains() {
    if (ALL_PAINS) return ALL_PAINS;
    ALL_PAINS = [];
    moduleList().forEach(function (m) {
      (m.structures || []).forEach(function (s) {
        (s.painTypes || []).forEach(function (p) {
          ALL_PAINS.push({ module: m, structure: s, pain: p });
        });
      });
    });
    return ALL_PAINS;
  }

  function findPain(id) {
    for (var i = 0; i < allPains().length; i++) {
      if (allPains()[i].pain.id === id) return allPains()[i];
    }
    return null;
  }

  function painDescription(entry) {
    return painDesc(entry);
  }

  /* ------------------------------------------------------------- state */

  var state = {
    view: 'front',
    moduleId: null,
    structureId: null,
    painId: null,
    mode: 'home',          // home | module | structure | pain | filtered
    appMode: 'assess',     // assess | explore
    query: '',
    filters: { mechanism: {}, duration: {}, characteristic: {} },
    recent: []
  };

  function filtersActive() {
    var f = state.filters;
    return Object.keys(f.mechanism).length + Object.keys(f.duration).length + Object.keys(f.characteristic).length > 0;
  }

  function matchesFilters(p) {
    var f = state.filters;
    var mk = Object.keys(f.mechanism), dk = Object.keys(f.duration), ck = Object.keys(f.characteristic);
    if (mk.length && !p.mechanisms.some(function (m) { return f.mechanism[m]; })) return false;
    if (dk.length && !(p.duration || []).some(function (d) { return f.duration[d]; })) return false;
    if (ck.length && !(p.characteristics || []).some(function (c) { return f.characteristic[c]; })) return false;
    return true;
  }

  /* ------------------------------------------------------------- helpers */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function badgeClass(category) {
    var c = norm(category);
    if (c.indexOf('visceral') >= 0) return 'visceral';
    if (c.indexOf('neuro') >= 0) return 'neuro';
    if (c.indexOf('vasc') >= 0 || c.indexOf('ischem') >= 0) return 'vasc';
    if (c.indexOf('nociplastic') >= 0) return 'noci';
    if (c.indexOf('mixed') >= 0) return 'mixed';
    if (c.indexOf('somatic') >= 0) return 'somatic';
    return '';
  }

  function catBadge(p) {
    return '<span class="badge badge-cat ' + badgeClass(p.category) + '">' + esc(painCat(p)) + '</span>';
  }
  function mechBadges(p) {
    return (p.mechanisms || []).map(function (m) {
      return '<span class="badge badge-mech">' + esc(mechLabel(m)) + '</span>';
    }).join('');
  }
  function durBadges(p) {
    return (p.duration || []).map(function (d) {
      return '<span class="badge badge-dur">' + esc(durLabel(d)) + '</span>';
    }).join('');
  }

  function $(sel) { return document.querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ------------------------------------------------------------- application mode */

  function setAppMode(mode) {
    if (mode !== 'assess' && mode !== 'explore') return;
    if (state.appMode === mode) return;
    state.appMode = mode;

    var explorer = $('#explorerView');
    var wizard = $('#wizardView');
    if (explorer) explorer.hidden = (mode !== 'explore');
    if (wizard) wizard.hidden = (mode !== 'assess');

    $$('.mode-btn').forEach(function (b) {
      var on = b.getAttribute('data-mode') === mode;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    /* The explorer's filters/search stay untouched; just refresh the notice. */
    applyNotice();
    if (mode === 'assess' && window.PAIN_WIZARD) window.PAIN_WIZARD.activate();
    if (mode === 'explore') render();
  }

  function applyNotice() {
    var n = $('.notice');
    if (!n) return;
    if (state.appMode === 'assess') {
      n.innerHTML = '<strong>' + T('noticeAssessTitle') + '</strong> ' + T('noticeAssessBody');
    } else {
      n.innerHTML = '<strong>' + T('noticeTitle') + '</strong> ' + T('noticeBody');
    }
  }

  /* ------------------------------------------------------------- navigation */

  function goHome() {
    state.moduleId = null; state.structureId = null; state.painId = null; state.mode = 'home';
    state.query = '';
    var si = $('#searchInput'); if (si) si.value = '';
    hideSearchResults();
    render();
  }

  function openModule(id) {
    if (!moduleById(id)) return;
    state.moduleId = id; state.structureId = null; state.painId = null;
    state.mode = filtersActive() ? 'filtered' : 'module';
    hideSearchResults(true);
    render();
  }

  function openStructure(moduleId, structureId) {
    var mod = moduleById(moduleId);
    if (!mod) return;
    var st = resolveStructure(mod, structureId);
    state.moduleId = moduleId;
    state.structureId = st ? st.id : null;
    state.painId = null;
    state.mode = filtersActive() ? 'filtered' : 'structure';
    hideSearchResults(true);
    render();
  }

  function openPain(painId) {
    var entry = findPain(painId);
    if (!entry) return;
    state.moduleId = entry.module.id;
    state.structureId = entry.structure.id;
    state.painId = painId;
    state.mode = 'pain';
    pushRecent(entry);
    hideSearchResults();
    render();
  }

  function pushRecent(entry) {
    state.recent = state.recent.filter(function (r) { return r.pain.id !== entry.pain.id; });
    state.recent.unshift({ module: entry.module, structure: entry.structure, pain: entry.pain });
    if (state.recent.length > 6) state.recent.length = 6;
  }

  /* ------------------------------------------------------------- breadcrumbs */

  function renderBreadcrumbs() {
    var bc = $('#breadcrumbs');
    var parts = ['<button class="crumb" data-nav="home" type="button">' + T('crumbHome') + '</button>'];
    var mod = state.moduleId ? moduleById(state.moduleId) : null;
    var st = mod && state.structureId ? resolveStructure(mod, state.structureId) : null;

    if (mod) {
      parts.push('<span class="crumb-sep">›</span>');
      if (state.mode === 'pain' || st) {
        parts.push('<button class="crumb" data-nav="module" type="button">' + esc(modName(mod)) + '</button>');
      } else {
        parts.push('<span class="crumb current">' + esc(modName(mod)) + '</span>');
      }
    }
    if (st) {
      parts.push('<span class="crumb-sep">›</span>');
      if (state.mode === 'pain') {
        parts.push('<button class="crumb" data-nav="structure" type="button">' + esc(structName(st)) + '</button>');
      } else {
        parts.push('<span class="crumb current">' + esc(structName(st)) + '</span>');
      }
    }
    if (state.mode === 'filtered' && !mod) {
      parts.push('<span class="crumb-sep">›</span><span class="crumb current">' + T('filteredTitle') + '</span>');
    }
    if (state.mode === 'pain') {
      var entry = findPain(state.painId);
      if (entry) {
        parts.push('<span class="crumb-sep">›</span><span class="crumb current">' + esc(painName(entry.pain)) + '</span>');
      }
    }
    bc.innerHTML = parts.join('');
  }

  /* ------------------------------------------------------------- views */

  function viewHome() {
    var cross = (window.CROSS_CUTTING_MODULES || []).concat(['urinary', 'pelvis-repro']);
    var recent = '';
    if (state.recent.length) {
      recent = '<div class="pd-section"><h4>' + T('recentTitle') + '</h4><div class="chips chips-wrap">' +
        state.recent.map(function (r) {
          return '<button class="chip" data-pain="' + esc(r.pain.id) + '" type="button">' + esc(painName(r.pain)) + '</button>';
        }).join('') + '</div></div>';
    }
    return '' +
      '<div class="detail-empty">' +
        '<div class="big">⚕</div>' +
        '<h3>' + T('homeTitle') + '</h3>' +
        '<p>' + T('homeBody') + '</p>' +
      '</div>' +
      '<div class="pd-section"><h4>' + T('flowTitle') + '</h4>' +
        '<ol class="pd-flow">' +
          '<li>' + T('flow1') + '</li>' +
          '<li>' + T('flow2') + '</li>' +
          '<li>' + T('flow3') + '</li>' +
          '<li>' + T('flow4') + '</li>' +
        '</ol></div>' +
      '<div class="pd-section"><h4>' + T('systemsTitle') + '</h4>' +
        '<div class="chips chips-wrap">' +
          cross.map(function (id) {
            var m = moduleById(id);
            return m ? '<button class="chip" data-module="' + esc(id) + '" type="button"><span class="dot"></span>' + esc(modName(m)) + '</button>' : '';
          }).join('') +
        '</div></div>' +
      recent;
  }

  function viewModule(mod) {
    var count = (mod.structures || []).reduce(function (a, s) { return a + (s.painTypes || []).length; }, 0);
    var groups = {};
    var noGroup = [];
    (mod.structures || []).forEach(function (s) {
      if (s.group) { (groups[s.group] = groups[s.group] || []).push(s); }
      else noGroup.push(s);
    });

    var html = '' +
      '<div class="module-head"><h2>' + esc(modName(mod)) + '</h2>' +
        (mod.blurb ? '<div class="module-blurb">' + esc(isAr() && mod.blurbAr ? mod.blurbAr : mod.blurb) + '</div>' : '') +
        '<div class="module-stats">' + TF('moduleStats', {
          s: (mod.structures || []).length, p: count }) + '</div>' +
      '</div>';

    html += '<div class="filter-summary">' + T('moduleSelect') + '</div>';

    function cards(list) {
      return '<div class="struct-grid">' + list.map(function (s) {
        var n = (s.painTypes || []).length;
        var matchN = filtersActive() ? (s.painTypes || []).filter(matchesFilters).length : n;
        return '<button class="struct-card" data-structure="' + esc(s.id) + '" type="button">' +
          '<h4>' + esc(structName(s)) + '</h4>' +
          '<span class="count">' + (filtersActive()
            ? TF('cardCountMatch', { n: matchN, m: n })
            : TF('cardCount', { n: n })) + '</span>' +
          (s.group ? '<span class="group-tag">' + esc(structGroup(s)) + '</span>' : '') +
          '</button>';
      }).join('') + '</div>';
    }

    Object.keys(groups).forEach(function (g) {
      html += '<div class="group-label">' + esc(g) + '</div>' + cards(groups[g]);
    });
    if (noGroup.length) {
      if (Object.keys(groups).length) html += '<div class="group-label">' + T('groupUngrouped') + '</div>';
      html += cards(noGroup);
    }
    return html;
  }

  function viewStructure(mod, st) {
    var html = '' +
      '<div class="module-head"><h2>' + esc(structName(st)) + '</h2>' +
        '<div class="module-blurb">' + esc(modName(mod)) +
          (st.group ? ' · ' + esc(structGroup(st)) : '') + '</div>' +
      '</div>';

    var list = st.painTypes || [];
    if (filtersActive()) {
      var n = list.filter(matchesFilters).length;
      html += '<div class="filter-summary">' + TF('structMatchSummary', { n: n, m: list.length }) +
        ' <button class="btn btn-tiny" id="clearFiltersInline" type="button">' + T('clearFilters') + '</button></div>';
    }
    html += '<div class="filter-summary">' + T('structPrompt') + '</div>';

    html += list.map(function (p) {
      var ok = !filtersActive() || matchesFilters(p);
      return '<button class="pain-row' + (ok ? '' : ' dimmed') + '" data-pain="' + esc(p.id) + '" type="button">' +
        '<span class="pname">' + esc(painName(p)) + '</span>' +
        (p.characteristics && p.characteristics.length ? '<span class="pchars">' + esc(p.characteristics.slice(0, 3).map(sensLabel).join(isAr() ? '، ' : ', ')) + '</span>' : '') +
        catBadge(p) +
        '<span class="arrow">›</span></button>';
    }).join('');
    return html;
  }

  function viewPain(entry) {
    var p = entry.pain;
    var sibs = entry.structure.painTypes || [];
    var related = sibs.filter(function (x) { return x.id !== p.id; }).slice(0, 6);

    return '' +
      '<div class="pain-detail">' +
        '<div class="pd-title">' + esc(painName(p)) + '</div>' +
        '<div class="pd-path">' + esc(modName(entry.module)) + ' › ' + esc(structName(entry.structure)) + '</div>' +
        '<div class="pd-badges">' + catBadge(p) + mechBadges(p) + durBadges(p) + '</div>' +
        '<div class="pd-section"><h4>' + T('descTitle') + '</h4><div class="pd-desc">' + esc(painDescription(entry)) + '</div></div>' +
        '<div class="pd-section"><h4>' + T('charsTitle') + '</h4>' +
          (p.characteristics && p.characteristics.length
            ? '<ul class="pd-list dot">' + p.characteristics.map(function (c) { return '<li>' + esc(sensLabel(c)) + '</li>'; }).join('') + '</ul>'
            : '<p class="panel-hint">' + T('charsNone') + '</p>') +
        '</div>' +
        '<div class="pd-section"><h4>' + T('durTitle') + '</h4>' +
          '<ul class="pd-list">' + (p.duration || []).map(function (d) { return '<li>' + esc(durLabel(d)) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="pd-section"><h4>' + T('radTitle') + '</h4>' +
          (p.radiation && p.radiation.length
            ? '<ul class="pd-list">' + p.radiation.map(function (r, i) {
                return '<li>' + esc((isAr() && p.radiationAr && p.radiationAr[i]) ? p.radiationAr[i] : r) + '</li>';
              }).join('') + '</ul>'
            : '<p class="panel-hint">' + T('radNone') + '</p>') +
        '</div>' +
        '<div class="pd-section"><h4>' + T('relTitle') + '</h4>' +
          (p.related && p.related.length
            ? '<ul class="pd-list">' + p.related.map(function (r, i) {
                return '<li>' + esc((isAr() && p.relatedAr && p.relatedAr[i]) ? p.relatedAr[i] : r) + '</li>';
              }).join('') + '</ul>'
            : '<p class="panel-hint">' + T('relNone') + '</p>') +
        '</div>' +
        (related.length
          ? '<div class="pd-section"><h4>' + T('relIn') + ' ' + esc(structName(entry.structure)) + '</h4>' +
            '<div class="chips chips-wrap">' + related.map(function (r) {
              return '<button class="chip" data-pain="' + esc(r.id) + '" type="button">' + esc(painName(r)) + '</button>';
            }).join('') + '</div></div>'
          : '') +
        '<div class="pd-nav">' +
          '<button class="btn btn-tiny" data-nav="structure" type="button">' + T('backTo') + ' ' + esc(structName(entry.structure)) + '</button>' +
          '<button class="btn btn-tiny" data-nav="module" type="button">' + T('backTo') + ' ' + esc(modName(entry.module)) + '</button>' +
        '</div>' +
        '<div class="pd-note">' + T('clinicianNote') + '</div>' +
      '</div>';
  }

  function viewFiltered() {
    var matches = allPains().filter(function (e) { return matchesFilters(e.pain); });
    var byModule = {};
    matches.forEach(function (e) {
      (byModule[e.module.id] = byModule[e.module.id] || []).push(e);
    });

    var html = '<div class="module-head"><h2>' + T('filteredTitle') + '</h2>' +
      '<div class="module-stats">' + TF('filteredStats', {
        n: matches.length, m: Object.keys(byModule).length }) + '</div></div>';

    if (!matches.length) {
      html += '<div class="detail-empty"><div class="big">∅</div><h3>' + T('noMatchTitle') + '</h3>' +
        '<p>' + T('noMatchBody') + '</p></div>';
    } else {
      MODULE_ORDER.forEach(function (id) {
        if (!byModule[id]) return;
        var mod = moduleById(id);
        html += '<div class="result-group"><h4 data-module="' + esc(id) + '">' + esc(modName(mod)) +
          ' <span style="color:var(--ink-mute);font-weight:400">(' + byModule[id].length + ')</span></h4>' +
          byModule[id].map(function (e) {
            return '<button class="pain-row" data-pain="' + esc(e.pain.id) + '" type="button">' +
              '<span class="pname">' + esc(painName(e.pain)) + '</span>' +
              '<span class="pchars">' + esc(structName(e.structure)) + '</span>' +
              catBadge(e.pain) + '<span class="arrow">›</span></button>';
          }).join('') + '</div>';
      });
    }
    return html;
  }

  /* ------------------------------------------------------------- render */

  function render() {
    renderBreadcrumbs();
    renderBodyState();
    renderHint();

    var detail = $('#detail');
    var mod = state.moduleId ? moduleById(state.moduleId) : null;
    var st = mod && state.structureId ? resolveStructure(mod, state.structureId) : null;

    switch (state.mode) {
      case 'module': detail.innerHTML = mod ? viewModule(mod) : viewHome(); break;
      case 'structure': detail.innerHTML = (mod && st) ? viewStructure(mod, st) : viewHome(); break;
      case 'pain':
        var entry = findPain(state.painId);
        detail.innerHTML = entry ? viewPain(entry) : viewHome();
        break;
      case 'filtered': detail.innerHTML = mod ? viewFilteredModule(mod) : viewFiltered(); break;
      default: detail.innerHTML = viewHome();
    }
    var scroll = $('.detail-scroll');
    if (scroll) scroll.scrollTop = 0;
    $('#clearFiltersBtn').hidden = !filtersActive();
  }

  /* Filtered view scoped to one module (reached while a region is selected). */
  function viewFilteredModule(mod) {
    var matches = (mod.structures || []).reduce(function (arr, s) {
      (s.painTypes || []).forEach(function (p) {
        if (matchesFilters(p)) arr.push({ module: mod, structure: s, pain: p });
      });
      return arr;
    }, []);

    var html = '<div class="module-head"><h2>' + esc(modName(mod)) + ' — ' + T('filteredTitle') + '</h2>' +
      '<div class="module-stats">' + TF('filteredModuleStats', { n: matches.length }) +
      ' · <button class="btn btn-tiny" id="allResultsBtn" type="button">' + T('showAll') + '</button></div></div>';

    if (!matches.length) {
      html += '<div class="detail-empty"><div class="big">∅</div><h3>' + T('noMatchRegionTitle') + '</h3>' +
        '<p>' + TF('noMatchRegionBody', { module: esc(modName(mod)) }) + '</p></div>';
    } else {
      html += matches.map(function (e) {
        return '<button class="pain-row" data-pain="' + esc(e.pain.id) + '" type="button">' +
          '<span class="pname">' + esc(painName(e.pain)) + '</span>' +
          '<span class="pchars">' + esc(structName(e.structure)) + '</span>' +
          catBadge(e.pain) + '<span class="arrow">›</span></button>';
      }).join('');
    }
    return html;
  }

  /* ------------------------------------------------------------- body map */

  function regionLabel(el, view) {
    var side = el.getAttribute('data-side');
    var label = isAr()
      ? (el.getAttribute('data-label-ar') || el.getAttribute('data-label') || '')
      : (el.getAttribute('data-label') || '');
    if (!side) return label;
    var sideWord = '';
    if (isAr()) {
      /* In the back view the figure's right edge is the patient's left. */
      sideWord = ((side === 'r') === (view === 'back')) ? T('sideRight') : T('sideLeft');
    } else {
      sideWord = ((side === 'r') === (view === 'back')) ? 'Right' : 'Left';
    }
    return sideWord + ' ' + label;
  }

  /* Keep the caption under the body model in sync with the current state. */
  function renderHint() {
    var hint = $('#bodyHint');
    if (!hint) return;
    var mod = state.moduleId ? moduleById(state.moduleId) : null;
    if (mod) {
      hint.textContent = T('hintRegion') + ' ' + modName(mod) + ' ' + T('hintSwitch') +
        (state.view === 'back' ? ' ' + T('hintBack') : '');
    } else if (filtersActive()) {
      hint.textContent = T('hintFiltered');
    } else {
      hint.textContent = T('hintStart');
    }
  }

  function renderBodyState() {
    var active = $('.body-view.is-active .body-svg');
    if (!active) return;
    var modName = state.moduleId && moduleById(state.moduleId) ? moduleById(state.moduleId).name : null;

    /* modules containing pain types that match active filters / search */
    var matchModules = null;
    if (filtersActive() || state.query.trim()) {
      matchModules = {};
      allPains().forEach(function (e) {
        if (matchModules[e.module.id]) return;
        if (filtersActive() && !matchesFilters(e.pain)) return;
        if (state.query.trim() && !painMatchesQuery(e.pain, state.query)) return;
        matchModules[e.module.id] = true;
      });
    }

    $$('.region', active).forEach(function (el) {
      el.classList.remove('current', 'has-match', 'dimmed');
      var mid = el.getAttribute('data-module');
      if (modName && mid === state.moduleId) el.classList.add('current');
      if (matchModules) {
        if (matchModules[mid]) el.classList.add('has-match');
        else el.classList.add('dimmed');
      }
    });
  }

  function buildBody() {
    var front = $('#bodyFront'), back = $('#bodyBack');
    /* Clear any previously built figure so re-initialising (e.g. on language
       switch) does not stack duplicate SVGs. */
    if (front) front.innerHTML = '';
    if (back) back.innerHTML = '';
    if (front && window.BODY_MAP) front.appendChild(window.BODY_MAP.build('front'));
    if (back && window.BODY_MAP) back.appendChild(window.BODY_MAP.build('back'));

    [front, back].forEach(function (container) {
      if (!container) return;
      var view = container.getAttribute('id') === 'bodyBack' ? 'back' : 'front';
      $$('.region', container).forEach(function (el) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', regionLabel(el, view) + ' — click to explore');

        el.addEventListener('click', function () {
          var mid = el.getAttribute('data-module');
          var struct = el.getAttribute('data-structure');
          if (struct) openStructure(mid, struct);
          else openModule(mid);
        });
        el.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.click(); }
        });

        el.addEventListener('mouseenter', function (ev) { showTooltip(el, view, ev); });
        el.addEventListener('mousemove', function (ev) { moveTooltip(ev); });
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('focus', function () {
          var r = el.getBoundingClientRect();
          showTooltip(el, view, { clientX: r.left + r.width / 2, clientY: r.top + 8 });
        });
        el.addEventListener('blur', hideTooltip);
      });
    });
  }

  function setView(view) {
    state.view = view;
    $('#bodyFront').classList.toggle('is-active', view === 'front');
    $('#bodyBack').classList.toggle('is-active', view === 'back');
    $$('.view-btn').forEach(function (b) {
      var on = b.getAttribute('data-view') === view;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderBodyState();
  }

  /* ------------------------------------------------------------- tooltip */

  function showTooltip(el, view, ev) {
    var tip = $('#tooltip');
    var mid = el.getAttribute('data-module');
    var mod = moduleById(mid);
    tip.innerHTML = '<span>' + esc(regionLabel(el, view)) + '</span>' +
      '<span class="tt-sub">' + (mod ? esc(modName(mod)) : '') + ' ' + T('clickExplore') + '</span>';
    tip.hidden = false;
    moveTooltip(ev);
  }
  function moveTooltip(ev) {
    var tip = $('#tooltip');
    tip.style.left = ev.clientX + 'px';
    tip.style.top = ev.clientY + 'px';
  }
  function hideTooltip() { $('#tooltip').hidden = true; }

  /* ------------------------------------------------------------- filters UI */

  function buildFilters() {
    function chip(kind, label, cls) {
      return '<button class="chip ' + (cls || '') + '" data-fkind="' + kind + '" data-fval="' + esc(label) +
        '" type="button" aria-pressed="false"><span class="dot"></span>' + esc(label) + '</button>';
    }
    $('#mechanismChips').innerHTML = CL.mechanisms.map(function (m) { return chip('mechanism', m.id); }).join('');
    $('#durationChips').innerHTML = CL.durations.map(function (d) { return chip('duration', d.id); }).join('');
    $('#sensationChips').innerHTML = CL.sensations.map(function (s) { return chip('characteristic', s); }).join('');
  }

  function syncFilterChips() {
    $$('[data-fkind]').forEach(function (b) {
      var kind = b.getAttribute('data-fkind'), val = b.getAttribute('data-fval');
      b.setAttribute('aria-pressed', !!state.filters[kind][val]);
    });
  }

  function toggleFilter(kind, val) {
    if (state.filters[kind][val]) delete state.filters[kind][val];
    else state.filters[kind][val] = true;
    syncFilterChips();
    if (filtersActive() && state.mode !== 'pain') state.mode = state.moduleId ? 'filtered' : 'filtered';
    if (!filtersActive() && state.mode === 'filtered') state.mode = state.structureId ? 'structure' : (state.moduleId ? 'module' : 'home');
    render();
  }

  function clearFilters() {
    state.filters = { mechanism: {}, duration: {}, characteristic: {} };
    syncFilterChips();
    if (state.mode === 'filtered') state.mode = state.structureId ? 'structure' : (state.moduleId ? 'module' : 'home');
    render();
  }

  /* ------------------------------------------------------------- quick access */

  function buildQuickAccess() {
    var ids = (window.CROSS_CUTTING_MODULES || []).concat(['urinary', 'pelvis-repro']);
    $('#quickAccess').innerHTML = ids.map(function (id) {
      var m = moduleById(id);
      return m ? '<button class="chip" data-module="' + esc(id) + '" type="button"><span class="dot"></span>' + esc(modName(m)) + '</button>' : '';
    }).join('');
  }

  /* ------------------------------------------------------------- search */

  function painMatchesQuery(p, q) {
    q = norm(q);
    if (!q) return true;
    var hay = [p.name, p.nameAr, p.category].concat(p.mechanisms || [], p.characteristics || [],
      p.duration || [], p.radiation || [], p.radiationAr || [], p.related || [], p.relatedAr || [],
      [p.description || '', p.descriptionAr || '']).join(' ');
    return norm(hay).indexOf(q) >= 0;
  }

  function runSearch(q) {
    state.query = q;
    if (!q.trim()) { hideSearchResults(); renderBodyState(); return; }
    var results = [];
    /* pain types */
    allPains().forEach(function (e) {
      if (painMatchesQuery(e.pain, q)) {
        var score = norm(painName(e.pain)).indexOf(norm(q)) === 0 ? 0 : norm(painName(e.pain)).indexOf(norm(q)) > 0 ? 1 : 2;
        results.push({ score: score, type: T('srPain'), name: painName(e.pain),
          path: modName(e.module) + ' › ' + structName(e.structure), painId: e.pain.id });
      }
    });
    /* structures */
    moduleList().forEach(function (m) {
      (m.structures || []).forEach(function (s) {
        if (norm(structName(s)).indexOf(norm(q)) >= 0 || (s.nameAr && norm(s.nameAr).indexOf(norm(q)) >= 0)) {
          results.push({ score: 1, type: T('srStruct'), name: structName(s), path: modName(m),
            moduleId: m.id, structureId: s.id });
        }
      });
    });
    /* modules */
    moduleList().forEach(function (m) {
      if (norm(modName(m)).indexOf(norm(q)) >= 0 || (m.nameAr && norm(m.nameAr).indexOf(norm(q)) >= 0)) {
        results.push({ score: 2, type: T('srRegion'), name: modName(m), path: T('srRegionPath'), moduleId: m.id });
      }
    });
    results.sort(function (a, b) { return a.score - b.score; });
    results = results.slice(0, 12);

    var box = $('#searchResults');
    if (!results.length) {
      box.innerHTML = '<div class="sr-empty">' + T('searchNone') + '</div>';
    } else {
      var lastType = '';
      box.innerHTML = results.map(function (r) {
        var head = r.type !== lastType ? '<div class="sr-group">' + esc(r.type) + '</div>' : '';
        lastType = r.type;
        return head + '<button class="sr-item" type="button" data-pain="' + esc(r.painId || '') +
          '" data-module="' + esc(r.moduleId || '') + '" data-structure="' + esc(r.structureId || '') + '">' +
          esc(r.name) + '<span class="sr-path">' + esc(r.path) + '</span></button>';
      }).join('');
    }
    box.hidden = false;
    renderBodyState();
  }

  function hideSearchResults(clearInput) {
    $('#searchResults').hidden = true;
    if (state.query) { state.query = ''; }
    if (clearInput) { var si = $('#searchInput'); if (si) si.value = ''; }
  }

  /* ------------------------------------------------------------- language */

  /* Apply direction + lang attributes and refresh every static label. */
  function applyLang() {
    var ar = isAr();
    document.documentElement.setAttribute('dir', ar ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', ar ? 'ar' : 'en');
    document.title = T('docTitle');

    var si = $('#searchInput');
    if (si) {
      si.setAttribute('placeholder', T('searchPlaceholder'));
      si.setAttribute('aria-label', T('searchLabel'));
    }
    setText('.brand-sub', T('brandSub'));
    setText('.role-badge', T('roleBadge'));
    setText('#refBtn', T('refBtn'));
    setText('#homeBtn', T('homeBtn'));
    setText('#langBtn', T('langToggle'));
    setHtml('.notice', '<strong>' + T('noticeTitle') + '</strong> ' + T('noticeBody'));
    applyNotice();
    setText('.mode-btn[data-mode="assess"]', T('modeAssess'));
    setText('.mode-btn[data-mode="explore"]', T('modeExplore'));
    setText('.panel-left h2', T('filtersTitle'));
    setText('.panel-left .panel-hint', T('filtersHint'));
    setText('[data-filter="mechanisms"] h3', T('mech'));
    setText('[data-filter="durations"] h3', T('dur'));
    setText('[data-filter="characteristics"] h3', T('sens'));
    $('#clearFiltersBtn').textContent = T('clearAll');
    $('.panel-center .view-btn[data-view="front"]').textContent = T('frontView');
    $('.panel-center .view-btn[data-view="back"]').textContent = T('backView');
    setText('.quick-access h3', T('quickTitle'));
    $('#modalTitle').textContent = T('refTitle');
    $('#modalClose').setAttribute('aria-label', T('close'));
    $('.panel-left').setAttribute('aria-label', T('filtersAria'));
    $('.panel-center').setAttribute('aria-label', T('bodyAria'));
    $('#detailPanel').setAttribute('aria-label', T('detailAria'));

    /* Rebuild language-dependent dynamic content */
    buildQuickAccess();
    syncFilterChips();
    buildBody();
    render();
    if (window.PAIN_WIZARD) window.PAIN_WIZARD.refresh();
  }

  function setText(sel, val) {
    var el = $(sel);
    if (el) el.textContent = val;
  }
  function setHtml(sel, val) {
    var el = $(sel);
    if (el) el.innerHTML = val;
  }

  function toggleLang() {
    window.I18N.setLang(window.I18N.otherLang());
    applyLang();
  }

  /* Ask before leaving an incomplete assessment for the explorer. The draft
   * itself is preserved either way — only the view changes. */
  function askLeaveExplore() {
    var m = $('#wizConfirm');
    if (!m) { setAppMode('explore'); return; }
    $('#wizConfirmTitle').textContent = T('wizConfirmLeaveTitle');
    $('#wizConfirmBody').textContent = T('wizConfirmLeaveBody');
    $('#wizConfirmYes').textContent = T('wizYes');
    $('#wizConfirmNo').textContent = T('wizNo');
    m.hidden = false;
    pendingLeave = true;
  }
  var pendingLeave = false;
  /* ------------------------------------------------------------- reference modal */

  function openReference() {
    var body = $('#modalBody');
    var ar = isAr();
    var html = '';
    html += '<h3>' + T('refMech') + '</h3>';
    CL.mechanisms.forEach(function (m) {
      html += '<p><strong>' + esc(ar && m.nameAr ? m.nameAr : m.name) + '.</strong> ' +
        esc(ar && m.defAr ? m.defAr : m.def) + '</p>';
      html += '<ul>' + (ar && m.includesAr ? m.includesAr : m.includes).map(function (i) {
        return '<li>' + esc(i) + '</li>';
      }).join('') + '</ul>';
    });
    html += '<h3>' + T('refDur') + '</h3>';
    html += '<table class="ref-table"><thead><tr><th>' + T('refDurTh1') + '</th><th>' + T('refDurTh2') + '</th></tr></thead><tbody>';
    CL.durations.forEach(function (d) {
      html += '<tr><td><strong>' + esc(ar && d.nameAr ? d.nameAr : d.name) + '</strong></td><td>' +
        esc(ar && d.defAr ? d.defAr : d.def) + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<h3>' + T('refSens') + '</h3>';
    html += '<div class="chips chips-wrap">' + CL.sensations.map(function (s) {
      return '<span class="chip" style="cursor:default">' + esc(sensLabel(s)) + '</span>';
    }).join('') + '</div>';
    html += '<h3>' + T('refRad') + '</h3>';
    html += '<table class="ref-table"><thead><tr><th>' + T('refRadTh1') + '</th><th>' + T('refRadTh2') + '</th><th>' + T('refRadTh3') + '</th></tr></thead><tbody>';
    CL.referredPain.forEach(function (r) {
      html += '<tr><td>' + esc(ar && r.fromAr ? r.fromAr : r.from) + '</td><td>' +
        esc(ar && r.toAr ? r.toAr : r.to) + '</td><td>' +
        esc(ar && r.exampleAr ? r.exampleAr : r.example) + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<div class="note-box">' + esc(ar && CL.noteAr ? CL.noteAr : CL.note) + '</div>';
    body.innerHTML = html;
    $('#modal').hidden = false;
  }
  function closeReference() { $('#modal').hidden = true; }

  /* ------------------------------------------------------------- events */

  function bindEvents() {
    /* view toggle */
    $$('.view-btn').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.getAttribute('data-view')); });
    });

    /* search */
    var si = $('#searchInput');
    si.addEventListener('input', function () { runSearch(si.value); });
    si.addEventListener('focus', function () { if (si.value.trim()) runSearch(si.value); });
    si.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { si.value = ''; hideSearchResults(); renderBodyState(); si.blur(); }
      if (ev.key === 'Enter') {
        var first = $('#searchResults .sr-item');
        if (first) first.click();
      }
    });
    document.addEventListener('click', function (ev) {
      if (!ev.target.closest('.search-wrap')) hideSearchResults();
    });

    /* search result clicks (delegated) */
    $('#searchResults').addEventListener('click', function (ev) {
      var item = ev.target.closest('.sr-item');
      if (!item) return;
      if (item.getAttribute('data-pain')) openPain(item.getAttribute('data-pain'));
      else if (item.getAttribute('data-structure')) openStructure(item.getAttribute('data-module'), item.getAttribute('data-structure'));
      else openModule(item.getAttribute('data-module'));
      si.value = ''; hideSearchResults();
      ev.stopPropagation();
    });

    /* filters + navigation (delegated) */
    document.addEventListener('click', function (ev) {
      /* Body-map regions handle their own clicks. */
      if (ev.target.closest('.region')) return;

      var chip = ev.target.closest('[data-fkind]');
      if (chip) { toggleFilter(chip.getAttribute('data-fkind'), chip.getAttribute('data-fval')); return; }

      var clear = ev.target.closest('#clearFiltersBtn, #clearFiltersInline');
      if (clear) { clearFilters(); return; }

      var allRes = ev.target.closest('#allResultsBtn');
      if (allRes) { state.moduleId = null; state.structureId = null; state.mode = 'filtered'; render(); return; }

      var mod = ev.target.closest('[data-module]');
      if (mod) { openModule(mod.getAttribute('data-module')); return; }

      var st = ev.target.closest('[data-structure]');
      if (st) { openStructure(state.moduleId, st.getAttribute('data-structure')); return; }

      var pain = ev.target.closest('[data-pain]');
      if (pain) { openPain(pain.getAttribute('data-pain')); return; }

      var nav = ev.target.closest('[data-nav]');
      if (nav) {
        var target = nav.getAttribute('data-nav');
        if (target === 'home') goHome();
        else if (target === 'module') openModule(state.moduleId);
        else if (target === 'structure') openStructure(state.moduleId, state.structureId);
        return;
      }
    });

    /* header buttons */
    $('#refBtn').addEventListener('click', openReference);
    $('#homeBtn').addEventListener('click', goHome);
    $('#langBtn').addEventListener('click', toggleLang);
    $('#modalClose').addEventListener('click', closeReference);
    $('#modalBackdrop').addEventListener('click', closeReference);

    /* application mode switch */
    $$('.mode-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var to = b.getAttribute('data-mode');
        if (to === 'explore') {
          var busy = window.PAIN_WIZARD && window.PAIN_WIZARD.hasData();
          if (busy) {
            askLeaveExplore();
            return;
          }
        }
        setAppMode(to);
      });
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        if (!$('#modal').hidden) closeReference();
        else if (!$('#searchResults').hidden) hideSearchResults();
      }
    });

    /* assessment confirm dialog (shared with the wizard) */
    var wc = $('#wizConfirm');
    if (wc) {
      $('#wizConfirmNo').addEventListener('click', function () { wc.hidden = true; pendingLeave = false; });
      $('#wizConfirmBackdrop').addEventListener('click', function () { wc.hidden = true; pendingLeave = false; });
      $('#wizConfirmYes').addEventListener('click', function () {
        wc.hidden = true;
        if (pendingLeave) { pendingLeave = false; setAppMode('explore'); }
      });
    }
  }

  /* ------------------------------------------------------------- init */

  function missingModules() {
    return MODULE_ORDER.filter(function (id) { return !moduleById(id); });
  }

  function init() {
    var missing = missingModules();
    if (missing.length) {
      console.warn('PAIN SCORE: missing data modules: ' + missing.join(', '));
    }
    applyStaticLabels();
    applyNotice();
    buildBody();
    buildFilters();
    buildQuickAccess();
    bindEvents();
    render();
    if (window.PAIN_WIZARD) window.PAIN_WIZARD.init();
  }

  /* First-pass label application (English defaults already live in the markup). */
  function applyStaticLabels() {
    document.title = T('docTitle');
    var si = $('#searchInput');
    if (si) {
      si.setAttribute('placeholder', T('searchPlaceholder'));
      si.setAttribute('aria-label', T('searchLabel'));
    }
    setText('.brand-sub', T('brandSub'));
    setText('.role-badge', T('roleBadge'));
    setText('#refBtn', T('refBtn'));
    setText('#homeBtn', T('homeBtn'));
    setText('#langBtn', T('langToggle'));
    setHtml('.notice', '<strong>' + T('noticeTitle') + '</strong> ' + T('noticeBody'));
    applyNotice();
    setText('.mode-btn[data-mode="assess"]', T('modeAssess'));
    setText('.mode-btn[data-mode="explore"]', T('modeExplore'));
    setText('.panel-left h2', T('filtersTitle'));
    setText('.panel-left .panel-hint', T('filtersHint'));
    setText('[data-filter="mechanisms"] h3', T('mech'));
    setText('[data-filter="durations"] h3', T('dur'));
    setText('[data-filter="characteristics"] h3', T('sens'));
    $('#clearFiltersBtn').textContent = T('clearAll');
    $('.panel-center .view-btn[data-view="front"]').textContent = T('frontView');
    $('.panel-center .view-btn[data-view="back"]').textContent = T('backView');
    setText('.quick-access h3', T('quickTitle'));
    $('#modalTitle').textContent = T('refTitle');
    $('#modalClose').setAttribute('aria-label', T('close'));
    $('.panel-left').setAttribute('aria-label', T('filtersAria'));
    $('.panel-center').setAttribute('aria-label', T('bodyAria'));
    $('#detailPanel').setAttribute('aria-label', T('detailAria'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
