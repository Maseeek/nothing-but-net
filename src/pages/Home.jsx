import Navbar from "../components/Navbar.jsx";
import '../css/MainPage.css';

function MainPage() {
    return (
        <div className="main-page">
            <h1>Video Processing Page</h1>
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
        </>

    )


}

export default Home;