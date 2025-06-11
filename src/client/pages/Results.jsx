import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import FGResults from '../components/FGResults.jsx';
import '../css/Results.css';

// Helper function to save the analysis results to your database
const saveAnalysisResult = async (analysisData) => {
    try {
        const response = await fetch('/api/analyses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analysisData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save analysis.");
        }
        console.log("Analysis saved successfully to user profile.");
    } catch (error) {
        // This won't impact the user seeing their results, but logs errors for debugging.
        console.error("Could not save analysis result:", error);
    }
};

const Results = () => {
    const location = useLocation();
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null); // New state to handle errors

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        // Get parameters from the URL
        const fgPercentageParam = queryParams.get('fg_percentage');
        const totalShotsParam = queryParams.get('total_shots');
        const madeShotsParam = queryParams.get('made_shots');

        // Check if any parameter is missing from the URL
        if (fgPercentageParam === null || totalShotsParam === null || madeShotsParam === null) {
            setError("Analysis results are missing from the URL. Please try analyzing another video.");
            return;
        }

        // Try to convert parameters to numbers
        const fgPercentage = parseFloat(fgPercentageParam);
        const totalShots = parseInt(totalShotsParam, 10);
        const madeShots = parseInt(madeShotsParam, 10);

        // Check if the converted numbers are valid
        if (isNaN(fgPercentage) || isNaN(totalShots) || isNaN(madeShots)) {
            setError("Received invalid analysis data from the previous step. Please try again.");
            // Log the problematic data to the console for your debugging
            console.error("Invalid data received in URL:", { fgPercentageParam, totalShotsParam, madeShotsParam });
            return;
        }

        // If all checks pass, set the results and save them
        const newResults = { fgPercentage, totalShots, madeShots };
        setResults(newResults);
        saveAnalysisResult(newResults);

    }, [location.search]); // This effect runs once when the page loads with its URL parameters

    // Helper function to decide what to render
    const renderContent = () => {
        if (error) {
            return <p className="error-message">{error}</p>;
        }
        if (results) {
            return (
                <FGResults
                    fg_percentage={results.fgPercentage}
                    total_shots={results.totalShots}
                    made_shots={results.madeShots}
                />
            );
        }
        return <p className="loading-message">Loading analysis results...</p>;
    };

    return (
        <div className="results-page">
            <Navbar />
            <div className="results-container">
                <h1>Analysis Results</h1>
                <div className="results-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Results;