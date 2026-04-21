# 🏀 nothingbutnet
### The AI-Powered Basketball Analytics Studio

**nothingbutnet** (nbn) is a premium, full-stack basketball performance platform that leverages Computer Vision to track shooting metrics, analyze trajectories, and provide actionable intelligence to players and coaches.

---

## ✨ Features

- 🎥 **AI Shot Tracking**: Automated detection of Makes (FGM) and Attempts (FGA) using OpenCV-powered analysis.
- 📊 **Analytics Studio**: A high-performance dashboard featuring bento-grid layouts and interactive Chart.js visualizations.
- 💎 **Premium Aesthetic**: Modern "Liquid Glass" design system with fluid animations powered by Framer Motion.
- 💳 **Membership Tiers**: Integrated Stripe payments for Guest, Free, and Pro memberships with automated video duration guards.
- 🎯 **Coordinate Mapping**: Precision hoop and ball detection for accurate trajectory estimation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, Framer Motion, Chart.js, Three.js, Vanilla CSS |
| **Backend** | Node.js (Express 5), MongoDB (Mongoose), Stripe SDK |
| **CV Service** | Python 3.x, Flask, OpenCV (cv2), NumPy |
| **Orchestration** | `concurrently` (unified dev environment) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB instance (Local or Atlas)

### Installation
1. Clone the repository and install root dependencies:
   ```bash
   npm install
   ```
2. Install Python dependencies for the CV service:
   ```bash
   cd src/cv_service
   pip install -r requirements.txt
   cd ../..
   ```

### Development
Start all services (Frontend, Node API, and Python CV) with a single command:
```bash
npm run dev-all
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Node API**: [http://localhost:3000](http://localhost:3000)
- **Python CV**: [http://localhost:5000](http://localhost:5000)

---

## ⚡ Performance & Optimization
The project is currently implementing **Massive Optimization Phase 1**, targeting:
- **80% reduction** in video processing latency.
- Migration from `HoughCircles` to **YOLOv8/v11-nano** AI tracking.
- Native C++ (OpenCV Mobile) porting for on-device processing.

---

## 🤖 Maintenance Protocol
- **Source of Truth**: All progress is tracked in `TASKS.MD`.
- **Guidelines**: Adheres to strict "Frontend Consistency" (Glassmorphism) and "Python CV" (Vectorization) standards.
- **Audit Reports**: See `audit_report.md` for the latest architectural health checks.

