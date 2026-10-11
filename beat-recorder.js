/**
 * ==============================================================================
 * HW2 - BEAT RECORDER MODULE (TIMESTAMPED FIFO EVENT QUEUE & SEQUENCER)
 * ==============================================================================
 * Captures live acoustic events into a chronological FIFO queue and replays
 * them with sample-accurate timer scheduling.
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. FIFO Queue Structure: Preserves strict First-In, First-Out sequence ordering.
 * 2. High-precision timestamps: Uses performance.now() offsets relative to t0.
 * 3. Event-driven decoupling: Listens for 'drum:hit' CustomEvents emitted by InputController.
 * 4. Resilient playback scheduler: Supports single-pass playback, stop interruptions,
 *    and continuous beat looping.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BeatRecorder = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Internal State Machine
  const STATE = {
    IDLE: 'IDLE',
    RECORDING: 'RECORDING',
    PLAYING: 'PLAYING'
  };

  let currentState = STATE.IDLE;
  let recordStartTime = 0;
  let totalRecordDuration = 0;
  let timerRafId = null;

  // Chronological FIFO Event Queue
  // Schema: Array<{ id: number, sound: string, timestamp: number }>
  const fifoQueue = [];
  let eventSequenceCounter = 0;

  // Active playback scheduled timers
  let scheduledPlaybackTimers = [];

  // DOM Elements Cache
  let btnRecord = null;
  let btnStop = null;
  let btnPlay = null;
  let btnClear = null;
  let checkboxLoop = null;
  let elStatus = null;
  let elTimer = null;
  let elCount = null;
  let elQueueDisplay = null;
  let elQueueBadge = null;

  /**
   * Formats milliseconds into MM:SS.mmm format.
   * @param {number} ms
   * @returns {string}
   */
  function formatTimestamp(ms) {
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const millis = Math.floor(ms % 1000);

    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    const mmm = String(millis).padStart(3, '0');
    return `${mm}:${ss}.${mmm}`;
  }

  /**
   * Formats relative seconds for queue item display (e.g. "0.352s").
   * @param {number} ms
   * @returns {string}
   */
  function formatRelativeSeconds(ms) {
    return (ms / 1000).toFixed(3) + 's';
  }

  /**
   * Updates HUD metrics and toolbar button states according to currentState.
   */
  function updateUIState() {
    if (!elStatus) return;

    // Reset status classes
    elStatus.classList.remove('status-idle', 'status-recording', 'status-playing');

    switch (currentState) {
      case STATE.RECORDING:
        elStatus.textContent = 'RECORDING';
        elStatus.classList.add('status-recording');
        if (btnRecord) btnRecord.setAttribute('aria-pressed', 'true');
        if (btnStop) btnStop.disabled = false;
        if (btnPlay) btnPlay.disabled = true;
        if (btnClear) btnClear.disabled = true;
        break;

      case STATE.PLAYING:
        elStatus.textContent = 'PLAYING';
        elStatus.classList.add('status-playing');
        if (btnRecord) btnRecord.setAttribute('aria-pressed', 'false');
        if (btnStop) btnStop.disabled = false;
        if (btnPlay) btnPlay.disabled = true;
        if (btnClear) btnClear.disabled = true;
        break;

      case STATE.IDLE:
      default:
        elStatus.textContent = 'IDLE';
        elStatus.classList.add('status-idle');
        if (btnRecord) btnRecord.setAttribute('aria-pressed', 'false');
        if (btnStop) btnStop.disabled = true;
        if (btnPlay) btnPlay.disabled = fifoQueue.length === 0;
        if (btnClear) btnClear.disabled = fifoQueue.length === 0;
        break;
    }

    // Queue count & badge
    const count = fifoQueue.length;
    if (elCount) {
      elCount.textContent = `${count} ${count === 1 ? 'event' : 'events'}`;
    }
    if (elQueueBadge) {
      elQueueBadge.textContent = count === 0 ? 'Empty Queue' : `${count} In Queue`;
    }
  }

  /**
   * High-precision timer tick loop for HUD display.
   */
  function runTimerLoop() {
    if (currentState === STATE.RECORDING) {
      const elapsed = performance.now() - recordStartTime;
      if (elTimer) elTimer.textContent = formatTimestamp(elapsed);
      timerRafId = requestAnimationFrame(runTimerLoop);
    }
  }

  /**
   * Renders a new FIFO queue entry in the DOM list.
   * @param {object} item
   */
  function appendQueueItemDOM(item) {
    if (!elQueueDisplay) return;

    // Remove placeholder if present
    const placeholder = elQueueDisplay.querySelector('.queue-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    const li = document.createElement('li');
    li.className = 'queue-item';
    li.id = `queue-item-${item.id}`;

    const seqSpan = document.createElement('span');
    seqSpan.className = 'queue-item-seq';
    seqSpan.textContent = `#${String(item.id).padStart(2, '0')}`;

    const soundSpan = document.createElement('span');
    soundSpan.className = 'queue-item-sound';
    soundSpan.textContent = item.sound;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'queue-item-time font-mono';
    timeSpan.textContent = `+${formatRelativeSeconds(item.timestamp)}`;

    li.appendChild(seqSpan);
    li.appendChild(soundSpan);
    li.appendChild(timeSpan);

    elQueueDisplay.appendChild(li);

    // Auto-scroll to bottom of queue
    elQueueDisplay.scrollTop = elQueueDisplay.scrollHeight;
  }

  /**
   * Renders the entire FIFO queue DOM.
   */
  function renderFullQueueDOM() {
    if (!elQueueDisplay) return;
    elQueueDisplay.innerHTML = '';

    if (fifoQueue.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'queue-placeholder';
      emptyLi.textContent = 'Queue is empty. Click "Record" and trigger drum pads to capture timestamped beats.';
      elQueueDisplay.appendChild(emptyLi);
      return;
    }

    fifoQueue.forEach(function (item) {
      appendQueueItemDOM(item);
    });
  }

  /**
   * Starts live recording session.
   */
  function startRecording() {
    // If currently playing, stop playback first
    if (currentState === STATE.PLAYING) {
      stopPlayback();
    }

    // Reset FIFO queue for a fresh take
    fifoQueue.length = 0;
    eventSequenceCounter = 0;
    renderFullQueueDOM();

    currentState = STATE.RECORDING;
    recordStartTime = performance.now();
    totalRecordDuration = 0;

    updateUIState();
    runTimerLoop();
    console.log('[BeatRecorder] Recording started.');
  }

  /**
   * Stops recording session.
   */
  function stopRecording() {
    if (currentState !== STATE.RECORDING) return;

    if (timerRafId) {
      cancelAnimationFrame(timerRafId);
      timerRafId = null;
    }

    totalRecordDuration = performance.now() - recordStartTime;
    if (elTimer) elTimer.textContent = formatTimestamp(totalRecordDuration);

    currentState = STATE.IDLE;
    updateUIState();
    console.log(`[BeatRecorder] Recording stopped. Total events in FIFO queue: ${fifoQueue.length}`);
  }

  /**
   * Starts chronological FIFO queue playback.
   */
  function startPlayback() {
    if (fifoQueue.length === 0) return;
    if (currentState === STATE.RECORDING) stopRecording();

    clearScheduledPlayback();
    currentState = STATE.PLAYING;
    updateUIState();

    const playbackStartTime = performance.now();

    // Playback HUD Timer loop
    function runPlaybackTimer() {
      if (currentState === STATE.PLAYING) {
        const elapsed = performance.now() - playbackStartTime;
        if (elTimer) elTimer.textContent = formatTimestamp(elapsed);
        timerRafId = requestAnimationFrame(runPlaybackTimer);
      }
    }
    runPlaybackTimer();

    // Iterate through FIFO queue items in chronological order
    fifoQueue.forEach(function (item) {
      const timer = setTimeout(function () {
        if (currentState !== STATE.PLAYING) return;

        // 1. Acoustic trigger via AudioEngine
        if (window.AudioEngine && typeof window.AudioEngine.play === 'function') {
          window.AudioEngine.play(item.sound);
        }

        // 2. Visual trigger on matching drum pad
        const pad = document.querySelector(`.drum-pad[data-sound="${CSS.escape(item.sound)}"]`);
        if (pad) {
          pad.classList.remove('playing');
          void pad.offsetWidth;
          pad.classList.add('playing');
          setTimeout(function () {
            pad.classList.remove('playing');
          }, 120);
        }

        // 3. Highlight corresponding item in visual FIFO list
        highlightQueueItem(item.id);
      }, item.timestamp);

      scheduledPlaybackTimers.push(timer);
    });

    // Schedule playback completion or loop
    const lastEventTime = fifoQueue[fifoQueue.length - 1].timestamp;
    const endDuration = Math.max(totalRecordDuration, lastEventTime + 450);

    const completionTimer = setTimeout(function () {
      if (currentState !== STATE.PLAYING) return;

      if (checkboxLoop && checkboxLoop.checked) {
        // Continuous loop playback
        startPlayback();
      } else {
        stopPlayback();
      }
    }, endDuration);

    scheduledPlaybackTimers.push(completionTimer);
  }

  /**
   * Highlights a specific queue item in the visual DOM list.
   * @param {number} id
   */
  function highlightQueueItem(id) {
    if (!elQueueDisplay) return;

    // Remove previous highlights
    const activeItems = elQueueDisplay.querySelectorAll('.queue-item.active-event');
    activeItems.forEach(function (el) {
      el.classList.remove('active-event');
    });

    const target = document.getElementById(`queue-item-${id}`);
    if (target) {
      target.classList.add('active-event');
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Cancels all scheduled playback timers and cleans up active highlights.
   */
  function clearScheduledPlayback() {
    scheduledPlaybackTimers.forEach(function (t) {
      clearTimeout(t);
    });
    scheduledPlaybackTimers = [];

    if (timerRafId) {
      cancelAnimationFrame(timerRafId);
      timerRafId = null;
    }

    if (elQueueDisplay) {
      const activeItems = elQueueDisplay.querySelectorAll('.queue-item.active-event');
      activeItems.forEach(function (el) {
        el.classList.remove('active-event');
      });
    }
  }

  /**
   * Stops playback.
   */
  function stopPlayback() {
    clearScheduledPlayback();
    currentState = STATE.IDLE;
    updateUIState();
    console.log('[BeatRecorder] Playback stopped.');
  }

  /**
   * Clears the FIFO queue completely.
   */
  function clearQueue() {
    if (currentState === STATE.PLAYING) stopPlayback();
    if (currentState === STATE.RECORDING) stopRecording();

    fifoQueue.length = 0;
    eventSequenceCounter = 0;
    totalRecordDuration = 0;

    if (elTimer) elTimer.textContent = '00:00.000';
    renderFullQueueDOM();
    updateUIState();
    console.log('[BeatRecorder] FIFO queue cleared.');
  }

  /**
   * Captures an acoustic event when in RECORDING state.
   * Invoked via 'drum:hit' CustomEvent.
   * @param {string} soundName
   */
  function recordEvent(soundName) {
    if (currentState !== STATE.RECORDING) return;
    if (!soundName) return;

    const elapsed = Math.round(performance.now() - recordStartTime);
    eventSequenceCounter += 1;

    // FIFO Enqueue
    const entry = {
      id: eventSequenceCounter,
      sound: String(soundName).toLowerCase().trim(),
      timestamp: elapsed
    };

    fifoQueue.push(entry);
    appendQueueItemDOM(entry);
    updateUIState();
  }

  /**
   * Initializes recorder controls and event listeners.
   */
  function init() {
    btnRecord = document.getElementById('btn-record');
    btnStop = document.getElementById('btn-stop');
    btnPlay = document.getElementById('btn-play');
    btnClear = document.getElementById('btn-clear');
    checkboxLoop = document.getElementById('checkbox-loop');
    elStatus = document.getElementById('recorder-status');
    elTimer = document.getElementById('recorder-timer');
    elCount = document.getElementById('event-count');
    elQueueDisplay = document.getElementById('queue-display');
    elQueueBadge = document.getElementById('queue-badge');

    // Button event bindings (Zero inline onclick handlers!)
    if (btnRecord) {
      btnRecord.addEventListener('click', function () {
        if (currentState === STATE.RECORDING) {
          stopRecording();
        } else {
          startRecording();
        }
      });
    }

    if (btnStop) {
      btnStop.addEventListener('click', function () {
        if (currentState === STATE.RECORDING) {
          stopRecording();
        } else if (currentState === STATE.PLAYING) {
          stopPlayback();
        }
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        startPlayback();
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', function () {
        clearQueue();
      });
    }

    // Listen to decoupled 'drum:hit' CustomEvents emitted by InputController
    document.addEventListener('drum:hit', function (e) {
      if (e.detail && e.detail.sound) {
        recordEvent(e.detail.sound);
      }
    });

    updateUIState();
    console.log('[BeatRecorder] Initialized FIFO Beat Recorder.');
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    startRecording: startRecording,
    stopRecording: stopRecording,
    startPlayback: startPlayback,
    stopPlayback: stopPlayback,
    clearQueue: clearQueue,
    recordEvent: recordEvent,
    getQueue: function () { return fifoQueue.slice(); },
    getState: function () { return currentState; }
  };
});
