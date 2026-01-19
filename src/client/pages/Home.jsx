import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import "../css/MainPage.css";
import Coordinates from "../components/Coordinates.jsx";
import { sendVideoForAnalysis } from "../js/videoProcessing.js";

import Instructions from "../components/Instructions.jsx";
import QuestionMarkIcon from "../components/QuestionMarkIcon.jsx";
import VideoUpload from "../components/VideoUpload.jsx";




function HomeContent() {
    const [videoFile, setVideoFile] = useState(null);
    const [image, setImage] = useState(null);

    const [showInstructions, setShowInstructions] = useState(false);
    const [showCoordinates, setShowCoordinates] = useState(false);
    const [scaleFactor, setScaleFactor] = useState(1);

    const handleVideoSelect = (file) => {
        if (file) {
            setVideoFile(file);
            extractFirstFrame(file);
        }
    };

    const extractFirstFrame = (videoFile) => {
        const videoElement = document.createElement("video");
        videoElement.src = URL.createObjectURL(videoFile);
        videoElement.onloadedmetadata = () => { videoElement.currentTime = 1; };
        videoElement.onseeked = () => {
            const canvas = document.createElement("canvas");
            // Limit resolution for performance
            const MAX_DIM = 720;
            let w = videoElement.videoWidth;
            let h = videoElement.videoHeight;
            if (w > MAX_DIM || h > MAX_DIM) {
                const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
                w *= ratio;
                h *= ratio;
            }

            canvas.width = w;
            canvas.height = h;
            const context = canvas.getContext("2d");
            context.drawImage(videoElement, 0, 0, w, h);

            // Calculate scale factor (Original Width / Canvas Width)
            // if w changed, then we scaled. If not, ratio is 1.
            const factor = videoElement.videoWidth / w;
            setScaleFactor(factor);

            setImage(canvas.toDataURL('image/jpeg', 0.85)); // Optimized format
            setShowCoordinates(true);
        };
    };

    const handleBackToUpload = () => {
        setVideoFile(null);
        setImage(null);
        setShowCoordinates(false);
    };



    // Note: handleAnalyzeResults is defined in Coordinates component now/handled there or passed down? 
    // Checking previous code: Coordinates called sendVideoForAnalysis directly. 
    // And Home.jsx also had handleAnalyzeResults but it wasn't passed to Coordinates in the previous snippets?
    // Wait, in the previous code for Home.jsx (Step 22), Coordinates was passed:
    // imageUrl, videoFile, onCoordinatesChange, onBack.
    // Coordinates component (Step 8) HAS its own handleAnalyzeResults.
    // So Home.jsx's handleAnalyzeResults (Lines 54-67) was seemingly UNUSED or redundant if Coordinates handles it.
    // Let's verify if Coordinates uses validation from Home.
    // Coordinates (Step 8) line 46 defines handleAnalyzeResults and uses sendVideoForAnalysis.
    // So Home.jsx lines 54-67 are likely dead code or from older version. I will remove them to clean up.

    return (
        <>
            {/* Instructions Overlay */}
            {showInstructions && <Instructions onClose={() => setShowInstructions(false)} />}



            {/* Coordinates Overlay */}
            {showCoordinates && (
                <Coordinates
                    imageUrl={image}
                    videoFile={videoFile}
                    scaleFactor={scaleFactor}
                    onBack={handleBackToUpload}
                />
            )}

            {/* Main Content - Always visible underneath */}
            <div className="main-page glass">
                <h2 className="section-title">Upload & Analyze</h2>

                <div className="upload-section">
                    <VideoUpload onVideoSelect={handleVideoSelect} />

                    <button className="instructions-btn" onClick={() => setShowInstructions(true)} title="How to use">
                        <QuestionMarkIcon className="icon" />
                    </button>
                </div>
            </div>
        </>
    );
}

function LandingPage() {
    return (
        <div className="landing-page">
            <div className="background-video-form">

                <div className="video-overlay"></div>

                <div className="landing-content-wrapper">
                    <div className="welcome">
                        <h1 className="welcome-message">Never Lose Count Again</h1>
                        <p className="welcome-info">Automatic shot tracking. Get your FG% and shooting angle.</p>
                    </div>

                    <HomeContent />
                </div>
            </div>
        </div>
    )
}

function Home() {
    return (
        <>
            <Navbar />
            <LandingPage />
        </>
    );
}

export default Home;