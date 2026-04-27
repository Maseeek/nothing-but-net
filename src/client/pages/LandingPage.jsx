import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Target, Zap, ChevronRight } from 'lucide-react';
import '../css/LandingPage.css';
import '../css/navbar.css';
import { isLoggedIn } from '../js/auth.js';
import Navbar from '../components/Navbar.jsx';

const TrajectoryVisual = ({ isStatic = false }) => {
    return (
        <div className="bento-visual">
            <svg className="trajectory-svg" viewBox="0 0 400 200">
                {/* Court floor with grid-like lines for technical feel */}
                <line x1="20" y1="180" x2="380" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1" className="court-line" />
                <line x1="100" y1="180" x2="100" y2="175" stroke="rgba(255,255,255,0.3)" />
                <line x1="200" y1="180" x2="200" y2="175" stroke="rgba(255,255,255,0.3)" />
                <line x1="300" y1="180" x2="300" y2="175" stroke="rgba(255,255,255,0.3)" />
                
                {/* Primary Arc */}
                <motion.path
                    d="M 50 160 Q 200 20 350 160"
                    fill="none"
                    stroke="var(--accent-color)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="400"
                    initial={{ strokeDashoffset: 400 }}
                    whileInView={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />

                {!isStatic && (
                    <motion.circle
                        r="5"
                        fill="white"
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: "100%" }}
                        transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            repeatDelay: 0.8
                        }}
                        style={{ 
                            offsetPath: "path('M 50 160 Q 200 20 350 160')",
                            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))'
                        }}
                    />
                )}

                {/* Target marker at landing point */}
                <circle cx="350" cy="160" r="10" fill="none" stroke="rgba(214, 75, 23, 0.3)" strokeWidth="1" />
                <circle cx="350" cy="160" r="4" fill="var(--accent-color)" opacity="0.5" />
            </svg>

            {/* Technical Peak Callout */}
            <motion.div 
                className="peak-asset"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
            >
                <div className="peak-label">45.2° Arc</div>
                <div className="peak-indicator"></div>
            </motion.div>

            {/* AI Callouts */}
            <div className="data-point point-angle">
                <Target size={12} className="text-ember" />
                <span>Detection: </span> 0.98c
            </div>
            <div className="data-point point-optimal">
                <Zap size={12} className="text-ember" />
                <span>Optimal</span>
            </div>
        </div>
    );
};

const LandingPage = () => {
    const loggedIn = isLoggedIn();

    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    return (
        <div className="landing-container">
            <Navbar />

            <main className="landing-main">
                {/* Hero Section */}
                <motion.section 
                    className="hero-section"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="hero-title">
                        Shoot. Track. <span className="text-ember">Improve.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Pro-level computer vision analytics in your pocket. Upload your shot, and let our AI break down your arc, trajectory, and accuracy in seconds.
                    </p>
                    <div className="hero-cta-group">
                        <Link to={loggedIn ? "/dashboard" : "/register"}>
                            <button className="primary-btn">
                                {loggedIn ? "Go to Dashboard" : "Start Tracking Free"} <ChevronRight size={20} />
                            </button>
                        </Link>
                        <Link to="/dashboard">
                            <button className="secondary-btn">
                                View Analytics
                            </button>
                        </Link>
                    </div>
                </motion.section>

                {/* Bento Grid Features */}
                <motion.section 
                    className="bento-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {/* Bento Box 1: Core Feature (Large) */}
                    <motion.div className="bento-item glass bento-large" variants={itemVariants}>
                        <div className="bento-icon-wrapper">
                            <Target size={32} className="text-ember" />
                        </div>
                        <h3>AI Trajectory Analysis</h3>
                        <p>Our custom computer vision engine tracks the ball frame-by-frame, calculating the exact arc and entry angle of your shot.</p>
                        
                        <TrajectoryVisual isStatic={false} />
                    </motion.div>

                    {/* Bento Box 2: Speed (Medium) */}
                    <motion.div className="bento-item glass bento-medium" variants={itemVariants}>
                        <div className="bento-icon-wrapper">
                            <Zap size={32} className="text-ember" />
                        </div>
                        <h3>Lightning Fast</h3>
                        <p>Optimized downscaling and adaptive frame skipping means you get your results in seconds, not minutes.</p>
                    </motion.div>

                    {/* Bento Box 3: Dashboard (Medium) */}
                    <motion.div className="bento-item glass bento-medium" variants={itemVariants}>
                        <div className="bento-icon-wrapper">
                            <Activity size={32} className="text-ember" />
                        </div>
                        <h3>Instant Analytics</h3>
                        <p>Track your FGM/FGA and shooting percentage over time.</p>
                    </motion.div>

                    {/* Bento Box 4: CTA (Wide) */}
                    <motion.div className="bento-item glass bento-wide bento-cta" variants={itemVariants}>
                        <div className="cta-content">
                            <h3>Ready to elevate your game?</h3>
                            <p>Join nothingbutnet today and start analyzing your shots like a pro.</p>
                        </div>
                        <Link to={loggedIn ? "/dashboard" : "/register"} className="bento-cta-btn">
                            {loggedIn ? "Dashboard" : "Create Account"}
                        </Link>
                    </motion.div>
                </motion.section>
            </main>
            
            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} nothingbutnet. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
