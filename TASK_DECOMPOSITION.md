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
| **HW1-M1** | WCAG 2.2 AA Audit | Contrast ratios, landmark accessible names, heading hierarchy | **Completed** | ≥ 4.5:1 contrast, all landmarks labeled, Commit: `fix(a11y): contrast & landmarks` |
| **HW1-M2** | Focus Trap Audit | Keyboard Tab & Enter flow, skip-link, no focus traps | **Completed** | Linear Tab order, skip-link targets `#main-content`, Commit: `fix(nav): keyboard trap prevention` |
| **HW1-M3** | Strict CSP & Zero Inline Handlers | Content Security Policy, externalize inline scripts | **Completed** | Zero `onclick=`, strict CSP meta tag, Commit: `fix(security): strict CSP policy` |
| **HW1-M4** | Lighthouse 100 Audit | Performance, SEO, Best Practices, Accessibility optimization | **Completed** | LCP < 2.0s, meta description, favicon, Commit: `perf: optimize assets` |
| **HW2-S1** | HTML data-sound Contract | Drum pad elements with decoupled data-sound & data-key contracts | **Completed** | 0 `<div>` tags, zero JS touched in step, Commit: `feat(html): drum kit data-sound contract` |
| **HW2-S2** | Polyphonic Audio Engine | Web Audio API synthesis with independent polyphony | **Completed** | No DOM dependencies, concurrent voices, Commit: `feat(audio): polyphonic playback engine` |
| **HW2-S3** | Keydown Throttled Input | keydown listener with event.repeat throttling & contract lookup | **Completed** | Throttle repeat, dynamic key lookup, Commit: `feat(input): keydown listener with repeat throttling` |
| **HW2-S4** | FIFO Beat Recorder | Timestamped event queue with record, playback, and FIFO visualization | **Completed** | Chronological FIFO queue, Commit: `feat(recorder): fifo beat recorder with timestamped queue` |

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


---

## HW1: Production Portfolio (Min 4 Commits)

### Acceptance Criteria
- Monolithic PRs or one-shot AI code = 0 pts for architecture.
- Min 4 atomic commits, each isolated to its concern.
- WCAG 2.2 AA compliant across all themes.
- Full keyboard navigation support (Tab & Enter).
- Zero console errors during dynamic theme toggling.
- Strict Content Security Policy enforced.

### Milestone HW1-M1: WCAG 2.2 AA Audit
- Verify all contrast ratios ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
- Ensure all landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) have accessible names.
- Validate heading hierarchy (h1 → h2 → h3) is logical and complete.
- Ensure all interactive elements have accessible labels.
- Add missing `aria-labelledby` where required.

### Milestone HW1-M2: Focus Trap Audit
- Verify linear Tab order: skip-link → theme toggle → nav → hero → skills → projects → state controls → contact form → footer.
- Ensure skip-link correctly focuses `#main-content` via `tabindex="-1"`.
- Confirm no keyboard traps in any interactive component.
- Validate Enter key activates all interactive elements.

### Milestone HW1-M3: Strict CSP & Zero Inline Handlers
- Externalize inline `<script>` in `<head>` (anti-FOUC) to separate JS file.
- Add `<meta http-equiv="Content-Security-Policy">` with strict directives.
- Verify zero `onclick=`, `onload=`, or other inline event handler attributes.
- All event binding strictly via `addEventListener()` in external JS files.

### Milestone HW1-M4: Lighthouse 100 Audit Score
- Add `<meta name="description">` for SEO.
- Add `<link rel="icon">` favicon.
- Ensure all images have explicit `width` and `height` dimensions.
- Verify LCP element loads efficiently (< 2.0s on Fast 3G).
- Optimize asset loading order and render-blocking resources.

---

## HW2: Drum Kit Engine (Contract-First Architecture)

