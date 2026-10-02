/**
 * ==========================================================================
 * CONTACT FORM CLIENT-SIDE STATE & VALIDATION ENGINE (SUB-TASK T-03C)
 * ==========================================================================
 * Strict Contract:
 * - Native form validation with accessible live-region error announcements.
 * - Dynamic button and status state management (loading, success, error).
 * - Focus management directing keyboard navigation to first invalid control.
 * - Zero console errors.
 */

(function () {
  'use strict';

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var nameInput = document.getElementById('contact-name');
    var emailInput = document.getElementById('contact-email');
    var messageInput = document.getElementById('contact-message');
    var submitBtn = document.getElementById('form-submit-btn');
    var statusEl = document.getElementById('form-status');

    var nameError = document.getElementById('name-error');
    var emailError = document.getElementById('email-error');
    var messageError = document.getElementById('message-error');

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setFieldError(input, errorEl, message) {
      if (input) {
        input.setAttribute('aria-invalid', 'true');
      }
      if (errorEl) {
        errorEl.textContent = message;
      }
    }

    function clearFieldError(input, errorEl) {
      if (input) {
        input.removeAttribute('aria-invalid');
      }
      if (errorEl) {
        errorEl.textContent = '';
      }
    }

    function setStatus(message, state) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.setAttribute('data-state', state);
      statusEl.hidden = false;
    }

    function clearStatus() {
      if (!statusEl) return;
      statusEl.textContent = '';
      statusEl.removeAttribute('data-state');
      statusEl.hidden = true;
    }

    // Real-time clearance of errors upon input
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        if (nameInput.value.trim().length >= 2) {
          clearFieldError(nameInput, nameError);
        }
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', function () {
        if (emailPattern.test(emailInput.value.trim())) {
          clearFieldError(emailInput, emailError);
        }
      });
    }

    if (messageInput) {
      messageInput.addEventListener('input', function () {
        if (messageInput.value.trim().length >= 10) {
          clearFieldError(messageInput, messageError);
        }
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearStatus();

      var hasError = false;
      var firstInvalidInput = null;

      // Validate Name
      var nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        setFieldError(nameInput, nameError, 'Please enter your name (at least 2 characters).');
        hasError = true;
        if (!firstInvalidInput) firstInvalidInput = nameInput;
      } else {
        clearFieldError(nameInput, nameError);
      }

      // Validate Email
      var emailVal = emailInput ? emailInput.value.trim() : '';
      if (!emailVal || !emailPattern.test(emailVal)) {
        setFieldError(emailInput, emailError, 'Please enter a valid email address.');
        hasError = true;
        if (!firstInvalidInput) firstInvalidInput = emailInput;
      } else {
        clearFieldError(emailInput, emailError);
      }

      // Validate Message
      var messageVal = messageInput ? messageInput.value.trim() : '';
      if (!messageVal || messageVal.length < 10) {
        setFieldError(messageInput, messageError, 'Please enter a message (at least 10 characters).');
        hasError = true;
        if (!firstInvalidInput) firstInvalidInput = messageInput;
      } else {
        clearFieldError(messageInput, messageError);
      }

      if (hasError) {
        setStatus('Please correct the highlighted fields before submitting.', 'error');
        if (firstInvalidInput && typeof firstInvalidInput.focus === 'function') {
          firstInvalidInput.focus();
        }
        return;
      }

      // Valid state: Handle simulated submission
      if (submitBtn) {
        submitBtn.disabled = true;
        var btnTextEl = submitBtn.querySelector('.btn-text');
        if (btnTextEl) btnTextEl.textContent = 'Sending...';
      }

      // Simulate asynchronous dispatch
      setTimeout(function () {
        setStatus('Thank you! Your message has been sent successfully.', 'success');
        form.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          var btnTextEl = submitBtn.querySelector('.btn-text');
          if (btnTextEl) btnTextEl.textContent = 'Send Message';
        }
      }, 600);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
