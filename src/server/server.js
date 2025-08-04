import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';
import Analysis from './models/Analysis.js';
import User from './models/User.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(helmet());
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:63342',
    'http://localhost:63343',
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error('CORS error: Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// 👇 NEW: Authentication Middleware
const requireAuthSession = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.user = user; // Attach user to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};


const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    makes: { type: Number, required: true, default: 0 },
    misses: { type: Number, required: true, default: 0 },
    longestStreak: { type: Number, required: true, default: 0 },
    average_angle: { type: Number, required: true },
    average_make_angle: { type: Number, required: true },
    average_miss_angle: { type: Number, required: true },
    fg_percentage: { type: Number, required: true },
    shot_angles: { type: [Number], required: true },
    shots_results: { type: [Number], required: true },
    total_shots: { type: Number, required: true },
    sessionDate: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);


app.get('/', (req, res) => res.send('Server is running 🚀'));



// --- Replace your existing /api/register route with this one ---
app.post('/api/register',
    [
        body('username').trim().isLength({ min: 3 }),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            if (await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] })) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

            const user = new User({
                username: req.body.username,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, 10)
            });

            // --- NEW VERIFICATION LOGIC ---
            const token = crypto.randomBytes(32).toString('hex');
            user.verificationToken = token;
            user.verificationTokenExpires = Date.now() + 3600000; // Expires in 1 hour
            await user.save();

            const verificationLink = `http://localhost:5173/verify-email/${token}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Welcome to NothingButNet! Please Verify Your Email',
                html: `<p>Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`
            };

            await transporter.sendMail(mailOptions);
            // --- END OF NEW LOGIC ---

            res.status(201).json({ message: 'User registered successfully! Please check your email.' });

        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username, email: user.email, emailVerified: user.emailVerified },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

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

app.post('/api/session', async (req, res) => {
    try {
        const {
            userId, makes, misses, longest_streak, average_angle, average_make_angle,
            average_miss_angle, fg_percentage, shot_angles, shots_results, total_shots
        } = req.body;

        console.log("Incoming session data:", req.body);

        if (!userId || makes == null || misses == null || longest_streak == null ||
            average_angle == null || average_make_angle == null || average_miss_angle == null ||
            fg_percentage == null || !Array.isArray(shot_angles) || !Array.isArray(shots_results) ||
            total_shots == null) {
            console.error("Validation error: Missing required fields");
            return res.status(400).json({ error: "Missing required fields" });
        }

        const session = new Session({
            userId, makes, misses, longest_streak, average_angle, average_make_angle,
            average_miss_angle, fg_percentage, shot_angles, shots_results, total_shots, sessionDate: new Date()
        });
        await session.save();

        console.log("Session saved successfully:", session);

        res.status(201).json({ message: "Session recorded successfully!", session });
    } catch (err) {
        console.error("Session recording error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get('/api/longest-streak/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const sessions = await Session.find({ userId }).sort({ longestStreak: -1 }).limit(1);
        if (!sessions.length) {
            return res.status(404).json({ error: 'No sessions found for this user' });
        }

        res.json({ longestStreak: sessions[0].longestStreak });
    } catch (err) {
        console.error('Longest streak retrieval error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/sessions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const sessions = await Session.find({ userId });
        if (!sessions.length) {
            return res.status(404).json({ error: 'No sessions found for this user' });
        }

        res.json(sessions);
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
app.get('/api/field-goal-percentage/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const stats = await Session.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalMakes: { $sum: '$makes' },
                    totalMisses: { $sum: '$misses' }
                }
            }
        ]);

        if (!stats.length) {
            return res.status(404).json({ error: 'No sessions found for this user' });
        }

        const { totalMakes, totalMisses } = stats[0];
        const totalAttempts = totalMakes + totalMisses;
        const fgPercentage = totalAttempts > 0 ? (totalMakes / totalAttempts) * 100 : 0;

        res.json({ fieldGoalPercentage: fgPercentage.toFixed(2) });

    } catch (err) {
        console.error('Field goal percentage error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


app.post('/api/analyses', requireAuthSession, async (req, res) => {
    try {
        const { totalShots, madeShots, fgPercentage } = req.body;
        const userId = req.user._id;

        const newAnalysis = new Analysis({
            userId,
            totalShots,
            madeShots,
            fgPercentage
        });

        await newAnalysis.save();
        res.status(201).json({ message: 'Analysis saved successfully!', analysis: newAnalysis });

    } catch (err) {
        console.error('Error saving analysis:', err);
        res.status(500).json({ error: 'Failed to save analysis.' });
    }
});

app.get('/api/analyses', requireAuthSession, async (req, res) => {
    try {
        const userId = req.user._id;
        const analyses = await Analysis.find({ userId }).sort({ date: -1 });
        res.status(200).json(analyses);
    } catch (err) {
        console.error('Error fetching analyses:', err);
        res.status(500).json({ error: 'Failed to retrieve analyses.' });
    }
});

// --- NODEMAILER TRANSPORTER SETUP ---
// This uses the credentials from your .env file
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// --- NEW API ROUTE: SEND VERIFICATION EMAIL ---
app.post('/api/send-verification-email', requireAuthSession, async (req, res) => {
    try {
        const user = req.user;

        // Generate a random, secure token
        const token = crypto.randomBytes(32).toString('hex');
        user.verificationToken = token;
        // Set the token to expire in 1 hour
        user.verificationTokenExpires = Date.now() + 3600000; // 1 hour in milliseconds
        await user.save();

        // Create the verification URL for the email
        const verificationLink = `http://localhost:5173/verify-email/${token}`; // Adjust for your frontend URL

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Verify Your NothingButNet Account',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                    <h2>Welcome to NothingButNet!</h2>
                    <p>Please click the button below to verify your email address and activate your account.</p>
                    <a href="${verificationLink}" style="background-color: #d64b17; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
                        Verify My Email
                    </a>
                    <p style="margin-top: 30px; font-size: 0.9em;">If you did not create this account, you can safely ignore this email.</p>
                </div>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Verification email sent successfully.' });

    } catch (err) {
        console.error('Error sending verification email:', err);
        res.status(500).json({ error: 'Server error while sending email.' });
    }
});


// --- NEW API ROUTE: HANDLE EMAIL VERIFICATION ---
// Find your /api/verify-email/:token route and replace it with this

// Add this new route handler anywhere before your app.listen() call

app.post('/api/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is missing.' });
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'This link is invalid or has expired.' });
        }

        // Verification successful
        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        // Create and send back a NEW token with the updated user info
        const newToken = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                emailVerified: user.emailVerified // This will now be true
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Email verified successfully!',
            token: newToken
        });

    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ error: 'An error occurred during verification.' });
    }
});
app.use(express.static(path.join(__dirname, '../client')));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});