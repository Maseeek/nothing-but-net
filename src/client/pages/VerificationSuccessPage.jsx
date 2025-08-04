import React from 'react';
import Navbar from '../components/Navbar.jsx';

const VerificationSuccessPage = () => {
    return (
        <>
            <Navbar />
            <div style={{ textAlign: 'center', color: 'white', paddingTop: '150px' }}>
                <h1>✅ Email Verified Successfully!</h1>
                <p>Your account is now active. You can now close this tab or return to your profile.</p>
                <a href="/profile" style={{ color: '#d64b17', marginTop: '20px', display: 'inline-block' }}>Go to Profile</a>
            </div>
        </>
    );
};

export default VerificationSuccessPage;