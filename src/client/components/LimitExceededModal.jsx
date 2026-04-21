import React from 'react';
import '../css/instructions.css'; // Reuse existing popup styles
import '../css/Coordinates.css'; // Reuse button styles
import { CloseIcon } from './Icons';
import { useNavigate } from 'react-router-dom';

const LimitExceededModal = ({ onClose, planName, maxDuration, actualDuration, isGuest }) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onClose();
        navigate('/profile'); // Redirect to pricing/profile for upgrade
    };

    const handleLogin = () => {
        onClose();
        navigate('/login');
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content glass animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <button className="close-button" onClick={onClose} aria-label="Close">
                    <CloseIcon />
                </button>

                <div className="header-section">
                    <div className="gradient-bar-std" style={{ background: 'var(--accent-color)' }}></div>
                    <h2 style={{ color: 'var(--accent-color)' }}>Limit Exceeded</h2>
                    <p className="subtitle">This video is too long for your current plan.</p>
                </div>

                <div className="stats-indicator glass" style={{ margin: '20px 0', padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Current Plan:</span>
                        <span style={{ fontWeight: 'bold' }}>{planName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Max Allowed:</span>
                        <span style={{ fontWeight: 'bold' }}>{maxDuration / 60} min</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4b4b' }}>
                        <span>Video Length:</span>
                        <span style={{ fontWeight: 'bold' }}>{Math.round(actualDuration / 60 * 10) / 10} min</span>
                    </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>
                    {isGuest 
                        ? "Create a free account to upload up to 5-minute videos, or go Pro for 1-hour analysis!"
                        : "Upgrade to a Pro account to analyze videos up to 1 hour long and unlock advanced metrics."}
                </p>

                <div className="button-group" style={{ flexDirection: 'column', gap: '10px' }}>
                    {isGuest ? (
                        <button className="analyze-button" onClick={handleLogin} style={{ width: '100%' }}>
                            Sign Up / Login
                        </button>
                    ) : (
                        <button className="analyze-button" onClick={handleUpgrade} style={{ width: '100%' }}>
                            Upgrade to Pro
                        </button>
                    )}
                    <button className="back-button" onClick={onClose} style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LimitExceededModal;
