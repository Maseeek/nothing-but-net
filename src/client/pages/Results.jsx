import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Loading from "../components/Loading.jsx";
import "./../css/Results.css"; // This now points to the combined CSS file

function Results() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAngle, setShowAngle] = useState(true);

    useEffect(() => {
        console.log("Results component mounted");
        const storedData = sessionStorage.getItem("analysisResults");
        console.log("Raw stored data from sessionStorage:", storedData);
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                console.log("Parsed data:", parsedData);
                setData(parsedData);
            } catch (err) {
                console.error("Error parsing stored results:", err);
            }
        } else {
            console.warn("No 'analysisResults' found in sessionStorage.");
        }

        // Load settings
        const storedShowAngle = localStorage.getItem('nbn_settings_showAngle');
        console.log("Stored showAngle setting:", storedShowAngle);
        if (storedShowAngle !== null) {
            setShowAngle(JSON.parse(storedShowAngle));
        }

        setLoading(false);
    }, []);

    // Destructure all values from the data, providing defaults
    const {
        total_shots = 0,
        makes = 0,
        fg_percentage = 0,
        longest_streak = 0,
        average_angle = 0,
        shots_results = []
    } = data || {}; // Use empty object as fallback if data is null

    return (
        <div className="results-page">
            <Navbar />
            <div className="results-container glass animate-fade-in">
                <header className="results-header">
                    <div className="gradient-bar-std" style={{ width: '80px' }}></div>
                    <h1>Analysis Complete</h1>
                    <p>Here is the breakdown of your shooting session.</p>
                </header>

                <main className="results-content">
                    {loading ? (
                        <Loading />
                    ) : !data ? (
                        <div className="results-placeholder">
                            <div className="placeholder-icon">📊</div>
                            <h2>No analysis data found.</h2>
                            <p>Please upload a video to see your results.</p>
                            <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>
                                Analyze Video
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* --- Main Stats Grid --- */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h4>Field Goal %</h4>
                                    <p>{fg_percentage}<span>%</span></p>
                                </div>
                                <div className="stat-card">
                                    <h4>Shots Made</h4>
                                    <p>{makes}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>Longest Streak</h4>
                                    <p>{longest_streak}</p>
                                </div>
                                {showAngle && (
                                    <div className="stat-card">
                                        <h4>Avg. Angle</h4>
                                        <p>{average_angle}<span>°</span></p>
                                    </div>
                                )}
                            </div>

                            {/* --- Shot Sequence Section --- */}
                            <div className="shot-sequence-container">
                                <h3>Shot-by-Shot</h3>
                                <div className="shot-sequence">
                                    {shots_results.map((shot, index) => (
                                        <div
                                            key={index}
                                            className={`shot-bubble ${shot === 1 ? "make" : "miss"}`}
                                            title={`Shot ${index + 1}: ${shot === 1 ? 'Made' : 'Missed'}`}
                                        >
                                            {index + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* --- Action Buttons --- */}
                            <div className="results-actions">
                                <Link to="/" className="btn-secondary">
                                    Analyze New Video
                                </Link>
                                <Link to="/profile" className="btn-primary">
                                    View Profile
                                </Link>
                            </div>
                        </>
                    )}
                </main>
            </div>

        </div >
    );
}

export default Results;