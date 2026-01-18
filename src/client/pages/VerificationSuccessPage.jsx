import React from 'react';
import Navbar from '../components/Navbar.jsx';

const VerificationSuccessPage = () => {
    return (
        <>
            <Navbar />
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '150px' }}>
                <div className="glass" style={{ padding: '40px', maxWidth: '600px', width: '90%', textAlign: 'center', color: 'white' }}>
                    <h1>✅ Email Verified Successfully!</h1>
                    <p>Your account is now active. You can now close this tab or return to your profile.</p>
                    <a href="/profile" style={{ color: '#d64b17', marginTop: '20px', display: 'inline-block', fontWeight: 'bold' }}>Go to Profile</a>
                </div>
            </div>
        </>
    );
};

export default VerificationSuccessPage;