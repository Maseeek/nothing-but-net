import { useState, useCallback, useEffect } from "react";
import "../css/Coordinates.css";
import { sendVideoForAnalysis } from "../js/videoProcessing.js";
import Loading from "../components/Loading.jsx";
import { useNavigate } from "react-router-dom";
import { RotateCcw, ArrowLeft } from 'lucide-react';

function Coordinates({ imageUrl, videoFile, onBack, scaleFactor }) {
    const [coordinates, setCoordinates] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [imgElement, setImgElement] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleImageClick = (event) => {
        if (coordinates.length < 2) {
            const rect = event.target.getBoundingClientRect();
            const image = imgElement;

            if (!image) {
                console.error("Image reference is not available.");
                return;
            }

            const scaleX = image.naturalWidth / image.offsetWidth;
            const scaleY = image.naturalHeight / image.offsetHeight;

            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;

            setCoordinates((prev) => [...prev, { x, y }]);
        } else {
            alert("You can only select two coordinates.");
        }
    };

    const handleReset = () => {
        setCoordinates([]);
    };

    const handleAnalyzeResults = async () => {
        if (!videoFile) {
            alert("No video file provided.");
            return;
        }

        if (coordinates.length === 2) {
            const [hoopLeft, hoopRight] = coordinates;

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

            // Apply scale factor to convert UI coords to Original Video coords
            const realHoopLeft = {
                x: hoopLeft.x * (scaleFactor || 1),
                y: hoopLeft.y * (scaleFactor || 1)
            };
            const realHoopRight = {
                x: hoopRight.x * (scaleFactor || 1),
                y: hoopRight.y * (scaleFactor || 1)
            };

            setIsAnalyzing(true);

            try {
                await sendVideoForAnalysis(videoFile, realHoopLeft, realHoopRight, navigate);
            } catch (error) {
                console.error("Error during analysis:", error);
                alert("An error occurred during analysis. Please try again.");
            } finally {
                setIsAnalyzing(false);
            }
        } else {
            alert("Please select exactly two coordinates.");
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="coordinates-container">
            {isAnalyzing && <Loading />}
            {!isAnalyzing && (
                <div className="coordinates-content">
                    <div className="progress-indicator">
                        {coordinates.length === 0 ? "Step 1 of 2" : coordinates.length === 1 ? "Step 2 of 2" : "Complete ✓"}
                    </div>
                    <h2>
                        {coordinates.length === 0
                            ? "Click the left edge of the basketball hoop"
                            : coordinates.length === 1
                                ? "Now click the right edge of the hoop"
                                : "Perfect! Both points selected"}
                    </h2>
                    <div className="image-wrapper">
                        <img
                            ref={setImgElement}
                            src={imageUrl}
                            alt="Selectable"
                            onClick={handleImageClick}
                            className="selectable-image"
                        />
                        {coordinates.map((coord, index) => {
                            if (!imgElement) return null;
                            return (
                                <div
                                    key={index}
                                    className="coordinate-point"
                                    style={{
                                        left: `${(coord.x / imgElement.naturalWidth) * imgElement.offsetWidth}px`,
                                        top: `${(coord.y / imgElement.naturalHeight) * imgElement.offsetHeight}px`,
                                    }}
                                >
                                    {index === 0 ? "L" : "R"}
                                </div>
                            );
                        })}
                    </div>
                    <div className="button-group">
                        <div className="secondary-actions">
                            <button
                                className="back-button"
                                onClick={onBack}
                                title="Back to upload"
                            >
                                <ArrowLeft color="white" size={24} />
                            </button>
                            <button
                                className="reset-button"
                                onClick={handleReset}
                                disabled={coordinates.length === 0}
                                title="Reset points"
                            >
                                <RotateCcw color="white" size={24} />
                            </button>
                        </div>
                        <button
                            className="analyze-button"
                            onClick={handleAnalyzeResults}
                            disabled={coordinates.length < 2 || isAnalyzing}
                        >
                            Analyze Results
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Coordinates;