### 1. Mandatory Architectural Decoupling Philosophy
HW2 implements strict architectural separation of concerns across 4 discrete layers:
1. **Markup Layer (Contract)**: HTML declares the relationship between hardware keys and acoustic samples using standard `data-*` attributes (`data-key`, `data-code`, `data-sound`). The markup contains zero presentation logic and zero behavioral logic.
2. **Audio Layer (Engine)**: Polyphonic synthesis engine operating strictly via the Web Audio API (`AudioContext`). It accepts sound tokens (`clap`, `kick`, `snare`, etc.) and produces concurrent acoustic voices without voice-stealing or clipping. It has zero coupling to the DOM or keyboard events.
3. **Input Layer (Controller)**: Event listener capturing hardware `keydown` and pointer interactions. It implements hardware `event.repeat` throttling to discard OS auto-repeat chatter and translates physical inputs into acoustic tokens via dynamic DOM contract querying.
4. **Recording Layer (FIFO Queue)**: Temporal event sequencer maintaining a timestamped First-In, First-Out queue of acoustic events. It supports real-time recording, high-precision playback, visual queue inspection, and loop cycles.

### 2. HTML data-sound Contract Matrix

| Key | Keyboard Code | Acoustic Token | Audio Characteristic | HTML Representation |
|:---:|:---:|:---:|:---:|:---|
| **A** | `KeyA` | `clap` | Multi-burst synthesized handclap with snappy decay | `<button class="drum-pad" data-key="a" data-code="KeyA" data-sound="clap">` |
| **S** | `KeyS` | `hihat` | High-pass filtered white noise burst (7 kHz, 0.05s) | `<button class="drum-pad" data-key="s" data-code="KeyS" data-sound="hihat">` |
| **D** | `KeyD` | `kick` | Punchy 808-style sine sweep (150 Hz -> 30 Hz) | `<button class="drum-pad" data-key="d" data-code="KeyD" data-sound="kick">` |
| **F** | `KeyF` | `openhat` | Resonant high-pass white noise with prolonged release | `<button class="drum-pad" data-key="f" data-code="KeyF" data-sound="openhat">` |
| **G** | `KeyG` | `boom` | Deep sub-bass acoustic drop (55 Hz -> 24 Hz, 0.8s) | `<button class="drum-pad" data-key="g" data-code="KeyG" data-sound="boom">` |
| **H** | `KeyH` | `ride` | High-frequency metallic inharmonic overtone cluster | `<button class="drum-pad" data-key="h" data-code="KeyH" data-sound="ride">` |
| **J** | `KeyJ` | `snare` | Dual-layer body oscillator (180 Hz) + filtered snare noise | `<button class="drum-pad" data-key="j" data-code="KeyJ" data-sound="snare">` |
| **K** | `KeyK` | `tom` | Tuned mid-range acoustic resonant sweep (120 Hz -> 65 Hz) | `<button class="drum-pad" data-key="k" data-code="KeyK" data-sound="tom">` |
| **L** | `KeyL` | `tink` | High-frequency acoustic bell/triangle strike (1800 Hz) | `<button class="drum-pad" data-key="l" data-code="KeyL" data-sound="tink">` |

### 3. FIFO Beat Recorder State Flow & Queue Specification

```
      +-------------+
      |    IDLE     | <-------------------------+
      +-------------+                           |
             |                                  |
      (START_RECORD)                            |
             v                                  |
      +-------------+      (STOP_RECORD)        |
      |  RECORDING  | --------------------------+
      |  (Push FIFO)|                           |
      +-------------+                           |
             |                                  |
       (START_PLAY)                             |
             v                                  |
      +-------------+      (FINISH / STOP)      |
      |   PLAYING   | --------------------------+
      | (Iter FIFO) |
      +-------------+
```

- **FIFO Queue Entry Schema**:
  ```typescript
  interface DrumEvent {
    id: number;          // Monotonic sequence index (1, 2, 3...)
    sound: string;       // Acoustic token ('kick', 'snare', etc.)
    timestamp: number;   // Milliseconds elapsed since recording start (performance.now() - t0)
  }
  ```

### 4. 3-Minute Live Defense Protocol
When the instructor requests changing a key binding (e.g., *“Change Kick from 'D' to 'X'”*):
1. Locate the target `<button class="drum-pad" data-sound="kick">` in [index.html](file:///c:/Work/UIT/web%20dev/lab1/index.html).
2. Modify `data-key="x"`, `data-code="KeyX"`, and the visual label `<kbd>X</kbd>`.
3. Save and refresh the browser.
4. **Refactor Time:** < 30 seconds. Because JavaScript queries `[data-key="${key}"]` directly from the DOM contract without hardcoded lookup tables, zero code changes are required in the JS engine.

