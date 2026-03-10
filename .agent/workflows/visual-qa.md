---
description: Visual Quality Assurance
---

# Visual Quality Assurance

1. **CSS Variable Check**
   - Scan modified `.css` or `.jsx` files.
   - Are there hardcoded hex codes? Replace them with `var(--accent-color)` etc.

2. **Glassmorphism Check**
   - Ensure any new container has the `.glass` class.
   - Ensure text contrast is sufficient (white text on dark glass).

3. **Responsiveness**
   - Check if `flex-direction` switches to `column` on screens smaller than 768px.