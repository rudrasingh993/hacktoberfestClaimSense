/* ClaimSense feature layer. Loaded by server.py. Works without knowing the page layout:
   - replaces the "Policy details could not be loaded" message with real policy cards
   - adds a policy picker + 3-language summary + print under the estimator
   - adds insurer logo badges. Numbers always come from the Python server. */
(function () {
  if (window.__csFeat) return;
  window.__csFeat = true;
  var origFetch = window.fetch.bind(window);
  var cfg = null, last = null, lang = "en", sel = "", profs = {}, list = [], cmpTok = 0;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var inr = function (x) { return "\u20B9" + Math.round(x).toLocaleString("en-IN"); };
  function h(tag, a, kids) {
    var e = document.createElement(tag);
    for (var k in (a || {})) { if (k === "class") e.className = a[k]; else if (k === "text") e.textContent = a[k]; else e.setAttribute(k, a[k]); }
    (kids || []).forEach(function (c) { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function json(r) { return r.json(); }
  function setText(id, t) { var e = document.getElementById(id); if (e) e.textContent = t; }

  var css = [
    ".cs-box{width:100%;max-width:1100px;margin:22px auto;color:var(--ink,#17171a);font:inherit;box-sizing:border-box;grid-column:1/-1}",
    ".cs-box *{box-sizing:border-box}.cs-box [hidden]{display:none!important}",
    ".cs-card{background:var(--card,#fff);border-radius:24px;padding:22px 26px;margin-bottom:16px}",
    ".cs-card h3{margin:0 0 4px;font-size:20px;font-weight:600;letter-spacing:-.02em}",
    ".cs-sub{margin:0 0 14px;color:var(--mut,#6b6b73);font-size:14px;line-height:1.5}",
    ".cs-eyebrow{display:block;color:var(--red,#e8452e);font-size:11px;font-weight:600;letter-spacing:.1em;margin-bottom:6px}",
    ".cs-pick{display:grid;grid-template-columns:minmax(240px,420px) 1fr;gap:10px 28px;align-items:center}",
    "@media(max-width:820px){.cs-pick{grid-template-columns:1fr}}",
    ".cs-sel{font:inherit;font-weight:600;width:100%;padding:13px 16px;border-radius:99px;border:2px solid #e3e1de;background:#faf9f8;color:var(--ink,#17171a);cursor:pointer}",
    ".cs-info{color:var(--mut,#6b6b73);font-size:13px;line-height:1.55}.cs-info a,.cs-pcard a{color:var(--red,#e8452e);font-weight:600}",
    ".cs-btn{font:inherit;font-weight:600;font-size:14px;cursor:pointer;padding:11px 20px;border-radius:99px;border:0;background:#f1f0f4;color:var(--ink,#17171a)}",
    ".cs-btn:hover{filter:brightness(.96)}.cs-pri{background:var(--red,#e8452e);color:#fff}",
    ".cs-seg{display:inline-flex;background:#f1f0f4;border-radius:99px;padding:4px;gap:2px;margin-bottom:16px}",
    ".cs-seg button{border:0;background:none;padding:8px 18px;border-radius:99px;font:inherit;font-weight:600;cursor:pointer;color:var(--mut,#6b6b73)}",
    ".cs-seg button[aria-pressed=true]{background:var(--ink,#17171a);color:#fff}",
    ".cs-text{font-size:18px;line-height:1.65;margin:0 0 14px;max-width:72ch}",
    ".cs-call{background:var(--yel,#ffd24a);color:var(--ink,#17171a);border-radius:16px;padding:13px 18px;margin:0 0 18px;font-weight:600;line-height:1.5}",
    ".cs-printonly{display:none}.cs-printonly table{width:100%;border-collapse:collapse;margin:0 0 14px}.cs-printonly td{padding:6px 8px;border-bottom:1px solid #999}.cs-printonly td:last-child{text-align:right;font-weight:700}",
    "@media print{.cs-print body *{visibility:hidden!important}.cs-print #cs-sum,.cs-print #cs-sum *{visibility:visible!important}.cs-print #cs-sum{position:absolute;left:0;top:0;width:100%;border-radius:0}.cs-print .cs-printonly{display:block!important}.cs-print .cs-noprint{display:none!important}}",
    ".cs-h2{margin:6px 0 6px;font-size:clamp(28px,3.4vw,42px);line-height:1;letter-spacing:-.04em;font-weight:600}",
    ".cs-pcards{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(290px,1fr))}",
    ".cs-pcard{display:flex;flex-direction:column;gap:10px;margin:0}.cs-pcard.sel{outline:3px solid var(--red,#e8452e)}",
    ".cs-pcard h3{font-size:18px}.cs-pcard .plan{color:var(--mut,#6b6b73);margin:0;font-size:14px}",
    ".cs-tags{display:flex;flex-wrap:wrap;gap:6px}.cs-tag{font-size:12px;font-weight:600;background:#f1f0f4;border-radius:99px;padding:4px 11px}",
    ".cs-tag.good{background:#dff3e9;color:#1e7a50}.cs-tag.warn{background:#ffe4dc;color:#b4381f}",
    ".cs-note{margin:0;font-size:13px;color:var(--mut,#6b6b73);line-height:1.55;flex:1}",
    ".cs-logo{display:grid;place-items:center;border-radius:50%;color:#fff;font-weight:700;letter-spacing:.02em;flex:none}",
    ".cs-cin{display:flex;flex-wrap:wrap;gap:14px;margin:0 0 12px}.cs-cin label{font-size:12px;font-weight:600;color:var(--mut,#6b6b73)}",
    ".cs-cin input{display:block;margin-top:4px;width:140px;font:inherit;font-size:16px;font-weight:600;padding:9px 14px;border-radius:99px;border:2px solid #e3e1de;background:#faf9f8;color:var(--ink,#17171a)}",
    ".cs-bar{display:grid;grid-template-columns:minmax(150px,280px) 1fr auto;gap:14px;align-items:center;padding:8px 0;font-size:14px}",
    ".cs-bt{height:14px;border-radius:99px;background:repeating-linear-gradient(135deg,#d8d8d8 0 3px,#eee 3px 7px);overflow:hidden}",
    ".cs-bf{height:100%;background:var(--red,#e8452e);border-radius:99px;transition:width .35s}.cs-bar.low .cs-bf{background:var(--ok,#2e9e6b)}",
    ".cs-bar b{font-variant-numeric:tabular-nums}@media(max-width:620px){.cs-bar{grid-template-columns:1fr auto}.cs-bt{grid-column:1/-1}}",
    ".cs-box select:focus-visible,.cs-box button:focus-visible,.cs-box input:focus-visible{outline:3px solid var(--yel,#ffd24a);outline-offset:2px}"
  ].join("\n");
  document.head.appendChild(h("style", { text: css }));

  /* the page posts estimates itself; add the chosen policy and keep the latest result */
  window.fetch = function (url, opts) {
    if (String(url).indexOf("/api/estimate") === -1 || !opts || opts.method !== "POST") return origFetch(url, opts);
    var b = {}; try { b = JSON.parse(opts.body || "{}"); } catch (e) {}
    if (sel) b.profile = sel;
    return origFetch(url, Object.assign({}, opts, { body: JSON.stringify(b) })).then(function (res) {
      if (res.ok) res.clone().json().then(function (d) { last = d; paint(); }).catch(function () {});
      return res;
    });
  };

  /* ---------- logo badges ---------- */
  var BRAND = { "star health": "#d71920", "new india": "#1f4e9c", "hdfc ergo": "#c8102e", "niva bupa": "#0072bc", "care health": "#f58220", "secure health": "#e8452e" };
  function brandColor(n) {
    var k = n.toLowerCase();
    for (var b in BRAND) if (k.indexOf(b) > -1) return BRAND[b];
    var x = 0; for (var i = 0; i < n.length; i++) x = (x * 31 + n.charCodeAt(i)) % 360;
    return "hsl(" + x + ",55%,42%)";
  }
  function initials(n) {
    var w = n.replace(/\(.*?\)/g, "").trim().split(/\s+/).filter(Boolean);
    return ((w[0] || "?")[0] + (w[1] ? w[1][0] : "")).toUpperCase();
  }
  function badge(n, size) {
    var e = h("div", { "class": "cs-logo", title: n, text: initials(n) });
    e.style.cssText = "width:" + size + "px;height:" + size + "px;font-size:" + Math.round(size * 0.36) + "px;background:" + brandColor(n);
    return e;
  }
  function decorateHeader() {
    var ins = document.getElementById("ins"), icon = document.querySelector(".pol i");
    if (ins && icon) {
      var n = ins.textContent.trim();
      if (n && n !== "Policy") {
        icon.textContent = initials(n);
        icon.style.cssText += ";background:" + brandColor(n) + ";color:#fff;display:grid;place-items:center;font-style:normal;font-weight:700;font-size:16px;border-radius:50%";
      }
    }
    var me = document.querySelector(".me");
    if (me && !me.querySelector("svg")) {
      var ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg");
      s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", "24"); s.setAttribute("height", "24");
      s.setAttribute("fill", "none"); s.setAttribute("stroke", "#fff"); s.setAttribute("stroke-width", "1.8"); s.setAttribute("stroke-linecap", "round");
      var c = document.createElementNS(ns, "circle"); c.setAttribute("cx", "12"); c.setAttribute("cy", "8.5"); c.setAttribute("r", "3.6");
      var p = document.createElementNS(ns, "path"); p.setAttribute("d", "M4.5 20c.8-4 3.6-6 7.5-6s6.7 2 7.5 6");
      s.appendChild(c); s.appendChild(p); me.appendChild(s);
      me.style.display = "grid"; me.style.placeItems = "center";
    }
  }

  /* ---------- wording ---------- */
  function bill(i) { return i.total_bill != null ? i.total_bill : i.rent * i.days + (i.other || 0); }
  function summary(d, l) {
    var i = d.inputs, oop = d.results[3].out_of_pocket, b = bill(i), pay = b - oop, over = i.rent > i.limit, R = inr;
    return {
      en: over ? "Your room costs " + R(i.rent) + " a day but the policy limit is " + R(i.limit) + ". Of the " + R(b) + " bill, the insurer is expected to pay about " + R(pay) + ". Your family pays about " + R(oop) + "."
               : "Your room is within the policy limit, so no room-rent deduction applies. Of the " + R(b) + " bill, the insurer is expected to pay about " + R(pay) + ". Your family pays about " + R(oop) + ".",
      hi: over ? "\u0906\u092a\u0915\u0947 \u0915\u092e\u0930\u0947 \u0915\u093e \u0915\u093f\u0930\u093e\u092f\u093e " + R(i.rent) + " \u092a\u094d\u0930\u0924\u093f\u0926\u093f\u0928 \u0939\u0948, \u091c\u092c\u0915\u093f \u092a\u0949\u0932\u093f\u0938\u0940 \u0915\u0940 \u0938\u0940\u092e\u093e " + R(i.limit) + " \u092a\u094d\u0930\u0924\u093f\u0926\u093f\u0928 \u0939\u0948\u0964 " + R(b) + " \u0915\u0947 \u092c\u093f\u0932 \u092e\u0947\u0902 \u0938\u0947 \u092c\u0940\u092e\u093e \u0915\u0902\u092a\u0928\u0940 \u0932\u0917\u092d\u0917 " + R(pay) + " \u0926\u0947\u0917\u0940\u0964 \u0906\u092a\u0915\u0947 \u092a\u0930\u093f\u0935\u093e\u0930 \u0915\u094b \u0932\u0917\u092d\u0917 " + R(oop) + " \u0926\u0947\u0928\u0947 \u0939\u094b\u0902\u0917\u0947\u0964"
               : "\u0906\u092a\u0915\u0947 \u0915\u092e\u0930\u0947 \u0915\u093e \u0915\u093f\u0930\u093e\u092f\u093e \u092a\u0949\u0932\u093f\u0938\u0940 \u0915\u0940 \u0938\u0940\u092e\u093e \u0915\u0947 \u092d\u0940\u0924\u0930 \u0939\u0948, \u0907\u0938\u0932\u093f\u090f \u0915\u092e\u0930\u0947 \u0915\u0947 \u0915\u093f\u0930\u093e\u092f\u0947 \u092e\u0947\u0902 \u0915\u091f\u094c\u0924\u0940 \u0928\u0939\u0940\u0902 \u0939\u094b\u0917\u0940\u0964 " + R(b) + " \u0915\u0947 \u092c\u093f\u0932 \u092e\u0947\u0902 \u0938\u0947 \u092c\u0940\u092e\u093e \u0915\u0902\u092a\u0928\u0940 \u0932\u0917\u092d\u0917 " + R(pay) + " \u0926\u0947\u0917\u0940\u0964 \u0906\u092a\u0915\u0947 \u092a\u0930\u093f\u0935\u093e\u0930 \u0915\u094b \u0932\u0917\u092d\u0917 " + R(oop) + " \u0926\u0947\u0928\u0947 \u0939\u094b\u0902\u0917\u0947\u0964",
      mr: over ? "\u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0916\u094b\u0932\u0940\u091a\u0947 \u092d\u093e\u0921\u0947 " + R(i.rent) + " \u092a\u094d\u0930\u0924\u093f\u0926\u093f\u0928 \u0906\u0939\u0947, \u0924\u0930 \u092a\u0949\u0932\u093f\u0938\u0940\u091a\u0940 \u092e\u0930\u094d\u092f\u093e\u0926\u093e " + R(i.limit) + " \u092a\u094d\u0930\u0924\u093f\u0926\u093f\u0928 \u0906\u0939\u0947. \u090f\u0915\u0942\u0923 " + R(b) + " \u091a\u094d\u092f\u093e \u092c\u093f\u0932\u093e\u092a\u0948\u0915\u0940 \u0935\u093f\u092e\u093e \u0915\u0902\u092a\u0928\u0940 \u0938\u0941\u092e\u093e\u0930\u0947 " + R(pay) + " \u0926\u0947\u0908\u0932. \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0915\u0941\u091f\u0941\u0902\u092c\u093e\u0932\u093e \u0938\u0941\u092e\u093e\u0930\u0947 " + R(oop) + " \u092d\u0930\u093e\u0935\u0947 \u0932\u093e\u0917\u0924\u0940\u0932."
               : "\u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0916\u094b\u0932\u0940\u091a\u0947 \u092d\u093e\u0921\u0947 \u092a\u0949\u0932\u093f\u0938\u0940\u091a\u094d\u092f\u093e \u092e\u0930\u094d\u092f\u093e\u0926\u0947\u0924 \u0906\u0939\u0947, \u0924\u094d\u092f\u093e\u092e\u0941\u0933\u0947 \u0916\u094b\u0932\u0940 \u092d\u093e\u0921\u094d\u092f\u093e\u0924 \u0915\u092a\u093e\u0924 \u0939\u094b\u0923\u093e\u0930 \u0928\u093e\u0939\u0940. \u090f\u0915\u0942\u0923 " + R(b) + " \u091a\u094d\u092f\u093e \u092c\u093f\u0932\u093e\u092a\u0948\u0915\u0940 \u0935\u093f\u092e\u093e \u0915\u0902\u092a\u0928\u0940 \u0938\u0941\u092e\u093e\u0930\u0947 " + R(pay) + " \u0926\u0947\u0908\u0932. \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0915\u0941\u091f\u0941\u0902\u092c\u093e\u0932\u093e \u0938\u0941\u092e\u093e\u0930\u0947 " + R(oop) + " \u092d\u0930\u093e\u0935\u0947 \u0932\u093e\u0917\u0924\u0940\u0932."
    }[l];
  }
  function sugg(d, l) {
    var i = d.inputs, b = d.best;
    if (i.rent <= i.limit) return { en: "Good choice: this room is within your limit.", hi: "\u0905\u091a\u094d\u091b\u093e \u0935\u093f\u0915\u0932\u094d\u092a: \u092f\u0939 \u0915\u092e\u0930\u093e \u0906\u092a\u0915\u0940 \u0938\u0940\u092e\u093e \u0915\u0947 \u092d\u0940\u0924\u0930 \u0939\u0948\u0964", mr: "\u091a\u093e\u0902\u0917\u0932\u093e \u092a\u0930\u094d\u092f\u093e\u092f: \u0939\u0940 \u0916\u094b\u0932\u0940 \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u092e\u0930\u094d\u092f\u093e\u0926\u0947\u0924 \u0906\u0939\u0947." }[l];
    if (!b) return { en: "No listed room is within your limit. Check the policy with your insurer.", hi: "\u0938\u0942\u091a\u0940 \u0915\u093e \u0915\u094b\u0908 \u0915\u092e\u0930\u093e \u0938\u0940\u092e\u093e \u0915\u0947 \u092d\u0940\u0924\u0930 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u092c\u0940\u092e\u093e \u0915\u0902\u092a\u0928\u0940 \u0938\u0947 \u092a\u0949\u0932\u093f\u0938\u0940 \u091c\u093e\u0901\u091a\u0947\u0902\u0964", mr: "\u092f\u093e\u0926\u0940\u0924\u0940\u0932 \u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u0916\u094b\u0932\u0940 \u092e\u0930\u094d\u092f\u093e\u0926\u0947\u0924 \u0928\u093e\u0939\u0940. \u0935\u093f\u092e\u093e \u0915\u0902\u092a\u0928\u0940\u0915\u0921\u0947 \u092a\u0949\u0932\u093f\u0938\u0940 \u0924\u092a\u093e\u0938\u093e." }[l];
    var r = inr(b.rent), s = inr(b.saving), o = inr(b.out_of_pocket);
    return {
      en: "Suggestion: switch to a " + r + "/day room. It stays within your limit, and your family would pay about " + o + ", about " + s + " less.",
      hi: "\u0938\u0941\u091d\u093e\u0935: " + r + "/\u0926\u093f\u0928 \u0915\u093e \u0915\u092e\u0930\u093e \u091a\u0941\u0928\u0947\u0902\u0964 \u092f\u0939 \u0906\u092a\u0915\u0940 \u0938\u0940\u092e\u093e \u0915\u0947 \u092d\u0940\u0924\u0930 \u0930\u0939\u0924\u093e \u0939\u0948 \u0914\u0930 \u092a\u0930\u093f\u0935\u093e\u0930 \u0915\u094b \u0932\u0917\u092d\u0917 " + o + " \u0926\u0947\u0928\u0947 \u0939\u094b\u0902\u0917\u0947, \u092f\u093e\u0928\u0940 \u0932\u0917\u092d\u0917 " + s + " \u0915\u092e\u0964",
      mr: "\u0938\u0942\u091a\u0928\u093e: " + r + "/\u0926\u093f\u0935\u0938 \u0916\u094b\u0932\u0940 \u0928\u093f\u0935\u0921\u093e. \u0924\u0940 \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u092e\u0930\u094d\u092f\u093e\u0926\u0947\u0924 \u0930\u093e\u0939\u0924\u0947 \u0906\u0923\u093f \u0915\u0941\u091f\u0941\u0902\u092c\u093e\u0932\u093e \u0938\u0941\u092e\u093e\u0930\u0947 " + o + " \u092d\u0930\u093e\u0935\u0947 \u0932\u093e\u0917\u0924\u0940\u0932, \u092e\u094d\u0939\u0923\u091c\u0947 \u0938\u0941\u092e\u093e\u0930\u0947 " + s + " \u0915\u092e\u0940."
    }[l];
  }

  /* ---------- estimator extras (policy picker + summary) ---------- */
  function onEstimatorView() { var x = location.hash.replace("#", ""); return x === "" || x === "estimator"; }
  function host() {
    var f = document.getElementById("cs-feat");
    if (f && f.isConnected) return f;
    f = h("div", { id: "cs-feat", "class": "cs-box" });
    var pick = h("section", { "class": "cs-card cs-pick cs-noprint" }, [
      h("div", null, [h("span", { "class": "cs-eyebrow", text: "POLICY TO USE" }),
        h("select", { id: "cs-pol", "class": "cs-sel", "aria-label": "Policy to use for the estimate" })]),
      h("div", { id: "cs-pinfo", "class": "cs-info" })
    ]);
    var seg = h("div", { "class": "cs-seg cs-noprint", role: "group", "aria-label": "Summary language" });
    [["en", "English"], ["hi", "\u0939\u093f\u0928\u094d\u0926\u0940"], ["mr", "\u092e\u0930\u093e\u0920\u0940"]].forEach(function (x) {
      var b = h("button", { type: "button", "data-l": x[0], "aria-pressed": x[0] === lang ? "true" : "false", text: x[1] });
      b.onclick = function () { lang = x[0]; paint(); };
      seg.appendChild(b);
    });
    var pb = h("button", { "class": "cs-btn cs-pri cs-noprint", type: "button", text: "Print one-page result" });
    pb.onclick = function () {
      document.documentElement.classList.add("cs-print");
      window.addEventListener("afterprint", function () { document.documentElement.classList.remove("cs-print"); }, { once: true });
      window.print();
    };
    var sum = h("section", { id: "cs-sum", "class": "cs-card", hidden: "" }, [
      h("span", { "class": "cs-eyebrow cs-noprint", text: "YOUR RESULT, IN YOUR LANGUAGE" }),
      h("p", { "class": "cs-sub cs-noprint", text: "Numbers come straight from the Python calculation. Only the wording changes." }),
      seg, h("div", { "class": "cs-printonly", id: "cs-pr" }),
      h("p", { "class": "cs-text", id: "cs-text" }), h("div", { "class": "cs-call", id: "cs-sg" }), pb
    ]);
    f.appendChild(pick); f.appendChild(sum);
    var est = document.getElementById("estimator");
    if (est) est.appendChild(f);
    else (document.querySelector(".shell") || document.body).appendChild(f);
    fillSelect();
    return f;
  }
  function syncVis() {
    var f = document.getElementById("cs-feat"); if (!f) return;
    var inEst = f.parentNode && f.parentNode.id === "estimator";
    f.hidden = inEst ? false : !onEstimatorView();
  }
  function fillSelect() {
    var s = $("#cs-pol"); if (!s || !list.length) return;
    s.textContent = "";
    list.forEach(function (p) { s.appendChild(h("option", { value: p.id, text: p.id ? p.insurer + " - " + p.plan : "Default: " + p.insurer })); });
    s.value = sel;
    s.onchange = function () { choose(s.value, false); };
    syncSelect();
  }
  function syncSelect() {
    var s = $("#cs-pol"); if (s) s.value = sel;
    var d = $("#cs-pinfo"); if (!d) return; d.textContent = "";
    var p = profs[sel]; if (!p) return;
    d.appendChild(document.createTextNode("Room limit: " + p.limit_label + ". Co-pay: " + p.copay + "%. Proportionate deduction: " + (p.proportionate ? "yes" : "no") + ". " + (p.note || "") + " "));
    if (p.url) d.appendChild(h("a", { href: p.url, target: "_blank", rel: "noopener", text: "Source: " + p.source + (p.date ? " (checked " + p.date + ")" : "") }));
  }
  function header() {
    var p = profs[sel]; if (!p) return;
    setText("ins", p.insurer);
    if (sel) {
      setText("pname", p.plan);
      setText("si", p.sum_insured ? inr(p.sum_insured) : "-");
      setText("lim", p.limit != null ? "Policy limit " + inr(p.limit) + "/day" : "No room limit");
    } else if (cfg) {
      setText("pname", "Profile: " + cfg.profile);
      setText("si", cfg.sum_insured ? inr(cfg.sum_insured) : "-");
      setText("lim", "Policy limit " + inr(cfg.limit) + "/day");
    }
    setText("cp", p.copay + "%");
    decorateHeader();
  }
  function refreshEstimate() {
    if (typeof window.run === "function") { window.run(); return; }
    var inp = document.querySelector("#estimator input[type=number], input[type=number]");
    if (inp) inp.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function choose(id, goEstimator) {
    sel = id; syncSelect(); header(); renderCards(); refreshEstimate();
    if (goEstimator) { location.hash = "#estimator"; window.scrollTo(0, 0); }
  }
  function paint() {
    host();
    if (!last) return;
    var i = last.inputs, oop = last.results[3].out_of_pocket, P = profs[sel], b = bill(i);
    $("#cs-sum").hidden = false;
    setText("cs-text", summary(last, lang));
    setText("cs-sg", sugg(last, lang));
    document.querySelectorAll("#cs-sum [data-l]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.l === lang ? "true" : "false"); });
    var pr = $("#cs-pr"); pr.textContent = "";
    var t = h("table");
    [["Policy", P ? P.insurer + (P.id ? " - " + P.plan : "") : "-"], ["Room rent per day", inr(i.rent)], ["Days", String(i.days)],
     ["Room limit per day", P && P.limit == null && P.id ? "No limit" : inr(i.limit)], ["Total bill", inr(b)],
     ["Insurer pays (estimate)", inr(b - oop)], ["Family pays (estimate)", inr(oop)]].forEach(function (r) {
      t.appendChild(h("tr", null, [h("td", { text: r[0] }), h("td", { text: r[1] })]));
    });
    pr.appendChild(h("h3", { text: "ClaimSense estimate" })); pr.appendChild(t);
    pr.appendChild(h("p", { text: "This is an estimate, not insurance, medical or legal advice. The insurer's decision is final." }));
  }

  /* ---------- Policies tab: replace the "could not be loaded" message ---------- */
  function findAnchor() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (n.nodeValue.indexOf("Policy details could not be loaded") > -1) {
        var card = n.parentElement, p = card.parentElement;
        if (p && p !== document.body && p.id !== "policies" && p.children.length === 1) card = p;
        return { card: card };
      }
    }
    var s = document.getElementById("policies");
    return s ? { section: s } : null;
  }
  function renderPolicies() {
    if (!list.length) return;
    var cur = document.getElementById("cs-pols"); if (cur && cur.isConnected) return;
    var a = findAnchor(); if (!a) return;
    var root = h("div", { id: "cs-pols", "class": "cs-box" });
    root.appendChild(h("span", { "class": "cs-eyebrow", text: "POLICIES" }));
    root.appendChild(h("h2", { "class": "cs-h2", text: "Policies you can test" }));
    root.appendChild(h("p", { "class": "cs-sub", style: "max-width:70ch", text: "Rules summarised from public comparison pages on 26 Oct 2026. They are not policy wordings, so check your own policy. Choose one and the estimator follows its rules." }));
    root.appendChild(h("div", { "class": "cs-card" }, [
      h("h3", { text: "Same bill, every policy" }),
      h("p", { "class": "cs-sub", text: "What your family would pay for one hospital bill under each policy." }),
      h("div", { "class": "cs-cin" }, [
        h("label", null, ["Room rent per day", h("input", { id: "cs-c-rent", type: "number", min: "1", value: "8000" })]),
        h("label", null, ["Days", h("input", { id: "cs-c-days", type: "number", min: "1", step: "1", value: "3" })]),
        h("label", null, ["Other charges", h("input", { id: "cs-c-other", type: "number", min: "0", value: "120000" })])
      ]),
      h("div", { id: "cs-cmp" })
    ]));
    root.appendChild(h("div", { "class": "cs-pcards", id: "cs-pcards" }));
    if (a.card) { a.card.style.display = "none"; a.card.parentNode.insertBefore(root, a.card.nextSibling); }
    else a.section.appendChild(root);
    ["cs-c-rent", "cs-c-days", "cs-c-other"].forEach(function (id) {
      var el = document.getElementById(id), t; el.oninput = function () { clearTimeout(t); t = setTimeout(runCompare, 350); };
    });
    renderCards(); runCompare();
  }
  function renderCards() {
    var box = document.getElementById("cs-pcards"); if (!box) return;
    box.textContent = "";
    list.forEach(function (p) {
      var use = h("button", { "class": "cs-btn" + (p.id === sel ? "" : " cs-pri"), type: "button", text: p.id === sel ? "Selected" : "Use in estimator" });
      use.onclick = function () { choose(p.id, true); };
      var tags = h("div", { "class": "cs-tags" }, [
        h("span", { "class": "cs-tag", text: p.limit_label }),
        h("span", { "class": "cs-tag" + (p.copay ? " warn" : " good"), text: p.copay ? p.copay + "% co-pay" : "No co-pay" }),
        h("span", { "class": "cs-tag" + (p.proportionate ? " warn" : " good"), text: p.proportionate ? "Proportionate deduction" : "No deduction" })
      ]);
      var kids = [badge(p.insurer, 40), h("h3", { text: p.insurer }), h("p", { "class": "plan", text: p.plan }), tags, h("p", { "class": "cs-note", text: p.note })];
      if (p.url) kids.push(h("a", { href: p.url, target: "_blank", rel: "noopener", text: "Source: " + p.source + (p.date ? " (checked " + p.date + ")" : "") }));
      kids.push(use);
      box.appendChild(h("div", { "class": "cs-card cs-pcard" + (p.id === sel ? " sel" : "") }, kids));
    });
  }
  function runCompare() {
    var box = document.getElementById("cs-cmp"); if (!box || !list.length) return;
    var r = +document.getElementById("cs-c-rent").value, d = +document.getElementById("cs-c-days").value, o = +document.getElementById("cs-c-other").value;
    if (!(r > 0) || !Number.isInteger(d) || d < 1 || d > 365 || !(o >= 0)) { box.textContent = "Enter a room rent, a whole number of days and other charges."; return; }
    var tok = ++cmpTok;
    Promise.all(list.map(function (p) {
      var body = { rent: r, days: d, other: o }; if (p.id) body.profile = p.id;
      return origFetch("/api/estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(json).then(function (j) { return { p: p, oop: j.results ? j.results[3].out_of_pocket : null }; })
        .catch(function () { return { p: p, oop: null }; });
    })).then(function (rs) {
      if (tok !== cmpTok) return;
      rs = rs.filter(function (x) { return x.oop !== null; }).sort(function (a, b) { return a.oop - b.oop; });
      box.textContent = "";
      if (!rs.length) { box.textContent = "Could not calculate. Check the terminal running python server.py for errors."; return; }
      var max = Math.max.apply(null, rs.map(function (x) { return x.oop; })) || 1;
      rs.forEach(function (x, k) {
        box.appendChild(h("div", { "class": "cs-bar" + (k === 0 ? " low" : "") }, [
          h("span", { text: x.p.id ? x.p.insurer + " - " + x.p.plan : "Default policy" }),
          h("div", { "class": "cs-bt" }, [h("div", { "class": "cs-bf", style: "width:" + Math.max(2, Math.round(100 * x.oop / max)) + "%" })]),
          h("b", { text: inr(x.oop) })
        ]));
      });
    });
  }

  /* ---------- boot ---------- */
  function tick() { renderPolicies(); host(); syncVis(); decorateHeader(); }
  Promise.all([
    origFetch("/api/config").then(json).catch(function () { return null; }),
    origFetch("/api/profiles").then(json).catch(function () { return []; })
  ]).then(function (r) {
    cfg = r[0] && !r[0].error ? r[0] : null;
    var ex = Array.isArray(r[1]) ? r[1] : [];
    list = [];
    if (cfg) list.push({ id: "", insurer: cfg.insurer, plan: "Your default policy (policy.json)", limit_label: inr(cfg.limit) + "/day",
      limit: cfg.limit, sum_insured: cfg.sum_insured, copay: cfg.copay, proportionate: !!cfg.proportionate,
      note: "The rules your estimator uses unless you pick another policy.", source: "policy.json", url: "", date: "" });
    list = list.concat(ex);
    list.forEach(function (p) { profs[p.id] = p; });
    fillSelect(); tick();
  });
  var timer;
  new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(tick, 120); }).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("hashchange", function () { setTimeout(tick, 100); });
  setInterval(tick, 1500);
  tick();
})();
