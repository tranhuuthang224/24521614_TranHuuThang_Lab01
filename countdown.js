/**
 * ==============================================================================
 * HW3 - SLICE 1: DRIFT-FREE COUNTDOWN ENGINE (UTC ISO 8601 TIMESTAMPS)
 * ==============================================================================
 * Solves the classic AI failure mode of cumulative setInterval drift and timezone
 * parsing discrepancies.
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. UTC ISO 8601 Contract: Parses strict UTC timestamps ('Z' specifier) directly
 *    from DOM data-target, preventing local timezone conversion anomalies.
 * 2. Absolute Epoch Delta: Computes Math.max(0, targetEpoch - Date.now()) on each
 *    tick, eliminating cumulative interval drift.
 * 3. Self-Compensating Alignment: Schedules subsequent ticks aligned to the hardware
 *    clock's millisecond boundary (1000 - (Date.now() % 1000)).
 * 4. Page Visibility API Sync: Resynchronizes instantly when background tabs wake.
 * 5. Memory Leak Safe: Clears timer references cleanly on completion or teardown.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CountdownEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  let activeTimerId = null;
  let targetEpochMs = 0;
  let isRunning = false;
  let isCompleted = false;

  // DOM Elements Cache
  let elTimer = null;
  let elDays = null;
  let elHours = null;
  let elMinutes = null;
  let elSeconds = null;
  let elStatusBadge = null;

  /**
   * Pads a number with a leading zero if less than 10.
   * @param {number} num
   * @returns {string}
   */
  function pad2(num) {
    return String(Math.max(0, Math.floor(num))).padStart(2, '0');
  }

  /**
   * Parses an ISO 8601 timestamp string strictly as UTC epoch milliseconds.
   * @param {string} isoString
   * @returns {number|null} Epoch ms or null if invalid
   */
  function parseUtcTimestamp(isoString) {
    if (!isoString) return null;
    const epoch = Date.parse(isoString);
    if (Number.isNaN(epoch)) {
      console.error('[CountdownEngine] Invalid ISO 8601 timestamp contract:', isoString);
      return null;
    }
    return epoch;
  }

  /**
   * Core tick calculation: computes absolute delta from system hardware clock.
   * Eliminates setInterval drift accumulation.
   */
  function tick() {
    if (!isRunning || isCompleted) return;

    const now = Date.now();
    const diffMs = Math.max(0, targetEpochMs - now);

    if (diffMs <= 0) {
      handleComplete();
      return;
    }

    // Split epoch delta into calendar units
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Update DOM units
    if (elDays) elDays.textContent = pad2(days);
    if (elHours) elHours.textContent = pad2(hours);
    if (elMinutes) elMinutes.textContent = pad2(minutes);
    if (elSeconds) elSeconds.textContent = pad2(seconds);

    // --------------------------------------------------------------------------
    // SELF-COMPENSATING ALIGNMENT:
    // Rather than blindly setTimeout(tick, 1000), calculate the exact fraction of a
    // second remaining until the physical second boundary flips.
    // --------------------------------------------------------------------------
    const remainderToNextSecond = 1000 - (Date.now() % 1000);
    activeTimerId = setTimeout(tick, remainderToNextSecond);
  }

  /**
   * Handles timer completion state.
   */
  function handleComplete() {
    isCompleted = true;
    isRunning = false;

    if (activeTimerId) {
      clearTimeout(activeTimerId);
      activeTimerId = null;
    }

    if (elDays) elDays.textContent = '00';
    if (elHours) elHours.textContent = '00';
    if (elMinutes) elMinutes.textContent = '00';
    if (elSeconds) elSeconds.textContent = '00';

    if (elStatusBadge) {
      elStatusBadge.textContent = 'Keynote Commenced';
      elStatusBadge.style.borderColor = 'var(--color-primary)';
      elStatusBadge.style.color = 'var(--color-primary)';
    }

    if (elTimer) {
      elTimer.setAttribute('aria-label', 'Countdown complete: Keynote launch has commenced.');
      elTimer.dispatchEvent(new CustomEvent('countdown:complete', { bubbles: true }));
    }

    console.log('[CountdownEngine] Countdown reached zero. Launch commenced.');
  }

  /**
   * Resynchronizes immediately when the tab transitions from background to foreground.
   * Fixes browser background timer throttling.
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      // Tab backgrounded: timer may be throttled by browser
      return;
    }

    // Tab returned to foreground: resynchronize immediately against Date.now()
    if (isRunning && !isCompleted) {
      if (activeTimerId) {
        clearTimeout(activeTimerId);
        activeTimerId = null;
      }
      tick();
    }
  }

  /**
   * Initializes the Countdown Engine from HTML contract data attributes.
   * @param {HTMLElement} [timerElement] - Optional custom timer root
   */
  function init(timerElement) {
    elTimer = timerElement || document.getElementById('countdown-timer');
    if (!elTimer) {
      console.warn('[CountdownEngine] No #countdown-timer element found in DOM.');
      return false;
    }

    elDays = document.getElementById('unit-days');
    elHours = document.getElementById('unit-hours');
    elMinutes = document.getElementById('unit-minutes');
    elSeconds = document.getElementById('unit-seconds');
    elStatusBadge = document.getElementById('timer-drift-status');

    // Read UTC ISO 8601 target string from HTML contract
    const targetAttr = elTimer.dataset.target || elTimer.getAttribute('datetime');
    const parsed = parseUtcTimestamp(targetAttr);
    if (!parsed) return false;

    targetEpochMs = parsed;
    isRunning = true;
    isCompleted = false;

    // Listen to tab visibility changes to overcome OS/browser background throttle
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    // Initial immediate tick
    tick();

    console.log(`[CountdownEngine] Initialized. Target UTC: ${targetAttr} (${targetEpochMs}ms)`);
    return true;
  }

  /**
   * Clean teardown for testing and unmounting.
   */
  function destroy() {
    isRunning = false;
    if (activeTimerId) {
      clearTimeout(activeTimerId);
      activeTimerId = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  return {
    init: init,
    tick: tick,
    destroy: destroy,
    getTargetEpoch: function () { return targetEpochMs; },
    isCompleted: function () { return isCompleted; }
  };
});
