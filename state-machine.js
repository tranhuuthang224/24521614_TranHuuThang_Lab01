/**
 * ==========================================================================
 * 4-STATE RESILIENT COMPONENT STATE MACHINE (SUB-TASK T-04D)
 * ==========================================================================
 * Finite State Machine managing 4 distinct operational states:
 * - LOADING: Pure CSS shimmer skeleton placeholders (aria-busy="true")
 * - SUCCESS: Live data cards with flexbox metadata badges
 * - EMPTY:   Informative empty state with reset trigger
 * - ERROR:   Resilient error state (role="alert") with accessible retry trigger
 */

(function () {
  'use strict';

  var STATES = {
    LOADING: 'loading',
    SUCCESS: 'success',
    EMPTY: 'empty',
    ERROR: 'error'
  };

  function initStateMachine() {
    var feedContainer = document.getElementById('projects-feed');
    var controls = document.querySelector('.state-controls');
    if (!feedContainer) return;

    var currentState = STATES.LOADING;

    // Cache the original live content HTML
    var liveContentHTML = feedContainer.innerHTML;

    var skeletonHTML =
      '<ul class="skeleton-list" aria-busy="true" aria-label="Loading projects feed">' +
        '<li class="skeleton-card">' +
          '<span class="skeleton-item skeleton-title"></span>' +
          '<span class="skeleton-item skeleton-desc"></span>' +
          '<span class="skeleton-item skeleton-footer"></span>' +
        '</li>' +
        '<li class="skeleton-card">' +
          '<span class="skeleton-item skeleton-title"></span>' +
          '<span class="skeleton-item skeleton-desc"></span>' +
          '<span class="skeleton-item skeleton-footer"></span>' +
        '</li>' +
        '<li class="skeleton-card">' +
          '<span class="skeleton-item skeleton-title"></span>' +
          '<span class="skeleton-item skeleton-desc"></span>' +
          '<span class="skeleton-item skeleton-footer"></span>' +
        '</li>' +
      '</ul>';

    var emptyHTML =
      '<section class="empty-state" aria-labelledby="empty-state-title">' +
        '<span class="state-icon" aria-hidden="true">&#128269;</span>' +
        '<h3 id="empty-state-title" class="state-title">No Projects Found</h3>' +
        '<p class="state-desc">There are currently no items matching your criteria. Try adjusting your filters or reloading the feed.</p>' +
        '<button id="empty-action-btn" type="button" class="state-btn">Reset &amp; Reload Feed</button>' +
      '</section>';

    var errorHTML =
      '<section class="error-state" role="alert" aria-labelledby="error-state-title">' +
        '<span class="state-icon error-icon" aria-hidden="true">&#9888;</span>' +
        '<h3 id="error-state-title" class="state-title">Failed to Load Projects</h3>' +
        '<p class="state-desc">A network timeout occurred while communicating with the remote repository. Please retry your request.</p>' +
        '<button id="retry-btn" type="button" class="retry-btn" aria-label="Retry loading project data">' +
          '<span aria-hidden="true">&#8635;</span> Retry Connection' +
        '</button>' +
      '</section>';

    function updateControlButtons(state) {
      if (!controls) return;
      var buttons = controls.querySelectorAll('.state-switch-btn');
      buttons.forEach(function (btn) {
        var target = btn.getAttribute('data-target-state');
        btn.setAttribute('aria-pressed', target === state ? 'true' : 'false');
      });
    }

    function transitionTo(nextState) {
      currentState = nextState;
      feedContainer.setAttribute('data-state', nextState);
      updateControlButtons(nextState);

      switch (nextState) {
        case STATES.LOADING:
          feedContainer.setAttribute('aria-busy', 'true');
          feedContainer.innerHTML = skeletonHTML;
          break;

        case STATES.SUCCESS:
          feedContainer.setAttribute('aria-busy', 'false');
          feedContainer.innerHTML = liveContentHTML;
          break;

        case STATES.EMPTY:
          feedContainer.setAttribute('aria-busy', 'false');
          feedContainer.innerHTML = emptyHTML;
          var emptyBtn = feedContainer.querySelector('#empty-action-btn');
          if (emptyBtn) {
            emptyBtn.addEventListener('click', function () {
              triggerFetch(STATES.SUCCESS);
            });
          }
          break;

        case STATES.ERROR:
          feedContainer.setAttribute('aria-busy', 'false');
          feedContainer.innerHTML = errorHTML;
          var retryBtn = feedContainer.querySelector('#retry-btn');
          if (retryBtn) {
            retryBtn.addEventListener('click', function () {
              triggerFetch(STATES.SUCCESS);
            });
            retryBtn.focus();
          }
          break;
      }
    }

    function triggerFetch(resolvedState) {
      transitionTo(STATES.LOADING);
      setTimeout(function () {
        transitionTo(resolvedState || STATES.SUCCESS);
      }, 700);
    }

    // Bind demo controls for instructor defense
    if (controls) {
      controls.addEventListener('click', function (e) {
        var targetBtn = e.target.closest('.state-switch-btn');
        if (!targetBtn) return;
        var targetState = targetBtn.getAttribute('data-target-state');
        if (targetState && STATES[targetState.toUpperCase()]) {
          transitionTo(targetState);
        }
      });
    }

    // Initial lifecycle: start with Pure CSS Shimmer Skeleton, then transition to Live Data
    transitionTo(STATES.LOADING);
    setTimeout(function () {
      transitionTo(STATES.SUCCESS);
    }, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStateMachine);
  } else {
    initStateMachine();
  }
})();
