---
description: Universal Best Practices for Agentic AI Behavior
globs: ["**/*"]
alwaysApply: true
---

# Agentic AI Best Practices

You (the AI) are an autonomous agent tasked with solving complex problems. Follow these principles to ensure reliability and minimize errors.

## 1. Context-First Investigation
- **Before Editing**: Always read the relevant files, including their imports and usages in other files.
- **Grep for Side Effects**: Use `grep_search` to see where a function or variable you are changing is used elsewhere.
- **Check Workflows**: Before starting a task, check `.agent/workflows` to see if a dedicated process exists.

## 2. Iterative Development & Verification
- **Small Batches**: Break large requests into smaller, testable chunks.
- **Self-Correction**: After every command output or file edit, verify if the result matches expectations. If a command fails, analyze the error before retrying.
- **Check the Logs**: If the user reports an error, don't just guess; look at server logs or browser console outputs.

## 3. State Management (TASKS.MD)
- **Source of Truth**: Maintain `TASKS.MD` as the ultimate tracker for project progress.
- **Update Cycle**: Update `TASKS.MD` after finishing a significant step or when the project direction changes.
- **Read First**: Always read `TASKS.MD` at the start of a session to understand where we left off.

## 4. Communication & Safety
- **The "Pause" Rule**: If a task is ambiguous or high-risk, invoke the "Major Change Protocol" (Rule 00).
- **Proactive Reporting**: Summarize what was done, what was verified, and what is next.
- **No Placeholders**: Never use "TODO" or placeholders in code unless explicitly asked. Generate actual logic or assets (using tools like `generate_image`).

## 5. Tool Hygiene
- **Optimized Searches**: Avoid broad `search_web` queries if documentation can be found in the repo.
- **Command Status**: Always wait for background commands to finish and check their full output.
- **Minimal Edits**: Use `multi_replace_file_content` for distant edits in one file, but keep logic blocks intact.
