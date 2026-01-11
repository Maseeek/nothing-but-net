
import { performance } from 'perf_hooks';

// Generate Mock Data
const N = 10000;
const sessionData = Array.from({ length: N }, (_, i) => ({
    makes: Math.floor(Math.random() * 50),
    misses: Math.floor(Math.random() * 50),
    longest_streak: Math.floor(Math.random() * 10),
    sessionDate: new Date().toISOString(),
    fg_percentage: Math.random() * 100,
    shot_angles: new Array(100).fill(0), // Simulate heavy unused data
    shots_results: new Array(100).fill(0)
}));

// --- AREA 1: Profile Stats Calculation ---
console.log('--- Area 1: Profile Stats Calculation ---');
const start1 = performance.now();

const totalMakes = sessionData.reduce((sum, session) => sum + (session.makes || 0), 0);
const totalMisses = sessionData.reduce((sum, session) => sum + (session.misses || 0), 0);
const overallLongestStreak = sessionData.reduce((maxStreak, session) =>
    Math.max(maxStreak, session.longest_streak || 0), 0
);

const end1 = performance.now();
console.log(`Baseline Time: ${(end1 - start1).toFixed(4)} ms`);


// --- AREA 2: Profile Chart Data Prep ---
console.log('\n--- Area 2: Profile Chart Data Prep ---');
const sessions = sessionData; // Same data
const start2 = performance.now();

const labels = sessions.map(session => new Date(session.sessionDate).toLocaleDateString());
const makesData = sessions.map(session => session.makes || 0);
const missesData = sessions.map(session => session.misses || 0);
const fgPercentageData = sessions.map(session => session.fg_percentage || 0);

const end2 = performance.now();
console.log(`Baseline Time: ${(end2 - start2).toFixed(4)} ms`);


// --- AREA 3: Server Serialization (Overfetching) ---
console.log('\n--- Area 3: Server Serialization (Overfetching) ---');
const start3 = performance.now();
const jsonFull = JSON.stringify(sessionData);
const end3 = performance.now();
console.log(`Baseline Time (Full Object): ${(end3 - start3).toFixed(4)} ms`);
console.log(`Payload Size: ${(jsonFull.length / 1024).toFixed(2)} KB`);


// --- AREA 4: DB Graph Data Mapping ---
console.log('\n--- Area 4: DB Graph Data Mapping ---');
const start4 = performance.now();
// Simulating fetching full docs then mapping
const graphData = sessionData.map(session => ({
    date: session.sessionDate,
    makes: session.makes,
    misses: session.misses,
    fgPercentage: session.fg_percentage
}));
const end4 = performance.now();
console.log(`Baseline Time: ${(end4 - start4).toFixed(4)} ms`);


// --- AREA 5: DB Hydration Simulation ---
console.log('\n--- Area 5: DB Hydration Simulation ---');
class MockSession {
    constructor(data) {
        Object.assign(this, data);
    }
    save() { }
    toObject() { return { ...this }; }
}

const start5 = performance.now();
const hydratedDocs = sessionData.map(d => new MockSession(d));
const end5 = performance.now();
console.log(`Baseline Time (Hydration): ${(end5 - start5).toFixed(4)} ms`);
