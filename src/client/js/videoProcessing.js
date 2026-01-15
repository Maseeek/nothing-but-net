import { getCurrentUser } from "./auth.js";
import { API_BASE_URL, ANALYSIS_API_URL } from '../config.js';

export async function sendSessionData(sessionData) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.userId) {
            console.error("User ID not found. Ensure the user is logged in.");
            return;
        }

        const payload = {
            userId: currentUser.userId, // Include userId
            makes: sessionData.makes,
            misses: sessionData.misses,
            longest_streak: sessionData.longest_streak, // Updated field name
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

export async function sendVideoForAnalysis(file, hoopLeft, hoopRight, navigate) {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("hoopLeft", JSON.stringify([hoopLeft.x, hoopLeft.y]));
    formData.append("hoopRight", JSON.stringify([hoopRight.x, hoopRight.y]));
    try {
        console.log("Hoop Left:", hoopLeft, "Hoop Right:", hoopRight);

        // Match the key used in Settings and Results
        const settingsShowAngle = localStorage.getItem('nbn_settings_showAngle') === 'true';
        formData.append("showAngle", settingsShowAngle);

        const response = await fetch(`${ANALYSIS_API_URL}/upload-and-analyze`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log("Analysis raw response data:", data.data);
            const analysisResults = data.data;
            console.log("Saving to sessionStorage 'analysisResults':", analysisResults);
            sessionStorage.setItem("analysisResults", JSON.stringify(analysisResults));

            // Send session data to the server
            await sendSessionData(analysisResults);

            navigate("/results"); // Navigate to Results.jsx page
        } else {
            console.error("Analysis failed:", data.error || "Unknown error");
            alert("Analysis failed: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error processing video:", error);
        alert("Error processing video: " + error.message);
    }
}