---
trigger: always_on
description: Guidelines for maintaining the specific "Glassmorphism" aesthetic of Nothing But Net.
---

# Frontend Consistency Standards

To maintain the premium "Nothing But Net" look, all UI changes must adhere to these rules:

## 1. Glassmorphism Core
- **Background**: Use `backdrop-filter: blur(10px);` and `background: rgba(255, 255, 255, 0.05);`.
- **Borders**: Subtle white borders `1px solid rgba(255, 255, 255, 0.1);`.
- **Shadows**: Soft, multi-layered shadows for depth.

## 2. Color Palette
- **Accent**: `var(--accent-color)` (Basketball Orange/Vibrant Coral).
- **Background**: Dark, deep blues or charcoal, never pure black `#000`.
- **Text**: Off-white for readability on dark backgrounds.

## 3. Layout Best Practices
- **Navbar Spacing**: Ensure all page content has a `padding-top` or `margin-top` that accounts for the sticky navbar height (typically 70-80px).
- **Mobile First**: Use Flexbox/Grid with responsive breakpoints (`@media (max-width: 768px)`).
- **Navigation**: Always link back to the main dashboard/analytics page.

## 4. Component Verification
- Before submitting a UI change, use the `/visual-qa` workflow.
- Avoid inline styles; use `index.css` or scoped CSS modules if applicable.
