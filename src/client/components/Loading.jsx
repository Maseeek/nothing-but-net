import React from 'react';
import nbnLogo from '../assets/nbn logo transparent.png';
import '../css/loading.css';

function Loading() {
    return (
        <div className="loading-container">
            <div className="loading-box glass">
                <img src={nbnLogo} alt="NBN Logo" className="loading-logo" />
                <div className="loading-spinner"></div>
            </div>
        </div>
    );
}

export default Loading;