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
| **T-03A** | Modular Markup Architecture | Hero Section, Skills Matrix, Project Cards & Contact Form | **Completed** | 0 `<div>` tags, Explicit portrait dimensions, Commit: `feat(html): modular component architecture` |
| **T-03B** | Component Styling & Grid | CSS Grid layouts for Skills & Cards, Form Styling | **Completed** | Zero hardcoded hex in rules, No JS, Commit: `feat(css): modular component styling` |
| **T-03C** | Form State & Validation Engine | Client-side validation, accessible state handling | **Completed** | Native validation with live regions, Commit: `feat(js): contact form state engine` |

---

## Milestone T-03: Modular Component Architecture Specifications

### 1. Hero Section
- High-res vector portrait (`assets/portrait.svg`) with explicit dimensions (`width="160" height="160"`) to guarantee **Zero CLS** (Core Web Vitals).
- Personal headline: Tran Huu Thang (3rd-Year Information Systems Student | UIT).
- Concise professional pitch articulating engineering focus.

### 2. Theme Switcher
- Accessible button with `aria-pressed`, dynamic icon, and explicit accessible name.
- Persistent state via `localStorage` key `'theme'`.

### 3. Skills Matrix
- Categorized skill domains (Frontend Engineering, Backend & Databases, Architecture & Tools).
- Semantic structure using categorized badge lists arranged in CSS Grid (`.skills-categories-grid`).

### 4. Project Cards
- Self-contained `<article class="project-card" data-category="...">` blocks matching contract snippet:
  - `<header class="card-header">` with title & `<span class="badge">`.
  - `<p class="card-desc">` with description.
  - `<footer class="card-footer">` with accessible action links.

### 5. Contact Form
- Native semantic form with `<label>`, `<input>`, `<textarea>`, and validation attributes (`required`, `type="email"`, `autocomplete`).
- Inline accessible error containers (`aria-describedby`) and live status region (`role="status"`, `aria-live="polite"`).
- Client-side validation engine in `form.js` managing asynchronous submission state (`Sending...` -> `Success`) and keyboard focus redirection.

---

## Quality Gates & Verification Checklist
- [x] **Zero Div Tags Gate:** Exactly 0 `<div>` tags in `index.html`.
- [x] **Explicit Image Dimensions:** Explicit `width="160"` and `height="160"` preventing layout shifts.
- [x] **Zero Hardcoded Colors in CSS Rules:** 100% of color rules consume `var(--color-*)`.
- [x] **Client-Side Form State Engine:** Robust accessible validation, live region announcements, zero console errors.
- [x] **Strict Separation of Concerns:** T-03A, T-03B, T-03C executed via atomic commits.
