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
import useEntitlements from "../hooks/useEntitlements.js";
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
    const { status, result: contextResult, uploadProgress, error: analysisError } = useAnalysis();
    const { hasFeature, usage } = useEntitlements();
    const currentUser = getCurrentUser();
    
    // Feature flags
    const canSeeAngles = hasFeature('shot_angles');
    const canSeeIntelligence = hasFeature('fg_progression');
    const canSeeSessionFG = hasFeature('session_fg');

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            
            // 1. Priority: Load from Context if it just finished
            if (contextResult) {
                setData(contextResult);
                setLoading(false);
                return;
            }

            // 2. Fallback: Load from Storage
            const storedData = sessionStorage.getItem("analysisResults");
            if (storedData) {
                try {
                    setData(JSON.parse(storedData));
                } catch (err) {
                    console.error("Error parsing stored results:", err);
                }
            }

            // 3. Fetch Session History for Intelligence Sidebar
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

            // 4. Load Settings
            const storedShowAngle = localStorage.getItem('nbn_settings_showAngle');
            if (storedShowAngle !== null) {
                setShowAngle(JSON.parse(storedShowAngle));
            }

            setLoading(false);
        };

        loadInitialData();
    }, [status, currentUser?.userId, contextResult]);

    // --- Intelligence Calculations ---
    const intelligence = useMemo(() => {
        if (!data || history.length === 0) return null;

        // 1. All-time averages (for long-term context)
        // Filter out current session from history if it has an _id
        const relevantHistory = history.filter(h => h._id !== data._id);
        if (relevantHistory.length === 0) return null;

        const historyFGs = relevantHistory.map(h => h.fg_percentage || 0);
        const avgFG = historyFGs.reduce((acc, val) => acc + val, 0) / historyFGs.length;
        
        // 2. Best of Last 5 Sessions (The "Benchmark")
        const lastFive = relevantHistory.slice(0, 5);
        const lastFiveBestFG = Math.max(...lastFive.map(h => h.fg_percentage || 0));
        const lastFiveAvgFG = lastFive.reduce((acc, h) => acc + (h.fg_percentage || 0), 0) / lastFive.length;
        
        return {
            fgDiffAvg: data.fg_percentage - avgFG,
            fgDiffLast5: data.fg_percentage - lastFiveAvgFG,
            isNewBest: data.fg_percentage > Math.max(...historyFGs),
            isStreakBest: (data.longest_streak || data.longestStreak || 0) >= Math.max(...relevantHistory.map(h => h.longestStreak || h.longest_streak || 0)),
            lastFiveBestFG,
            prevSession: relevantHistory[0]
        };
    }, [data, history]);

    // --- Chart Data Preparation ---
    const { chartData, points } = useMemo(() => {
        if (!data?.shot_angles) return { chartData: null, points: [] };
        
        const filteredPoints = data.shot_angles.map((angle, i) => ({
            angle,
            result: data.shots_results[i],
            id: i + 1
        })).filter(p => p.angle >= 30 && p.angle <= 60);

        if (filteredPoints.length === 0) return { chartData: null, points: [] };

        return {
            points: filteredPoints,
            chartData: {
                labels: filteredPoints.map(p => `S${p.id}`), // Shortened labels for better mobile fit
                datasets: [
                    {
                        label: 'Launch Angle',
                        data: filteredPoints.map(p => p.angle),
                        borderColor: 'rgba(214, 75, 23, 0.9)',
                        backgroundColor: 'rgba(214, 75, 23, 0.05)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: 'start',
                        pointBackgroundColor: filteredPoints.map(p => p.result === 1 ? '#4ade80' : '#f87171'),
                        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                    }
                ]
            }
        };
    }, [data]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 15, 25, 0.95)',
                titleColor: 'rgba(255, 255, 255, 0.5)',
                bodyColor: '#fff',
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => {
                        const angle = context.parsed.y;
                        const result = points[context.dataIndex]?.result === 1 ? 'MAKE' : 'MISS';
                        return [`Angle: ${angle.toFixed(1)}°`, `Result: ${result}`];
                    }
                }
            }
        },
        scales: {
            y: {
                min: 30,
                max: 60,
                grid: { 
                    color: (context) => {
                        if (context.tick.value >= 45 && context.tick.value <= 55) {
                            return 'rgba(214, 75, 23, 0.15)';
                        }
                        return 'rgba(255, 255, 255, 0.03)';
                    }
                },
                ticks: { 
                    color: 'rgba(255, 255, 255, 0.3)',
                    stepSize: 10,
                    font: { size: 10 }
                }
            },
            x: {
                grid: { display: false },
                ticks: { 
                    color: 'rgba(255, 255, 255, 0.3)',
                    maxRotation: 0,
                    font: { size: 9 },
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            }
        }
    };

    if (status === 'processing' || status === 'uploading') {
        const progressMessage = status === 'uploading' 
            ? `Uploading Content: ${uploadProgress}%` 
            : "Analyzing Performance: Extracting biomechanics and shot data...";
            
        return (
            <div className="analytics-studio">
                <Navbar />
                <Loading message={progressMessage} />
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="analytics-studio">
                <Navbar />
                <div className="hero-placeholder glass" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="placeholder-icon" style={{ color: '#f87171' }}>⚠️</div>
                    <h2>Analysis Unavailable</h2>
                    <p>{analysisError || "We encountered an issue processing your video. Please try again with a different clip."}</p>
                    <Link to="/dashboard" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                        Return to Dashboard
                    </Link>
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
                            className={`bento-card glass consistency-card ${!canSeeAngles ? 'locked-feature' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {!canSeeAngles && (
                                <div className="lock-overlay-center">
                                    <Crown size={32} className="accent-text" />
                                    <h3>Arc Analysis (Pro)</h3>
                                    <p>Upgrade to Pro to track your launch angles and arc consistency.</p>
                                    <Link to="/profile?tab=pricing" className="btn-primary btn-sm">Upgrade</Link>
                                </div>
                            )}
                            <div className="card-header" style={{ opacity: canSeeAngles ? 1 : 0.3 }}>
                                <TrendingUp size={18} className="accent-text" />
                                <h3>Arc Consistency</h3>
                            </div>
                            <div className="chart-wrapper" style={{ opacity: canSeeAngles ? 1 : 0.1, filter: canSeeAngles ? 'none' : 'blur(4px)' }}>
                                {chartData && <Line data={chartData} options={chartOptions} />}
                            </div>
                        </motion.div>

                        {/* 3. Small Stats */}
                        <motion.div 
                            className="bento-card glass s-makes stat-small"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="card-icon"><Target size={20} /></div>
                            <div className="small-label">Total Makes</div>
                            <div className="small-value">{data?.makes}</div>
                        </motion.div>

                        <motion.div 
                            className="bento-card glass s-streak stat-small streak-highlight"
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
                            <motion.div 
                                className="timeline-bubbles"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05
                                        }
                                    }
                                }}
                            >
                                {data?.shots_results.map((shot, i) => (
                                    <motion.div 
                                        key={i} 
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.5, y: 10 },
                                            visible: { opacity: 1, scale: 1, y: 0 }
                                        }}
                                        className={`shot-bubble ${shot === 1 ? 'make' : 'miss'} ${i === data.shots_results.length - 1 ? 'last-shot' : ''}`}
                                    >
                                        {i + 1}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="stage-actions">
                        <Link to="/" className="btn-secondary">New Session</Link>
                        <Link to="/profile" className="btn-primary">Back to Profile</Link>
                    </div>
                </main>

                {/* --- Right Column: Intelligence Sidebar --- */}
                <aside className="intelligence-sidebar">
                    <section className={`intelligence-block glass ${!canSeeIntelligence ? 'locked-feature' : ''}`} style={{ position: 'relative' }}>
                        {!canSeeIntelligence && (
                            <div className="lock-overlay-center">
                                <Activity size={24} className="accent-text" />
                                <h4 style={{ margin: '10px 0' }}>Intelligence (Pro)</h4>
                                <p style={{ fontSize: '0.8rem', padding: '0 10px' }}>Historical progression benchmarks require a Pro account.</p>
                            </div>
                        )}
                        <div className="block-header" style={{ opacity: canSeeIntelligence ? 1 : 0.3 }}>
                            <Activity size={18} className="accent-text" />
                            <h3>Training Intelligence</h3>
                        </div>
                        
                        <div style={{ opacity: canSeeIntelligence ? 1 : 0.1, filter: canSeeIntelligence ? 'none' : 'blur(4px)' }}>
                            {!intelligence ? (
                                <div className="empty-intelligence">
                                    <AlertCircle size={32} />
                                    <p>Keep shooting to unlock improvement metrics!</p>
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
                        </div>
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