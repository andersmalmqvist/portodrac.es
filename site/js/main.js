/* Språkväxling: svenska som standard, valet sparas i localStorage. */
(function () {
  "use strict";

  var STORAGE_KEY = "portodrac.lang";
  var DEFAULT_LANG = "sv";
  var SUPPORTED = ["sv", "en"];
  var translations = window.TRANSLATIONS || {};

  function storedLang() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function saveLang(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      /* Privat läge utan localStorage: sidan fungerar ändå. */
    }
  }

  function resolveLang() {
    var fromUrl = new URLSearchParams(window.location.search).get("lang");
    var candidates = [fromUrl, storedLang(), (navigator.language || "").slice(0, 2), DEFAULT_LANG];

    for (var i = 0; i < candidates.length; i += 1) {
      if (SUPPORTED.indexOf(candidates[i]) !== -1) {
        return candidates[i];
      }
    }
    return DEFAULT_LANG;
  }

  function applyLanguage(lang) {
    var dict = translations[lang] || translations[DEFAULT_LANG] || {};

    document.documentElement.lang = lang;

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i += 1) {
      var key = nodes[i].getAttribute("data-i18n");
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        nodes[i].textContent = dict[key];
      }
    }

    if (dict["page.title"]) {
      document.title = dict["page.title"];
    }

    var description = document.querySelector('meta[name="description"]');
    if (description && dict["page.description"]) {
      description.setAttribute("content", dict["page.description"]);
    }

    var buttons = document.querySelectorAll(".lang-btn");
    for (var j = 0; j < buttons.length; j += 1) {
      buttons[j].setAttribute("aria-pressed", String(buttons[j].getAttribute("data-lang") === lang));
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".lang-btn");
    if (!button) {
      return;
    }
    var lang = button.getAttribute("data-lang");
    if (SUPPORTED.indexOf(lang) === -1) {
      return;
    }
    saveLang(lang);
    applyLanguage(lang);
  });

  applyLanguage(resolveLang());
})();
