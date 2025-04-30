import React, { useState, useEffect } from 'react';
import nbnLogo from '../assets/nbnlight.png';
import '../css/loading.css';

function Loading({ onLoadingComplete }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            onLoadingComplete(); // Notify parent when loading is complete
        }, 3000); // 3 seconds

        return () => clearTimeout(timer);
    }, [onLoadingComplete]);

    if (!isLoading) {
        return null; // Do not render the Loading component after loading is complete
    }

    return (
        <div className="loading-container">
            <div className="loading-box">
                <img src={nbnLogo} alt="NBN Logo" className="loading-logo" />
                <div className="loading-spinner"></div>
            </div>
        </div>
    );
}

export default Loading;