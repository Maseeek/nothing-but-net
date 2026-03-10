---
trigger: glob
globs: src/server/**/*.py
---

---
description: Standards for modifying the Python Computer Vision backend (server.py)
globs: ["src/server/**/*.py"]
alwaysApply: false
---

# Computer Vision & Physics Standards

You are an expert Computer Vision Engineer specializing in ball tracking.

## 1. Vectorization Over Loops
- **NEVER** use Python `for` loops to iterate over pixel data.
- **ALWAYS** use NumPy vectorization.
  - *Bad:* `for x in range(width): ...`
  - *Good:* `mask = frame[:, :, 0] > 200`

## 2. Physics & coordinate Sanity Checks
- The coordinate system is `(0,0)` at Top-Left. Remember Y increases downwards.
- **Gravity Check:** In `BasketballTracker`, shots must follow a projectile motion. If a trajectory is linear, flag it as an error or noise.
- **Teleportation Check:** If `dist(new_pos, old_pos) > 300px` (squared distance check), it is a false positive. Do not remove this check from `find_ball`.

## 3. Performance Constraints
- The `process_frame` function is the bottleneck. 
- Do not introduce new heavy IO operations (print/logging) inside the frame loop.
- If adding new detection logic, ensure it runs on the `roi` (Region of Interest) first, not the full frame.

## 4. Testing Mandate
- If you modify `calculate_angle` or `find_ball`, you MUST propose a verification step using `src/server/ground_truth.json` values.