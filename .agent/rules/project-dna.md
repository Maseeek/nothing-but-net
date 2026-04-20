---
description: High-level overview of the project's purpose, tech stack, and core architecture.
globs: ["**/*"]
alwaysApply: true
---

# Project DNA: Nothing But Net

This document serves as the ground truth for the project's identity. Refer to this whenever making architectural decisions.

## 🏀 Mission
Nothing But Net is a premium basketball analytics platform that translates raw video footage into professional-grade shooting metrics (Arc Height, Release Time, FG%, etc.).

## 🛠️ Technology Stack
- **Frontend**: React 18 (Vite), Glassmorphism UI (Vanilla CSS), Lucide-React icons.
- **Backend (API)**: Node.js (Express), MongoDB (Mongoose ODM).
- **CV Service (AI)**: Python 3.10+, OpenCV, FastAPI/Flask.
- **Infrastructure**: Vercel (Frontend), Render/Railway (Backend/CV), AWS S3 (Video Storage).

## 🏗️ Core Architecture & File Mapping
- **Logic Engine**: `cv_service/src/cv_core.py` (The physics and tracking core).
- **Main API**: `src/server/server.js` (Handles user sessions, analytics, and service orchestration).
- **Frontend Entry**: `src/client/main.jsx` and `App.jsx`.
- **Design Tokens**: `src/client/index.css` (Contains the Glassmorphism variables).

## 🧭 Strategic Principles
1. **Performance is a Feature**: Any change to `cv_core.py` must prioritize processing speed. We aim for <20% of video duration for processing time.
2. **Glassmorphism First**: The UI must feel premium. Never use plain white/black backgrounds. Use transparency, blur, and vibrant accents.
3. **Mobile Future**: Avoid complex hover-only interactions. Design logic that can eventually run on-device (OpenCV Mobile/TFLite).
4. **Data Integrity**: Shooting stats are sacred. Ensure math is validated against known physical constants (gravity = 9.81m/s² scaled to pixels).

## 🛑 Hard Constraints
- **No Tailwind**: Strictly use the established Vanilla CSS system for consistency unless specifically requested.
- **Environment Isolation**: Always use `.env` for API keys and secrets. Never hardcode endpoints.
- **Audit Trails**: Every database change should be reflected in the `Session` or `Analysis` models.
