import React from 'react';
import { API_BASE_URL } from '../../config.js';

const VerificationStatus = ({ isVerified }) => {
    if (isVerified) {
        return null;
    }

    const handleVerifyClick = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('You must be logged in to do that.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/send-verification-email`, { // Using API_BASE_URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send verification email.');
            }

            alert('A new verification email has been sent to your address!');

        } catch (err) {
            console.error("Verification error:", err);
            alert(err.message);
        }
    };

    return (
        <div className="verification-tooltip">
            <svg className="verification-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div className="tooltip-text">
                <span>Your email is not verified. Check your inbox for a link.</span>
                <button className="verify-now-btn" onClick={handleVerifyClick}>
                    Resend Email
                </button>
            </div>
        </div>
    );
};

export default VerificationStatus;
