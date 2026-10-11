/**
 * ==============================================================================
 * HW2 - INPUT CONTROLLER MODULE (THROTTLED KEYBOARD & POINTER INTERACTION)
 * ==============================================================================
 * Bridges physical hardware events to acoustic sound synthesis via the HTML contract.
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. event.repeat throttling: Strictly suppresses OS auto-repeat keystrokes.
 * 2. Dynamic contract querying: Finds target pads using DOM data-attributes
 *    ([data-key] and [data-code]) rather than hardcoded internal JavaScript tables.
 *    (Enables instant 3-minute Live Defense key rebinding in HTML!).
 * 3. Decoupled event publication: Dispatches 'drum:hit' custom event on document
 *    for independent consumption by the FIFO Beat Recorder.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.InputController = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Animation duration safety fallback (ms)
  const TRANSITION_SAFETY_TIMEOUT = 120;

  /**
   * Triggers visual playing feedback and sound playback for a given drum pad.
   * @param {HTMLElement} pad - The target .drum-pad button element
   * @param {string} [triggerSource='keyboard'] - 'keyboard' | 'pointer' | 'playback'
   */
  function triggerPad(pad, triggerSource) {
    if (!pad) return;

    const soundName = pad.dataset.sound;
    if (!soundName) return;

    // 1. Audio playback via independent polyphonic engine
    if (window.AudioEngine && typeof window.AudioEngine.play === 'function') {
      window.AudioEngine.play(soundName);
    }

    // 2. Visual feedback: add .playing class
    // Remove first in case pad was already in playing state (rapid succession)
    pad.classList.remove('playing');
    // Force DOM reflow to restart CSS transition
    void pad.offsetWidth;
    pad.classList.add('playing');

    // Safety timeout to clean up .playing in case transitionend does not fire
    clearTimeout(pad._playingTimeout);
    pad._playingTimeout = setTimeout(function () {
      pad.classList.remove('playing');
    }, TRANSITION_SAFETY_TIMEOUT);

    // 3. Decoupled custom event broadcast for FIFO Beat Recorder
    const hitEvent = new CustomEvent('drum:hit', {
      bubbles: true,
      detail: {
        sound: soundName,
        key: pad.dataset.key || '',
        code: pad.dataset.code || '',
        pad: pad,
        source: triggerSource || 'unknown',
        timestamp: performance.now()
      }
    });
    pad.dispatchEvent(hitEvent);
  }

  /**
   * Handles physical keydown events with hardware repeat throttling.
   */
  function handleKeyDown(e) {
    // --------------------------------------------------------------------------
    // SUB-TASK T-03 / STEP 3: Mandatory event.repeat Throttling
    // When holding down a physical key, the operating system dispatches continuous
    // repeated keydown events. Discard these to preserve acoustic clarity.
    // --------------------------------------------------------------------------
    if (e.repeat) {
      return;
    }

    // Skip if focus is inside an input or textarea
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea') {
      return;
    }

    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    // Contract-first dynamic query:
    // Looks up the pad element directly from HTML attributes
    // (Zero hardcoded JS key lookup tables!)
    const pad = document.querySelector(
      `.drum-pad[data-key="${CSS.escape(key)}"], .drum-pad[data-code="${CSS.escape(code)}"]`
    );

    if (pad) {
      e.preventDefault();
      triggerPad(pad, 'keyboard');
    }
  }

  /**
   * Initializes the input controller listeners.
   */
  function init() {
    // 1. Global keydown listener with repeat throttling
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    // 2. Transitionend cleanup for all drum pads
    const pads = document.querySelectorAll('.drum-pad');
    pads.forEach(function (pad) {
      pad.addEventListener('transitionend', function (e) {
        if (e.propertyName !== 'transform') return;
        this.classList.remove('playing');
      });
    });

    // 3. Pointer / click interaction via event delegation
    const drumKitSection = document.getElementById('drum-kit');
    if (drumKitSection) {
      drumKitSection.addEventListener('pointerdown', function (e) {
        const pad = e.target.closest('.drum-pad');
        if (!pad) return;
        triggerPad(pad, 'pointer');
      });
    }

    console.log('[InputController] Initialized with event.repeat throttling & dynamic contract lookup.');
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    triggerPad: triggerPad,
    init: init
  };
});
