import { useState, useRef, useEffect } from "react";
import "../css/Coordinates.css";
import { sendVideoForAnalysis } from "../js/videoProcessing.js";
import Loading from "../components/Loading.jsx";
import { useNavigate } from "react-router-dom";

function Coordinates({ imageUrl, videoFile }) {
    const [coordinates, setCoordinates] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const imageRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleImageClick = (event) => {
        if (coordinates.length < 2) {
            const rect = event.target.getBoundingClientRect();
            const image = imageRef.current;

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

            setIsAnalyzing(true);

            try {
                await sendVideoForAnalysis(videoFile, hoopLeft, hoopRight, navigate);
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
                    <h2>
                        {coordinates.length === 0
                            ? "Click the left side of the hoop"
                            : coordinates.length === 1
                                ? "Click the right side of the hoop"
                                : "You have selected both points."}
                    </h2>
                    <div className="image-wrapper">
                        <img
                            ref={imageRef}
                            src={imageUrl}
                            alt="Selectable"
                            onClick={handleImageClick}
                            className="selectable-image"
                        />
                        {coordinates.map((coord, index) => (
                            <div
                                key={index}
                                className="coordinate-point"
                                style={{
                                    left: `${(coord.x / imageRef.current.naturalWidth) * imageRef.current.offsetWidth}px`,
                                    top: `${(coord.y / imageRef.current.naturalHeight) * imageRef.current.offsetHeight}px`,
                                }}
                            >
                                {index === 0 ? "L" : "R"}
                            </div>
                        ))}
                    </div>
                    <div className="button-group">
                        <button
                            className="reset-button"
                            onClick={handleReset}
                            disabled={coordinates.length === 0}
                        >
                            <svg fill="#000000" width="800px" height="800px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                                <path d="M960 0v213.333c411.627 0 746.667 334.934 746.667 746.667S1371.627 1706.667 960 1706.667 213.333 1371.733 213.333 960c0-197.013 78.4-382.507 213.334-520.747v254.08H640V106.667H53.333V320h191.04C88.64 494.08 0 720.96 0 960c0 529.28 430.613 960 960 960s960-430.72 960-960S1489.387 0 960 0" fill-rule="evenodd"/>
                            </svg>
                        </button>
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