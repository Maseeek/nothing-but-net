---
description: Backend Performance Optimization Loop
---

# Backend Performance Optimization Loop

1. **Profile**
   - Identify the target function in `server.py`.
   - Wrap the suspicious block in `time.time()` checks to measure execution time per frame.

2. **Vectorize & Downscale**
   - Check: Can we reduce `MAX_FRAMES`?
   - Check: Can we lower the resolution of the `gray_frame` before passing it to `HoughCircles`? (e.g., `cv2.resize(frame, (0,0), fx=0.5, fy=0.5)`).
   - Check: Are we using `np.append` inside a loop? (Replace with pre-allocated arrays).

3. **verify**
   - Run the optimized code against a sample video.
   - Ensure `fg_percentage` remains within 1% of the original result.