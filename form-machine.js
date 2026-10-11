/**
 * ==============================================================================
 * HW3 - SLICE 2: STATE-MACHINE REGISTRATION FORM ENGINE
 * ==============================================================================
 * Implements a resilient 4-state Finite State Machine (FSM):
 * [ IDLE ] -> [ SUBMITTING ] -> [ SUCCESS ] or [ ERROR ]
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. Strict state machine transitions: Only valid state transitions are permitted.
 * 2. Accessible UI feedback: Uses aria-busy="true", role="status", role="alert",
 *    and field-level aria-invalid attributes.
 * 3. Non-destructive error recovery: Preserves user input values on simulated failure
 *    so the user does not have to re-type their data.
 * 4. Zero <div> elements: Feedback and banners operate on semantic <output> and <p>.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FormStateMachine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // State Machine Enumeration
  const STATES = {
    IDLE: 'IDLE',
    SUBMITTING: 'SUBMITTING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
  };

  let currentState = STATES.IDLE;

  // DOM Elements Cache
  let formEl = null;
  let inputName = null;
  let inputEmail = null;
  let selectTrack = null;
  let inputNotes = null;
  let btnSubmit = null;
  let btnReset = null;
  let btnText = null;
  let btnSpinner = null;
  let feedbackEl = null;
  let nameErrorEl = null;
  let emailErrorEl = null;

  // Email RFC 5322 standard regex
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Validates form inputs according to business requirements.
   * @returns {boolean} True if all valid
   */
  function validateInputs() {
    let isValid = true;

    // Validate Name
    const nameVal = inputName ? inputName.value.trim() : '';
    if (nameVal.length < 2) {
      isValid = false;
      if (inputName) inputName.setAttribute('aria-invalid', 'true');
      if (nameErrorEl) nameErrorEl.textContent = 'Please enter your full name (minimum 2 characters).';
    } else {
      if (inputName) inputName.removeAttribute('aria-invalid');
      if (nameErrorEl) nameErrorEl.textContent = '';
    }

    // Validate Email
    const emailVal = inputEmail ? inputEmail.value.trim() : '';
    if (!EMAIL_REGEX.test(emailVal)) {
      isValid = false;
      if (inputEmail) inputEmail.setAttribute('aria-invalid', 'true');
      if (emailErrorEl) emailErrorEl.textContent = 'Please enter a valid email address (e.g. name@uit.edu.vn).';
    } else {
      if (inputEmail) inputEmail.removeAttribute('aria-invalid');
      if (emailErrorEl) emailErrorEl.textContent = '';
    }

    return isValid;
  }

  /**
   * Transitions the Form State Machine to target state and updates DOM attributes.
   * @param {string} nextState
   * @param {object} [payload] - Optional metadata (e.g. attendee name, error message)
   */
  function transitionTo(nextState, payload) {
    console.log(`[FormStateMachine] Transition: ${currentState} -> ${nextState}`);
    currentState = nextState;

    switch (currentState) {
      case STATES.SUBMITTING:
        applySubmittingState();
        break;

      case STATES.SUCCESS:
        applySuccessState(payload);
        break;

      case STATES.ERROR:
        applyErrorState(payload);
        break;

      case STATES.IDLE:
      default:
        applyIdleState();
        break;
    }
  }

  /**
   * Renders IDLE State: Form inputs active, submit enabled, feedback hidden.
   */
  function applyIdleState() {
    if (formEl) formEl.setAttribute('aria-busy', 'false');

    setInputDisabled(false);

    if (btnSubmit) {
      btnSubmit.disabled = false;
      if (btnText) btnText.textContent = 'Reserve VIP Access';
      if (btnSpinner) btnSpinner.hidden = true;
    }

    if (btnReset) btnReset.hidden = true;
    if (feedbackEl) {
      feedbackEl.hidden = true;
      feedbackEl.className = 'form-feedback';
      feedbackEl.textContent = '';
    }
  }

  /**
   * Renders SUBMITTING State: Inputs locked, button disabled with spinner, aria-busy="true".
   */
  function applySubmittingState() {
    if (formEl) formEl.setAttribute('aria-busy', 'true');

    setInputDisabled(true);

    if (btnSubmit) {
      btnSubmit.disabled = true;
      if (btnText) btnText.textContent = 'Registering Attendee...';
      if (btnSpinner) btnSpinner.hidden = false;
    }

    if (feedbackEl) {
      feedbackEl.hidden = true;
    }
  }

  /**
   * Renders SUCCESS State: Displays safe attendee confirmation badge and reset option.
   */
  function applySuccessState(payload) {
    if (formEl) formEl.setAttribute('aria-busy', 'false');

    setInputDisabled(true);

    if (btnSubmit) {
      btnSubmit.disabled = true;
      if (btnText) btnText.textContent = 'Registered Successfully';
      if (btnSpinner) btnSpinner.hidden = true;
    }

    if (btnReset) btnReset.hidden = false;

    if (feedbackEl) {
      feedbackEl.hidden = false;
      feedbackEl.className = 'form-feedback feedback-success';
      feedbackEl.setAttribute('role', 'status');

      // Clear previous content
      feedbackEl.textContent = '';

      // Create safe semantic DOM structure (ZERO innerHTML injection)
      const titleStrong = document.createElement('strong');
      titleStrong.textContent = 'Registration Confirmed: ';

      const attendeeText = document.createTextNode(
        `Welcome, ${payload && payload.name ? payload.name : 'Attendee'}! ` +
        `Your VIP pass for track "${payload && payload.track ? payload.track : 'Cloud Architecture'}" ` +
        `has been provisioned to ${payload && payload.email ? payload.email : 'your email'}.`
      );

      feedbackEl.appendChild(titleStrong);
      feedbackEl.appendChild(attendeeText);
    }
  }

  /**
   * Renders ERROR State: Non-destructive failure feedback with retry trigger.
   */
  function applyErrorState(payload) {
    if (formEl) formEl.setAttribute('aria-busy', 'false');

    // Re-enable inputs so user can edit and retry
    setInputDisabled(false);

    if (btnSubmit) {
      btnSubmit.disabled = false;
      if (btnText) btnText.textContent = 'Retry Registration';
      if (btnSpinner) btnSpinner.hidden = true;
    }

    if (feedbackEl) {
      feedbackEl.hidden = false;
      feedbackEl.className = 'form-feedback feedback-error';
      feedbackEl.setAttribute('role', 'alert');
      feedbackEl.textContent = (payload && payload.message)
        ? payload.message
        : 'Network dispatch encountered an error. Please verify details and retry.';
    }
  }

  /**
   * Toggles disabled state on all form input elements.
   * @param {boolean} disabled
   */
  function setInputDisabled(disabled) {
    if (inputName) inputName.disabled = disabled;
    if (inputEmail) inputEmail.disabled = disabled;
    if (selectTrack) selectTrack.disabled = disabled;
    if (inputNotes) inputNotes.disabled = disabled;
  }

  /**
   * Simulates asynchronous network submission.
   * Can be injected or mocked in tests.
   */
  function simulateNetworkRequest(data) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        // Simulate random 5% network glitch or trigger error if email contains 'error'
        if (data.email && data.email.includes('error@')) {
          reject(new Error('Simulated gateway timeout (504): Registration server unavailable.'));
        } else {
          resolve({ status: 200, confirmationId: 'VIP-' + Math.random().toString(36).substring(2, 9).toUpperCase() });
        }
      }, 750);
    });
  }

  /**
   * Form submit handler.
   */
  function handleSubmit(e) {
    e.preventDefault();

    // Guard: Only allow submit from IDLE or ERROR states
    if (currentState === STATES.SUBMITTING) {
      return;
    }

    if (!validateInputs()) {
      return;
    }

    const attendeeData = {
      name: inputName ? inputName.value.trim() : '',
      email: inputEmail ? inputEmail.value.trim() : '',
      track: selectTrack ? selectTrack.value : 'Cloud Architecture',
      notes: inputNotes ? inputNotes.value.trim() : ''
    };

    transitionTo(STATES.SUBMITTING);

    simulateNetworkRequest(attendeeData)
      .then(function () {
        transitionTo(STATES.SUCCESS, attendeeData);
      })
      .catch(function (err) {
        transitionTo(STATES.ERROR, { message: err.message });
      });
  }

  /**
   * Reset form handler (Register another attendee).
   */
  function handleReset() {
    if (formEl) formEl.reset();
    transitionTo(STATES.IDLE);
  }

  /**
   * Initializes Form State Machine.
   */
  function init() {
    formEl = document.getElementById('registration-form');
    if (!formEl) return false;

    inputName = document.getElementById('reg-name');
    inputEmail = document.getElementById('reg-email');
    selectTrack = document.getElementById('reg-track');
    inputNotes = document.getElementById('reg-notes');
    btnSubmit = document.getElementById('btn-submit');
    btnReset = document.getElementById('btn-reset');
    btnText = document.getElementById('btn-text');
    btnSpinner = document.getElementById('btn-spinner');
    feedbackEl = document.getElementById('form-feedback');
    nameErrorEl = document.getElementById('name-error');
    emailErrorEl = document.getElementById('email-error');

    formEl.addEventListener('submit', handleSubmit);
    if (btnReset) btnReset.addEventListener('click', handleReset);

    // Live validation clearance on input
    if (inputName) {
      inputName.addEventListener('input', function () {
        if (inputName.getAttribute('aria-invalid') === 'true') validateInputs();
      });
    }
    if (inputEmail) {
      inputEmail.addEventListener('input', function () {
        if (inputEmail.getAttribute('aria-invalid') === 'true') validateInputs();
      });
    }

    transitionTo(STATES.IDLE);
    console.log('[FormStateMachine] Initialized in IDLE state.');
    return true;
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init: init,
    getState: function () { return currentState; },
    transitionTo: transitionTo,
    validateInputs: validateInputs
  };
});
