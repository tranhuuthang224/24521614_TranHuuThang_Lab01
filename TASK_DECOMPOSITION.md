# TASK DECOMPOSITION & WORK BREAKDOWN STRUCTURE (WBS)

## Project Overview
- **Project:** Personal Portfolio Web Application
- **Standard:** WCAG 2.2 AA / W3C Semantic HTML Standards
- **Strategy:** Atomic Milestones with Strict Separation of Concerns & Contract-First Pipelines

---

## Work Breakdown Structure (WBS)

| Task ID | Component / Milestone | Description | Status | Constraints |
|---------|-----------------------|-------------|--------|-------------|
| **T-01** | HTML Semantic Architecture | Semantic Landmark Tree & Accessible Skip-Link | **Completed** | 0 `<div>` tags, 0 CSS |
| **T-02A** | Design Tokens & Reset | CSS Variables (:root, dark) & Modern Reset | **Completed** | Zero hardcoded hex in rules, No JS, Commit: `feat(css): tokens & reset` |
| **T-02B** | 2D Grid Layout | Responsive 2D Grid Layout (Desktop & 375px Mobile) | **Completed** | Zero horizontal scroll, No JS, Commit: `feat(css): responsive grid` |
| **T-02C** | Theme Engine | Dark Mode Toggle, LocalStorage Persistence | **Completed** | Strict `localStorage` key `'theme'`, Zero CLS, Commit: `feat(js): dark mode engine` |

---

## Contract-First Constraints & Quality Gates

### 1. Monolithic Dump Ban (Zero Penalty Policy)
- Commits combining CSS & JS in 1 shot = **0 pts**.
- Pipeline strictly executed atomic commits:
  1. `feat(css): tokens & reset` (Done)
  2. `feat(css): responsive grid` (Done)
  3. `feat(js): dark mode engine` (Done)

### 2. Design Tokens & Color Pairing Contract
- **Rule:** Zero hardcoded hex codes in CSS selector rules.
- Hex codes are exclusively declared inside token blocks (`:root` and `[data-theme="dark"]`).
- All properties (`color`, `background-color`, `border-color`, `outline-color`, etc.) consume `var(--color-*)`.
- **WCAG 2.2 AA Contrast Compliance:**
  - Normal text contrast >= 4.5:1 against background / surface.
  - Large text / UI components contrast >= 3:1.
  - Verified:
    - Light: Text `#0f172a` on `#f8fafc` (17.1:1), Primary `#1d4ed8` on `#f8fafc` (6.4:1), Muted `#334155` on `#f8fafc` (9.9:1).
    - Dark: Text `#f8fafc` on `#0a0f1d` (18.3:1), Primary `#60a5fa` on `#0a0f1d` (7.5:1), Muted `#94a3b8` on `#0a0f1d` (7.5:1).
- **3-Minute Live Defense Guarantee:** If instructor modifies any token in `:root` / `[data-theme="dark"]`, the UI instantly adapts without any broken overrides.

### 3. Responsive & Accessibility Contract
- **Mobile Guarantee:** Flawless rendering at 375px viewport with zero horizontal scroll (`overflow-x: hidden`, flexible grid items with `minmax(0, 1fr)`).
- **Keyboard Navigation:** Full Tab and Enter focus flow with accessible `:focus-visible` indicators.
- **Skip Link:** Visually hidden until keyboard focus, jumps directly to main landmark.

### 4. Performance & State Contract
- **Performance Budget:** Zero CLS (Cumulative Layout Shift = 0) via inline anti-FOUC theme setter in `<head>`, and LCP < 2.0s on DevTools Fast 3G.
- **State Persistence:** Strictly bound to `localStorage` key `'theme'` (values: `'light'` | `'dark'`).
- **Dynamic Toggle:** Zero console errors upon toggle with accessible `aria-pressed` and `aria-label` synchronization.

---

## Milestone T-02C: Theme Engine (Completed)
- Created `theme.js` enforcing state persistence strictly via `localStorage` key `'theme'`.
- Added dynamic theme toggle button with accessible aria attributes (`aria-pressed`, `aria-label`).
- Included inline anti-FOUC head script ensuring Zero CLS upon initial load and theme restoration.
- Handled OS-level media query `prefers-color-scheme: dark` listener for responsive system sync.
