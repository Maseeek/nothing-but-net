import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { getCurrentUser } from '../../js/auth.js';
import { API_BASE_URL } from '../../config.js';
import Loading from '../Loading.jsx';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const AnalysesHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [performanceSummary, setPerformanceSummary] = useState({
        overallLongestStreak: 0,
        progressSummary: "Analyze more videos to see your progress trend!"
    });

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const currentUser = getCurrentUser();
                const userId = currentUser?.userId;

                if (!userId) {
                    console.error('User ID is missing. Cannot fetch sessions.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/api/sessions/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                if (!response.ok) {
                    if (response.status === 404) {
                        setSessions([]);
                        setLoading(false);
                        return;
                    }
                    throw new Error('Failed to fetch sessions.');
                }
                const data = await response.json();

                const sortedSessions = data.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
                setSessions(sortedSessions);

                const overallLongestStreak = sortedSessions.reduce((maxStreak, session) =>
                    Math.max(maxStreak, session.longestStreak || 0), 0
                );

                let progressSummary = "Analyze more videos to see your progress trend!";
                if (sortedSessions.length >= 2) {
                    const firstSessionFg = sortedSessions[0].fg_percentage || 0;
                    const lastSessionFg = sortedSessions[sortedSessions.length - 1].fg_percentage || 0;
                    if (lastSessionFg > firstSessionFg) {
                        progressSummary = `Great progress! Your FG% has improved from ${firstSessionFg.toFixed(1)}% to ${lastSessionFg.toFixed(1)}%.`;
                    } else if (lastSessionFg < firstSessionFg) {
                        progressSummary = `Your FG% went from ${firstSessionFg.toFixed(1)}% to ${lastSessionFg.toFixed(1)}%. Keep practicing!`;
                    } else {
                        progressSummary = `Your FG% has remained consistent at ${firstSessionFg.toFixed(1)}%.`;
                    }
                }
                setPerformanceSummary({ overallLongestStreak, progressSummary });

            } catch (error) {
                console.error("Error fetching sessions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const { totalShots, totalMade, careerFgPct, bestSessionPct, lineChartData, doughnutChartData } = React.useMemo(() => {
        // Safe guard if sessions is undefined or empty
        const safeSessions = sessions || [];

        const totalShots = safeSessions.reduce((sum, s) => sum + (s.total_shots || 0), 0);
        const totalMade = safeSessions.reduce((sum, s) => sum + (s.makes || 0), 0);
        const careerFgPct = totalShots > 0 ? ((totalMade / totalShots) * 100).toFixed(1) : 0;
        const bestSessionPct = Math.max(0, ...safeSessions.map(s => s.fg_percentage || 0));

        const lineChartData = {
            labels: safeSessions.map(s => new Date(s.sessionDate).toLocaleDateString()),
            datasets: [{
                label: 'Field Goal % Per Session',
                data: safeSessions.map(s => s.fg_percentage || 0),
                borderColor: '#d64b17',
                backgroundColor: 'rgba(214, 75, 23, 0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#d64b17',
                pointBorderColor: '#fff',
                pointHoverRadius: 7,
                pointRadius: 5,
            }]
        };

        const doughnutChartData = {
            labels: ['Made', 'Missed'],
            datasets: [{
                data: [totalMade, totalShots - totalMade],
                backgroundColor: ['#4ade80', '#ef4444'],
                borderColor: '#1e1e2f',
                borderWidth: 4,
                hoverOffset: 4
            }]
        };

        return { totalShots, totalMade, careerFgPct, bestSessionPct, lineChartData, doughnutChartData };
    }, [sessions]);

    if (loading) {
        return <Loading />;
    }

    if (sessions.length === 0) {
        return (
            <div className="profile-tab-content">
                <h3>My Analyses</h3>
                <div className="history-placeholder">
                    <p>You haven't analyzed any sessions yet.</p>
                    <span>Upload a video on the home page to get started!</span>
                </div>
            </div>
        );
    }

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 4,
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.raw}%`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#b0b0b0' },
                grid: { color: 'rgba(176, 176, 176, 0.1)' }
            },
            y: {
                ticks: { color: '#b0b0b0', callback: value => `${value}%` },
                grid: { color: 'rgba(176, 176, 176, 0.1)' },
                beginAtZero: true,
                max: 100,
            }
        }
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#f0f0f0', font: { size: 14 } } },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 4,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw;
                        const percentage = ((value / (totalShots || 1)) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '60%',
    };

    return (
        <div className="profile-tab-content">
            <h3>Performance Dashboard</h3>
            <div className="stats-grid">
                <div className="stat-card">
                    <h4>Career FG%</h4>
                    <p>{careerFgPct}<span>%</span></p>
                </div>
                <div className="stat-card">
                    <h4>Total Shots</h4>
                    <p>{totalShots}</p>
                </div>
                <div className="stat-card">
                    <h4>Best Session FG%</h4>
                    <p>{bestSessionPct.toFixed(1)}<span>%</span></p>
                </div>
            </div>

            <div className="progress-summary-card">
                <p>{performanceSummary.progressSummary}</p>
            </div>

            <div className="charts-grid">
                <div className="chart-container line-chart">
                    <h4>FG% Performance Over Time</h4>
                    <Line options={lineChartOptions} data={lineChartData} />
                </div>
                <div className="chart-container doughnut-chart">
                    <h4>Career Shot Distribution</h4>
                    <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                </div>
            </div>
        </div>
    );
};

export default AnalysesHistory;
