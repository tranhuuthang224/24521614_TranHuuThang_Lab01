/**
 * ==========================================================================
 * THEME ENGINE (SUB-TASK T-02C)
 * ==========================================================================
 * Strict Contract:
 * - State persistence strictly via localStorage key 'theme'.
 * - Performance Budget: Zero CLS (Early inline anti-FOUC + attribute sync).
 * - Zero console errors during dynamic theme toggling.
 * - Accessible keyboard Tab & Enter flow support.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'theme';
  const THEME_LIGHT = 'light';
  const THEME_DARK = 'dark';

  /**
   * Retrieves preferred theme from localStorage or system media query.
   * @returns {'light' | 'dark'}
   */
  function getPreferredTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (savedTheme === THEME_LIGHT || savedTheme === THEME_DARK) {
        return savedTheme;
      }
    } catch (_) {
      // LocalStorage access restricted (e.g., privacy sandbox)
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }

    return THEME_LIGHT;
  }

  /**
   * Applies theme to DOM and updates toggle button accessible states.
   * @param {'light' | 'dark'} theme
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const isDark = theme === THEME_DARK;
    toggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    toggleBtn.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );

    const iconEl = toggleBtn.querySelector('.theme-toggle-icon');
    const textEl = toggleBtn.querySelector('.theme-toggle-text');

    if (iconEl) {
      iconEl.textContent = isDark ? '☀️' : '🌙';
    }
    if (textEl) {
      textEl.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }
  }

  /**
   * Toggles theme between light and dark with state persistence.
   */
  function toggleTheme() {
    const currentTheme =
      document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const nextTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (err) {
      // Graceful degradation when localStorage is blocked
    }

    applyTheme(nextTheme);
  }

  /**
   * Initialize theme engine listeners and controls.
   */
  function initThemeEngine() {
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    // Listen for OS scheme changes if no explicit user override is saved
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSchemeChange = (e) => {
        try {
          const hasUserChoice = Boolean(localStorage.getItem(STORAGE_KEY));
          if (!hasUserChoice) {
            applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
          }
        } catch (_) {}
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSchemeChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSchemeChange);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeEngine);
  } else {
    initThemeEngine();
  }
})();
