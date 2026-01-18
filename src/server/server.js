import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import {
    registerValidation,
    loginValidation,
    sessionValidation,
    analysisValidation,
    emailValidation
} from './middleware/validation.js';
import { errorHandler } from './middleware/errorHandler.js';

// ... imports ...

// ... app setup ...

app.post('/api/register', registerValidation, async (req, res) => {
    try {
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

        // ... (rest of the registration logic remains the same, stripping validation checks) ...

        // --- Email Verification Logic ---
        const token = crypto.randomBytes(32).toString('hex');
        user.verificationToken = token;
        user.verificationTokenExpires = Date.now() + 3600000;

        try {
            await user.save();
            console.log('User saved to database');
        } catch (dbErr) {
            console.error('Database save error:', dbErr);
            return res.status(500).json({ error: 'Database save failed', details: dbErr.message });
        }

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

        try {
            await transporter.sendMail(mailOptions);
            console.log('Verification email sent');
        } catch (emailErr) {
            console.error('Email sending error:', emailErr);
            // We still fail the request if email fails, because verification is required
            // Optionally delete the user to allow retrying
            await User.deleteOne({ _id: user._id });
            next(emailErr);
        }

        res.status(201).json({ message: 'User registered successfully! Please check your email.' });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

app.post('/api/login', loginValidation, async (req, res, next) => {
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
        next(err);
    }
});

app.get('/api/profile', async (req, res, next) => {
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
        next(err);
    }
});

app.post('/api/session', sessionValidation, async (req, res, next) => {
    try {
        const {
            userId, makes, misses, longest_streak, average_angle, average_make_angle,
            average_miss_angle, fg_percentage, shot_angles, shots_results, total_shots
        } = req.body;

        console.log("Incoming session data:", req.body);

        // Manual validation removed (handled by middleware)

        const session = new Session({
            userId, makes, misses, longest_streak, average_angle, average_make_angle,
            average_miss_angle, fg_percentage, shot_angles, shots_results, total_shots, sessionDate: new Date()
        });
        await session.save();

        console.log("Session saved successfully:", session);

        res.status(201).json({ message: "Session recorded successfully!", session });
    } catch (err) {
        next(err);
    }
});

app.get('/api/longest-streak/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;

        const sessions = await Session.find({ userId }).sort({ longestStreak: -1 }).limit(1).lean();
        if (!sessions.length) {
            return res.status(404).json({ error: 'No sessions found for this user' });
        }

        res.json({ longestStreak: sessions[0].longestStreak });
    } catch (err) {
        next(err);
    }
});

app.get('/api/sessions/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;

        const sessions = await Session.find({ userId })
            .select('sessionDate makes misses longest_streak fg_percentage')
            .sort({ sessionDate: -1 })
            .lean(); // Added sort for consistency
        if (!sessions.length) {
            return res.status(404).json({ error: 'No sessions found for this user' });
        }

        res.json(sessions);
    } catch (err) {
        next(err);
    }
});
app.get('/api/field-goal-percentage/:userId', async (req, res, next) => {
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
        next(err);
    }
});


app.post('/api/analyses', requireAuthSession, analysisValidation, async (req, res, next) => {
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
        next(err);
    }
});

app.get('/api/analyses', requireAuthSession, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const analyses = await Analysis.find({ userId }).sort({ date: -1 }).lean();
        res.status(200).json(analyses);
    } catch (err) {
        next(err);
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
app.post('/api/send-verification-email', requireAuthSession, async (req, res, next) => {
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
        next(err);
    }
});


// --- NEW API ROUTE: HANDLE EMAIL VERIFICATION ---
// Find your /api/verify-email/:token route and replace it with this

// Add this new route handler anywhere before your app.listen() call

app.post('/api/verify-email', async (req, res, next) => {
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
        next(err);
    }
});

app.post('/api/forgot-password', emailValidation, async (req, res, next) => {
    try {
        const { email } = req.body;
        // email is already validated and normalized by middleware
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

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        } catch (emailErr) {
            console.error('Forgot password email error:', emailErr);
            return res.status(500).json({ error: 'Email sending failed', details: emailErr.message });
        }

    } catch (err) {
        next(err);
    }
});

// --- NEW API ROUTE: STRIPE CHECKOUT ---
app.post('/api/create-checkout-session', requireAuthSession, async (req, res, next) => {
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
        next(err);
    }
});

// --- NEW API ROUTE: STRIPE WEBHOOK ---
app.post('/api/webhook', async (req, res, next) => {
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
app.post('/api/reset-password/:token', async (req, res, next) => {
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
        next(err);
    }
});

app.use(errorHandler);

app.use(express.static(path.join(__dirname, '../client')));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

console.log(`Attempting to bind server to port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;