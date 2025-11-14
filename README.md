# 🏀 Nothing But Net

> **Never Lose Count Again** - AI-powered basketball shot analysis made simple.

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Nothing But Net is an intelligent basketball training companion that uses computer vision and AI to analyze your shooting performance. Simply upload your practice video, mark the hoop, and let our AI do the rest.

## ✨ Features

### 🎯 Shot Analysis
- **Automatic Shot Detection** - AI identifies makes and misses from your uploaded videos
- **Angle Analysis** - Calculates shot angles for every attempt
- **Performance Metrics** - Tracks field goal percentage, longest streak, and more
- **Make vs Miss Comparison** - Analyzes angle differences between successful and missed shots

### 📊 Performance Tracking
- **Session History** - Keep track of all your practice sessions
- **Progress Over Time** - Monitor improvement with detailed analytics
- **Visual Charts** - Interactive charts powered by Chart.js
- **User Profiles** - Personal accounts with email verification

### 🔐 Secure & Reliable
- **User Authentication** - Secure login with JWT tokens
- **Email Verification** - Confirm your account via email
- **Password Recovery** - Easy password reset functionality
- **Data Protection** - Passwords hashed with bcrypt

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Maseeek/nbnc.git
   cd nbnc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   For development, the app works with localhost defaults out of the box. For custom configuration:
   
   **Frontend** - Create `.env` in project root:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_ANALYSIS_API_URL=http://localhost:5000
   ```
   
   **Backend** - Create `src/server/.env`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/nbn
   JWT_SECRET=your-secret-key-here
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📖 Usage

### Recording Your Shots
1. **Record a video** of your basketball practice session
   - Use a stable camera position
   - Ensure the entire hoop is visible
   - Record your shooting session

### Analyzing Your Performance
1. **Upload your video** on the main page
2. **Mark the hoop** by clicking two points (left and right edges)
3. **Click "Analyze Results"** to process your video
4. **View your stats** including:
   - Total makes and misses
   - Field goal percentage
   - Longest streak
   - Average shot angles
   - Shot-by-shot breakdown

### Tracking Progress
- **Create an account** to save your sessions
- **View your profile** to see all past sessions
- **Compare performance** across different practice sessions

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **React Router** - Client-side routing
- **Chart.js** - Data visualization
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Security & Authentication
- **JWT** - Secure token-based authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Additional Tools
- **Nodemailer** - Email functionality
- **Axios** - HTTP client
- **express-validator** - Input validation
- **Vercel Analytics** - Usage tracking

## 📁 Project Structure

```
nbnc/
├── src/
│   ├── client/              # Frontend React application
│   │   ├── assets/          # Images, videos, and static files
│   │   ├── components/      # Reusable React components
│   │   ├── css/             # Stylesheets
│   │   ├── js/              # JavaScript utilities
│   │   ├── pages/           # Page components
│   │   ├── config.js        # Environment configuration
│   │   └── main.jsx         # Application entry point
│   └── server/              # Backend Node.js application
│       ├── models/          # Mongoose models
│       ├── tests/           # Server tests
│       ├── server.js        # Express server
│       └── dbUtils.js       # Database utilities
├── public/                  # Public static assets
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📚 Documentation

For detailed information, check out these guides:

- **[Setup Guide](SETUP_GUIDE.md)** - Quick setup instructions
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Changes Summary](CHANGES_SUMMARY.md)** - Recent updates and changes

## 🌐 Deployment

### Frontend (Vercel/Netlify)
Set environment variables:
```
VITE_API_BASE_URL=https://your-api-domain.com
VITE_ANALYSIS_API_URL=https://your-analysis-api.com
```

### Backend (Any Node.js host)
Set environment variables and deploy the server code. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Test your changes before submitting
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for basketball enthusiasts
- Computer vision powered by advanced AI algorithms
- Thanks to all contributors and users

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Maseeek/nbnc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Maseeek/nbnc/discussions)

---

**Made with 🏀 by the Nothing But Net team**
