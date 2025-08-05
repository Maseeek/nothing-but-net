import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import './../css/Login.css';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        setMessage('');

        try {
            const response = await fetch(`http://localhost:3000/api/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            setMessage(data.message + ' Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-page">
            <Navbar />
            <div className="login-container">
                <header>
                    <h1>Reset Your Password</h1>
                    <p>Enter a new password for your account.</p>
                </header>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder=" "/>
                        <label htmlFor="password">New Password</label>
                    </div>
                    <div className="input-group">
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder=" "/>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                    </div>
                    <button type="submit" className="submit-button">Reset Password</button>
                    {message && <p className="outcome" style={{color: 'green'}}>{message}</p>}
                    {error && <p className="outcome">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;