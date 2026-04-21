# 🏀 Nothing But Net - Task Tracker

## 🎨 Frontend (UI/UX)
- [ ] **[BIG TASK]** standardise Site UI Architecture: Unify aesthetic (glassmorphism, bento-grid, ember accents) and navigation across all pages (Results, Profile, Settings, Auth).
- [ ] **[BIG TASK]** Overhaul Dashboard UI into a professional "Analytics Studio" workspace.
- [x] Fix Analysis Results Error: Resolve TypeError in `Results.jsx` related to `useAnalysis` hook.
- [ ] Migrate outstanding pages to the cleaner, modern UI.
- [ ] Polish styling on the data-analytics graph to avoid CSS layout conflicts (Currently using non-functional Tailwind classes in `LiquidGlassGraph.jsx`).
- [ ] Ensure full responsiveness and accessibility across mobile and desktop.
- [x] Verify glassmorphism aesthetics throughout the app (Enforced on Profile Page).
- [x] Overhaul Profile Page with strict glassmorphism and refined navigation tabs spacing.
- [x] Refactor MagicButton with Framer Motion and premium liquid shimmer effect (Replaced manual spin).
- [x] Work on a new landing page for the app. This landing page should have a clear call to action, information about what the app does, and push the user down the funnel of signing up and getting a membership. (Done with bento-grid and motion animations)
- [x] Migrate Settings into Profile Page: Consolidated app settings (Shot Angle, History) into a new "App Settings" tab on the Profile page and removed the standalone Settings route.
- [x] Fix global UI spacing (reduced gap between navbar and content for better vertical flow).
- [x] Fix Results page navbar vertical shift caused by misapplied container padding.
- [x] Refine Profile and Dashboard aesthetics (spacing optimized for 13" laptop visibility).
- [x] Unify global layout variables in `index.css` by accurately adjusting `--nav-height`.

## ⚙️ Backend (Node.js / Express)
- [ ] Optimize database queries and API response times.
- [ ] Review error handling on user authentication & data routes.
- [x] Ensure that a user can't upload a video longer than a minute if they do not have an account. (Client-side enforced in `AnalysisContext.jsx`)
- [x] Ensure that a user can't upload a video longer than 5 minutes if they have a free account. (Client-side enforced in `AnalysisContext.jsx`)
- [x] Add Premium Upgrade Modal for duration limit exceeds. (`LimitExceededModal` implemented and integrated)

## 🎥 Computer Vision (Python / cv_service)
- [ ] Test accuracy of shooting metrics and trajectory estimations.
- [x] Optimize processing speed for video uploads (Initial downscaling and adaptive skip implemented).
- [ ] Implement Massive Optimization Plan (Phase 1) - *Detailed below*.

## 🚀 Massive Optimization (Phase 1)
**Goal:** Reduce video processing time by 80% and prepare backend logic for real-time mobile performance.

### ⚡ Performance Tuning
- [/] **Resolution Downscaling:** Basic resizing implemented in `server.py`. 
    - [ ] Refine logic to only downscale if original width > 640px (Currently always downscales to 640px).
    - [x] Scale hoop coordinates based on scale factor.
- [ ] **Adaptive Frame Skipping (Fast Forward):**
    - [ ] Replace `cap.read()` in skip loops with `cap.grab()` to avoid unnecessary frame decoding. (Current implementation uses `cap.read()` even when skipping).
    - [x] Initial adaptive skip logic implemented (6 to 30 frames).
- [ ] **HoughCircles Tuning:**
    - [ ] Change `dp` from `1.2` to `2.0` for faster detection.
    - [ ] Change `minDist` from `50` to dynamic `self.min_radius * 2`.
- [ ] **Result Aggregation:**
    - [ ] Add `ball_detected` boolean to `process_frame` return dictionary. (Currently returns `fgm`, `fga`, but no detection flag).

### 🧠 Migration to AI-Based Detection (Ball Tracking)
**Goal:** Transition from `HoughCircles` to a robust, lightweight AI model to improve reliability and speed.

- [ ] **Benchmark Current vs. AI:**
    - [ ] Create benchmark script to compare `cv2.HoughCircles` vs. AI models (latency, FPS, detection accuracy).
    - [ ] Measure CPU/Memory usage of both approaches on standard 1080p footage.
- [ ] **Explore Lightweight Models:**
    - [ ] Research **YOLOv8/v11-nano** (Ultralytics) for high-speed tracking.
    - [ ] Research **MediaPipe Objectron** (Google) for 3D object detection/tracking.
    - [ ] Research **NanoDet** or **TFLite** models for mobile-first performance.
- [ ] **Integration Prototype:**
    - [ ] Create a prototype `AIBasketballTracker` class in `cv_core.py` (keeping original tracker as fallback).

### 🧪 Validation
- [ ] Test with a 4K video to verify >5x speedup.
- [ ] Test with a 480p video to ensure detection accuracy remains stable.

## 📱 Mobile Migration Strategy (Phase 2)
- [ ] Transition to Flutter/React Native for UI.
- [ ] Port logic to Native C++ (OpenCV Mobile) or TFLite for on-device processing.
- [ ] Replace `HoughCircles` with TFLite Object Detection for NPU acceleration (30 FPS).
- [ ] Sync results to database while offloading video processing to the device.

## 🧪 Testing & Quality Assurance
- [ ] Add unit tests for critical components.
- [ ] Perform cross-browser UI testing.
- [ ] Resolve any remaining linter warnings.

## 🤖 Agentic AI & Workspace Optimization
- [x] **[BIG TASK]** Establish rigorous `TASKS.MD` maintenance protocol: Update this file after every task completion, explicitly flagging big tasks, and treating it as the strict single source of truth.
- [x] Establish "Agentic Best Practices" rule for autonomous behavior.
- [x] Enhance `architect.md` workflow with context mapping and edge case analysis.
- [x] Define concrete "Frontend Consistency" guidelines for UI/UX.
- [x] Implement structured "Agentic Debugging Loop" workflow.
- [x] Create "Project DNA" rule to store high-level tech stack and business logic context.
- [ ] Periodically audit `.agent/` directory for stale rules or workflows.

## 🚀 Deployment / DevOps
- [x] Configure Environment Variables for production deployment (`CHANGES_SUMMARY.md`).
- [x] Create comprehensive Deployment and Setup Guides.
- [x] Remove all hardcoded localhost URLs from client and server.