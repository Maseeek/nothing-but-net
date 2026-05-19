import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    ip: { type: String, required: false, index: true },
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

// Index for fetching sessions by user or IP, sorted by date (common query)
sessionSchema.index({ userId: 1, sessionDate: -1 });
sessionSchema.index({ ip: 1, sessionDate: -1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
