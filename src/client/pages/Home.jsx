import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import "../css/MainPage.css";
import Coordinates from "../components/Coordinates.jsx";
import { sendVideoForAnalysis } from "../js/videoProcessing.js";
import Loading from "../components/Loading.jsx";
import Instructions from "../components/Instructions.jsx";
import QuestionMarkIcon from "../components/QuestionMarkIcon.jsx"; // IMPORT THE NEW ICON

function MainPage() {
    const [videoFile, setVideoFile] = useState(null);
    const [image, setImage] = useState(null);
    const [coordinates, setCoordinates] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    // Move state for the instructions pop-up here
    const [showInstructions, setShowInstructions] = useState(false);

    // ... (keep all your existing functions like handleVideoUpload, etc.)
    const handleVideoUpload = (event) => {
        const file = event.target.files[0];
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
        };
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
        <div className="main-page">
            {/* Conditionally render the pop-up from this component */}
            {showInstructions && <Instructions onClose={() => setShowInstructions(false)} />}

            {isAnalyzing ? (
                <Loading />
            ) : (
                <>
                    {/* 👇 New container for the upload button and icon 👇 */}
                    <div className="upload-container">
                        <form className="video-form">
                            <label htmlFor="videoInput">UPLOAD VIDEO</label>
                            <input
                                type="file"
                                id="videoInput"
                                accept="video/*"
                                onChange={handleVideoUpload}
                            />
                        </form>

                        {/* 👇 CHANGE THIS PART 👇 */}
                        <button className="instructions-btn" onClick={() => setShowInstructions(true)}>
                            <QuestionMarkIcon className="icon" />
                        </button>
                    </div>

                    {image && (
                        <Coordinates
                            imageUrl={image}
                            videoFile={videoFile}
                            onCoordinatesChange={handleCoordinatesChange}
                        />
                    )}
                    {coordinates.length === 2 && (
                        <button
                            className="analyze-button"
                            onClick={handleAnalyzeResults}
                            disabled={isAnalyzing}
                        >
                            Analyze Results
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

function LandingPage(){
    return(
        <div className={"landing-page"}>
            <div className={"background-video-form"}>
                <video className={"background-video"} src={"src/client/assets/backgroundvideo.mp4"} autoPlay loop muted />
                <div className={"welcome"}>
                    <h1 className={"welcome-message"}>Never Lose Count Again</h1>
                    <p className={"welcome-info"}>Just upload your video. Our AI does the rest.</p>
                </div>
            </div>
            <MainPage />
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