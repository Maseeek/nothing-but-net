
import { performance } from 'perf_hooks';

// Generate Mock Data
const N = 10000;
const sessionData = Array.from({ length: N }, (_, i) => ({
    makes: Math.floor(Math.random() * 50),
    misses: Math.floor(Math.random() * 50),
    longest_streak: Math.floor(Math.random() * 10),
    sessionDate: new Date().toISOString(),
    fg_percentage: Math.random() * 100,
    shot_angles: new Array(100).fill(0),
    shots_results: new Array(100).fill(0)
}));
// Lean data for optimizations
const leanSessionData = sessionData.map(({ makes, misses, longest_streak, sessionDate, fg_percentage }) => ({
    makes, misses, longest_streak, sessionDate, fg_percentage
}));


// --- AREA 1: Profile Stats Calculation (Optimized) ---
console.log('--- Area 1: Profile Stats Calculation (Optimized) ---');
const start1 = performance.now();

let totalMakes = 0;
let totalMisses = 0;
let overallLongestStreak = 0;

for (let i = 0; i < sessionData.length; i++) {
    const session = sessionData[i];
    totalMakes += (session.makes || 0);
    totalMisses += (session.misses || 0);
    const streak = session.longest_streak || 0;
    if (streak > overallLongestStreak) overallLongestStreak = streak;
}

const end1 = performance.now();
console.log(`Optimized Time: ${(end1 - start1).toFixed(4)} ms`);


// --- AREA 2: Profile Chart Data Prep (Optimized) ---
console.log('\n--- Area 2: Profile Chart Data Prep (Optimized) ---');
const sessions = sessionData;
const start2 = performance.now();

const labels = new Array(sessions.length);
const makesData = new Array(sessions.length);
const missesData = new Array(sessions.length);
const fgPercentageData = new Array(sessions.length);

for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    labels[i] = new Date(session.sessionDate).toLocaleDateString();
    makesData[i] = session.makes || 0;
    missesData[i] = session.misses || 0;
    fgPercentageData[i] = session.fg_percentage || 0;
}

const end2 = performance.now();
console.log(`Optimized Time: ${(end2 - start2).toFixed(4)} ms`);


// --- AREA 3: Server Serialization (Optimized) ---
console.log('\n--- Area 3: Server Serialization (Optimized) ---');
// Optimize: Send only necessary fields
const start3 = performance.now();
const jsonOptimized = JSON.stringify(leanSessionData);
const end3 = performance.now();
console.log(`Optimized Time (Lean Object): ${(end3 - start3).toFixed(4)} ms`);
console.log(`Payload Size: ${(jsonOptimized.length / 1024).toFixed(2)} KB`);


// --- AREA 4: DB Graph Data (Optimized) ---
console.log('\n--- Area 4: DB Graph Data (Optimized) ---');
const start4 = performance.now();
// Optimized: DB returns exactly what we need, so no mapping required or trivial mapping
// We simulate this by iterating the lean data which represents the DB result
const graphDataOptimized = leanSessionData;
const end4 = performance.now();
console.log(`Optimized Time: ${(end4 - start4).toFixed(4)} ms`); // Should be near 0 or just reference assignment


// --- AREA 5: DB Hydration (Optimized) ---
console.log('\n--- Area 5: DB Hydration (Optimized) ---');
const start5 = performance.now();
// Optimized: Use .lean(), so we get plain objects. No instantiation.
const plainDocs = leanSessionData; // Already plain objects
const end5 = performance.now();
console.log(`Optimized Time (No Hydration): ${(end5 - start5).toFixed(4)} ms`);
