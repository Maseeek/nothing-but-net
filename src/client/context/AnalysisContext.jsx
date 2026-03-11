import React, { createContext, useState, useContext } from 'react';
import { ANALYSIS_API_URL } from '../config';
import { sendSessionData } from '../js/videoProcessing';
import AnalysisCompletePopup from '../components/AnalysisCompletePopup';
import AnalysisProcessingPopup from '../components/AnalysisProcessingPopup';
import { useNavigate, useLocation } from 'react-router-dom';

const AnalysisContext = createContext();

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }) => {
    const [status, setStatus] = useState('idle'); // idle, processing, completed, failed
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showProcessingPopup, setShowProcessingPopup] = useState(false);
    const [showCompletePopup, setShowCompletePopup] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const startAnalysis = async (videoFile, hoopLeft, hoopRight, showAngle) => {
        setStatus('processing');
        setShowProcessingPopup(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("video", videoFile);
            formData.append("hoopLeft", JSON.stringify(hoopLeft));
            formData.append("hoopRight", JSON.stringify(hoopRight));
            formData.append("showAngle", showAngle);

            // Using the synchronous endpoint defined in server.py
            const response = await fetch(`${ANALYSIS_API_URL}/upload-and-analyze`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResult(data.data);
                setStatus('completed');
                
                // Only show the complete popup if the user is not already on the results page
                if (location.pathname !== '/results') {
                    setShowCompletePopup(true);
                }

                // Save to session storage as before (for compatibility if needed)
                sessionStorage.setItem("analysisResults", JSON.stringify(data.data));

                // Send session data
                await sendSessionData(data.data);
            } else {
                setStatus('failed');
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setStatus('failed');
            setError(err.message);
        }
    };

    const handleDismissComplete = () => {
        setStatus('idle');
        setResult(null);
        setShowCompletePopup(false);
    };

    const handleDismissProcessing = () => {
        setShowProcessingPopup(false);
    };

    const handleViewResults = () => {
        handleDismissComplete();
        navigate('/results');
    };

    return (
        <AnalysisContext.Provider value={{ startAnalysis, status, error, result }}>
            {children}
            {showProcessingPopup && (
                <AnalysisProcessingPopup
                    onDismiss={handleDismissProcessing}
                />
            )}
            {showCompletePopup && status === 'completed' && (
                <AnalysisCompletePopup
                    onDismiss={handleDismissComplete}
                    onViewResults={handleViewResults}
                />
            )}
        </AnalysisContext.Provider>
    );
};
