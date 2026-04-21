import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Eye } from 'lucide-react';

const AppSettings = () => {
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
        <div className="settings-content animate-fade-in">
            <div className="settings-section bento-item glass" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <Eye size={20} className="accent-text" />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Basketball Review</h3>
                </div>

                <div className="setting-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem 0'
                }}>
                    <div className="setting-info">
                        <h4 style={{ margin: '0 0 5px 0' }}>Show Shot Angle</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                            Display the average entry angle in your analysis results
                        </p>
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

            <div className="settings-section bento-item glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <Trash2 size={20} style={{ color: '#ff4444' }} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Data Management</h3>
                </div>

                <div className="setting-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem 0'
                }}>
                    <div className="setting-info">
                        <h4 style={{ margin: '0 0 5px 0' }}>Clear History</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                            Remove locally stored analysis results from this session
                        </p>
                    </div>
                    <button 
                        className="primary-btn" 
                        style={{ 
                            background: 'rgba(255, 68, 68, 0.2)', 
                            color: '#ff4444',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }} 
                        onClick={handleClearHistory}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255, 68, 68, 0.3)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255, 68, 68, 0.2)'}
                    >
                        Clear Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppSettings;
