import React from "react";
import "../css/FGResults.css"; // Ensure you have a separate CSS file for styling

function FGResults({ results }) {
    if (!results) {
        return (
            <div className="analysis-results">
                <h2>No Results Available</h2>
                <p>Please upload a video and try again.</p>
            </div>
        );
    }

    return (
        <div className="analysis-results">
            <h2 className="regHeader">SHOT ANALYSIS RESULTS</h2>
            <div className="shot-sequence">
                {results.shots_results.map((shot, index) => (
                    <div
                        key={index}
                        className={`shot ${shot === 1 ? "make" : "miss"}`}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>
            <div className="stats-container">
                <div className="stat-card">
                    <h3>Field Goal %</h3>
                    <div className="value">{results.fg_percentage}%</div>
                    <p className="regText">
                        {results.makes}/{results.total_shots}
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Longest Streak</h3>
                    <div className="value">{results.longest_streak}</div>
                    <p className="regText">consecutive makes</p>
                </div>
            </div>
        </div>
    );
}

export default FGResults;