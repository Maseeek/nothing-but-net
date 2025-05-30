require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const path = require('path');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// ✏️ CONFIGURATION (Update these values)
// ========================================
const MONGODB_URI = process.env.MONGODB_URI; // ✏️ Replace with your DB URI
const JWT_SECRET = process.env.JWT_SECRET; // ✏️ Use a strong secret in production

// ========================================
// Middleware
// ========================================
app.use(helmet()); // Security headers
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:63342',
    'http://localhost:63343',// WebStorm's preview server
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json()); // Parse JSON bodies

// ========================================
// Database Connection
// ========================================
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ========================================
// User Model
// ========================================
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true, trim: true, minlength: 3 },
    email: { type: String, unique: true, required: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    password: { type: String, required: true, minlength: 6 },
    emailVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ========================================
// Routes
// ========================================

// ► Health Check
app.get('/', (req, res) => res.send('Server is running 🚀'));

// ► Register
app.post('/api/register',
    [
        body('username').trim().isLength({ min: 3 }),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
    ],
    async (req, res) => {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            // Check for existing user
            if (await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] })) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

            // Create user
            const user = new User({
                username: req.body.username,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, 10)
            });

            await user.save();
            res.status(201).json({ message: 'User registered successfully!' });

        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);


// ► Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Check password
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token (expires in 1 hour) and include emailVerified
        const token = jwt.sign(
            { userId: user._id, username: user.username, emailVerified: user.emailVerified },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ► Protected Profile Route
app.get('/api/profile', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Include emailVerified in the response
        res.json({
            userId: user._id,
            username: user.username,
            emailVerified: user.emailVerified
        });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
});



// Serve static files from /client
app.use(express.static(path.join(__dirname, '../client')));

// Handle SPA routing (place after other routes)
// More specific catch-all route
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ========================================
// Start Server
// ========================================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Connected to MongoDB: ${MONGODB_URI}`);
});