// In: src/server/models/Analysis.js
import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional for guests
        index: true
    },
    ip: {
        type: String,
        required: false,
        index: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    totalShots: {
        type: Number,
        required: true
    },
    madeShots: {
        type: Number,
        required: true
    },
    fgPercentage: {
        type: Number,
        required: true
    }
    // In the future, you could add more detailed data here,
    // such as an array of individual shot coordinates and their outcomes.
});

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;