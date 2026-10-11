/**
 * ==============================================================================
 * HW2 - AUDIO ENGINE MODULE (INDEPENDENT POLYPHONIC SYNTHESIS)
 * ==============================================================================
 * Contract-first, standalone audio playback engine built upon the Web Audio API.
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. Zero DOM coupling: Operates purely on acoustic sound tokens ('clap', 'kick', etc.).
 * 2. Zero input coupling: Does not listen to KeyboardEvents or PointerEvents.
 * 3. Polyphony: Each playback invocation instantiates an independent voice node tree,
 *    enabling unlimited overlapping concurrent sounds without clipping or voice-stealing.
 * 4. Self-contained procedural synthesis: Zero external audio file dependencies
 *    (immune to network 404s, CORS restrictions, and audio buffer decoding latency).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AudioEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Shared lazy-initialized AudioContext
  let audioCtx = null;
  let masterGain = null;
  let noiseBuffer = null;

  /**
   * Initializes or resumes the Web Audio API context.
   * Safe for modern browser autoplay policies (resumes on user gesture).
   * @returns {AudioContext}
   */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn('[AudioEngine] Web Audio API is not supported in this environment.');
        return null;
      }
      audioCtx = new AudioCtxClass();

      // Master output gain
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Pre-generate a 1-second white noise buffer for polyphonic snare/hihat/clap synthesis
      noiseBuffer = createNoiseBuffer(audioCtx, 1.0);
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function (err) {
        console.warn('[AudioEngine] Context resume error:', err);
      });
    }

    return audioCtx;
  }

  /**
   * Generates a mono White Noise AudioBuffer.
   * Reused across transient percussion voices.
   */
  function createNoiseBuffer(ctx, durationSec) {
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Synthesis voice algorithms for each acoustic token.
   * Every trigger instantiates isolated transient nodes, guaranteeing polyphony.
   */
  const SYNTH_VOICES = {
    /**
     * KICK: Punchy 808-style sine sweep (160 Hz -> 32 Hz) with rapid pitch decay
     */
    kick: function (ctx, dest, t0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t0);
      osc.frequency.exponentialRampToValueAtTime(32, t0 + 0.08);

      gain.gain.setValueAtTime(1.0, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t0);
      osc.stop(t0 + 0.36);
    },

    /**
     * CLAP: Multi-burst synthesized handclap with rapid successive transient spikes
     */
    clap: function (ctx, dest, t0) {
      if (!noiseBuffer) return;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t0);
      filter.Q.setValueAtTime(1.5, t0);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t0);

      // 3 rapid burst spikes to simulate multi-hand clap acoustics
      gain.gain.setValueAtTime(0.8, t0);
      gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.012);

      gain.gain.setValueAtTime(0.8, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.027);

      gain.gain.setValueAtTime(0.9, t0 + 0.030);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      source.start(t0);
      source.stop(t0 + 0.25);
    },

    /**
     * HI-HAT (Closed): High-pass filtered white noise with ultra-fast decay
     */
    hihat: function (ctx, dest, t0) {
      if (!noiseBuffer) return;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7500, t0);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.055);

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      source.start(t0);
      source.stop(t0 + 0.06);
    },

    /**
     * OPEN HAT: Prolonged resonant high-frequency noise wash
     */
    openhat: function (ctx, dest, t0) {
      if (!noiseBuffer) return;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6500, t0);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.75, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.42);

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      source.start(t0);
      source.stop(t0 + 0.45);
    },

    /**
     * BOOM: Deep resonant sub-bass drop (55 Hz -> 24 Hz)
     */
    boom: function (ctx, dest, t0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, t0);
      osc.frequency.exponentialRampToValueAtTime(24, t0 + 0.5);

      gain.gain.setValueAtTime(1.0, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.75);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t0);
      osc.stop(t0 + 0.76);
    },

    /**
     * RIDE: Inharmonic metallic overtone cluster with shimmer tail
     */
    ride: function (ctx, dest, t0) {
      const freqs = [320, 540, 890, 1220, 1680];
      const bandGain = ctx.createGain();
      bandGain.gain.setValueAtTime(0.2, t0);
      bandGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.85);

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2500, t0);

      freqs.forEach(function (f) {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t0);
        osc.connect(filter);
        osc.start(t0);
        osc.stop(t0 + 0.86);
      });

      filter.connect(bandGain);
      bandGain.connect(dest);
    },

    /**
     * SNARE: Dual-component synthesis (resonant body tone + noise snare crack)
     */
    snare: function (ctx, dest, t0) {
      // 1. Tonal body
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t0);
      osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.08);

      oscGain.gain.setValueAtTime(0.7, t0);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);

      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(t0);
      osc.stop(t0 + 0.13);

      // 2. Snare wire noise rattle
      if (!noiseBuffer) return;
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1500, t0);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.85, t0);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);

      noiseSource.start(t0);
      noiseSource.stop(t0 + 0.23);
    },

    /**
     * TOM: Tuned mid-range acoustic sweep (120 Hz -> 65 Hz)
     */
    tom: function (ctx, dest, t0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, t0);
      osc.frequency.exponentialRampToValueAtTime(65, t0 + 0.25);

      gain.gain.setValueAtTime(0.9, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.38);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t0);
      osc.stop(t0 + 0.39);
    },

    /**
     * TINK: High-frequency bright bell/triangle acoustic strike (1800 Hz)
     */
    tink: function (ctx, dest, t0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, t0);

      gain.gain.setValueAtTime(0.65, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t0);
      osc.stop(t0 + 0.19);
    }
  };

  /**
   * Public AudioEngine API
   */
  const AudioEngine = {
    /**
     * Dispatches polyphonic playback of an acoustic sound token.
     * @param {string} soundName - Token ('clap', 'kick', 'snare', etc.)
     * @returns {boolean} True if successfully dispatched, false otherwise
     */
    play: function (soundName) {
      if (!soundName) return false;
      const key = String(soundName).toLowerCase().trim();

      const voiceFn = SYNTH_VOICES[key];
      if (!voiceFn) {
        console.warn('[AudioEngine] Unknown acoustic token:', soundName);
        return false;
      }

      const ctx = getAudioContext();
      if (!ctx) return false;

      try {
        const t0 = ctx.currentTime;
        voiceFn(ctx, masterGain, t0);
        return true;
      } catch (err) {
        console.error('[AudioEngine] Playback error for sound:', key, err);
        return false;
      }
    },

    /**
     * Ensures AudioContext is un-suspended.
     */
    resume: function () {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        return ctx.resume();
      }
      return Promise.resolve();
    },

    /**
     * Returns list of supported acoustic tokens.
     */
    getSupportedSounds: function () {
      return Object.keys(SYNTH_VOICES);
    },

    /**
     * Adjusts master output gain (0.0 to 1.0).
     */
    setMasterVolume: function (vol) {
      if (masterGain && audioCtx) {
        const clamped = Math.max(0, Math.min(1, vol));
        masterGain.gain.setValueAtTime(clamped, audioCtx.currentTime);
      }
    }
  };

  return AudioEngine;
});
