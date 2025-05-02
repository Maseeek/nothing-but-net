import { useState } from "react";
import "../css/Coordinates.css";
import { sendVideoForAnalysis } from "../js/videoProcessing.js";
import Loading from "../components/Loading.jsx";
import { useNavigate } from "react-router-dom";

function Coordinates({ imageUrl, videoFile }) {
    const [coordinates, setCoordinates] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const navigate = useNavigate();

    const handleImageClick = (event) => {
        if (coordinates.length < 2) {
            const rect = event.target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            setCoordinates((prev) => [...prev, { x, y }]);
        }
    };

    const handleAnalyzeResults = async () => {
        if (!videoFile) {
            alert("No video file provided.");
            return;
        }

        if (coordinates.length === 2) {
            const [hoopLeft, hoopRight] = coordinates;

            // Validate coordinates
            if (
                !hoopLeft ||
                !hoopRight ||
                typeof hoopLeft.x !== "number" ||
                typeof hoopLeft.y !== "number" ||
                typeof hoopRight.x !== "number" ||
                typeof hoopRight.y !== "number"
            ) {
                alert("Invalid coordinates. Please select valid points.");
                return;
            }

            setIsAnalyzing(true); // Show loading screen

            try {
                await sendVideoForAnalysis(videoFile, hoopLeft, hoopRight, navigate);
            } catch (error) {
                console.error("Error during analysis:", error);
                alert("An error occurred during analysis. Please try again.");
            } finally {
                setIsAnalyzing(false); // Hide loading screen after response
            }
        } else {
            alert("Please select exactly two coordinates.");
        }
    };

    return (
        <div className="coordinates-container">
            {isAnalyzing && <Loading />}
            {!isAnalyzing && (
                <div className="coordinates-content">
                    <h2>Please select the left and right edges of the hoop.</h2>
                    <div className="image-wrapper">
                        <img
                            src={imageUrl}
                            alt="Selectable"
                            onClick={handleImageClick}
                            className="selectable-image"
                        />
                        {coordinates.map((coord, index) => (
                            <div
                                key={index}
                                className="coordinate-point"
                                style={{ left: `${coord.x}px`, top: `${coord.y}px` }}
                            >
                                {index + 1}
                            </div>
                        ))}
                    </div>
                    <button
                        className="analyze-button"
                        onClick={handleAnalyzeResults}
                        disabled={coordinates.length < 2 || isAnalyzing}
                    >
                        Analyze Results
                    </button>
                </div>
            )}
        </div>
    );
}

export default Coordinates;