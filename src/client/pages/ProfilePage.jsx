import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Loading from '../components/Loading.jsx';
import ProfileDetails from '../components/profile/ProfileDetails.jsx';
import SecuritySettings from '../components/profile/SecuritySettings.jsx';
import AnalysesHistory from '../components/profile/AnalysesHistory.jsx';
import { API_BASE_URL } from '../config.js';
import './../css/ProfilePage.css';

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
                localStorage.removeItem('authToken'); // Clear invalid token
                window.location.href = '/login';
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
                <div className="gradient-bar-std"></div>
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