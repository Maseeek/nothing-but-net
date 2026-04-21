import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { API_BASE_URL } from '../config.js';
import { motion } from 'framer-motion';
import nbnLogo from '../assets/nbnlight.png';
import './../css/Login.css';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const [verificationStatus, setVerificationStatus] = useState('Verifying your email, please wait...');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setVerificationStatus('No verification token found.');
                return;
            }

            try {
                // CHANGED TO A POST REQUEST
                const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: token })
                });

                const data = await response.json();

                if (response.ok) {
                    // Save the new, updated token to localStorage
                    localStorage.setItem('authToken', data.token);
                    setVerificationStatus('✅ Email verified successfully!');
                } else {
                    setVerificationStatus(`Verification failed: ${data.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Verification API error:', error);
                setVerificationStatus('An error occurred. Could not connect to the server.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="login-page">
            <Navbar />
            <div className="login-background">
                <div className="login-container glass" style={{ textAlign: 'center' }}>
                    <header>
                        <img src={nbnLogo} alt="NothingButNet Logo" className="login-logo" />
                        <h1>Email Verification</h1>
                    </header>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ margin: '2rem 0', color: 'white' }}
                    >
                        <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>{verificationStatus}</p>
                    </motion.div>

                    <div className="form-footer" style={{ marginTop: '2rem' }}>
                        <Link to="/profile" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                            Go to Your Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;