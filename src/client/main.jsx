import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import './css/index.css';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import VerificationSuccessPage from './pages/VerificationSuccessPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// eslint-disable-next-line react-refresh/only-export-components
function Main() {
    return (
        <BrowserRouter>
            <Analytics />
            <Routes>
                {/* All routes must be inside here */}
                <Route path="/" element={<Home />} />
                <Route path="/results" element={<Results />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                <Route path="/verification-success" element={<VerificationSuccessPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Main />
    </StrictMode>
);