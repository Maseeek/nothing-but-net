import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Target, Zap, ChevronRight } from 'lucide-react';
import '../css/LandingPage.css';
import '../css/navbar.css';
import { isLoggedIn } from '../js/auth.js';
import Navbar from '../components/Navbar.jsx';

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
                        <div className="bento-visual">
                            {/* Mock visual representation */}
                            <div className="mock-arc"></div>
                        </div>
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
