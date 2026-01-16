import dotenv from 'dotenv';
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
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from src/server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(STRIPE_SECRET_KEY);

app.use(helmet());
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://nothingbutnet.online',
    'https://www.nothingbutnet.online',
    process.env.FRONTEND_URL,
    process.env.PRODUCTION_FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
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
// Use JSON parser with verify option to capture raw body for Stripe webhooks
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

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
            // 👇 --- FIX IS HERE: Convert to lowercase before checking --- 👇
            const { username, email, password } = req.body;
            const lowerCaseEmail = email.toLowerCase();
            const lowerCaseUsername = username.toLowerCase();

            // Check if a user with the same lowercase username or email already exists
            if (await User.findOne({ $or: [{ username: lowerCaseUsername }, { email: lowerCaseEmail }] })) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

            const user = new User({
                username: lowerCaseUsername, // Save as lowercase
                email: lowerCaseEmail,       // Save as lowercase
                password: await bcrypt.hash(password, 10)
            });

            // --- Email Verification Logic ---
            const token = crypto.randomBytes(32).toString('hex');
            user.verificationToken = token;
            user.verificationTokenExpires = Date.now() + 3600000;
            await user.save(); // Now this save will be consistent with the check

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const verificationLink = `${frontendUrl}/verify-email/${token}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Welcome to NothingButNet! Please Verify Your Email',
                html: `
        <div style="background-color: #1e1e2f; color: #f0f0f0; padding: 40px; font-family: Arial, sans-serif; text-align: center; border-radius: 12px;">
            
            <img src="https://i.imgur.com/8m1GnbC.png" alt="NothingButNet Logo" style="width: 100px; margin-bottom: 20px;">
            
            <h2 style="color: #d64b17;">Welcome to NothingButNet, ${user.username}!</h2>
            
            <p style="color: #b0b0b0; font-size: 16px; line-height: 1.5;">
                We're excited to have you. Please click the button below to verify your email address and activate your account.
            </p>
            
            <a href="${verificationLink}" style="background-color: #d64b17; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; font-weight: bold;">
                Verify My Email
            </a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
                If you did not create this account, you can safely ignore this email. This link will expire in one hour.
            </p>
        </div>
    `
            };
            await transporter.sendMail(mailOptions);

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

        // Convert input username to lowercase to match registration
        const lowerCaseUsername = username.toLowerCase();

        const user = await User.findOne({ username: lowerCaseUsername });
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
        // Return the actual error message for debugging purposes
        res.status(500).json({ error: 'Server error', details: err.message });
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
            emailVerified: user.emailVerified,
            isPro: user.isPro
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

        const sessions = await Session.find({ userId })
            .select('sessionDate makes misses longest_streak fg_percentage')
            .sort({ sessionDate: -1 }); // Added sort for consistency
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
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationLink = `${frontendUrl}/verify-email/${token}`;

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Verify Your NothingButNet Account',
            html: `
                <div style="background-color: #1e1e2f; color: #f0f0f0; padding: 40px; font-family: Arial, sans-serif; text-align: center; border-radius: 12px;">
                    <img src="https://i.imgur.com/8m1GnbC.png" alt="NothingButNet Logo" style="width: 100px; margin-bottom: 20px;">
                    <h2 style="color: #d64b17;">Verify Your Email</h2>
                    <p style="color: #b0b0b0; font-size: 16px; line-height: 1.5;">Please click the button below to verify your email address for your NothingButNet account.</p>
                    <a href="${verificationLink}" style="background-color: #d64b17; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; font-weight: bold;">
                        Verify My Email
                    </a>
                    <p style="margin-top: 30px; font-size: 12px; color: #888;">This link will expire in one hour.</p>
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
                email: user.email,
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

app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Important: For security, don't reveal if the email exists or not.
            // Just send a generic success message.
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate a token
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Expires in 1 hour
        await user.save();

        // Send the email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request for NothingButNet',
            html: `
        <div style="background-color: #1e1e2f; color: #f0f0f0; padding: 40px; font-family: Arial, sans-serif; text-align: center; border-radius: 12px;">
            
            <img src="https://i.imgur.com/8m1GnbC.png" alt="NothingButNet Logo" style="width: 100px; margin-bottom: 20px;">
            
            <h2 style="color: #d64b17;">Password Reset Request</h2>
            
            <p style="color: #b0b0b0; font-size: 16px; line-height: 1.5;">
                You are receiving this because you (or someone else) have requested the reset of the password for your account.
            </p>
            <p style="color: #b0b0b0; font-size: 16px; line-height: 1.5;">
                Please click the button below to choose a new password.
            </p>
            
            <a href="${resetLink}" style="background-color: #d64b17; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; font-weight: bold;">
                Reset Your Password
            </a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
                If you did not request this, please ignore this email. This link will expire in one hour.
            </p>
        </div>
    `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- NEW API ROUTE: STRIPE CHECKOUT ---
app.post('/api/create-checkout-session', requireAuthSession, async (req, res) => {
    try {
        const user = req.user;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            client_reference_id: user._id.toString(),
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'NothingButNet PRO Subscription',
                            description: 'Unlock unlimited video analysis and advanced stats.',
                        },
                        unit_amount: 1000, // $10.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // Use 'subscription' if you set up recurring prices in Dashboard
            success_url: `${frontendUrl}/profile?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/profile`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('Stripe checkout error:', err);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// --- NEW API ROUTE: STRIPE WEBHOOK ---
app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    // console.log("Webhook received. Signature:", sig); // Optional: debug log

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        console.error(`Make sure your .env STRIPE_WEBHOOK_SECRET matches the one from 'stripe listen'`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    console.log(`Webhook Event Type: ${event.type}`); // Log event type

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id;
        console.log(`Processing checkout.session.completed for user: ${userId}`);

        if (userId) {
            try {
                const user = await User.findById(userId);
                if (user) {
                    user.isPro = true;
                    user.stripeCustomerId = session.customer;
                    await user.save();
                    console.log(`SUCCESS: User ${user.username} upgraded to PRO via Stripe.`);
                } else {
                    console.error(`User not found for ID: ${userId}`);
                }
            } catch (error) {
                console.error('Error updating user status from webhook:', error);
            }
        } else {
            console.error('No client_reference_id found in session.');
        }
    }

    res.status(200).send();
});


// --- 👇 ADD THIS NEW ROUTE: TO HANDLE THE ACTUAL PASSWORD RESET ---
app.post('/api/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() } // Check if the token is not expired
        });

        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }

        // Set the new password
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined; // Clear the token
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been successfully reset.' });

    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.use(express.static(path.join(__dirname, '../client')));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

console.log(`Attempting to bind server to port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;