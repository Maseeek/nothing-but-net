import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { ANALYSIS_API_URL } from '../config';
import { sendSessionData } from '../js/videoProcessing';
import AnalysisCompletePopup from '../components/AnalysisCompletePopup';
import { useNavigate } from 'react-router-dom';

const AnalysisContext = createContext();

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }) => {
    const [jobId, setJobId] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed, failed
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const pollInterval = useRef(null);
    const navigate = useNavigate();

    const startAnalysis = async (videoFile, hoopLeft, hoopRight, showAngle) => {
        setStatus('processing');
        setError(null);

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

    const handleDismiss = () => {
        setStatus('idle');
        setJobId(null);
        setResult(null);
    };

    const handleViewResults = () => {
        handleDismiss();
        navigate('/results');
    };

    return (
        <AnalysisContext.Provider value={{ startAnalysis, status, error, result }}>
            {children}
            {status === 'completed' && (
                <AnalysisCompletePopup
                    onDismiss={handleDismiss}
                    onViewResults={handleViewResults}
                />
            )}
        </AnalysisContext.Provider>
    );
};
