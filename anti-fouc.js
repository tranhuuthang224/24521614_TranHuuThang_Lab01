/**
 * Anti-FOUC (Flash of Unstyled Content) Theme Initializer
 * Reads stored theme preference from localStorage and applies it
 * before CSS loads to prevent layout shift and flash.
 * Loaded synchronously in <head> before stylesheet.
 */
(function () {
  try {
    var s = localStorage.getItem('theme');
    var m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', s || (m ? 'dark' : 'light'));
  } catch (_) {}
})();
