# Original User Request

## 2026-10-17T22:49:33Z

This is a single self-contained cleanup and redesign; keep it small and focused.

Simplify the Retrocanopy website front page so that everything is removed except for the official Retrocanopy logo and the "Retrocanopy" text directly below it, centered cleanly with the synthwave aesthetic. Clean up and eliminate all orphaned/unused code, obsolete sections, unneeded modals, and clutter across the codebase.

Working directory: c:\Users\josep\OneDrive\Desktop\Retrocanopy\Website
Integrity mode: development

## Requirements

### R1. Minimal Clean Hero Presentation
Strip all sections, product carousels, countdown banners, portal sections, forms, and footers from index.html. Only the official Retrocanopy logo (assets/logo.png) and the styled brand text "RETROCANOPY" directly beneath it must remain, beautifully centered vertically and horizontally on the retro synthwave grid background.

### R2. Codebase Cleanliness and Optimization
Clean up style.css and script.js to remove styles, scripts, and listeners that are no longer used by the minimal page (or preserve cleanly segregated modules without runtime errors). Ensure zero console errors, zero broken asset links, and lightweight, modern responsiveness.

### R3. Preview Verification
Ensure the local development server or preview serves the updated minimal page without errors, verified via HTTP response inspection or server restart.

## Acceptance Criteria

### Visual Presentation
- [ ] index.html displays solely the Retrocanopy logo and the "RETROCANOPY" text below it, centered in viewport.
- [ ] All previous buttons, carousels, forms, and subpage links are removed from index.html.
- [ ] The retro synthwave dark background / grid styling remains visually intact and striking.

### Code Quality & Execution
- [ ] No JavaScript runtime or console errors on page load.
- [ ] No broken CSS or image 404 links.
- [ ] Code is formatted, clean, and minimal.
- [ ] Dev server responds with HTTP 200 on http://localhost:8080/index.html.
