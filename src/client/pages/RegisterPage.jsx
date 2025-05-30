import React, { useState } from 'react';
import { register } from '../js/auth.js'; // Assuming this path is correct
import Navbar from '../components/Navbar.jsx'; // Assuming this path is correct
import './../css/RegisterPage.css'; // Ensure this path points to the updated CSS

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [outcome, setOutcome] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password, confirmPassword } = formData;

        if (password !== confirmPassword) {
            setOutcome("Passwords don't match!");
            return;
        }

        try {
            await register(username, email, password, confirmPassword); // Make sure 'register' function is correctly imported and working
            setOutcome('Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/login'; // Or use React Router for navigation if implemented
            }, 1500);
        } catch (err) {
            // It's good practice to check if err and err.message exist
            const errorMessage = err && err.message ? err.message : 'Registration failed due to an unknown error.';
            setOutcome(errorMessage);
        }
    };

    return (
        <div className="register-page">
            <Navbar /> {/* Navbar styling is separate and not covered here */}
            <div className="register-background">
                <div className="register-container">
                    <header>
                        <h1>Create Your Account</h1>
                        <p>Join us and start your journey today!</p>
                    </header>
                    <form onSubmit={handleSubmit} className="register-form">
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                        />
                        <input
                            type="email"
                            id="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                        <button type="submit">Register</button>
                        {outcome && <p className="outcome">{outcome}</p>} {/* Conditionally render outcome */}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;