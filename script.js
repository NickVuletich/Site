(function () {
  "use strict";

  const root = document.documentElement;
  const storageKey = "nv-theme";

  try {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      root.dataset.theme = savedTheme;
    }
  } catch (_error) {
    // Local storage can be unavailable in privacy-restricted browsing contexts.
  }

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

    const evidenceStrip = document.querySelector(".orbital-chart-strip");
    if (evidenceStrip) {
      evidenceStrip.addEventListener("keydown", (event) => {
        if (evidenceStrip.scrollWidth <= evidenceStrip.clientWidth + 1) return;

        const cards = Array.from(evidenceStrip.querySelectorAll("figure"));
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const cardPosition = (card) => card.offsetLeft - evidenceStrip.offsetLeft;
        let target = null;

        if (event.key === "ArrowRight") {
          target = cards.find((card) => cardPosition(card) > evidenceStrip.scrollLeft + 8);
        } else if (event.key === "ArrowLeft") {
          target = cards.slice().reverse().find((card) => cardPosition(card) < evidenceStrip.scrollLeft - 8);
        } else if (event.key === "Home") {
          target = cards[0];
        } else if (event.key === "End") {
          target = cards[cards.length - 1];
        } else {
          return;
        }

        if (!target) return;
        event.preventDefault();
        evidenceStrip.scrollTo({
          left: cardPosition(target),
          behavior: reducedMotion ? "auto" : "smooth"
        });
      });
    }

    document.querySelectorAll("[data-year]").forEach((year) => {
      year.textContent = String(new Date().getFullYear());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
