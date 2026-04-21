import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { API_BASE_URL } from '../config.js';
import Loading from '../components/Loading.jsx';
import './../css/Login.css';
import nbnLogo from '../assets/nbnlight.png';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cooldown > 0) return;

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setCooldown(60); // Start 60s cooldown
            } else {
                setMessage(data.message || 'An error occurred.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <Navbar />
            <div className="login-background">
                <div className="login-container glass">
                    <header>
                        <img src={nbnLogo} alt="NothingButNet Logo" className="login-logo" />
                        <h1>Forgot Password</h1>
                        <p>Enter your email address and we'll send you a link to reset your password.</p>
                    </header>
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder=" " disabled={isLoading} />
                            <label htmlFor="email">Email Address</label>
                        </div>
                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={isLoading || cooldown > 0}
                            style={{ width: '100%', marginTop: '10px' }}
                        >
                            {isLoading ? <span className="loading-spinner"></span> : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Reset Link'}
                        </button>
                        {message && <p className="outcome" style={{ color: 'white' }}>{message}</p>}
                    </form>
                    <div className="form-footer">
                        <p><Link to="/login" style={{ color: 'var(--accent-color)' }}>Back to Login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;