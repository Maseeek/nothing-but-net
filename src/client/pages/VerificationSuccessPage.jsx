import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import nbnLogo from '../assets/nbnlight.png';
import './../css/Login.css';

const VerificationSuccessPage = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/profile');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="login-page">
            <Navbar />
            <div className="login-background">
                <div className="login-container glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <header>
                        <img src={nbnLogo} alt="NothingButNet Logo" className="login-logo" />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            style={{ fontSize: '4rem', marginBottom: '1rem' }}
                        >
                            ✅
                        </motion.div>
                        <h1>Email Verified!</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                            Your account is now active.
                        </p>
                    </header>

                    <div style={{ margin: '2rem 0' }}>
                        <p style={{ fontSize: '1.1rem' }}>
                            Redirecting to your profile in <strong className="accent-text">{countdown}</strong> seconds...
                        </p>
                    </div>

                    <div className="form-footer" style={{ marginTop: '2rem' }}>
                        <Link to="/profile" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                            Go to Profile Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationSuccessPage;