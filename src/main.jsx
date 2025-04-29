import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './css/index.css';
import Home from './pages/Home.jsx';
import Loading from './components/Loading.jsx';

function Main() {
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    return (
        <>
            {isLoading && <Loading onLoadingComplete={handleLoadingComplete} />}
            <Home />
        </>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Main />
    </StrictMode>
);