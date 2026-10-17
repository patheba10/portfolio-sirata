(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Langue ---------- */
  var META = {
    fr: {
      title: "Sirata Gueye · Analyste financière, crédit et financement d'entreprise",
      description: "Sirata Gueye, analyste financière chez CGI Finance (groupe Société Générale) et étudiante en Master 2 Finance à l'IAE Lille. Analyse de crédit et financement d'entreprise. Recherche un VIE."
    },
    en: {
      title: "Sirata Gueye · Financial analyst, credit and corporate finance",
      description: "Sirata Gueye, financial analyst at CGI Finance (Société Générale group) and Master's student in Corporate Finance at IAE Lille. Credit analysis and corporate financing. Seeking a V.I.E. assignment."
    }
  };

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  function lang() { return root.lang === "en" ? "en" : "fr"; }

  function setLang(next, persist) {
    if (next !== "fr" && next !== "en") next = "fr";
    root.lang = next;
    document.title = META[next].title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", META[next].description);
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === next));
    });
    if (persist) {
      store("sg-lang", next);
      try {
        var url = new URL(window.location.href);
        if (next === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
        window.history.replaceState(null, "", url.toString());
      } catch (e) { /* ignore */ }
    }
    renderSim();
  }

  /* ---------- Menu mobile ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- Barre de progression et section active ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var navLinks = document.querySelectorAll(".nav a[href^='#']");
  if ("IntersectionObserver" in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { sectionIO.observe(s); });
  }

  /* ---------- Méthode : étapes ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".steps [role='tab']"));
  var stepsEl = document.querySelector(".steps");
  var prevBtn = document.querySelector("[data-step='prev']");
  var nextBtn = document.querySelector("[data-step='next']");
  var current = 0;

  function selectStep(index, focus) {
    if (!tabs.length) return;
    index = Math.max(0, Math.min(tabs.length - 1, index));
    current = index;
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      tab.classList.toggle("is-done", i < index);
      var panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (!panel) return;
      if (on) {
        panel.hidden = false;
        panel.classList.remove("is-entering");
        void panel.offsetWidth;
        panel.classList.add("is-entering");
        panel.querySelectorAll("li").forEach(function (li, k) { li.style.setProperty("--i", k); });
      } else {
        panel.hidden = true;
      }
    });
    if (stepsEl) stepsEl.style.setProperty("--p", index + 1);
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === tabs.length - 1;
    if (focus) tabs[index].focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectStep(i, false); });
    tab.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); selectStep((current + 1) % tabs.length, true); }
      else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); selectStep((current - 1 + tabs.length) % tabs.length, true); }
      else if (k === "Home") { e.preventDefault(); selectStep(0, true); }
      else if (k === "End") { e.preventDefault(); selectStep(tabs.length - 1, true); }
    });
  });
  if (prevBtn) prevBtn.addEventListener("click", function () { selectStep(current - 1, false); });
  if (nextBtn) nextBtn.addEventListener("click", function () { selectStep(current + 1, false); });
  selectStep(0, false);

  /* ---------- Simulateur BFR ---------- */
  var sim = document.querySelector(".sim");
  var START = { ca: 10, dso: 60, dio: 45, dpo: 50 };

  function fmtMoney(v) {
    var l = lang();
    var abs = Math.abs(v);
    var s;
    if (abs >= 1e6) {
      s = (v / 1e6).toLocaleString(l === "en" ? "en-GB" : "fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return l === "en" ? "€" + s + "m" : s + " M€";
    }
    s = Math.round(v / 1e3).toLocaleString(l === "en" ? "en-GB" : "fr-FR");
    return l === "en" ? "€" + s + "k" : s + " k€";
  }

  function val(name) { var el = sim && sim.querySelector("[name='" + name + "']"); return el ? Number(el.value) : 0; }
  function out(name, text) { var el = sim && sim.querySelector("[data-out='" + name + "']"); if (el) el.innerHTML = text; }

  function renderSim() {
    if (!sim) return;
    var en = lang() === "en";
    var ca = val("ca"), dso = val("dso"), dio = val("dio"), dpo = val("dpo");
    var days = dso + dio - dpo;
    var bfr = ca * 1e6 * days / 365;
    var base = START.ca * 1e6 * (START.dso + START.dio - START.dpo) / 365;
    var delta = bfr - base;
    var d = en ? " days" : " jours";

    out("ca", en ? "€" + ca + "m" : ca + " M€");
    out("dso", dso + d);
    out("dio", dio + d);
    out("dpo", dpo + d);
    out("bfr", fmtMoney(bfr));
    out("days", en
      ? (days >= 0 ? days + " days of sales tied up in the operating cycle" : Math.abs(days) + " days of sales generated by the operating cycle")
      : (days >= 0 ? "soit " + days + " jours de chiffre d'affaires immobilisés" : "soit " + Math.abs(days) + " jours de chiffre d'affaires dégagés par l'exploitation"));

    var msg;
    if (Math.abs(delta) < 1) {
      msg = en ? "Starting point. Move a slider to see the impact on cash."
               : "Situation de départ. Déplacez un curseur pour voir l'effet sur la trésorerie.";
    } else if (delta > 0) {
      msg = en ? "Compared with the starting point, the company must find <strong>" + fmtMoney(delta) + "</strong> of extra financing, often before the difficulty shows in its earnings."
               : "Par rapport à la situation de départ, l'entreprise doit trouver <strong>" + fmtMoney(delta) + "</strong> de financement supplémentaire, souvent avant que la difficulté n'apparaisse dans ses résultats.";
    } else {
      msg = en ? "Compared with the starting point, <strong>" + fmtMoney(-delta) + "</strong> of cash is freed up."
               : "Par rapport à la situation de départ, <strong>" + fmtMoney(-delta) + "</strong> de trésorerie sont libérés.";
    }
    out("delta", msg);

    ["dso", "dio", "dpo"].forEach(function (k) {
      var bar = sim.querySelector("[data-bar='" + k + "']");
      if (bar) bar.style.width = (val(k) / 120 * 100) + "%";
    });
    sim.querySelectorAll("input[type='range']").forEach(function (r) {
      var p = (r.value - r.min) / (r.max - r.min) * 100;
      r.style.setProperty("--fill", p + "%");
    });
  }

  if (sim) {
    sim.addEventListener("input", renderSim);
    var reset = sim.querySelector("[data-sim-reset]");
    if (reset) reset.addEventListener("click", function () {
      Object.keys(START).forEach(function (k) { var el = sim.querySelector("[name='" + k + "']"); if (el) el.value = START[k]; });
      renderSim();
    });
  }

  /* ---------- Compteur de la note, tampon du contact ---------- */
  function countUp(el) {
    var target = Number(el.getAttribute("data-count"));
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 900;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) window.requestAnimationFrame(step);
    }
    el.textContent = "0";
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var onceIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute("data-count")) countUp(el);
        else el.classList.add("is-visible");
        onceIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("[data-count], .contact").forEach(function (el) { onceIO.observe(el); });
  } else {
    var c = document.querySelector(".contact"); if (c) c.classList.add("is-visible");
  }

  /* ---------- Copier l'e-mail ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function done() {
        btn.classList.add("is-copied");
        window.setTimeout(function () { btn.classList.remove("is-copied"); }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { window.location.href = "mailto:" + text; });
      } else {
        window.location.href = "mailto:" + text;
      }
    });
  });

  /* ---------- Démarrage ---------- */
  var initial = "fr";
  try {
    var param = new URLSearchParams(window.location.search).get("lang");
    if (param === "en" || param === "fr") initial = param;
    else if (store("sg-lang")) initial = store("sg-lang");
  } catch (e) { /* ignore */ }
  setLang(initial, false);

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-set-lang]");
    if (btn) setLang(btn.getAttribute("data-set-lang"), true);
  });

  document.querySelectorAll(".memo__row").forEach(function (row, i) { row.style.setProperty("--i", i); });
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () { root.classList.add("is-ready"); });
  });
})();
