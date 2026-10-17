(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

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

  function setLang(lang, persist) {
    if (lang !== "fr" && lang !== "en") lang = "fr";
    root.lang = lang;
    document.title = META[lang].title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", META[lang].description);
    var buttons = document.querySelectorAll("[data-set-lang]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", String(buttons[i].getAttribute("data-set-lang") === lang));
    }
    if (persist) {
      store("sg-lang", lang);
      try {
        var url = new URL(window.location.href);
        if (lang === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
        window.history.replaceState(null, "", url.toString());
      } catch (e) { /* ignore */ }
    }
  }

  // Langue : paramètre ?lang= (lien à envoyer aux recruteurs) > choix mémorisé > français
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

  // Remplissage progressif de la fiche de synthèse
  var rows = document.querySelectorAll(".memo__row");
  for (var j = 0; j < rows.length; j++) rows[j].style.setProperty("--i", j);
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () { root.classList.add("is-ready"); });
  });
})();
