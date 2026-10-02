# TASK DECOMPOSITION & WORK BREAKDOWN STRUCTURE (WBS)

## Project Overview
- **Project:** Personal Portfolio Web Application
- **Standard:** WCAG 2.2 AA / W3C Semantic HTML Standards
- **Strategy:** Atomic Milestones with Strict Separation of Concerns & 4-State Resilient Contract

---

## Work Breakdown Structure (WBS)

| Task ID | Component / Milestone | Description | Status | Constraints |
|---------|-----------------------|-------------|--------|-------------|
| **T-01** | HTML Semantic Architecture | Semantic Landmark Tree & Accessible Skip-Link | **Completed** | 0 `<div>` tags, 0 CSS |
| **T-02A** | Design Tokens & Reset | CSS Variables (:root, dark) & Modern Reset | **Completed** | Zero hardcoded hex in rules, No JS, Commit: `feat(css): tokens & reset` |
| **T-02B** | 2D Grid Layout | Responsive 2D Grid Layout (Desktop & 375px Mobile) | **Completed** | Zero horizontal scroll, No JS, Commit: `feat(css): responsive grid` |
| **T-02C** | Theme Engine | Dark Mode Toggle, LocalStorage Persistence | **Completed** | Strict `localStorage` key `'theme'`, Zero CLS, Commit: `feat(js): dark mode engine` |
| **T-03A** | Modular Markup Architecture | Hero Section, Skills Matrix, Project Cards & Contact Form | **Completed** | 0 `<div>` tags, Explicit portrait dimensions |
| **T-03B** | Component Styling & Grid | CSS Grid layouts for Skills & Cards, Form Styling | **Completed** | Zero hardcoded hex in rules, No JS |
| **T-03C** | Form State & Validation Engine | Client-side validation, accessible state handling | **Completed** | Native validation with live regions |
| **T-04A** | Loading Skeleton | Pure CSS Shimmer Gradient Skeleton | **Completed** | Pure CSS gradient shimmer animation, Commit: `feat(css): skeleton` |
| **T-04B** | Live Data State | Flexbox Metadata Badges & Grid List | **Completed** | Flexbox badges + Grid list, Commit: `feat(css): live data state` |
| **T-04C** | Empty & Error States | Accessible Empty & Error states with Retry trigger | **Completed** | `role="alert"`, retry button, Commit: `feat(components): empty & error states` |
| **T-04D** | 4-State Machine Engine | Finite State Machine (FSM) client engine | **Completed** | Event-driven transitions, Commit: `feat(js): 4-state resilient state machine` |

---

## Exercise 04: The 4-State Resilient Component Contract

### 1. Finite State Machine (FSM) Specification

```
      +-------------+
      |    IDLE     |
      +-------------+
             |
        (INIT_FETCH)
             v
      +-------------+  FETCH_RESOLVED (data > 0)  +-------------+
      |             | --------------------------> |   SUCCESS   |
      |   LOADING   |  FETCH_RESOLVED (data == 0) | (Live Data) |
      |  (Skeleton) | --------------------------> +-------------+
      |             |                             +-------------+
      |             | --------------------------> |    EMPTY    |
      +-------------+        FETCH_REJECTED       +-------------+
             ^                                           |
             |                                    +-------------+
             +-------------- (USER_RETRY) ------- |    ERROR    |
                                                  +-------------+
```

### 2. State Transition Matrix

| Current State | Event / Trigger | Next State | DOM Representation & ARIA Attributes |
|---|---|---|---|
| **IDLE** | `INIT_FETCH` | **LOADING** | Render `.skeleton-list`, set `aria-busy="true"`, announce "Loading live project data..." |
| **LOADING** | `FETCH_RESOLVED (items > 0)` | **SUCCESS** | Render `.projects-grid` with flexbox metadata badges, set `aria-busy="false"` |
| **LOADING** | `FETCH_RESOLVED (items == 0)` | **EMPTY** | Render `.empty-state` container with informative explanation and clear filter action |
| **LOADING** | `FETCH_REJECTED` | **ERROR** | Render `.error-state` container (`role="alert"`), render accessible retry trigger button |
| **ERROR** | `USER_RETRY` | **LOADING** | Trigger immediate re-fetch cycle, redirect focus, restart CSS shimmer skeleton |

---

## Milestone T-04A: Pure CSS Shimmer Skeleton (Completed)
- Implemented `.skeleton-item` with pure CSS linear gradient shimmer.
- Animation `@keyframes shimmer` (200% background-size with infinite translation).
- Tokenized skeleton base and highlight colors supporting both Light and Dark themes.
- Rendered accessible skeleton placeholder list with `aria-busy="true"`.

## Milestone T-04B: Live Data State (Completed)
- Rendered live project data items inside responsive CSS Grid `.projects-grid`.
- Integrated flexbox metadata badges (`.metadata-badge`, `.card-stats`) for repository stars, version badges, and categories.
- Verified 0 `<div>` elements and responsive layout at 375px mobile.

## Milestone T-04C: Empty & Error States (Completed)
- Implemented accessible `.empty-state` with guidance messaging and action trigger button.
- Implemented accessible `.error-state` with `role="alert"` and accessible retry trigger `<button class="retry-btn">`.
- Verified contrast ratios and responsive wrapping without horizontal overflow.

## Milestone T-04D: 4-State Resilient State Machine Engine (Completed)
- Implemented finite state machine in `state-machine.js` coordinating all 4 states (`LOADING`, `SUCCESS`, `EMPTY`, `ERROR`).
- Connected accessible retry trigger to re-initiate fetch workflow (`ERROR` -> `LOADING` -> `SUCCESS`).
- Added live state inspection controls enabling instant live defense testing of all 4 states.
- Verified 0 `<div>` tags in `index.html` and zero console errors.



