import { useState } from "react";
import "../css/Coordinates.css";
function Coordinates({ imageUrl }) {
    const [coordinates, setCoordinates] = useState([]);
    const [message, setMessage] = useState("Click on the image to select the first coordinate.");

    const handleImageClick = (event) => {
        if (coordinates.length < 2) {
            const rect = event.target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            setCoordinates((prev) => [...prev, { x, y }]);

            if (coordinates.length === 0) {
                setMessage("Click on the image to select the second coordinate.");
            } else {
                setMessage("You have selected both coordinates.");
            }
        }
    };

    return (
        <div className="coordinates-container">
            <div className="coordinates-content">
                <p className="coordinates-message">{message}</p>
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
                {coordinates.length > 0 && (
                    <div className="coordinates-list">
                        <h3>Selected Coordinates:</h3>
                        <ul>
                            {coordinates.map((coord, index) => (
                                <li key={index}>
                                    Point {index + 1}: (X: {coord.x}, Y: {coord.y})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Coordinates;