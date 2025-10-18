// `userProfile.js`
import { API_BASE_URL } from '../config.js';

async function showUserProfile(userId) {
    try {
        // Fetch user session data
        const response = await fetch(`${API_BASE_URL}/api/sessions/${encodeURIComponent(userId)}`);
        const sessions = await response.json();

        if (sessions.length > 0) {
            const userStats = calculateUserStats(sessions);
            displayUserProfile(userStats, sessions);
        } else {
            console.error("No sessions found for user ID:", userId);
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}

function calculateUserStats(sessions) {
    const totalMakes = sessions.reduce((sum, session) => sum + session.makes, 0);
    const totalMisses = sessions.reduce((sum, session) => sum + session.misses, 0);
    const totalShots = totalMakes + totalMisses;
    const fgPercentage = totalShots > 0 ? (totalMakes / totalShots) * 100 : 0;

    return {
        totalMakes,
        totalMisses,
        fgPercentage: fgPercentage.toFixed(2),
    };
}

function displayUserProfile(userStats, sessions) {
    // Create backdrop and modal if they don't exist
    const backdrop = document.getElementById('modal-backdrop') || createBackdrop();
    const profileContainer = document.getElementById('user-profile') || createProfileContainer();

    // Clear previous content
    profileContainer.innerHTML = '';

    // Create profile content
    const content = `
        <div class="profile-header">
            <h2>User Profile</h2>
            <div class="stats">
                <p><strong>Total Field Goal Percentage:</strong> ${userStats.fgPercentage}%</p>
                <p><strong>Total Makes:</strong> ${userStats.totalMakes}</p>
                <p><strong>Total Misses:</strong> ${userStats.totalMisses}</p>
            </div>
        </div>
        <div class="charts-container">
            <div id="shot-scores-line-chart-container" style="height: 300px;"></div>
        </div>
        <div class="profile-actions">
            <button class="close-btn">Close</button>
        </div>
    `;

    profileContainer.innerHTML = content;

    // Show the profile container and backdrop
    profileContainer.style.display = 'block';
    backdrop.style.display = 'block';

    // Generate the line graph
    displayShotScoresLineGraph(sessions);

    // Add event listener to close button
    const closeBtn = profileContainer.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            profileContainer.style.display = 'none';
            backdrop.style.display = 'none';
        });
    }
}

function displayShotScoresLineGraph(sessions) {
    // Create canvas for the chart if it doesn't exist
    const chartContainer = document.getElementById('shot-scores-line-chart-container');
    chartContainer.innerHTML = '<canvas id="shot-scores-line-chart"></canvas>';

    const ctx = document.getElementById('shot-scores-line-chart').getContext('2d');

    // Prepare data for the line graph
    const labels = sessions.map(session => new Date(session.sessionDate).toLocaleDateString());
    const makesData = sessions.map(session => session.makes);
    const missesData = sessions.map(session => session.misses);

    // Create the line graph
    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Makes',
                    data: makesData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    fill: true,
                },
                {
                    label: 'Misses',
                    data: missesData,
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Shot Scores Over Time',
                },
                legend: {
                    position: 'bottom',
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Shots',
                    },
                    beginAtZero: true,
                },
            },
        },
    });
}

function createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', () => {
        const profileContainer = document.getElementById('user-profile');
        if (profileContainer) {
            profileContainer.style.display = 'none';
        }
        backdrop.style.display = 'none';
    });

    return backdrop;
}

function createProfileContainer() {
    const container = document.createElement('div');
    container.id = 'user-profile';
    container.className = 'user-profile-modal';
    document.body.appendChild(container);
    return container;
}

// Export functions for use in other files
window.userProfile = {
    show: showUserProfile,
};