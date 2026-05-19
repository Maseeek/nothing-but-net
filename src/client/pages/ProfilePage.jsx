import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import Loading from '../components/Loading.jsx';
import ProfileDetails from '../components/profile/ProfileDetails.jsx';
import SecuritySettings from '../components/profile/SecuritySettings.jsx';
import AnalysesHistory from '../components/profile/AnalysesHistory.jsx';
import AppSettings from '../components/profile/AppSettings.jsx';
import MagicButton from '../components/MagicButton.jsx';
import Pricing from '../components/Pricing.jsx';
import { API_BASE_URL } from '../config.js';
import './../css/ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analyses');

    // Handle tab from query parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['analyses', 'details', 'security', 'settings', 'pricing'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    navigate('/login');
                    return;
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

    if (loading) {
        return <Loading />;
    }

    if (!user) return null;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Clean up URL when changing tabs manually (optional, but cleaner)
        navigate('/profile', { replace: true });
    };

    return (
        <div className="dashboard-container">
            <Navbar />

            <div className="dashboard-content-wrapper animate-fade-in" style={{maxWidth: '900px', margin: '0 auto', width: '100%'}}>
                <div className="profile-container bento-item glass">
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

                        {!user.isPro && (
                            <div style={{ marginTop: '20px' }}>
                                <MagicButton onClick={() => handleTabChange('pricing')}>
                                    View Upgrade Options
                                </MagicButton>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="profile-nav">
                    <button
                        className={activeTab === 'analyses' ? 'active' : ''}
                        onClick={() => handleTabChange('analyses')}
                    >
                        History
                    </button>
                    <button
                        className={activeTab === 'details' ? 'active' : ''}
                        onClick={() => handleTabChange('details')}
                    >
                        Profile Details
                    </button>
                    <button
                        className={activeTab === 'security' ? 'active' : ''}
                        onClick={() => handleTabChange('security')}
                    >
                        Security
                    </button>
                    <button
                        className={activeTab === 'settings' ? 'active' : ''}
                        onClick={() => handleTabChange('settings')}
                    >
                        App Settings
                    </button>
                    {!user.isPro && (
                        <button 
                            className={activeTab === 'pricing' ? 'active' : ''}
                            onClick={() => handleTabChange('pricing')}
                        >
                            Upgrades
                        </button>
                    )}
                </nav>

                <main className="profile-content">
                    {activeTab === 'details' && <ProfileDetails user={user} />}
                    {activeTab === 'security' && <SecuritySettings />}
                    {activeTab === 'analyses' && <AnalysesHistory />}
                    {activeTab === 'settings' && <AppSettings />}
                    {activeTab === 'pricing' && <Pricing user={user} />}
                </main>
            </div>
            </div>
        </div>
    );
};

export default ProfilePage;