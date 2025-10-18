import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { isLoggedIn, getCurrentUser } from '../js/auth.js';
import { API_BASE_URL } from '../config.js';
import Chart from 'chart.js/auto';
import "../css/Profile.css";

const Profile = () => {
    const [userStats, setUserStats] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const shotChartRef = useRef(null);
    const fgChartRef = useRef(null);
    const fgLineChartRef = useRef(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            window.location.href = './login';
            return;
        }

        const fetchUserData = async () => {
            try {
                const currentUser = getCurrentUser();
                const userId = currentUser?.userId;

                if (!userId) {
                    console.error('User ID is missing.');
                    // Optionally, redirect to login or show an error to the user
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/api/sessions/${userId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch sessions: ${response.statusText}`);
                }

                const sessionData = await response.json();
                if (!Array.isArray(sessionData) || sessionData.length === 0) {
                    // No sessions, set stats to default or indicate no data
                    setUserStats({
                        totalMakes: 0,
                        totalMisses: 0,
                        fgPercentage: '0.00',
                        overallLongestStreak: 0,
                        progressSummary: "No sessions recorded yet. Start analyzing videos to see your progress!"
                    });
                    setSessions([]);
                    setLoading(false);
                    return;
                }

                const totalMakes = sessionData.reduce((sum, session) => sum + (session.makes || 0), 0);
                const totalMisses = sessionData.reduce((sum, session) => sum + (session.misses || 0), 0);
                const totalShots = totalMakes + totalMisses;
                const fgPercentage = totalShots > 0 ? (totalMakes / totalShots) * 100 : 0;

                // Calculate overall longest streak
                const overallLongestStreak = sessionData.reduce((maxStreak, session) =>
                    Math.max(maxStreak, session.longest_streak || 0), 0
                );

                // Determine progress summary
                let progressSummary = "Analyze more videos to see your progress trend!";
                if (sessionData.length >= 2) {
                    const firstSessionFg = sessionData[0].fg_percentage || 0;
                    const lastSessionFg = sessionData[sessionData.length - 1].fg_percentage || 0;
                    if (lastSessionFg > firstSessionFg) {
                        progressSummary = `Great job! Your field goal percentage has improved from ${firstSessionFg.toFixed(2)}% to ${lastSessionFg.toFixed(2)}% over your sessions.`;
                    } else if (lastSessionFg < firstSessionFg) {
                        progressSummary = `Your field goal percentage has changed from ${firstSessionFg.toFixed(2)}% to ${lastSessionFg.toFixed(2)}% over your sessions. Keep practicing!`;
                    } else {
                        progressSummary = `Your field goal percentage has remained consistent at ${firstSessionFg.toFixed(2)}% across your sessions.`;
                    }
                }

                setUserStats({
                    totalMakes,
                    totalMisses,
                    fgPercentage: fgPercentage.toFixed(2),
                    overallLongestStreak,
                    progressSummary
                });
                setSessions(sessionData);
            } catch (error) {
                console.error('Error fetching user data:', error.message);
                setUserStats(null); // Clear stats on error
                setSessions([]);
                setError("Failed to load profile data. Please try again later."); // You might want to add an error state
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (sessions.length > 0 && userStats) { // Ensure userStats is also available
            const labels = sessions.map(session => new Date(session.sessionDate).toLocaleDateString());
            const makesData = sessions.map(session => session.makes || 0);
            const missesData = sessions.map(session => session.misses || 0);
            const fgPercentageData = sessions.map(session => session.fg_percentage || 0);

            const shotCanvas = document.getElementById('shot-scores-bar-chart');
            const fgCanvas = document.getElementById('fg-percentage-pie-chart');
            const fgLineCanvas = document.getElementById('fg-percentage-line-chart');

            // Destroy existing chart instances before creating new ones
            if (shotChartRef.current) shotChartRef.current.destroy();
            if (fgChartRef.current) fgChartRef.current.destroy();
            if (fgLineChartRef.current) fgLineChartRef.current.destroy();

            if (!shotCanvas || !fgCanvas || !fgLineCanvas) {
                console.error('Canvas elements not found for charts.');
                return;
            }

            const shotCtx = shotCanvas.getContext('2d');
            const fgCtx = fgCanvas.getContext('2d');
            const fgLineCtx = fgLineCanvas.getContext('2d');

            // Bar chart for shot scores
            shotChartRef.current = new Chart(shotCtx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Makes',
                            data: makesData,
                            backgroundColor: '#4CAF50',
                        },
                        {
                            label: 'Misses',
                            data: missesData,
                            backgroundColor: '#F44336',
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Shot Scores (Makes vs Misses) Per Session', // Updated title
                        },
                        legend: {
                            position: 'top',
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Shots',
                            },
                            beginAtZero: true,
                        },
                    },
                },
            });

            // Pie chart for overall field goal percentage
            fgChartRef.current = new Chart(fgCtx, {
                type: 'pie',
                data: {
                    labels: ['Makes', 'Misses'],
                    datasets: [
                        {
                            data: [userStats.totalMakes, userStats.totalMisses],
                            backgroundColor: ['#4CAF50', '#F44336'],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Overall Field Goal Distribution', // Updated title
                        },
                        legend: {
                            position: 'bottom',
                        },
                    },
                },
            });

            // Line chart for field goal percentage over time (already there, but ensuring it uses current data)
            fgLineChartRef.current = new Chart(fgLineCtx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Field Goal Percentage',
                            data: fgPercentageData,
                            borderColor: '#547AA5',
                            backgroundColor: 'rgba(84, 122, 165, 0.2)',
                            fill: true,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Field Goal Percentage Over Time',
                        },
                        legend: {
                            position: 'bottom',
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Percentage',
                            },
                            beginAtZero: true,
                            max: 100,
                        },
                    },
                },
            });
        }

        return () => {
            // Cleanup function to destroy charts when component unmounts
            if (shotChartRef.current) shotChartRef.current.destroy();
            if (fgChartRef.current) fgChartRef.current.destroy();
            if (fgLineChartRef.current) fgLineChartRef.current.destroy();
        };
    }, [sessions, userStats]); // Depend on sessions and userStats to re-render charts

    if (loading) {
        return <div className="profile-loading">Loading profile...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className="profile-container">
                {userStats && (
                    <>
                        <div className="rating-badge">
                            <span>{userStats.fgPercentage}%</span>
                            <span className="star">★</span>
                        </div>
                        <h2>User Profile</h2>
                        <div className="stats">
                            <p><strong>Overall Field Goal Percentage:</strong> {userStats.fgPercentage}%</p>
                            <p><strong>Total Makes:</strong> {userStats.totalMakes}</p>
                            <p><strong>Total Misses:</strong> {userStats.totalMisses}</p>
                            <p><strong>Overall Longest Streak:</strong> {userStats.overallLongestStreak} consecutive makes</p>
                            <p className="progress-summary"><em>{userStats.progressSummary}</em></p>
                        </div>
                    </>
                )}
                {!userStats && sessions.length === 0 && (
                    <p className="no-data-message">No stats available. Please analyze videos to see your progress!</p>
                )}

                {sessions.length > 0 && (
                    <div className="charts-container">
                        <canvas id="shot-scores-bar-chart"></canvas>
                        <canvas id="fg-percentage-pie-chart"></canvas>
                        <canvas id="fg-percentage-line-chart"></canvas>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;