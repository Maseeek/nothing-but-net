const API_BASE = 'http://localhost:3000';

// Login function with proper error handling and redirect
async function login(username, password) {
    const outcomeEl = document.getElementById('outcome');
    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const { token } = await response.json();
        localStorage.setItem('authToken', token);

        // Visual feedback before redirect
        if (outcomeEl) {
            outcomeEl.textContent = 'Login successful! Redirecting...';
            outcomeEl.style.color = 'green';
        }

        // Force redirect after short delay
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        if (outcomeEl) {
            outcomeEl.textContent = error.message;
            outcomeEl.style.color = 'red';
        }
    }
}

// Registration function with validation
async function register(username, email, password, confirmPassword) {
    const outcomeEl = document.getElementById('reg-outcome');

    // Client-side validation
    if (!outcomeEl) return;

    if (password !== confirmPassword) {
        outcomeEl.textContent = "Passwords don't match!";
        outcomeEl.style.color = 'red';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        outcomeEl.textContent = "Registration successful! Redirecting...";
        outcomeEl.style.color = 'green';

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (err) {
        outcomeEl.textContent = err.message;
        outcomeEl.style.color = 'red';
        console.error('Registration error:', err);
    }
}

// Auth state functions
function isLoggedIn() {
    return !!localStorage.getItem('authToken');
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
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
            expires: new Date(payload.exp * 1000),
            verified: payload.emailVerified
        };
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';

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
            window.location.href = 'login.html';
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