import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Loading from '../components/Loading.jsx';

const VerifyEmailPage = () => {
    const { token } = useParams(); // Gets the token from the URL (e.g., /verify-email/THIS_PART)
    const [verificationStatus, setVerificationStatus] = useState('Verifying your email, please wait...');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setVerificationStatus('No verification token found.');
                setIsLoading(false);
                return;
            }

            try {
                // This is the crucial API call to your backend
                const response = await fetch(`http://localhost:3000/api/verify-email/${token}`);

                if (response.ok) {
                    // The backend redirects on success, but we can set a state in case it doesn't
                    setVerificationStatus('Email verified successfully! You will be redirected shortly.');
                    // The backend should handle the redirect to /verification-success
                } else {
                    // If the backend returned an error (e.g., token expired)
                    const errorText = await response.text();
                    setVerificationStatus(`Verification failed: ${errorText}`);
                }
            } catch (error) {
                console.error('Verification API error:', error);
                setVerificationStatus('An error occurred. Could not connect to the server.');
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, [token]); // This effect runs whenever the token in the URL changes

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            <Navbar />
            <div style={{ textAlign: 'center', color: 'white', paddingTop: '150px' }}>
                <h1>Email Verification</h1>
                <p>{verificationStatus}</p>
                <Link to="/login" style={{ color: '#d64b17', marginTop: '20px', display: 'inline-block' }}>
                    Proceed to Login
                </Link>
            </div>
        </>
    );
};

export default VerifyEmailPage;