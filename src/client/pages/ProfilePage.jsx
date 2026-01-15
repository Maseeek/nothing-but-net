import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Navbar from '../components/Navbar.jsx';
import Loading from '../components/Loading.jsx';
import { getCurrentUser } from '../js/auth.js'; // Import getCurrentUser
import { API_BASE_URL } from '../config.js';
import './../css/ProfilePage.css';

// Register Chart.js components we will use
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- ICONS (Placeholder SVGs) ---
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm0-12a3,3,0,1,1-3,3A3,3,0,0,1,12,8Zm0,10a6,6,0,0,1-4.22-1.77,7.83,7.83,0,0,1,8.44,0A6,6,0,0,1,12,18Z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;

const VerificationStatusIcon = ({ isVerified }) => {
    if (isVerified) {
        return null;
    }

    // This function now calls your backend API
    const handleVerifyClick = async () => {
        try {
            // Get the authentication token from local storage
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('You must be logged in to do that.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/send-verification-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include the token for authentication
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                // Throw an error if the server response was not successful
                throw new Error(data.error || 'Failed to send verification email.');
            }

            // Let the user know it was successful
            alert('A new verification email has been sent to your address!');

        } catch (err) {
            console.error("Verification error:", err);
            alert(err.message);
        }
    };

    // The rest of the component's JSX remains the same
    return (
        <div className="verification-tooltip">
            <svg className="verification-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div className="tooltip-text">
                <span>Your email is not verified. Check your inbox for a link.</span>
                <button className="verify-now-btn" onClick={handleVerifyClick}>
                    Resend Email
                </button>
            </div>
        </div>
    );
};


