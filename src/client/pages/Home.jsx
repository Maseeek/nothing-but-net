import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import "../css/MainPage.css";
import Coordinates from "../components/Coordinates.jsx";
import { sendVideoForAnalysis } from "../js/videoProcessing.js";
import Loading from "../components/Loading.jsx";
import Instructions from "../components/Instructions.jsx";
import QuestionMarkIcon from "../components/QuestionMarkIcon.jsx";
import VideoUpload from "../components/VideoUpload.jsx";
import LiquidEther from "../components/LiquidEther/LiquidEther.jsx";

function HomeContent() {
    const [videoFile, setVideoFile] = useState(null);
    const [image, setImage] = useState(null);
    const [coordinates, setCoordinates] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [currentStep, setCurrentStep] = useState('upload'); // 'upload' or 'coordinates'

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
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const context = canvas.getContext("2d");
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            setImage(canvas.toDataURL());
            // Auto-transition to coordinates step after frame extraction
            setCurrentStep('coordinates');
        };
    };

    const handleBackToUpload = () => {
        setVideoFile(null);
        setImage(null);
        setCoordinates([]);
        setCurrentStep('upload');
    };

    const handleCoordinatesChange = (newCoordinates) => {
        setCoordinates(newCoordinates);
    };

    const handleAnalyzeResults = async () => {
        if (coordinates.length === 2) {
            setIsAnalyzing(true);
            try {
                await sendVideoForAnalysis(videoFile, coordinates[0], coordinates[1]);
            } catch (error) {
                console.error("Error during analysis:", error);
            } finally {
                setIsAnalyzing(false);
            }
        } else {
            alert("Please select exactly two coordinates.");
        }
    };


    return (
        <div className="main-page glass">
            {/* Conditionally render the pop-up from this component */}
            {showInstructions && <Instructions onClose={() => setShowInstructions(false)} />}

            {isAnalyzing ? (
                <Loading />
            ) : (
                <>
                    <h2 className="section-title">Upload & Analyze</h2>

                    {currentStep === 'upload' ? (
                        <div className="upload-section step-transition">
                            <VideoUpload onVideoSelect={handleVideoSelect} />

                            <button className="instructions-btn" onClick={() => setShowInstructions(true)} title="How to use">
                                <QuestionMarkIcon className="icon" />
                            </button>
                        </div>
                    ) : (
                        <div className="coordinates-section step-transition">
                            <Coordinates
                                imageUrl={image}
                                videoFile={videoFile}
                                onCoordinatesChange={handleCoordinatesChange}
                                onBack={handleBackToUpload}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function LandingPage() {
    return (
        <div className="landing-page">
            <div className="background-video-form">
                <LiquidEther
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={true}
                    viscous={30}
                    iterationsViscous={12}
                    iterationsPoisson={12}
                    colors={["#ffd214", "#ff5805", "#ff4606"]}
                    autoDemo
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    isBounce={false}
                    resolution={0.4}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -2 }}
                />
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