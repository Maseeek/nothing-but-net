import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import Home from "./pages/Home.jsx";
import App from "./pages/App.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Home />
    </StrictMode>,
)
