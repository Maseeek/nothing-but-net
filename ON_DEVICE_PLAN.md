# Future Implementation: On-Device Analysis Engine

This document outlines the transition from a **Client-Server** model to an **On-Device / Edge** processing model to eliminate the primary project bottleneck: video file upload latency.

## 1. The Bottleneck: Analysis vs. Upload
Current benchmarks show that while the **CV Processing** is extremely efficient, the **User Experience** is hindered by the network:

*   **Processing Speed**: ~6–9ms per frame (Hough Hot-Path).
*   **Total CV Time**: ~20-30 seconds for a standard 30-second 60fps clip.
*   **Upload Time**: 2–5 minutes (dependent on user's 1080p video file size and internet speed).

**Conclusion:** Moving the computer vision logic to the device eliminates 90% of the total wait time.

---

## 2. Proposed Architecture: The Hybrid Edge Model

Based on our benchmarks, the most robust on-device implementation uses a **Hierarchical Hybrid** approach:

### Tier 1: High-Speed Tracking (Hough ROI)
*   **Role**: Primary tracking during active play.
*   **Hardware**: Device CPU (via OpenCV).
*   **Performance**: ~100+ FPS on mobile/laptop.
*   **Benefit**: Extremely low battery drain and heat generation.

### Tier 2: Smart Re-acquisition (YOLOv11)
*   **Role**: Initial ball find and recovery when tracking is lost.
*   **Hardware**: Device NPU/GPU (via CoreML, TFLite, or WebNN).
*   **Performance**: ~20–50 FPS for recovery frames.
*   **Benefit**: High intelligence to distinguish a ball from heads, rims, or shadows.

---

## 3. Implementation Paths

### Path A: Web-Based (WASM / OpenCV.js)
*Best for: Maintaining the current web frontend while removing the server dependency.*
*   **Technologies**: OpenCV.js (WebAssembly) + TensorFlow.js.
*   **Workflow**: The user "uploads" a file to the browser; the browser processes it locally using the user's CPU/GPU and renders the HUD via `<canvas>`.

### Path B: Mobile Native (iOS / Android)
*Best for: Athletes using phones on the court.*
*   **Technologies**: OpenCV Mobile SDK + CoreML (iOS) / NNAPI (Android).
*   **Workflow**: Native camera access. The device can offer a **Real-Time HUD** while recording, providing instant feedback on release angle and shot outcomes.

### Path C: Desktop Native (PyInstaller)
*Best for: Professional coaching sets with laptops.*
*   **Technologies**: Current Python `cv_core` logic + PyInstaller.
*   **Workflow**: A standalone `.exe` or `.app` that processes local video files at maximum hardware speed.

---

## 4. Key Performance Insights for Implementation

1.  **Frame Scaling**: Always resize to a consistent width (e.g., 640px) before processing. This ensures that your geometric constants (like the **0.264 ball/hoop ratio**) remain accurate regardless of input resolution.
2.  **YOLO "Recovery Rate"**: To maintain speed on-device, only trigger the YOLO model when `ball_lost_count > 5`. Running it every frame is unnecessary and will throttle device performance.
3.  **WASM Optimization**: When using OpenCV.js, ensure SIMD and Multithreading are enabled to match the 8ms processing speeds seen in native Python benchmarks.

## 5. Summary of Benefits
*   **Latency**: Reduced from minutes to seconds.
*   **Privacy**: Zero video data sent to the cloud.
*   **Cost**: Eliminates expensive server-side GPU/CPU compute costs.
*   **Scalability**: The system can handle 10,000+ simultaneous users because each user provides their own compute power.
