import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './css/index.css';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/Login.jsx';

// eslint-disable-next-line react-refresh/only-export-components
function Main() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/results" element={<Results />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Main />
    </StrictMode>
);