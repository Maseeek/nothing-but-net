import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import Loading from '../components/Loading.jsx';
import ProfileDetails from '../components/profile/ProfileDetails.jsx';
import SecuritySettings from '../components/profile/SecuritySettings.jsx';
import AnalysesHistory from '../components/profile/AnalysesHistory.jsx';
import MagicButton from '../components/MagicButton.jsx';
import Pricing from '../components/Pricing.jsx';
import { API_BASE_URL } from '../config.js';
import './../css/ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
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



                const res = await axios.get(`${API_BASE_URL}/api/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (error) {
                console.error('Failed to fetch user data', error);
                localStorage.removeItem('authToken');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    if (loading) {
        return <Loading />;
    }

    if (!user) return null;

    return (
        <div className="profile-page">
            <Navbar />

            <div className="profile-container glass">
                <div className="profile-header">
                    <div className="avatar">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <h2>{user.username}</h2>
                        <p>{user.email}</p>
                        <div className="user-badges" style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                            <span className="role-badge" style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                {user.role || 'Player'}
                            </span>
                            {user.isPro && <span className="pro-badge">PRO</span>}
                        </div>

                        {/* Upgrade Button Section */}
                        {!user.isPro && (
                            <div style={{ marginTop: '20px' }}>
                                <MagicButton onClick={() => setActiveTab('pricing')}>
                                    View Upgrade Options
                                </MagicButton>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="profile-nav">
                    <button
                        className={activeTab === 'analyses' ? 'active' : ''}
                        onClick={() => setActiveTab('analyses')}
                    >
                        History
                    </button>
                    <button
                        className={activeTab === 'details' ? 'active' : ''}
                        onClick={() => setActiveTab('details')}
                    >
                        Profile Details
                    </button>
                    <button
                        className={activeTab === 'security' ? 'active' : ''}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                    {/* Hidden tab primarily accessed via the Upgrade button */}
                    {activeTab === 'pricing' && (
                        <button className="active">
                            Pricing
                        </button>
                    )}
                </nav>

                <main className="profile-content">
                    {activeTab === 'details' && <ProfileDetails user={user} />}
                    {activeTab === 'security' && <SecuritySettings />}
                    {activeTab === 'analyses' && <AnalysesHistory />}
                    {activeTab === 'pricing' && <Pricing />}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;