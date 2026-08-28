(function () {
  "use strict";

  const root = document.documentElement;
  const storageKey = "nv-theme";

  // The saved theme is applied before first paint by the inline script in
  // <head> (script.js loads with `defer`, which would otherwise flash the
  // wrong theme). This module only needs to read the theme it already set.

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function activeTheme() {
    return root.dataset.theme || systemTheme();
  }

  function updateThemeControl(toggle) {
    const theme = activeTheme();
    const nextTheme = theme === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);

    const icon = toggle.querySelector(".theme-toggle-icon");
    if (icon) icon.textContent = theme === "dark" ? "☾" : "☀";

    const themeColor = document.getElementById("theme-color");
    if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#10171d" : "#f5f7f8");
  }

  function initialize() {
    const themeToggle = document.querySelector("[data-theme-toggle]");
    if (themeToggle) {
      updateThemeControl(themeToggle);
      themeToggle.addEventListener("click", () => {
        const nextTheme = activeTheme() === "dark" ? "light" : "dark";
        root.dataset.theme = nextTheme;
        try {
          localStorage.setItem(storageKey, nextTheme);
        } catch (_error) {
          // The visual switch remains functional even when persistence is unavailable.
        }
        updateThemeControl(themeToggle);
      });

      const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
      colorScheme.addEventListener("change", () => {
        if (!root.dataset.theme) updateThemeControl(themeToggle);
      });
    }

    const navToggle = document.querySelector("[data-nav-toggle]");
    const navigation = document.querySelector("[data-navigation]");

    if (navToggle && navigation) {
      const toggleLabel = navToggle.querySelector(".sr-only");

      function setNavigation(open, returnFocus) {
        navToggle.setAttribute("aria-expanded", String(open));
        navigation.toggleAttribute("data-open", open);
        if (toggleLabel) toggleLabel.textContent = open ? "Close navigation" : "Open navigation";
        if (!open && returnFocus) navToggle.focus();
      }

      navToggle.addEventListener("click", () => {
        setNavigation(navToggle.getAttribute("aria-expanded") !== "true", false);
      });

      navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setNavigation(false, false));
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
          setNavigation(false, true);
        }
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 900 && navToggle.getAttribute("aria-expanded") === "true") {
          setNavigation(false, false);
        }
      });
    }

    document.querySelectorAll("[data-year]").forEach((year) => {
      year.textContent = String(new Date().getFullYear());
    });

    document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
      const dialog = document.getElementById(trigger.dataset.lightboxTrigger);
      if (!dialog || typeof dialog.showModal !== "function") return;

      trigger.addEventListener("click", () => {
        dialog.showModal();
      });

      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
