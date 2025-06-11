import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Navbar from '../components/Navbar.jsx';
import Loading from '../components/Loading.jsx';
import { getCurrentUser } from '../js/auth.js';
import './../css/ProfilePage.css';

// Register Chart.js components we will use
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

// --- ICONS (Placeholder SVGs) ---
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm0-12a3,3,0,1,1-3,3A3,3,0,0,1,12,8Zm0,10a6,6,0,0,1-4.22-1.77,7.83,7.83,0,0,1,8.44,0A6,6,0,0,1,12,18Z"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;


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
                <label>Username</label>
                {isEditing ? (
                    <input type="text" name="username" value={formData.username} onChange={handleChange} className="profile-input" />
                ) : (
                    <span>{user.username}</span>
                )}

                <label>Email Address</label>
                {isEditing ? (
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="profile-input" />
                ) : (
                    <span>{user.email}</span>
                )}

                <label>Date Joined</label>
                <span>{new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
                <label htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" name="currentPassword" className="profile-input" placeholder="••••••••" />

                <label htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" name="newPassword" className="profile-input" />

                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input type="password" id="confirmNewPassword" name="confirmNewPassword" className="profile-input" />

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
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalyses = async () => {
            try {
                const response = await fetch('/api/analyses');
                if (!response.ok) throw new Error('Failed to fetch analyses.');
                const data = await response.json();
                setAnalyses(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyses();
    }, []);

    if (loading) {
        return <div className="stats-loading">Loading Statistics...</div>;
    }

    if (analyses.length === 0) {
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

    // Process data for charts and aggregate stats
    const totalShots = analyses.reduce((sum, a) => sum + a.totalShots, 0);
    const totalMade = analyses.reduce((sum, a) => sum + a.madeShots, 0);
    const careerFgPct = totalShots > 0 ? ((totalMade / totalShots) * 100).toFixed(1) : 0;
    const bestSessionPct = Math.max(0, ...analyses.map(a => a.fgPercentage));

    // Chart data and options
    const lineChartData = {
        labels: analyses.map(a => new Date(a.date).toLocaleDateString()).reverse(),
        datasets: [{
            label: 'Shooting % Per Session',
            data: analyses.map(a => a.fgPercentage).reverse(),
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
            backgroundColor: ['#4ade80', '#ef4444'], // Professional green and red
            borderColor: '#1e1e2f',
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
            }
        },
        scales: {
            x: { ticks: { color: '#b0b0b0' }, grid: { color: 'rgba(176, 176, 176, 0.1)' } },
            y: { ticks: { color: '#b0b0b0', callback: value => `${value}%` }, grid: { color: 'rgba(176, 176, 176, 0.1)' } }
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
                    <h4>Best Session</h4>
                    <p>{bestSessionPct.toFixed(1)}<span>%</span></p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-container line-chart">
                    <h4>Performance Over Time</h4>
                    <Line options={lineChartOptions} data={lineChartData} />
                </div>
                <div className="chart-container doughnut-chart">
                    <h4>Career Shot Summary</h4>
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
                const userData = await getCurrentUser();
                if (userData) {
                    setUser(userData);
                } else {
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error("Failed to fetch user data, redirecting.", error);
                window.location.href = '/login';
            } finally {
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
            <div className="profile-container">
                <header className="profile-header">
                    <div className="avatar">
                        <span className="avatar-initial">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="user-info">
                        <h2>{user.username}</h2>
                        <p>{user.email}</p>
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