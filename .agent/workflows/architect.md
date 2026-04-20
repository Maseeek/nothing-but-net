---
description: Architectural Planning Session
---

# Architectural Planning Session

1. **Goal Extraction**
   - Ask the user to describe the "Dream State" of the project after this change.
   - Clarify the high-level "Why" to align the agent's autonomous decisions.

2. **Workspace Context Map**
   - Identify all files and systems affected. 
   - Check for existing patterns or legacy code that might conflict.
   - List dependencies that need to be added or updated.

3. **Tech Spec Generation**
   - Draft a `RFC_FeatureName.md` file (Request for Comments).
   - Outline:
     - The Problem
     - The Proposed Solution
     - Database Schema Changes (if any)
     - API Changes (if any)
     - **Agentic Logic**: How will the agent verify success? (Tests, logs, manual checks).
     - **Edge Cases**: List at least 3 things that could go wrong and how to handle them.

4. **User Review**
   - Present the RFC to the user.
   - Ask: "Does this match your mental model? What did I miss?"

5. **Approval & Tasking**
   - Only once approved, update `TASKS.MD` with a detailed checklist.
   - Execute in small, verifiable cycles.