import React, { createContext, useState, useContext } from 'react';
import { ANALYSIS_API_URL } from '../config';
import { sendSessionData, getVideoDuration } from '../js/videoProcessing';
import { getCurrentUser } from '../js/auth';
import AnalysisCompletePopup from '../components/AnalysisCompletePopup';
import AnalysisProcessingPopup from '../components/AnalysisProcessingPopup';
import LimitExceededModal from '../components/LimitExceededModal';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AnalysisContext = createContext({
    status: 'idle',
    result: null,
    error: null,
    uploadProgress: 0,
    startAnalysis: () => Promise.resolve()
});

export const useAnalysis = () => {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        console.error("useAnalysis must be used within an AnalysisProvider");
    }
    return context;
};

export const AnalysisProvider = ({ children }) => {
    const [status, setStatus] = useState('idle'); // idle, processing, completed, failed
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showProcessingPopup, setShowProcessingPopup] = useState(false);
    const [showCompletePopup, setShowCompletePopup] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [limitDetails, setLimitDetails] = useState({ planName: '', maxDuration: 0, actualDuration: 0, isGuest: true });
    const [uploadProgress, setUploadProgress] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    const startAnalysis = async (videoFile, hoopLeft, hoopRight, showAngle) => {
        const currentUser = getCurrentUser();
        
        // Upload Guard - Duration Limit
        let maxDuration = 60; // 1 min for guests
        let planName = "Guest";
        let isGuest = true;

        if (currentUser) {
            isGuest = false;
            if (currentUser.isPro || currentUser.subscriptionPlan === 'pro' || currentUser.subscriptionPlan === 'standard') {
                maxDuration = 3600; // 60 mins
                const rawPlan = currentUser.subscriptionPlan || (currentUser.isPro ? 'pro' : 'standard');
                planName = rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1);
            } else {
                maxDuration = 300; // 5 mins
                planName = "Free";
            }
        }

        try {
            const duration = await getVideoDuration(videoFile);
            if (duration > maxDuration) {
                setLimitDetails({ planName, maxDuration, actualDuration: duration, isGuest });
                setShowLimitModal(true);
                return;
            }
        } catch (err) {
            console.error("Duration check failed:", err);
            setError("Could not verify video duration.");
            return;
        }

        setStatus('processing');
        setShowProcessingPopup(true);
        setError(null);
        setResult(null);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("video", videoFile);
            formData.append("hoopLeft", JSON.stringify(hoopLeft));
            formData.append("hoopRight", JSON.stringify(hoopRight));
            formData.append("showAngle", showAngle);

            // Using the synchronous endpoint defined in server.py
            const response = await axios.post(`${ANALYSIS_API_URL}/upload-and-analyze`, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            const data = response.data;

            if (data.success) {
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
            const errorMsg = err.response?.data?.error || err.message || 'Upload failed';
            setError(errorMsg);
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
        <AnalysisContext.Provider value={{ startAnalysis, status, error, result, uploadProgress }}>
            {children}
            {showProcessingPopup && (
                <AnalysisProcessingPopup
                    onDismiss={handleDismissProcessing}
                    progress={uploadProgress}
                />
            )}
            {showCompletePopup && status === 'completed' && (
                <AnalysisCompletePopup
                    onDismiss={handleDismissComplete}
                    onViewResults={handleViewResults}
                />
            )}
            {showLimitModal && (
                <LimitExceededModal
                    onClose={() => setShowLimitModal(false)}
                    {...limitDetails}
                />
            )}
        </AnalysisContext.Provider>
    );
};
