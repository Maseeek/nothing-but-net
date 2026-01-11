import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../css/Settings.css';

function SettingsPage() {
    // State initialization with localStorage checks
    const [showAngle, setShowAngle] = useState(() => {
        const stored = localStorage.getItem('nbn_settings_showAngle');
        return stored !== null ? JSON.parse(stored) : true;
    });

    // Effects to save changes to localStorage
    useEffect(() => {
        localStorage.setItem('nbn_settings_showAngle', JSON.stringify(showAngle));
    }, [showAngle]);

    const handleClearHistory = () => {
        if (confirm("Are you sure you want to clear your local session history? This cannot be undone.")) {
            sessionStorage.removeItem('analysisResults');
            alert("History cleared.");
        }
    };

    return (
        <div className="settings-page">
            <Navbar />
            <div className="settings-container glass">
                <header className="settings-header">
                    <div className="gradient-bar" style={{
                        width: '60px',
                        height: '6px',
                        background: 'linear-gradient(145deg, var(--accent-color), #c14c1f)',
                        borderRadius: '3px',
                        margin: '0 auto 15px auto',
                        boxShadow: '0 0 10px rgba(214, 75, 23, 0.5)'
                    }}></div>
                    <h1>Settings</h1>
                    <p>Customize your Nothing But Net experience</p>
                </header>

                <div className="settings-section">
                    <h2>Basketball Review</h2>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Show Shot Angle</h3>
                            <p>Display the average entry angle in your analysis results</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={showAngle}
                                onChange={(e) => setShowAngle(e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>



                <div className="settings-section">
                    <h2>Data Management</h2>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Clear History</h3>
                            <p>Remove locally stored analysis results from this session</p>
                        </div>
                        <button className="danger-btn" onClick={handleClearHistory}>
                            Clear Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
