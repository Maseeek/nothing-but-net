import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import "../css/MainPage.css";
import Coordinates from "../components/Coordinates.jsx";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config.js";

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

function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const res = await axios.get(`${API_BASE_URL}/api/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data);
                }
            } catch (error) {
                console.error("Not logged in or failed to fetch user", error);
            }
        };
        fetchUserData();
    }, []);

    return (
        <div className="dashboard-container">
            <Navbar />
            <div className="dashboard-content-wrapper animate-fade-in">
                <div className="dashboard-grid">
                    {/* Header Row */}
                    <div className="dashboard-header">
                        <div>
                            <h1>Welcome back{user && user.username ? `, ${user.username}` : ''}</h1>
                            <p>Ready to analyze your next shooting session?</p>
                        </div>
                    </div>
                    
                    {/* Main Area: Upload Window */}
                    <div className="dashboard-main">
                        <HomeContent />
                    </div>

                    {/* Sidebar Pane */}
                    <div className="dashboard-sidebar">
                        <div className="sidebar-glass-panel">
                            <h3>Analytics Dashboard</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
                                Track your field goal percentage and arc metrics over time automatically.
                            </p>
                            <Link to="/results" className="demo-link-btn" style={{ display: 'inline-block', background: 'var(--accent-color)', color: 'white', padding: '10px 20px', borderRadius: '8px' }}>
                                View Full History
                            </Link>
                        </div>

                        <div className="sidebar-glass-panel">
                            <h3>Pro Tips</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                For best results, ensure your camera is stable and capturing the full arc of the ball from release to the net. A tripod is highly recommended.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;