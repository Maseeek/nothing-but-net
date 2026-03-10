---
description: Add New Basketball Metric
---

# Add New Basketball Metric

1. **Definition Phase**
   - Ask the user for the physics formula or logic for the new metric.
   - *Example:* "How do we calculate Arc Height based on `pos_list_y`?"

2. **Backend Implementation**
   - Modify `src/server/server.py` inside `BasketballTracker`.
   - Add the calculation to `process_frame` or `analyze_video`.
   - **Crucial:** Add the new key to the returned dictionary in `analyze_video`.

3. **API & Data Layer**
   - Update `src/server/models/Session.js` (Mongoose Schema) to store this new number.
   - Update `src/server/models/Analysis.js` if it needs to be tracked historically.

4. **Frontend Visualization**
   - Update `src/client/pages/Results.jsx` to destructure the new key from `data`.
   - Add a new `.stat-card` div to display it.

5. **Documentation**
   - Generate a brief summary of the math used.
   - (Optional) If the user has Notion MCP enabled, ask to append this to the "Metrics Definitions" page.