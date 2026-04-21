import React from 'react';
import '../css/MainPage.css';
import { Loader2 } from 'lucide-react';

const AnalysisProcessingPopup = ({ onDismiss, progress }) => {
    const isUploading = progress < 100;
    
    return (
        <div className="popup-overlay" style={{ zIndex: 1000 }}>
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
                    <Loader2 size={48} color="#ffffff" className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
                </div>

                <div style={{ textAlign: 'center', width: '100%' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>
                        {isUploading ? `Uploading Video: ${progress || 0}%` : 'Processing Video...'}
                    </h2>
                    
                    {isUploading && (
                        <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            marginTop: '1rem',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${progress || 0}%`,
                                height: '100%',
                                backgroundColor: 'var(--accent-color, #ff5805)',
                                transition: 'width 0.3s ease-out'
                            }} />
                        </div>
                    )}
                    
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '1rem' }}>
                        {isUploading 
                            ? 'Please wait while your video uploads to our servers.' 
                            : 'Your video is being processed in the background. You will be notified when it is done.'}
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
                            background: 'white',
                            color: '#ff5805',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'transform 0.1s'
                        }}
                    >
                        Got it
                    </button>
                </div>
            </div>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default AnalysisProcessingPopup;
