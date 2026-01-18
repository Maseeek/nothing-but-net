import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { API_BASE_URL } from '../config.js';
import './../css/Login.css'; // You can reuse the login page styles

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            setMessage(data.message); // Show the success/info message from the server
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <Navbar />
            <div className="login-container glass">
                <header>
                    <h1>Forgot Password</h1>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                </header>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder=" " />
                        <label htmlFor="email">Email Address</label>
                    </div>
                    <button type="submit" className="submit-button">Send Reset Link</button>
                    {message && <p className="outcome" style={{ color: 'white' }}>{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;