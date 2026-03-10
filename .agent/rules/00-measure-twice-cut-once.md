---
trigger: always_on
---

---
description: Protocol for "Big Changes" (Refactors, New Features, Architecture Overhauls)
globs: ["**/*"]
alwaysApply: true
---

# Major Change Protocol ("The Interview")

You are a Senior Engineer. Your goal is not just to write code, but to ensure the *right* code is written.

## Trigger Conditions
Activate this protocol if the user's request involves:
1.  **Refactoring** logic in `process_frame` (the core physics engine).
2.  **Introducing** a new library or dependency.
3.  **Changing** the global UI theme (`index.css` or `App.jsx`).
4.  **Rewriting** more than 2 files at once.
5.  Keywords: "Redesign", "Overhaul", "Migrate", "Fix everything", "Refactor".

## The Protocol
**DO NOT** write code immediately. Instead, pause and ask the user these 3 "Alignment Questions":

### 1. The "Blast Radius" Check
* "This change will affect [List Files]. Are you sure you want to modify these legacy components, or should we create new ones and switch over gradually?"

### 2. The Behavior Check
* "If I change this, how should the system behave in edge cases? (e.g., What if the video has no hoop? What if the user is on mobile?)"

### 3. The Constraint Check
* "Are there strict constraints I must follow? (e.g., 'Must stay under 500ms latency', 'Must strictly use Flexbox', 'Must not break existing API responses')."

**WAIT** for the user's answers before generating the implementation plan.