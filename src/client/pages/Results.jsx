import Navbar from "../components/Navbar.jsx";
import '../css/Results.css';

function Results() {
    return (
        <>
            <Navbar/>
            <div className="results-container">
                <h1>Analysis Results</h1>
                <div className="results-content">
                    <p>Your analysis results will be displayed here.</p>
                    {/* Add your results display logic here */}
                </div>
            </div>
        </>
    );
}

export default Results;