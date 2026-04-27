import React, { useState, useEffect } from 'react';
import nbnLogo from '../assets/nbn logo transparent.png';
import '../css/loading.css';

function Loading({ message, delay = 400 }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (!visible) return null;

    return (
        <div className="loading-container">
            <div className="loading-box glass">
                <img src={nbnLogo} alt="NBN Logo" className="loading-logo" />
                <div className="loading-spinner"></div>
                {message && <p className="loading-message">{message}</p>}
            </div>
        </div>
    );
}

export default Loading;