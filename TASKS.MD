# 🏀 Nothing But Net - Task Tracker

## 🎨 Frontend (UI/UX)
- [ ] Migrate outstanding pages to the cleaner, modern UI.
- [ ] Polish styling on the data-analytics graph to avoid CSS layout conflicts.
- [ ] Ensure full responsiveness and accessibility across mobile and desktop.
- [ ] Verify glassmorphism aesthetics throughout the app.

## ⚙️ Backend (Node.js / Express)
- [ ] Optimize database queries and API response times.
- [ ] Review error handling on user authentication & data routes.

## 🎥 Computer Vision (Python / cv_service)
- [ ] Test accuracy of shooting metrics and trajectory estimations.
- [/] Optimize processing speed for video uploads (Adaptive skip and ROI gating implemented).
- [ ] Implement Massive Optimization Plan (Phase 1) - *Detailed below*.

## 🚀 Massive Optimization (Phase 1)
**Goal:** Reduce video processing time by 80% and prepare backend logic for real-time mobile performance.

### ⚡ Performance Tuning
- [/] **Resolution Downscaling:** 
    - [x] Basic resizing to 640px width implemented in `server.py`.
    - [ ] Refine logic to only downscale if original width > 640px.
    - [x] Scale hoop coordinates based on scale factor.
- [/] **Adaptive Frame Skipping (Fast Forward):**
    - [ ] Replace `cap.read()` in skip loops with `cap.grab()` to avoid unnecessary frame decoding.
    - [x] Initial adaptive skip logic implemented (6 to 30 frames).
- [ ] **HoughCircles Tuning:**
    - [ ] Change `dp` from `1.2` to `2.0` for faster detection.
    - [ ] Change `minDist` from `50` to dynamic `self.min_radius * 2`.
- [ ] **Result Aggregation:**
    - [ ] Add `ball_detected` boolean to `process_frame` return dictionary.

### 🧠 Migration to AI-Based Detection (Ball Tracking)
**Goal:** Transition from `HoughCircles` to a robust, lightweight AI model to improve reliability and speed.

- [/] **Benchmark Current vs. AI:**
    - [x] Create benchmark script (`server_benchmark.py`).
    - [ ] Compare `cv2.HoughCircles` vs. YOLOv11 (latency, FPS, detection accuracy).
    - [ ] Measure CPU/Memory usage of both approaches.
- [/] **Explore Lightweight Models:**
    - [x] Initial testing with **YOLOv11-nano** (see `experiment_yolo.py`).
    - [ ] Research **MediaPipe Objectron** (Google) for 3D object detection/tracking.
    - [ ] Research **NanoDet** or **TFLite** models for mobile-first performance.
- [ ] **Integration Prototype:**
    - [ ] Create a prototype `AIBasketballTracker` class in `cv_core.py` (keeping original tracker as fallback).

### 🧪 Validation
- [ ] Test with a 4K video to verify >5x speedup.
- [ ] Test with a 480p video to ensure detection accuracy remains stable.

## 📱 Phase 2: Mobile & On-Device Processing
**Goal:** Port logic to the edge to eliminate upload latency.

### 🛠️ Implementation Paths (Future Tasks)
- [ ] **Path A: Web-Based (WASM / OpenCV.js)**
    - [ ] Implement OpenCV.js (WebAssembly) + TensorFlow.js.
    - [ ] Process video locally in the browser and render HUD via `<canvas>`.
    - [ ] Optimize with SIMD and Multithreading.
- [ ] **Path B: Mobile Native (iOS / Android)**
    - [ ] Port logic to OpenCV Mobile SDK + CoreML (iOS) / NNAPI (Android).
    - [ ] Implement **Real-Time HUD** with instant feedback on release angle.
- [ ] **Path C: Desktop Native (PyInstaller)**
    - [ ] Bundle `cv_core` logic into standalone `.exe` or `.app` for professional coaching.

### ⚙️ On-Device Optimizations
- [ ] **Hierarchical Hybrid Model:**
    - [ ] Tier 1: High-speed tracking via Hough ROI (100+ FPS).
    - [ ] Tier 2: Smart re-acquisition via YOLOv11 (Trigger when `ball_lost_count > 5`).
- [ ] **Consistency Scaling:** Ensure resizing to consistent width (640px) to keep geometric constants (0.264 ratio) accurate.

## 🧪 Testing & Quality Assurance
- [ ] Add unit tests for critical components.
- [ ] Perform cross-browser UI testing.
- [ ] Resolve any remaining linter warnings.

## 🤖 Agentic AI & Workspace Optimization
- [x] Establish "Agentic Best Practices" rule for autonomous behavior.
- [x] Enhance `architect.md` workflow with context mapping and edge case analysis.
- [x] Define concrete "Frontend Consistency" guidelines for UI/UX.
- [x] Implement structured "Agentic Debugging Loop" workflow.
- [x] Create "Project DNA" rule to store high-level tech stack and business logic context.
- [ ] Periodically audit `.agent/` directory for stale rules or workflows.

## 🚀 Deployment / DevOps
- [ ] Set up automated CI/CD for Python CV service.
- [ ] Monitor server-side latency and resource usage.