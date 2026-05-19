import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import '../css/navbar.css';
import nbnLogo from '../assets/nbnlight.png';
import { isLoggedIn, logout } from "../js/auth.js";


export const HomeButton = memo(function HomeButton() {
    return (
        <Link to="/" aria-label="Go to Landing Page">
            <button className="home-btn" title="Home">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            </button>
        </Link>
    );
});

export const ProfileButton = memo(function ProfileButton({ onClick }) {
    return (
        <button className="premium-profile-btn" onClick={onClick}>
            <div className="user-avatar-placeholder">
                <Activity size={18} color="white" />
            </div>
            <span style={{ fontWeight: 600 }}>My Account</span>
        </button>
    );
});

export const DropdownMenu = memo(function DropdownMenu({ isVisible }) {
    const navigate = useNavigate();

    const handleAuthClick = useCallback(() => {
        if (isLoggedIn()) {
            logout();
            navigate('/login');
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div id="dropdown-menu" className={`dropdown-menu ${isVisible ? 'visible' : 'hidden'}`}>
            <Link to="/dashboard" className="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
            </Link>
            <Link to="/profile" className="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
            </Link>
            <Link to="/results" className="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                Statistics
            </Link>
            <Link to="/profile?tab=settings" className="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Settings
            </Link>
            <a id="auth-btn" className="dropdown-item" onClick={handleAuthClick}>
                {isLoggedIn() ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        Logout
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Login
                    </>
                )}
            </a>
        </div>
    );
});

const Navbar = () => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const loggedIn = isLoggedIn();

    const toggleDropdown = useCallback(() => {
        setDropdownVisible(!isDropdownVisible);
    }, [isDropdownVisible]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="nav-container glass">
            <Link to="/" className="nav-title glow-on-hover" aria-label="Nothing But Net Home">
                <img id="logo" src={nbnLogo} alt="NBN Logo" className="nav-logo-img" />
                <h2 id="nbntitle">nothingbutnet</h2>
            </Link>
            <div className="nav-options">
                {loggedIn ? (
                    <>
                        <HomeButton />
                        <div ref={buttonRef}>
                            <ProfileButton onClick={toggleDropdown} />
                        </div>
                        <div ref={dropdownRef}>
                            <DropdownMenu isVisible={isDropdownVisible} />
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link to="/login" className="nav-link" style={{color: 'var(--text-secondary)', fontWeight: 500}}>Log In</Link>
                        <Link to="/register" className="nav-btn" style={{padding: '0.6rem 1.2rem', background: 'var(--accent-color)', color: 'white', borderRadius: '50px', fontWeight: 600}}>Get Started</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;