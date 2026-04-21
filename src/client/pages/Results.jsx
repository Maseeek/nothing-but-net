import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    TrendingUp, 
    Target, 
    Zap, 
    ChevronRight, 
    History, 
    Crown, 
    ArrowUpRight, 
    ArrowDownRight,
    Trophy,
    Activity,
    Settings as SettingsIcon,
    AlertCircle
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Loading from "../components/Loading.jsx";
import { useAnalysis } from "../context/AnalysisContext.jsx";
import { getCurrentUser } from "../js/auth.js";
import { API_BASE_URL } from "../config.js";
import "./../css/Results.css";

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function Results() {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAngle, setShowAngle] = useState(true);
    const { status } = useAnalysis();
    const currentUser = getCurrentUser();

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            
            // 1. Load Current Analysis from Storage
            const storedData = sessionStorage.getItem("analysisResults");
            if (storedData) {
                try {
                    setData(JSON.parse(storedData));
                } catch (err) {
                    console.error("Error parsing stored results:", err);
                }
            }

            // 2. Fetch Session History for Intelligence Sidebar
            if (currentUser?.userId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/sessions/${currentUser.userId}`);
                    if (response.ok) {
                        const historyData = await response.json();
                        setHistory(historyData);
                    }
                } catch (err) {
                    console.error("Error fetching history:", err);
                }
            }

            // 3. Load Settings
            const storedShowAngle = localStorage.getItem('nbn_settings_showAngle');
            if (storedShowAngle !== null) {
                setShowAngle(JSON.parse(storedShowAngle));
            }

            setLoading(false);
        };

        loadInitialData();
    }, [status, currentUser?.userId]);

    // --- Intelligence Calculations ---
    const intelligence = useMemo(() => {
        if (!data || history.length === 0) return null;

        // 1. All-time averages (for long-term context)
        const relevantHistory = history.filter(h => h._id !== data._id);
        if (relevantHistory.length === 0) return null;

        const avgFG = relevantHistory.reduce((acc, h) => acc + (h.fg_percentage || 0), 0) / relevantHistory.length;
        
        // 2. Best of Last 5 Sessions (The "Benchmark")
        const lastFive = relevantHistory.slice(0, 5);
        const lastFiveBestFG = Math.max(...lastFive.map(h => h.fg_percentage || 0));
        const lastFiveAvgFG = lastFive.reduce((acc, h) => acc + (h.fg_percentage || 0), 0) / lastFive.length;
        
        return {
            fgDiffAvg: data.fg_percentage - avgFG,
            fgDiffLast5: data.fg_percentage - lastFiveAvgFG,
            isNewBest: data.fg_percentage > Math.max(...relevantHistory.map(h => h.fg_percentage || 0)),
            isStreakBest: data.longest_streak >= Math.max(...relevantHistory.map(h => h.longest_streak || 0)),
            lastFiveBestFG,
            prevSession: relevantHistory[0]
        };
    }, [data, history]);

    // --- Chart Data Preparation ---
    const chartData = useMemo(() => {
        if (!data?.shot_angles) return null;
        
        return {
            labels: data.shot_angles.map((_, i) => `Shot ${i + 1}`),
            datasets: [
                {
                    label: 'Launch Angle',
                    data: data.shot_angles,
                    borderColor: 'rgba(214, 75, 23, 0.8)',
                    backgroundColor: 'rgba(214, 75, 23, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: data.shots_results.map(r => r === 1 ? '#4ade80' : '#f87171'),
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                }
            ]
        };
    }, [data]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 10,
                displayColors: false
            }
        },
        scales: {
            y: {
                min: 30,
                max: 70,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.4)' }
            },
            x: {
                grid: { display: false },
                ticks: { display: false }
            }
        }
    };

    if (status === 'processing' || status === 'uploading') {
        return (
            <div className="analytics-studio">
                <Navbar />
                <div className="center-placeholder">
                    <Loading />
                    <h2 style={{ marginTop: '20px' }}>Analyzing Performance...</h2>
                    <p>Extracting biomechanics and shot data.</p>
                </div>
            </div>
        );
    }

    if (!data && !loading) {
        return (
            <div className="analytics-studio">
                <Navbar />
                <div className="center-placeholder">
                    <div className="placeholder-icon">🏀</div>
                    <h2>The Lab is Waiting</h2>
                    <p>Upload a session to see your performance intelligence.</p>
                    <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>
                        Start Analysis
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-studio">
            <Navbar />
            
            <div className="studio-content-wrapper">
                {/* --- Left Column: Performance Stage --- */}
                <main className="performance-stage">
                    <header className="stage-header">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="header-pill"
                        >
                            <Zap size={14} className="accent-text" /> 
                            <span>Session Analysis Complete</span>
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Performance Intelligence
                        </motion.h1>
                    </header>

                    <div className="bento-layout">
                        {/* 1. Hero Gauge */}
                        <motion.div 
                            className="bento-card glass hero-gauge"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="gauge-content">
                                <div className="metric-label">Efficiency</div>
                                <div className="metric-value">{data?.fg_percentage}<span>%</span></div>
                                <div className="metric-subtext">Field Goal Percentage</div>
                            </div>
                            <div className="gauge-visual">
                                <svg viewBox="0 0 100 50">
                                    <path 
                                        d="M 10 45 A 35 35 0 0 1 90 45" 
                                        fill="none" 
                                        stroke="rgba(255,255,255,0.05)" 
                                        strokeWidth="8" 
                                        strokeLinecap="round"
                                    />
                                    <motion.path 
                                        d="M 10 45 A 35 35 0 0 1 90 45" 
                                        fill="none" 
                                        stroke="var(--accent-color)" 
                                        strokeWidth="8" 
                                        strokeLinecap="round"
                                        strokeDasharray="125.6"
                                        initial={{ strokeDashoffset: 125.6 }}
                                        animate={{ strokeDashoffset: 125.6 * (1 - (data?.fg_percentage || 0) / 100) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </svg>
                            </div>
                        </motion.div>

                        {/* 2. Consistency Chart */}
                        <motion.div 
                            className="bento-card glass consistency-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="card-header">
                                <TrendingUp size={18} className="accent-text" />
                                <h3>Arc Consistency</h3>
                            </div>
                            <div className="chart-wrapper">
                                {chartData && <Line data={chartData} options={chartOptions} />}
                            </div>
                        </motion.div>

                        {/* 3. Small Stats */}
                        <motion.div 
                            className="bento-card glass stat-small"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="card-icon"><Target size={20} /></div>
                            <div className="small-label">Total Makes</div>
                            <div className="small-value">{data?.makes}</div>
                        </motion.div>

                        <motion.div 
                            className="bento-card glass stat-small streak-highlight"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="card-icon"><Crown size={20} className="accent-text" /></div>
                            <div className="small-label">Max Streak</div>
                            <div className="small-value accent-text">{data?.longest_streak}</div>
                        </motion.div>

                        {/* 4. Shot timeline */}
                        <motion.div 
                            className="bento-card glass timeline-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="card-header">
                                <History size={18} />
                                <h3>Shot Sequence</h3>
                            </div>
                            <div className="timeline-bubbles">
                                {data?.shots_results.map((shot, i) => (
                                    <div key={i} className={`shot-bubble ${shot === 1 ? 'make' : 'miss'}`}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="stage-actions">
                        <Link to="/" className="btn-secondary">New Session</Link>
                        <Link to="/profile" className="btn-primary">Back to Profile</Link>
                    </div>
                </main>

                {/* --- Right Column: Intelligence Sidebar --- */}
                <aside className="intelligence-sidebar">
                    <section className="intelligence-block glass">
                        <div className="block-header">
                            <Activity size={18} className="accent-text" />
                            <h3>Training Intelligence</h3>
                        </div>
                        
                        {!intelligence ? (
                            <div className="empty-intelligence">
                                <AlertCircle size={32} />
                                <p>First session detected. Keep shooting to unlock improvement metrics!</p>
                            </div>
                        ) : (
                            <div className="intelligence-metrics">
                                <div className="intelligence-item">
                                    <div className="item-info">
                                        <label>Efficiency Progress</label>
                                        <div className="item-comparison">vs Last 5 Sessions</div>
                                    </div>
                                    <div className={`item-delta ${intelligence.fgDiffLast5 >= 0 ? 'up' : 'down'}`}>
                                        {intelligence.fgDiffLast5 >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {Math.abs(intelligence.fgDiffLast5).toFixed(1)}%
                                    </div>
                                </div>

                                <div className="intelligence-item">
                                    <div className="item-info">
                                        <label>Benchmark Comparison</label>
                                        <div className="item-comparison">vs Last 5 Peak ({intelligence.lastFiveBestFG}%)</div>
                                    </div>
                                    <div className={`item-delta ${data.fg_percentage >= intelligence.lastFiveBestFG ? 'up' : 'down'}`}>
                                        {data.fg_percentage >= intelligence.lastFiveBestFG ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {(data.fg_percentage - intelligence.lastFiveBestFG).toFixed(1)}%
                                    </div>
                                </div>

                                {(intelligence.isNewBest || intelligence.isStreakBest) && (
                                    <div className="achievement-badge glass">
                                        <Trophy size={20} className="accent-text" />
                                        <div>
                                            {intelligence.isNewBest ? (
                                                <>
                                                    <strong>New All-Time Record!</strong>
                                                    <span>Highest Shot Efficiency achieved.</span>
                                                </>
                                            ) : (
                                                <>
                                                    <strong>Hot Streak!</strong>
                                                    <span>Longest streak record broken.</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    <section className="recent-history glass">
                        <div className="block-header">
                            <History size={18} />
                            <h3>Last Sessions</h3>
                        </div>
                        <div className="history-list">
                            {history.slice(0, 3).map((session, i) => (
                                <div key={i} className="history-item">
                                    <div className="history-date">
                                        {new Date(session.sessionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="history-stat">
                                        {session.fg_percentage}% FG
                                    </div>
                                    <ChevronRight size={14} className="history-arrow" />
                                </div>
                            ))}
                            {history.length === 0 && <p className="empty-text">No history yet.</p>}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default Results;