import React from "react";
import Navbar from "../components/Navbar.jsx";
import FGResults from "../components/FGResults.jsx";
import "../css/Results.css"; // Import the CSS file

function Results() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        const storedData = sessionStorage.getItem("analysisResults");
        if (storedData) {
            setData(JSON.parse(storedData));
        }
    }, []);

    return (
        <>
            <Navbar />
            <div className="results-container">
                <h1>Analysis Results</h1>
                <FGResults results={data} />
            </div>
        </>
    );
}

export default Results;