import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { API_BASE_URL } from '../config.js';

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
        <>
            <Navbar />
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '150px' }}>
                <div className="glass" style={{ padding: '40px', maxWidth: '500px', width: '90%', textAlign: 'center', color: 'white' }}>
                    <h1>Email Verification</h1>
                    <p>{verificationStatus}</p>
                    <Link to="/profile" style={{ color: '#d64b17', marginTop: '20px', display: 'inline-block', fontWeight: 'bold' }}>
                        Go to Your Profile
                    </Link>
                </div>
            </div>
        </>
    );
};

export default VerifyEmailPage;