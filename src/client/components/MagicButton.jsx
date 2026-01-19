import React from 'react';
import '../css/MagicButton.css';

const MagicButton = ({ children, onClick, className = '' }) => {
    return (
        <button
            className={`magic-button-container ${className}`}
            onClick={onClick}
        >
            <div className="magic-button-border"></div>
            <div className="magic-button-content">
                {children}
            </div>
        </button>
    );
};

export default MagicButton;
