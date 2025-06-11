import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { isLoggedIn, getCurrentUser } from '../js/auth.js';
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
                    return;
                }

                const response = await fetch(`http://localhost:3000/api/sessions/${userId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch sessions: ${response.statusText}`);
                }

                const sessionData = await response.json();
                if (!Array.isArray(sessionData) || sessionData.length === 0) {
                    throw new Error('No session data available or invalid format.');
                }

                const totalMakes = sessionData.reduce((sum, session) => sum + session.makes, 0);
                const totalMisses = sessionData.reduce((sum, session) => sum + session.misses, 0);
                const totalShots = totalMakes + totalMisses;
                const fgPercentage = totalShots > 0 ? (totalMakes / totalShots) * 100 : 0;

                setUserStats({
                    totalMakes,
                    totalMisses,
                    fgPercentage: fgPercentage.toFixed(2),
                });
                setSessions(sessionData);
            } catch (error) {
                console.error('Error fetching user data:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (sessions.length > 0) {
            const labels = sessions.map(session => new Date(session.sessionDate).toLocaleDateString());
            const makesData = sessions.map(session => session.makes);
            const missesData = sessions.map(session => session.misses);
            const fgPercentageData = sessions.map(session => session.fg_percentage || 0);

            const shotCanvas = document.getElementById('shot-scores-bar-chart');
            const fgCanvas = document.getElementById('fg-percentage-pie-chart');
            const fgLineCanvas = document.getElementById('fg-percentage-line-chart');

            if (!shotCanvas || !fgCanvas || !fgLineCanvas) {
                console.error('Canvas elements not found.');
                return;
            }

            const shotCtx = shotCanvas.getContext('2d');
            const fgCtx = fgCanvas.getContext('2d');
            const fgLineCtx = fgLineCanvas.getContext('2d');

            if (shotChartRef.current) {
                shotChartRef.current.destroy();
            }
            if (fgChartRef.current) {
                fgChartRef.current.destroy();
            }
            if (fgLineChartRef.current) {
                fgLineChartRef.current.destroy();
            }

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
                            text: 'Shot Scores (Makes vs Misses)',
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

            // Pie chart for field goal percentage
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
                            text: 'Field Goal Percentage',
                        },
                        legend: {
                            position: 'bottom',
                        },
                    },
                },
            });

            // Line chart for field goal percentage over time
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
            if (shotChartRef.current) {
                shotChartRef.current.destroy();
            }
            if (fgChartRef.current) {
                fgChartRef.current.destroy();
            }
            if (fgLineChartRef.current) {
                fgLineChartRef.current.destroy();
            }
        };
    }, [sessions, userStats]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className="profile-container">
                <div className="rating-badge">
                    <span>{userStats?.fgPercentage}%</span>
                    <span className="star">★</span>
                </div>
                <h2>User Profile</h2>
                {userStats ? (
                    <div className="stats">
                        <p><strong>Total Field Goal Percentage:</strong> {userStats.fgPercentage}%</p>
                        <p><strong>Total Makes:</strong> {userStats.totalMakes}</p>
                        <p><strong>Total Misses:</strong> {userStats.totalMisses}</p>
                    </div>
                ) : (
                    <p>No stats available.</p>
                )}
                <div className="charts-container">
                    <canvas id="shot-scores-bar-chart"></canvas>
                    <canvas id="fg-percentage-pie-chart"></canvas>
                    <canvas id="fg-percentage-line-chart"></canvas>
                </div>
            </div>
        </div>
    );
};

export default Profile;