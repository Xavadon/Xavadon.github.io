(function () {
  const STORAGE_LANG = "site-lang";
  const STORAGE_THEME = "site-theme";

  const html = document.documentElement;
  const langBtn = document.getElementById("lang-toggle");
  const themeBtn = document.getElementById("theme-toggle");

  function load(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  }

  function applyLang(lang) {
    html.lang = lang;
    document.querySelectorAll("[data-ru], [data-en]").forEach(el => {
      const text = el.getAttribute("data-" + lang);
      if (text !== null) el.textContent = text;
    });
    langBtn.textContent = lang === "en" ? "RU" : "EN";
    langBtn.setAttribute("aria-label", lang === "en" ? "Переключить на русский" : "Switch to English");
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    themeBtn.textContent = theme === "light" ? "◐" : "◑";
  }

  const browserRu = (navigator.language || "").toLowerCase().startsWith("ru");
  applyLang(load(STORAGE_LANG) || (browserRu ? "ru" : "en"));

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(load(STORAGE_THEME) || (prefersDark ? "dark" : "light"));

  langBtn.addEventListener("click", () => {
    const next = html.lang === "en" ? "ru" : "en";
    save(STORAGE_LANG, next);
    applyLang(next);
  });

  themeBtn.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
    save(STORAGE_THEME, next);
    applyTheme(next);
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
