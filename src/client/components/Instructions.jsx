import React from 'react';
import '../css/instructions.css'; // We'll create this file next
import goodImage from '../assets/good image.webp'; // Import the image
import { CloseIcon } from './Icons';

// The pop-up component receives an 'onClose' function as a prop
const Instructions = ({ onClose }) => {
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content glass animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close">
                    <CloseIcon />
                </button>

                <div className="header-section">
                    <div className="gradient-bar-std"></div>
                    <h2>How It Works</h2>
                    <p className="subtitle">Follow these three simple steps for a perfect analysis.</p>
                </div>

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
                            <li>Click "Upload Video" on the homepage.</li>
                            <li>When loaded, <strong>click the left and right sides of the rim.</strong></li>
                            <li>This calibration helps our system precisely locate the hoop.</li>
                        </ul>
                    </div>

                    {/* Step 3: Results */}
                    <div className="step">
                        <div className="step-icon">📊</div>
                        <h3>3. Get Your Results</h3>
                        <ul>
                            <li>Once calibrated, click "Analyze."</li>
                            <li>Our computer vision algorithms track the ball's trajectory.</li>
                            <li>View your shooting percentage, arc, and consistency.</li>
                        </ul>
                    </div>
                </div>

                <div className="header-section" style={{ marginBottom: '30px', marginTop: '50px' }}>
                    <div className="gradient-bar-std"></div>
                    <h2>The Metrics</h2>
                    <p className="subtitle">Understanding your shooting data.</p>
                </div>

                <div className="steps-container">
                    <div className="step">
                        <h3>Entry Angle</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            The angle at which the ball enters the rim. A 45° entry angle is mathematically optimal for maximizing the rim's surface area.
                        </p>
                    </div>
                    <div className="step">
                        <h3>Shot Arc</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            The highest point of the ball's flight path. High arcs often correlate with softer landings and higher shooting percentages.
                        </p>
                    </div>
                    <div className="step">
                        <h3>Consistency</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            We track your make/miss streaks and session averages to help you identify patterns in your shooting mechanics over time.
                        </p>
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