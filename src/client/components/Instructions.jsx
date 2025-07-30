import React from 'react';
import '../css/instructions.css'; // We'll create this file next
import goodImage from '../assets/good image.webp'; // Import the image

// The pop-up component receives an 'onClose' function as a prop
const Instructions = ({ onClose }) => {
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>

                <h2>How It Works</h2>
                <p className="subtitle">Follow these three steps for a perfect analysis.</p>

                <div className="steps-container">
                    {/* Step 1: Record */}
                    <div className="step">
                        <div className="step-icon">📹</div>
                        <h3>1. Record Your Video</h3>
                        <ul>
                            <li><strong>Use a Tripod:</strong> The camera must be completely still.</li>
                            <li><strong>Clear View:</strong> The hoop, backboard, and ball's flight must be visible.</li>
                            <li><strong>Good Lighting:</strong> Record with a clear background so that there is high contrast with the ball.</li>
                        </ul>
                    </div>

                    {/* Step 2: Upload */}
                    <div className="step">
                        <div className="step-icon">🖱️</div>
                        <h3>2. Upload & Calibrate</h3>
                        <ul>
                            <li>Click the "Upload Video" button on the homepage.</li>
                            <li>When your video loads, you will be asked to **click the left and right sides of the rim.**</li>
                            <li>This step is critical for our AI to locate the hoop.</li>
                        </ul>
                    </div>

                    {/* Step 3: Results */}
                    <div className="step">
                        <div className="step-icon">📊</div>
                        <h3>3. Get Your Results</h3>
                        <ul>
                            <li>Once you've selected the hoop, click "Analyze."</li>
                            <li>Our AI will process the video and generate your shot stats.</li>
                            <li>View your full performance breakdown on your profile page.</li>
                        </ul>
                    </div>
                </div>

                <div className="example-image">
                    <h4>Example of a Good Shot</h4>
                    <img src={goodImage} alt="Example of a good recording angle" />
                </div>

            </div>
        </div>
    );
};

export default Instructions;