// --- SUB-COMPONENT: Profile Details Tab ---
const ProfileDetails = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: user.username, email: user.email });

    const handleEdit = () => {
        if (isEditing) {
            // In a real app, you would call an API to save changes to the backend.
            console.log("Saving data:", formData);
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="profile-tab-content">
            <h3>Account Details</h3>
            <div className="details-grid">
                {isEditing ? (
                    <>
                        <div className="input-group full-width">
                            <span className="input-icon"><UserIcon /></span>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder=" "
                                className="profile-input"
                            />
                            <label htmlFor="username">Username</label>
                        </div>
                        <div className="input-group full-width">
                            <span className="input-icon"><MailIcon /></span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder=" "
                                className="profile-input"
                            />
                            <label htmlFor="email">Email Address</label>
                        </div>
                    </>
                ) : (
                    <>
                        <label>Username</label>
                        <span>{user.username}</span>
                        <label>Email Address <VerificationStatusIcon isVerified={user.verified} /> </label>
                        <span>{user.email}</span>
                    </>
                )}

            </div>
            <button className="profile-action-btn" onClick={handleEdit}>
                <EditIcon /> {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
        </div>
    );
};

// --- SUB-COMPONENT: Security Tab ---
const SecuritySettings = () => {
    // This component would have state and handlers for password change logic
    return (
        <div className="profile-tab-content">
            <h3>Password & Security</h3>
            <form className="security-form">
                <div className="input-group">
                    <span className="input-icon"><LockIcon /></span>
                    <input type="password" id="currentPassword" name="currentPassword" placeholder=" " />
                    <label htmlFor="currentPassword">Current Password</label>
                </div>

                <div className="input-group">
                    <span className="input-icon"><LockIcon /></span>
                    <input type="password" id="newPassword" name="newPassword" placeholder=" " />
                    <label htmlFor="newPassword">New Password</label>
                </div>

                <div className="input-group">
                    <span className="input-icon"><LockIcon /></span>
                    <input type="password" id="confirmNewPassword" name="confirmNewPassword" placeholder=" " />
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                </div>

                <button type="submit" className="profile-action-btn">Update Password</button>
            </form>
            <hr className="divider" />
            <div className="danger-zone">
                <h4>Danger Zone</h4>
                <p>Deleting your account is a permanent action and cannot be undone. All of your analyses and data will be lost.</p>
                <button className="profile-action-btn btn-danger">Delete My Account</button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: My Analyses Tab (with Stats and Charts) ---
const AnalysesHistory = () => {
    const [sessions, setSessions] = useState([]); // Renamed from analyses to sessions
    const [loading, setLoading] = useState(true);
    const [performanceSummary, setPerformanceSummary] = useState({
        overallLongestStreak: 0,
        progressSummary: "Analyze more videos to see your progress trend!"
    });

    useEffect(() => {
        const fetchSessions = async () => { // Renamed function
            try {
                const currentUser = getCurrentUser();
                const userId = currentUser?.userId;

                if (!userId) {
                    console.error('User ID is missing. Cannot fetch sessions.');
                    setLoading(false);
                    return;
                }

                // Fetch data from the sessions endpoint
                const response = await fetch(`${API_BASE_URL}/api/sessions/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include auth token
                    }
                });
                if (!response.ok) {
                    // Check if response is 404 (No sessions found), handle gracefully
                    if (response.status === 404) {
                        console.log('No sessions found for this user yet.');
                        setSessions([]); // Set to empty array
                        setLoading(false);
                        return;
                    }
                    throw new Error('Failed to fetch sessions.');
                }
                const data = await response.json();

                // Sort sessions by date to ensure correct chronological order for progress
                const sortedSessions = data.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
                setSessions(sortedSessions);

                // Calculate overall longest streak
                const overallLongestStreak = sortedSessions.reduce((maxStreak, session) =>
                    Math.max(maxStreak, session.longestStreak || 0), 0 // Use longestStreak (camelCase from schema)
                );

                // Determine textual progress summary
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
        fetchSessions(); // Call the renamed function
    }, []); // Only run once on component mount

    if (loading) {
        return <div className="stats-loading">Loading Statistics...</div>;
    }

    if (sessions.length === 0) { // Check sessions length
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

    // Process data for charts and aggregate stats from sessions
    const totalShots = sessions.reduce((sum, s) => sum + (s.total_shots || 0), 0); // Use total_shots
    const totalMade = sessions.reduce((sum, s) => sum + (s.makes || 0), 0); // Use makes
    const careerFgPct = totalShots > 0 ? ((totalMade / totalShots) * 100).toFixed(1) : 0;
    const bestSessionPct = Math.max(0, ...sessions.map(s => s.fg_percentage || 0)); // Use fg_percentage

    // Chart data and options
    const lineChartData = {
        labels: sessions.map(s => new Date(s.sessionDate).toLocaleDateString()), // Use sessionDate
        datasets: [{
            label: 'Field Goal % Per Session',
            data: sessions.map(s => s.fg_percentage || 0), // Use fg_percentage
            borderColor: '#d64b17', // A distinct orange for the line chart
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
            backgroundColor: ['#4ade80', '#ef4444'], // Professional green and red
            borderColor: '#1e1e2f', // Dark background for border
            borderWidth: 4,
            hoverOffset: 4
        }]
    };

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
                max: 100, // Ensure Y-axis goes up to 100%
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
            {/* Key Stats Cards */}
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
                {/*<div className="stat-card">*/}
                {/*    <h4>Overall Longest Streak</h4>*/}
                {/*    <p>{performanceSummary.overallLongestStreak}</p>*/}
                {/*</div>*/}
            </div>

            {/* Progress Summary */}
            <div className="progress-summary-card">
                <p>{performanceSummary.progressSummary}</p>
            </div>

            {/* Charts Section */}
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


// --- MAIN PROFILE PAGE COMPONENT ---
const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analyses'); // Default to the new stats tab

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch fresh user data from the server
                const token = localStorage.getItem('authToken');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                // Check for session_id in URL (Stripe redirect)
                const urlParams = new URLSearchParams(window.location.search);
                const sessionId = urlParams.get('session_id');

                if (sessionId) {
                    console.log("Stripe redirect detected. Verifying payment...");
                    // Optional: You could show a specific loading state here
                }

                let attempts = 0;
                const maxAttempts = sessionId ? 5 : 1; // Poll if coming from Stripe
                const intervalTime = 2000; // 2 seconds

                const pollProfile = async () => {
                    attempts++;
                    const response = await fetch(`${API_BASE_URL}/api/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (!response.ok) {
                        if (response.status === 401) {
                            window.location.href = '/login';
                            return;
                        }
                        throw new Error('Failed to fetch profile');
                    }

                    const userData = await response.json();

                    // If we are looking for a PRO upgrade and it's not there yet, keep polling
                    if (sessionId && !userData.isPro && attempts < maxAttempts) {
                        console.log(`Polling for PRO status... Attempt ${attempts}`);
                        setTimeout(pollProfile, intervalTime);
                    } else {
                        setUser(userData);
                        setLoading(false);
                        // Clean up URL if successful
                        if (sessionId && userData.isPro) {
                            // window.history.replaceState({}, document.title, window.location.pathname);
                            // alert("Payment successful! You are now a PRO member.");
                        }
                    }
                };

                await pollProfile();

            } catch (error) {
                console.error("Failed to fetch user data, redirecting.", error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <p>Redirecting to login...</p>;
    }

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container glass">
                <div className="gradient-bar" style={{
                    width: '60px',
                    height: '6px',
                    background: 'linear-gradient(145deg, var(--accent-color), #c14c1f)',
                    borderRadius: '3px',
                    margin: '0 auto 20px auto',
                    boxShadow: '0 0 10px rgba(214, 75, 23, 0.5)'
                }}></div>
                <header className="profile-header">
                    <div className="avatar">
                        <span className="avatar-initial">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="user-info">
                        <h2>
                            {user.username}
                            {user.isPro && <span className="pro-badge">PRO</span>}
                        </h2>
                        <p>{user.email}</p>
                        {!user.isPro && (
                            <button className="upgrade-btn" onClick={async () => {
                                try {
                                    const token = localStorage.getItem('authToken');
                                    const res = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        }
                                    });
                                    const data = await res.json();
                                    if (data.url) {
                                        window.location.href = data.url;
                                    } else {
                                        alert('Failed to start checkout');
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert('Error starting checkout');
                                }
                            }}>
                                Upgrade to PRO
                            </button>
                        )}
                    </div>
                </header>

                <nav className="profile-nav">
                    <button onClick={() => setActiveTab('analyses')} className={activeTab === 'analyses' ? 'active' : ''}>Dashboard</button>
                    <button onClick={() => setActiveTab('details')} className={activeTab === 'details' ? 'active' : ''}>Profile Details</button>
                    <button onClick={() => setActiveTab('security')} className={activeTab === 'security' ? 'active' : ''}>Security</button>
                </nav>

                <main className="profile-content">
                    {activeTab === 'details' && <ProfileDetails user={user} />}
                    {activeTab === 'security' && <SecuritySettings />}
                    {activeTab === 'analyses' && <AnalysesHistory />}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;