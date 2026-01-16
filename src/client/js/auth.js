import { API_BASE_URL } from '../config.js';

const API_BASE = API_BASE_URL;

// In: src/client/js/auth.js

// Login function with proper error handling and redirect
async function login(username, password) {
    const outcomeEl = document.getElementById('outcome'); // This is for non-React HTML pages, can be kept for other uses or removed if LoginPage is the only consumer.
    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // Attempt to parse the JSON response body, even for errors, as it might contain messages.
        // Default to an empty object if JSON parsing fails (e.g., for non-JSON error responses)
        const data = await response.json().catch(() => ({ error: 'Failed to parse server response.' }));

        if (!response.ok) {
            // Prioritize error message from the parsed JSON body
            throw new Error(data.error || data.message || `Login failed with status: ${response.status}`);
        }

        // Ensure token exists in the successful response
        if (!data.token) {
            console.error('Login response successful, but no token received:', data);
            throw new Error('Login successful, but no authentication token was provided by the server.');
        }
        localStorage.setItem('authToken', data.token);

        // This UI update is for non-React contexts.
        // Your React component (LoginPage.jsx) will handle its own outcome message.
        if (outcomeEl) {
            outcomeEl.textContent = 'Login successful! Redirecting...';
            outcomeEl.style.color = 'green';
        }

        // The redirect will still happen from here on success.
        // The LoginPage.jsx success message might flash briefly.
        setTimeout(() => {
            window.location.href = 'profile'; // Consider using React Router's navigate for SPA consistency if login is called from a component that has access to it.
        }, 1000);

        return data; // Optionally return data if needed by a caller that doesn't rely on the redirect.

    } catch (error) {
        if (error.message === 'Failed to fetch') {
            error.message = 'Connection failed. Is the backend server running?';
        }
        console.error('Login error (from auth.js):', error.message);
        // Update non-React UI if element exists
        if (outcomeEl) {
            outcomeEl.textContent = error.message;
            outcomeEl.style.color = 'red';
        }
        // *** IMPORTANT: Re-throw the error ***
        // This allows the calling function in LoginPage.jsx to catch it.
        throw error;
    }
}

// In: src/client/js/auth.js

async function register(username, email, password, confirmPassword) {
    // The client-side password match is already handled in RegisterPage.jsx before calling this.
    // This internal check is redundant if only RegisterPage.jsx calls it, but kept for wider compatibility.
    const outcomeEl = document.getElementById('reg-outcome'); // For non-React HTML pages

    // Note: RegisterPage.jsx handles this specific check before calling.
    if (password !== confirmPassword) {
        if (outcomeEl) {
            outcomeEl.textContent = "Passwords don't match!";
            outcomeEl.style.color = 'red';
        }
        throw new Error("Passwords don't match!"); // Ensures React component can catch if somehow called directly
    }

    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json().catch(() => ({ error: 'Failed to parse server response.' }));

        if (!response.ok) {
            throw new Error(data.error || data.message || `Registration failed with status: ${response.status}`);
        }

        // For non-React UI:
        if (outcomeEl) {
            outcomeEl.textContent = "Registration successful! Redirecting...";
            outcomeEl.style.color = 'green';
        }

        setTimeout(() => {
            // RegisterPage.jsx also does its own redirect to '/login'.
            // Ensure consistency; using '/login' for React Router.
            window.location.href = '/login';
        }, 1500);

        return data; // Return success data

    } catch (err) {
        if (err.message === 'Failed to fetch') {
            err.message = 'Connection failed. Is the backend server running?';
        }
        // For non-React UI:
        if (outcomeEl) {
            outcomeEl.textContent = err.message;
            outcomeEl.style.color = 'red';
        }
        console.error('Registration error (in auth.js):', err.message);
        // *** IMPORTANT: Re-throw the error ***
        throw err;
    }
}


// Auth state functions
function isLoggedIn() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return false;
    }

    try {
        // Decode the token to get the payload
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Get the expiration timestamp (it's in seconds, so multiply by 1000)
        const expirationDate = new Date(payload.exp * 1000);
        const now = new Date();

        // Check if the token has expired
        if (expirationDate < now) {
            console.log("Token has expired. Logging out.");
            logout(); // Automatically log out and clear the expired token
            return false;
        }

        return true; // Token exists and is not expired

    } catch (error) {
        console.error("Failed to parse token, logging out.", error);
        logout(); // If token is malformed, log out
        return false;
    }
}


function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login';
    }
}

function getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log(payload); // Check if 'username' exists
        return {
            userId: payload.userId,
            username: payload.username,
            email: payload.email,
            expires: new Date(payload.exp * 1000),
            verified: payload.emailVerified
        };
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login';

    // Optional: Notify server
    fetch(`${API_BASE}/api/logout`, { method: 'POST' })
        .catch(err => console.error('Logout API error:', err));
}

// UI update function with null checks
function updateAuthUI() {
    const authButton = document.getElementById('auth-btn'); // Ensure the button has this ID in your HTML

    if (!authButton) return;

    const loggedIn = isLoggedIn();

    if (loggedIn) {
        authButton.innerHTML = `
            

<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A63D40" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 3H14a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6"></path>
    <polyline points="7 9 2 12 7 15"></polyline>
    <line x1="14" y1="12" x2="2" y2="12"></line>
</svg>
            Logout
        `;
        authButton.onclick = logout;
    } else {
        authButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3H9a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6"></path>
                <polyline points="10 9 15 12 10 15"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            Login
        `;
        authButton.onclick = () => {
            window.location.href = 'login';
        };
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    // Ensure the button is updated dynamically on page load
    const authButton = document.getElementById('auth-btn');
    if (authButton) {
        authButton.addEventListener('click', () => {
            updateAuthUI();
        });
    }
});

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username')?.value;
            const password = document.getElementById('password')?.value;
            if (username && password) await login(username, password);
        });
    }

    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username')?.value;
            const email = document.getElementById('reg-email')?.value;
            const password = document.getElementById('reg-password')?.value;
            const confirmPassword = document.getElementById('reg-confirm-password')?.value;
            if (username && email && password && confirmPassword) {
                await register(username, email, password, confirmPassword);
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Make functions available to other modules
export {
    login,
    register,
    isLoggedIn,
    requireAuth,
    getCurrentUser,
    logout,
    updateAuthUI
};