import React from 'react';
import '../css/instructions.css'; // Reuse existing popup styles
import '../css/Coordinates.css'; // Reuse button styles
import { CloseIcon } from './Icons';
import { useNavigate } from 'react-router-dom';

const LimitExceededModal = ({ onClose, planName, maxDuration, actualDuration, maxCount, reason, isGuest }) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onClose();
        navigate('/profile?tab=pricing'); // Redirect to pricing section
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
                    <p className="subtitle">
                        {reason === 'duration' 
                            ? "This video is too long for your current plan." 
                            : "You've reached your analysis limit for this period."}
                    </p>
                </div>

                <div className="stats-indicator glass" style={{ margin: '20px 0', padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Current Plan:</span>
                        <span style={{ fontWeight: 'bold' }}>{planName.charAt(0).toUpperCase() + planName.slice(1)}</span>
                    </div>
                    {reason === 'duration' ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Max Allowed:</span>
                                <span style={{ fontWeight: 'bold' }}>{maxDuration / 60} min</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4b4b' }}>
                                <span>Video Length:</span>
                                <span style={{ fontWeight: 'bold' }}>{Math.round(actualDuration / 60 * 10) / 10} min</span>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4b4b' }}>
                            <span>Limit:</span>
                            <span style={{ fontWeight: 'bold' }}>{maxCount} analyses / {isGuest ? 'day' : 'week'}</span>
                        </div>
                    )}
                </div>

                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>
                    {isGuest 
                        ? "Create a free account to unlock more analyses, or go Pro for unlimited access and advanced metrics!"
                        : "Upgrade your plan to increase your limits and unlock elite performance tracking."}
                </p>

                <div className="button-group" style={{ flexDirection: 'column', gap: '10px' }}>
                    {isGuest ? (
                        <button className="analyze-button" onClick={handleLogin} style={{ width: '100%' }}>
                            Sign Up / Login
                        </button>
                    ) : (
                        <button className="analyze-button" onClick={handleUpgrade} style={{ width: '100%' }}>
                            View Plans & Upgrade
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
