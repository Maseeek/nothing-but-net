import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null,
        index: true
    },
    verificationTokenExpires: {
        type: Date,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null,
        index: true
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    isPro: {
        type: Boolean,
        default: false
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'standard', 'pro'],
        default: 'free'
    },
    stripeCustomerId: {
        type: String,
        default: null,
        index: true
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// This makes the User model the one and only export from this file.
export default User;