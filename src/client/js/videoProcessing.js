import { getCurrentUser } from "./auth.js";
import { API_BASE_URL, ANALYSIS_API_URL } from '../config.js';

export async function sendSessionData(sessionData) {
    try {
        const currentUser = getCurrentUser();
        
        const payload = {
            userId: currentUser?.userId || null, 
            makes: sessionData.makes,
            misses: sessionData.misses,
            longest_streak: sessionData.longest_streak,
            average_angle: sessionData.average_angle,
            average_make_angle: sessionData.average_make_angle,
            average_miss_angle: sessionData.average_miss_angle,
            fg_percentage: sessionData.fg_percentage,
            shot_angles: sessionData.shot_angles,
            shots_results: sessionData.shots_results,
            total_shots: sessionData.total_shots
        };

        const response = await fetch(`${API_BASE_URL}/api/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (response.ok) {
            console.log("Session saved successfully:", result);
        } else {
            console.error("Failed to save session:", result.error);
        }
    } catch (error) {
        console.error("Error saving session:", error);
    }
}

export async function getVideoDuration(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };
        video.onerror = () => {
            reject("Could not load video metadata.");
        };
        video.src = URL.createObjectURL(file);
    });
}

// NOTE: sendVideoForAnalysis is deprecated in favor of AnalysisContext.jsx
// Keeping only the duration logic helper if needed elsewhere.
export async function sendVideoForAnalysis(file, hoopLeft, hoopRight, navigate) {
    // This function is being phased out.
    // Use AnalysisContext.startAnalysis for production use.
    console.warn("sendVideoForAnalysis is deprecated. Use AnalysisContext instead.");
}