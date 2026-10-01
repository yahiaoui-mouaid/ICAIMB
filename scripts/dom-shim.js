/* Minimal DOM shim — just enough of the DOM to run bodymap.js + app.js under node. */
(function (global) {
  var VOID = {
    area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1,
    input: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1
  };

  function ClassList(el) { this.el = el; this.set = new Set(); }
  ClassList.prototype._sync = function () {
    this.el.attrs['class'] = Array.from(this.set).join(' ');
  };
  ClassList.prototype.add = function (c) { this.set.add(c); this._sync(); };
  ClassList.prototype.remove = function (c) { this.set.delete(c); this._sync(); };
  ClassList.prototype.toggle = function (c, on) {
    if (on === undefined) on = !this.set.has(c);
    if (on) this.set.add(c); else this.set.delete(c);
    this._sync();
  };
  ClassList.prototype.contains = function (c) { return this.set.has(c); };

  function El(tag) {
    this.tag = tag.toLowerCase();
    this.attrs = {};
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.classList = new ClassList(this);
    this.style = {};
    this._text = '';
    this.value = '';
    this.scrollTop = 0;
  }
  Object.defineProperty(El.prototype, 'hidden', {
    get: function () { return this.attrs.hidden !== undefined; },
    set: function (v) { if (v) this.attrs.hidden = ''; else delete this.attrs.hidden; }
  });
  Object.defineProperty(El.prototype, 'textContent', {
    get: function () {
      if (this.tag === '#text') return this._text;
      return this.children.map(function (c) { return c.textContent; }).join('');
    },
    set: function (v) {
      this._text = String(v);
      this.children = [];
      var node = new El('#text');
      node._text = String(v);
      node.parent = this;
      this.children.push(node);
    }
  });
  Object.defineProperty(El.prototype, 'innerHTML', {
    get: function () { return this._html || ''; },
    set: function (v) { this._html = String(v); this.children = parseFragment(String(v)); this.children.forEach(function (c) { c.parent = this; }, this); }
  });
  El.prototype.setAttribute = function (k, v) {
    this.attrs[k] = String(v);
    if (k === 'class') { this.classList.set = new Set(String(v).split(/\s+/).filter(Boolean)); }
  };
  El.prototype.getAttribute = function (k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; };
  El.prototype.appendChild = function (c) { this.children.push(c); c.parent = this; return c; };
  El.prototype.addEventListener = function (t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); };
  El.prototype.removeEventListener = function (t, fn) {
    if (!this.listeners[t]) return;
    this.listeners[t] = this.listeners[t].filter(function (f) { return f !== fn; });
  };
  El.prototype.dispatchEvent = function (ev) {
    ev.target = ev.target || this;
    ev.stopPropagation = ev.stopPropagation || function () { ev._stopped = true; };
    ev.preventDefault = ev.preventDefault || function () {};
    var ls = this.listeners[ev.type] || [];
    for (var i = 0; i < ls.length; i++) ls[i].call(this, ev);
    if (!ev._stopped && this.parent && this.parent.dispatchEvent) this.parent.dispatchEvent(ev);
  };
  El.prototype.click = function () { this.dispatchEvent({ type: 'click', target: this }); };
  El.prototype.focus = function () { this.dispatchEvent({ type: 'focus', target: this }); };
  El.prototype.blur = function () { this.dispatchEvent({ type: 'blur', target: this }); };
  El.prototype.matches = function (sel) { return matchesSel(this, sel); };
  El.prototype.closest = function (sel) {
    var node = this;
    while (node) { if (matchesSel(node, sel)) return node; node = node.parent; }
    return null;
  };
  El.prototype.querySelector = function (sel) { return queryAll(this, sel)[0] || null; };
  El.prototype.querySelectorAll = function (sel) { return queryAll(this, sel); };

  /* ---- tiny HTML parser ---- */
  function tokenize(html) {
    var tokens = [];
    var i = 0, n = html.length;
    while (i < n) {
      if (html[i] === '<') {
        var end = html.indexOf('>', i);
        if (end < 0) break;
        var raw = html.slice(i + 1, end);
        if (raw[0] === '/') { tokens.push({ t: 'close', tag: raw.slice(1).trim() }); }
        else if (raw[raw.length - 1] === '/') { tokens.push({ t: 'open', tag: raw.slice(0, -1).trim(), self: true }); }
        else { tokens.push({ t: 'open', tag: raw.trim() }); }
        i = end + 1;
      } else {
        var lt = html.indexOf('<', i);
        if (lt < 0) lt = n;
        tokens.push({ t: 'text', value: html.slice(i, lt) });
        i = lt;
      }
    }
    return tokens;
  }

  function parseAttrs(str) {
    var attrs = {};
    var re = /([^\s=]+)\s*=\s*"([^"]*)"/g;
    var m;
    while ((m = re.exec(str))) attrs[m[1].toLowerCase()] = m[2];
    str.replace(/([^\s=]+)/g, function (w) { if (!(w.toLowerCase() in attrs)) attrs[w.toLowerCase()] = ''; return w; });
    return attrs;
  }

  function parseFragment(html) {
    var tokens = tokenize(html);
    var stack = [], out = [];
    var cur = null;
    tokens.forEach(function (tk) {
      if (tk.t === 'text') {
        if (/[^\s]/.test(tk.value)) {
          var el = new El('#text');
          el.textContent = tk.value;
          if (cur) cur.appendChild(el); else out.push(el);
        }
      } else if (tk.t === 'open') {
        var name = tk.tag.split(/\s+/)[0].toLowerCase();
        var el2 = new El(name);
        var attrs = parseAttrs(tk.tag.slice(name.length));
        Object.keys(attrs).forEach(function (k) { el2.setAttribute(k, attrs[k]); });
        if (cur) cur.appendChild(el2); else out.push(el2);
        if (!(name in VOID) && !tk.self) { stack.push(cur); cur = el2; }
      } else if (tk.t === 'close') {
        if (cur && cur.tag === tk.tag.toLowerCase()) cur = stack.pop();
      }
    });
    return out;
  }

  /* ---- selector engine (simple) ---- */
  function parseSel(part) {
    var re = /([.#]?[\w-]+|\[[^\]]+\])/g;
    var simple = { tag: null, id: null, classes: [], attrs: [] };
    var m;
    while ((m = re.exec(part))) {
      var s = m[1];
      if (s[0] === '#') simple.id = s.slice(1);
      else if (s[0] === '.') simple.classes.push(s.slice(1));
      else if (s[0] === '[') {
        var inner = s.slice(1, -1);
        var eq = inner.indexOf('=');
        if (eq < 0) simple.attrs.push({ k: inner, v: null });
        else simple.attrs.push({ k: inner.slice(0, eq), v: inner.slice(eq + 1).replace(/^"|"$/g, '') });
      } else simple.tag = s.toLowerCase();
    }
    return simple;
  }

  function matchesSimple(el, simple) {
    if (!el || el.tag === '#text') return false;
    if (simple.tag && el.tag !== simple.tag) return false;
    if (simple.id && el.attrs.id !== simple.id) return false;
    for (var i = 0; i < simple.classes.length; i++) {
      if (!el.classList.set.has(simple.classes[i])) return false;
    }
    for (var j = 0; j < simple.attrs.length; j++) {
      var a = simple.attrs[j];
      if (!(a.k in el.attrs)) return false;
      if (a.v !== null && el.attrs[a.k] !== a.v) return false;
    }
    return true;
  }

  function matchesSel(el, sel) {
    return sel.split(',').some(function (alt) {
      var parts = alt.trim().split(/\s+/);
      /* the rightmost simple selector must match the element itself */
      if (!matchesSimple(el, parseSel(parts[parts.length - 1]))) return false;
      var node = el.parent;
      for (var i = parts.length - 2; i >= 0; i--) {
        var simple = parseSel(parts[i]);
        var found = false;
        while (node) {
          if (matchesSimple(node, simple)) { node = node.parent; found = true; break; }
          node = node.parent;
        }
        if (!found) return false;
      }
      return true;
    });
  }

  function queryAll(root, sel) {
    var res = [];
    (function walk(el) {
      if (matchesSel(el, sel)) res.push(el);
      el.children.forEach(walk);
    })(root);
    return res;
  }

  function Document() {
    El.call(this, 'document');
    this.readyState = 'complete';
    this.documentElement = this;
    this.head = new El('head');
    this.appendChild(this.head);
  }
  Document.prototype = Object.create(El.prototype);
  Document.prototype.constructor = Document;
  Document.prototype.createElement = function (tag) { return new El(tag); };
  Document.prototype.createElementNS = function (ns, tag) { return new El(tag); };
  Document.prototype.createTextNode = function (t) { var el = new El('#text'); el.textContent = t; return el; };

  function parseDocument(html) {
    var doc = new Document();
    var bodyIdx = html.indexOf('<body');
    var bodyEnd = html.indexOf('</body>');
    var bodyHtml = html.slice(bodyIdx, bodyEnd);
    doc.body = new El('body');
    doc.body.children = parseFragment(bodyHtml);
    doc.body.children.forEach(function (c) { c.parent = doc.body; });
    doc.body.parent = doc;
    doc.children = [doc.body];
    return doc;
  }

  var api = {
    El: El,
    Document: Document,
    parseDocument: parseDocument,
    parseFragment: parseFragment
  };
  global.__dom = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof module !== 'undefined' ? module.exports : (this.__shim = this.__shim || {}));
