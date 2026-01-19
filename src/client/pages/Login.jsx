import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added this import for the links to work
import { login } from '../js/auth.js';
import Navbar from '../components/Navbar.jsx';
import Loading from '../components/Loading.jsx';
import './../css/Login.css';
import nbnLogo from '../assets/nbnlight.png';

// --- SVG Icons ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
</svg>;
const EyeSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
</svg>;
// --- End SVG Icons ---

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [outcome, setOutcome] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, password } = formData;

        if (!username || !password) {
            setOutcome("Username and password are required.");
            return;
        }

        setIsLoading(true);
        setOutcome(''); // Clear previous outcome

        try {
            await login(username, password);
            setOutcome(<span style={{ color: 'green' }}>Login successful! Redirecting...</span>);

            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            const errorMessage = err && err.message ? err.message : 'Login failed. Please check your credentials.';
            setOutcome(errorMessage);
            setIsLoading(false); // Only re-enable if login failed (keep loading on success until redirect)
        }
    };

    return (
        <div className="login-page">
            {isLoading && <Loading />}
            <Navbar />
            <div className="login-background">
                <div className="login-container glass">
                    <header>
                        <img src={nbnLogo} alt="NothingButNet Logo" className="login-logo" />
                        <h1>Welcome Back!</h1>
                        <p>Log in to access your NothingButNet account.</p>
                    </header>
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <span className="input-icon"><UserIcon /></span>
                            <input
                                type="text"
                                id="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                                placeholder=" "
                            />
                            <label htmlFor="username">Username</label>
                        </div>

                        <div className="input-group">
                            <span className="input-icon"><LockIcon /></span>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                placeholder=" "
                            />
                            <label htmlFor="password">Password</label>
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '10px' }}
                            disabled={isLoading}
                        >
                            Log In
                        </button>
                        {outcome && <p className="outcome">{outcome}</p>}
                    </form>
                    <div className="form-footer">
                        <p><Link to="/forgot-password">Forgot password?</Link></p>
                        <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;