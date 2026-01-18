import { useState, useRef } from 'react';
import '../css/MainPage.css'; // Utilizing existing and new styles
import demoVideo from '../assets/backgroundvideo.mp4';

const VideoUpload = ({ onVideoSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Ensure copy effect is shown
        e.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndUpload(files[0]);
        }
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndUpload(files[0]);
        }
    };

    const validateAndUpload = (file) => {
        if (file.type.startsWith('video/')) {
            onVideoSelect(file);
        } else {
            alert('Please upload a valid video file.');
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    // New: Demo Mode Helper
    const loadDemoVideo = async () => {
        try {
            const response = await fetch(demoVideo);
            const blob = await response.blob();
            const file = new File([blob], "demo_practice_shot.mp4", { type: "video/mp4" });
            onVideoSelect(file);
        } catch (error) {
            console.error("Demo load failed", error);
            alert("Could not load demo video.");
        }
    };

    return (
        <div className="upload-container-wrapper">
            <div
                className={`video-upload-zone glass ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden-input"
                    accept="video/*"
                    onChange={handleFileInput}
                />

                <div className="upload-content">
                    <div className="upload-icon-wrapper">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="upload-icon"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <h3 className="upload-title">Upload Video</h3>
                    <p className="upload-desc">Drag & drop or click to browse</p>
                    <span className="upload-formats">MP4, WEBM, OGG</span>
                </div>

                {isDragging && (
                    <div className="drag-overlay">
                        <p>Drop video here</p>
                    </div>
                )}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); loadDemoVideo(); }}
                className="demo-link-btn"
            >
                Don't have a video? Try our demo.
            </button>
        </div>
    );
};

export default VideoUpload;
