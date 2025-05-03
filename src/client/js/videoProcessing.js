export async function sendVideoForAnalysis(file, hoopLeft, hoopRight, navigate) {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("hoopLeft", JSON.stringify([hoopLeft.x, hoopLeft.y]));
    formData.append("hoopRight", JSON.stringify([hoopRight.x, hoopRight.y]));
    formData.append("showAngle", sessionStorage.getItem("showAngle") != "true");

    try {
        console.log("Hoop Left:", hoopLeft, "Hoop Right:", hoopRight);
        const response = await fetch("http://localhost:5000/upload-and-analyze", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log("Analysis completed successfully:", data.data);
            sessionStorage.setItem("analysisResults", JSON.stringify(data.data));
            console.log("Stored in sessionStorage:", sessionStorage.getItem("analysisResults"));
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