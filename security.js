/**
 * ==============================================================================
 * HW3 - SLICE 3: SECURITY & SANITIZATION ENGINE (ZERO-XSS & ATOMIC MUTEX)
 * ==============================================================================
 * Provides defense-in-depth against Cross-Site Scripting (XSS) and form submission
 * race conditions (double-submit / replay attacks).
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. Synchronous Mutex Lock: Guarantees turn-0 atomicity on form submission,
 *    preventing rapid double-clicks and Enter-key spam before async promises resolve.
 * 2. Zero-XSS HTML Sanitizer: Strictly neutralizes HTML meta-characters (&, <, >, ", ', /).
 * 3. Safe DOM Node Factory: Constructs text nodes rather than parsing via innerHTML.
 * 4. Strict CSP Compliance: Operates seamlessly under default-src 'self'.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SecurityEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Map of hazardous characters to safe HTML character entities
  const ENTITY_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  const HAZARDOUS_REGEX = /[&<>"'`=\/]/g;

  /**
   * Sanitizes untrusted user strings by converting dangerous HTML characters
   * to their corresponding character entity references.
   * @param {string} rawString
   * @returns {string} Sanitized string safe for contexts
   */
  function sanitize(rawString) {
    if (typeof rawString !== 'string') {
      return '';
    }
    return rawString.replace(HAZARDOUS_REGEX, function (char) {
      return ENTITY_MAP[char] || char;
    });
  }

  /**
   * Creates a safe TextNode inside a specified element, guaranteeing zero XSS.
   * NEVER uses innerHTML.
   * @param {HTMLElement} parentElement
   * @param {string} textContent
   * @returns {Text} The created TextNode
   */
  function appendSafeText(parentElement, textContent) {
    if (!parentElement) return null;
    const node = document.createTextNode(String(textContent || ''));
    parentElement.appendChild(node);
    return node;
  }

  /**
   * Submission Guard (Atomic Synchronous Mutex)
   * Prevents double-submit race conditions caused by rapid successive clicks or Enter spam.
   */
  function createSubmissionGuard() {
    let locked = false;
    let abortController = null;

    return {
      /**
       * Synchronously checks and locks the mutex.
       * Must be called synchronously at the very beginning of the submit handler!
       * @returns {boolean} True if successfully acquired lock; false if already locked.
       */
      acquireLock: function () {
        if (locked) {
          console.warn('[SecurityEngine] Double-submit attempt blocked by synchronous mutex.');
          return false;
        }
        locked = true;
        abortController = new AbortController();
        return true;
      },

      /**
       * Releases the lock, permitting subsequent submissions (e.g. on error or reset).
       */
      releaseLock: function () {
        locked = false;
        if (abortController) {
          abortController = null;
        }
      },

      /**
       * Returns current lock state.
       */
      isLocked: function () {
        return locked;
      },

      /**
       * Returns AbortSignal for the current submission lifecycle.
       */
      getSignal: function () {
        return abortController ? abortController.signal : null;
      }
    };
  }

  return {
    sanitize: sanitize,
    appendSafeText: appendSafeText,
    createSubmissionGuard: createSubmissionGuard
  };
});
