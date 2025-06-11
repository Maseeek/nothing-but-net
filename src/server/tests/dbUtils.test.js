// `tests/dbUtils.test.js`
import mongoose from 'mongoose';
import { getSessionsByUser, getLongestStreak, getFieldGoalPercentage, getGraphData } from '../src/server/dbUtils.js';
import { Session } from '../server.js'; // Import the Session model

beforeAll(async () => {
    await mongoose.connect('your-mongodb-uri', { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('dbUtils.js Tests', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    beforeEach(async () => {
        // Insert mock data into the database
        await Session.insertMany([
            { userId: mockUserId, makes: 5, misses: 3, longestStreak: 4, fg_percentage: 62.5, sessionDate: new Date() },
            { userId: mockUserId, makes: 2, misses: 6, longestStreak: 2, fg_percentage: 25, sessionDate: new Date() }
        ]);
    });

    afterEach(async () => {
        // Clear the database after each test
        await Session.deleteMany({});
    });

    test('getSessionsByUser should return sessions for a user', async () => {
        const sessions = await getSessionsByUser(mockUserId);
        expect(sessions).toHaveLength(2);
    });

    test('getLongestStreak should return the longest streak for a user', async () => {
        const longestStreak = await getLongestStreak(mockUserId);
        expect(longestStreak).toBe(4);
    });

    test('getFieldGoalPercentage should calculate field goal percentage', async () => {
        const fgPercentage = await getFieldGoalPercentage(mockUserId);
        expect(fgPercentage).toBeCloseTo(46.15, 2); // Average FG% of mock data
    });

    test('getGraphData should prepare data for graphs', async () => {
        const graphData = await getGraphData(mockUserId);
        expect(graphData).toHaveLength(2);
        expect(graphData[0]).toHaveProperty('date');
        expect(graphData[0]).toHaveProperty('makes');
        expect(graphData[0]).toHaveProperty('misses');
        expect(graphData[0]).toHaveProperty('fgPercentage');
    });
});