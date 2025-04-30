import Navbar from "../components/Navbar.jsx";
import '../css/MainPage.css';
import Coordinates from "../components/Coordinates.jsx";
import image from "../assets/nbnlogo.png"

function MainPage() {
    return (
        <div className="main-page">
            <h1>Analyze your Video</h1>
            <form className="video-form">
                <label htmlFor="videoInput">Upload a video:</label>
                <input type="file" id="videoInput" accept="video/*"/>
                <button type="submit">Process Video</button>
            </form>
        </div>
    );
}

function Home() {
    return (
        <>

            <Navbar/>
            <MainPage/>
            <Coordinates imageUrl={image}/>
        </>

    )


}

export default Home;