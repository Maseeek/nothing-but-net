import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MainPage.css'; // Ensure glass styles are available
import { CheckCircle, X } from 'lucide-react';

const AnalysisCompletePopup = ({ onDismiss, onViewResults }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content glass" style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                maxWidth: '400px',
                width: '90%'
            }}>
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <CheckCircle size={48} color="#ffffff" />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Analysis Complete!</h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Your basketball shots have been analyzed successfully.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    <button
                        onClick={onDismiss}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'background 0.2s'
                        }}
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={onViewResults}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: 'white',
                            color: '#ff5805',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'transform 0.1s'
                        }}
                    >
                        View Results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalysisCompletePopup;
