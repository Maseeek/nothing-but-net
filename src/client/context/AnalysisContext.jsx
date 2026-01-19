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
        setStatus('uploading');
        setError(null);

        try {
            const formData = new FormData();
            formData.append("video", videoFile);
            formData.append("hoopLeft", JSON.stringify(hoopLeft));
            formData.append("hoopRight", JSON.stringify(hoopRight));
            formData.append("showAngle", showAngle);

            const response = await fetch(`${ANALYSIS_API_URL}/analyze`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setJobId(data.job_id);
                setStatus('processing');
            } else {
                setStatus('failed');
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setStatus('failed');
            setError(err.message);
        }
    };

    useEffect(() => {
        if (status === 'processing' && jobId) {
            pollInterval.current = setInterval(async () => {
                try {
                    const response = await fetch(`${ANALYSIS_API_URL}/status/${jobId}`);
                    const data = await response.json();

                    if (data.success) {
                        if (data.status === 'completed') {
                            clearInterval(pollInterval.current);
                            setResult(data.data);
                            setStatus('completed');

                            // Save to session storage as before (for compatibility if needed)
                            sessionStorage.setItem("analysisResults", JSON.stringify(data.data));

                            // Send session data
                            await sendSessionData(data.data);

                        } else if (data.status === 'failed') {
                            clearInterval(pollInterval.current);
                            setStatus('failed');
                            setError(data.error);
                        }
                        // If 'processing' or 'queued', continue polling
                    }
                } catch (err) {
                    // Start polling might fail transiently, keep trying or handle error
                    console.error("Polling error:", err);
                }
            }, 2000); // Poll every 2 seconds
        }

        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, [status, jobId]);

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
