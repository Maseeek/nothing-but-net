import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import "../css/MainPage.css";
import Coordinates from "../components/Coordinates.jsx";
import { sendVideoForAnalysis } from "../js/videoProcessing.js";
import Loading from "../components/Loading.jsx";

function MainPage() {
    const [videoFile, setVideoFile] = useState(null);
    const [image, setImage] = useState(null);
    const [coordinates, setCoordinates] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

        videoElement.onloadedmetadata = () => {
            videoElement.currentTime = 1; // Seek to 1 second into the video
        };

        videoElement.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const context = canvas.getContext("2d");
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            setImage(canvas.toDataURL()); // Save the frame as a data URL
        };
    };

    const handleCoordinatesChange = (newCoordinates) => {
        setCoordinates(newCoordinates);
    };

    const handleAnalyzeResults = async () => {
        if (coordinates.length === 2) {
            setIsAnalyzing(true); // Show loading screen
            try {
                await sendVideoForAnalysis(videoFile, coordinates[0], coordinates[1]);
            } catch (error) {
                console.error("Error during analysis:", error);
            } finally {
                setIsAnalyzing(false); // Hide loading screen after processing
            }
        } else {
            alert("Please select exactly two coordinates.");
        }
    };

    return (
        <div className="main-page">
            {isAnalyzing ? (
                <Loading />
            ) : (
                <>
                    <h1>Analyze your Video</h1>
                    <form className="video-form">
                        <label htmlFor="videoInput">UPLOAD VIDEO:</label>
                        <input
                            type="file"
                            id="videoInput"
                            accept="video/*"
                            onChange={handleVideoUpload}
                        />
                    </form>
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

function Home() {
    return (
        <>
            <Navbar />
            <MainPage />
        </>
    );
}

export default Home;