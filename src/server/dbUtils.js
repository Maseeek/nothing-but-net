// `src/server/dbUtils.js`
import mongoose from 'mongoose';
import { Session } from './server.js' // Import your Session model

// Function to retrieve all sessions for a user
export async function getSessionsByUser(userId) {
    try {
        return await Session.find({ userId }).sort({ sessionDate: -1 });
    } catch (error) {
        console.error('Error retrieving sessions:', error);
        throw error;
    }
}
// Function to get the longest streak for a user
export async function getLongestStreak(userId) {
    try {
        const session = await Session.find({ userId }).sort({ longestStreak: -1 }).limit(1);
        return session.length ? session[0].longestStreak : 0;
    } catch (error) {
        console.error('Error retrieving longest streak:', error);
        throw error;
    }
}

// Function to calculate field goal percentage for a user
export async function getFieldGoalPercentage(userId) {
    try {
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

        if (!stats.length) return 0;

        const { totalMakes, totalMisses } = stats[0];
        const totalAttempts = totalMakes + totalMisses;
        return totalAttempts > 0 ? (totalMakes / totalAttempts) * 100 : 0;
    } catch (error) {
        console.error('Error calculating field goal percentage:', error);
        throw error;
    }
}

// Function to prepare data for graphs
export async function getGraphData(userId) {
    try {
        const sessions = await getSessionsByUser(userId);
        return sessions.map(session => ({
            date: session.sessionDate,
            makes: session.makes,
            misses: session.misses,
            fgPercentage: session.fg_percentage
        }));
    } catch (error) {
        console.error('Error preparing graph data:', error);
        throw error;
    }
}