import { StrictMode, Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import './css/index.css';
import './css/Form.css';
// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home.jsx'));
const Results = lazy(() => import('./pages/Results.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const LoginPage = lazy(() => import('./pages/Login.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage.jsx'));
const VerificationSuccessPage = lazy(() => import('./pages/VerificationSuccessPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));

// Loading component
const PageLoader = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#d64b17',
        fontSize: '1.2rem',
        fontWeight: 'bold'
    }}>
        Loading...
    </div>
);


import LiquidEther from './components/LiquidEther/LiquidEther.jsx';

// eslint-disable-next-line react-refresh/only-export-components
function Main() {
    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = e.clientX;
            const y = e.clientY;
            document.documentElement.style.setProperty('--mouse-x', `${x}px`);
            document.documentElement.style.setProperty('--mouse-y', `${y}px`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <BrowserRouter>
            <Analytics />
            {/* Global SVG Filters for Liquid/Gooey Effects */}
            {/* Global SVG Filters for Liquid/Gooey Effects */}
            <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2 }}>
                <LiquidEther
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={false}
                    iterationsPoisson={4}
                    iterationsViscous={4}
                    viscous={30}
                    colors={["#ffd214", "#ff5805", "#ff4606"]}
                    resolution={0.2}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    isBounce={false}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }}></div>
            </div>

            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Main />
    </StrictMode>
);