import React, { useState } from 'react';
import { login } from '../js/auth.js'; // Assuming 'login' function is exported
import Navbar from '../components/Navbar.jsx';
import './../css/Login.css'; // We'll create this CSS file next
import nbnLogo from '../assets/nbnlight.png'; // Path to your logo

// --- SVG Icons (same as RegisterPage or use your preferred icons) ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>;
const EyeSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75C21.27 7.61 17 4.5 12 4.5c-1.6 0-3.14.39-4.54 1.08L9.17 7.36C9.74 7.13 10.35 7 11 7zm-1.04 5.54L12 12c1.66 0 3-1.34 3-3 0-.05-.01-.1-.02-.14l1.79-1.79C16.99 7.51 17 8.5 17 9c.98-1.48 2.07-3.43 3.73-5.01L19 2.27 4.27 17l1.27 1.27.01-.01L7.73 16.5C7.5 16.69 7.27 16.84 7 17c-1.73-4.39-6-7.5-11-7.5 1.6-2.08 3.56-3.88 5.83-5.04l1.98 1.98C6.86 6.86 6.39 7.84 6.11 9H4c.05.33.1.66.17.99l1.32 1.32C5.46 11.46 5.23 11.02 5 10.55c.01.02.02.03.03.05l-1.32-1.32C3.46 9.46 3.23 9.02 3 8.55c-1.73 4.39 2.73 7.61 1 12 .01-.02.02-.03.03-.05l1.32 1.32zm-1.04 5.54l2.12 2.12C10.04 19.78 9.05 20 8 20c-4.41 0-8-3.13-8-7.5.92-2.26 2.53-4.25 4.52-5.73L2.73 5.01C1.07 6.59 0 8.95 0 12c0 4.41 3.59 7.5 8 7.5 1.05 0 2.05-.22 2.96-.62l-2.12-2.12z"/></svg>;
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
            setOutcome('Login successful! Redirecting...');
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