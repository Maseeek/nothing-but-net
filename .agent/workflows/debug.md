---
description: Structured Debugging & Error Recovery Loop
---

# Agentic Debugging Loop

Use this workflow when a command fails or a bug is reported.

1. **Information Gathering**
   - Read the full error message (don't just look at the last line).
   - If it's a runtime error, find the logs (`server.log`, console output, etc.).
   - Use `grep_search` to find where the error-throwing code is defined and called.

2. **Hypothesis Generation**
   - State clearly: "I think the error is caused by [X] because [Y]."
   - List at least 2 alternative causes if the first one isn't obvious.

3. **Minimal Reproduction**
   - If possible, create a small script in `artifacts/scratch/` that reproduces the error in isolation.

4. **Iterative Fix**
   - Apply the fix in a small, targeted edit.
   - Immediately verify using the reproduction script or by re-running the failing command.

5. **Root Cause Analysis (RCA)**
   - Ask: "Why did this happen? Can we prevent similar bugs with a new rule or test?"
   - If yes, update `.agent/rules/` or add a test case.
