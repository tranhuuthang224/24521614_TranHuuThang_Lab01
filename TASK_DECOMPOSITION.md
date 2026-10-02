# TASK DECOMPOSITION & WORK BREAKDOWN STRUCTURE (WBS)

## Project Overview
- **Project:** Personal Portfolio Web Application
- **Standard:** WCAG 2.1 AA / W3C Semantic HTML Standards
- **Strategy:** Atomic Milestones with Strict Separation of Concerns

---

## Work Breakdown Structure (WBS)

| Task ID | Component / Milestone | Description | Status | Constraints |
|---------|-----------------------|-------------|--------|-------------|
| **T-01** | HTML Semantic Architecture | Semantic Landmark Tree & Accessible Skip-Link | **Declared / Completed** | **0 `<div>` tags**, **0 CSS** (One-shot penalty rule) |
| **T-02** | Styling & Presentation | CSS Layout, Reset, & Visual Styling | Pending | Blocked until T-01 passes verification gate |
| **T-03** | Interactive Components | Accessible Navigation & Interactive Behaviors | Pending | - |

---

## WBS Task T-01: Semantic Landmark Tree & Accessible Skip-Link

### 1. Task Objective
Establish the foundational semantic HTML document structure using native HTML5 landmark elements and explicit WAI-ARIA landmark roles, implementing an accessible skip-to-content navigation mechanism without any presentation styling (CSS).

### 2. Landmark Hierarchy Contract
- **Zero-Div Contract (0 `<div>` elements):**
  - No `<div>` elements are allowed anywhere in the document tree.
  - All content grouping and structural containers must strictly use semantic landmark and sectioning tags.
- **Landmark Mapping:**
  - **Skip Link:** `<a href="#main-content" class="skip-link">Skip to main content</a>` (Directly targets the primary landmark `#main-content`).
  - **Banner Landmark:** `<header role="banner">` with top-level `<h1>Jane Doe, Lead Engineer</h1>`.
  - **Navigation Landmark:** `<nav role="navigation" aria-label="Primary">` containing an unordered list (`<ul>`) of navigation items.
  - **Main Landmark:** `<main id="main-content" role="main">` hosting the unique core content of the page.
  - **Sections:** `<section id="about">` and `<section id="projects">` representing thematic content blocks within `<main>`.

### 3. Accessible Skip-Link Specification
- Positioned as the first interactive element immediately inside the `<body>`.
- References target `#main-content` (or `#main`), allowing keyboard-only and screen reader users to bypass top-level header and navigation landmarks.
- Accessible text: `Skip to main content` / `Skip to Content`.

### 4. Constraints & Anti-Regressions
- **One-Shot Prompt Penalty Prevention:**
  - Strictly **ZERO CSS** in this milestone commit.
  - No `<style>` elements.
  - No inline `style="..."` attributes.
  - No `<link rel="stylesheet">` imports.
  - Commits that mix CSS with HTML in this milestone incur a 0-point penalty.
- **Div Prohibition:**
  - Automated verification must yield exactly 0 instances of `<div` in `index.html`.

### 5. Verification Gate & Acceptance Criteria
- [x] **Chrome DevTools Verification:**
  - Open `index.html` in Chrome.
  - Open **DevTools -> Elements -> Accessibility**.
  - Inspect the **Accessibility Tree / Landmarks**:
    - `banner` landmark is recognized.
    - `navigation` landmark with label `"Primary"` is recognized.
    - `main` landmark with ID `main-content` is recognized.
- [x] **Zero Div Elements Gate:** Verified 0 `<div>` tags in DOM.
- [x] **Zero CSS Gate:** Verified 0 stylesheets, 0 style blocks, 0 inline styles.
- [x] **Atomic Commit Gate:** Committed to Git with the exact message:
  `feat(html): semantic landmark tree`
