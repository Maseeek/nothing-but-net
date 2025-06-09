import React, { useState } from 'react';
import { login } from '../js/auth.js'; // Assuming 'login' function is exported
import Navbar from '../components/Navbar.jsx';
import './../css/Login.css'; // We'll create this CSS file next
import nbnLogo from '../assets/nbnlight.png'; // Path to your logo

// --- SVG Icons (same as RegisterPage or use your preferred icons) ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
</svg>;
const EyeSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
</svg>;

// --- End SVG Icons ---

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '', // Or 'email' if your backend expects email for login
        password: ''
    });
    const [outcome, setOutcome] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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

        try {
            // The login function from auth.js handles localStorage and redirection on success
            await login(username, password); //
            // If login is successful, auth.js redirects. If it fails, it throws an error.
            // So, we might not even reach here if successful and redirected by auth.js.
            // Setting a success outcome here is mainly for if auth.js's redirect is delayed or removed.
            setOutcome(<span style={{ color: 'green' }}>Login successful! Redirecting...</span>);

        } catch (err) {
            // The login function in auth.js should throw an error with a message
            const errorMessage = err && err.message ? err.message : 'Login failed. Please check your credentials.';
            setOutcome(errorMessage);
        }
    };

    return (
        <div className="login-page"> {/* Changed class name */ }
            <Navbar />
            <div className="login-background"> {/* Changed class name */ }
                <div className="login-container"> {/* Changed class name */ }
                    <header>
                        <img src={nbnLogo} alt="NothingButNet Logo" className="login-logo" /> {/* Changed class name */ }
                        <h1>Welcome Back!</h1>
                        <p>Log in to access your NothingButNet account.</p>
                    </header>
                    <form onSubmit={handleSubmit} className="login-form"> {/* Changed class name */ }
                        <div className="input-group">
                            <span className="input-icon"><UserIcon /></span>
                            <input
                                type="text" // Or "email" if login is by email
                                id="username" // Corresponds to formData.username
                                value={formData.username}
                                onChange={handleChange}
                                required
                                autoComplete="username"
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
                            />
                            <label htmlFor="password">Password</label>
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        <button type="submit" className="submit-button">Log In</button>
                        {outcome && <p className="outcome">{outcome}</p>}
                    </form>
                    <div className="form-footer">
                        <p><a href="/forgot-password">Forgot password?</a></p>
                        <p>Don't have an account? <a href="/register">Sign Up</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;