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


import LiquidEther from './components/LiquidEther/LiquidEther.jsx';

// eslint-disable-next-line react-refresh/only-export-components
function Main() {
    return (
        <BrowserRouter>
            <Analytics />
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2 }}>
                <LiquidEther
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={true}
                    viscous={30}
                    colors={["#ffd214", "#ff5805", "#ff4606"]}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    isBounce={false}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }}></div>
            </div>

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