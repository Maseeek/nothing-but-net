import React from 'react';
import { motion } from 'framer-motion';

const LiquidGlassGraph = ({ made = 0, missed = 0 }) => {
    // 1. Safe data handling
    const safeMade = Math.max(0, made);
    const safeMissed = Math.max(0, missed);
    const total = safeMade + safeMissed;

    // Default to 1 total to avoid divide-by-zero for initial rendering
    const calcTotal = total === 0 ? 1 : total;

    // 2. SVG Configuration
    const size = 300;
    const center = size / 2;
    const strokeWidth = 30; // Thicker glass tube
    const radius = (size - strokeWidth) / 2 - 10; // Padding
    const circumference = 2 * Math.PI * radius;

    // 3. Segment Calculations
    // We'll stack them: Green starts at -90deg (top). Red follows Green.
    const madeRatio = safeMade / calcTotal;
    const missedRatio = safeMissed / calcTotal;

    const madeOffset = circumference - (madeRatio * circumference);
    const missedOffset = circumference - (missedRatio * circumference); // This needs to be offset by Made's rotation? 
    // Actually, distinct arcs are easier with rotation.

    // 4. Animation Config
    const springTransition = { type: "spring", stiffness: 100, damping: 20, mass: 1 };

    return (
        <div className="relative flex flex-col items-center justify-center p-8">
            {/* Gooey Filter */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="doughnut-goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                    {/* Glass Gradients */}
                    <linearGradient id="glass-shine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                    </linearGradient>
                </defs>
            </svg>

            {/* The Badge/Stats in Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <div className="text-center backdrop-blur-sm bg-black/20 p-4 rounded-full border border-white/10">
                    <span className="block text-4xl font-bold text-white drop-shadow-lg font-heading">
                        {total > 0 ? Math.round((safeMade / total) * 100) : 0}%
                    </span>
                    <span className="text-xs text-green-400 font-bold tracking-wider uppercase">FG Percent</span>
                </div>
            </div>

            {/* The Chart SVG */}
            <div className="relative rounded-full shadow-2xl overflow-hidden"
                style={{
                    width: size,
                    height: size,
                    boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>

                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Track (Glass Tube Background) */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth={strokeWidth}
                    />

                    {/* MISSED Arc (Ruby Red) - Background Layer */}
                    {/* We draw this as a full circle masked, or just the segment? 
                        Let's render it starting after Green? 
                        Simpler: Render it fully, but rotate it so it starts where Green ends. */}
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#EF4444" // Ruby Red
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{
                            strokeDashoffset: missedOffset,
                            rotate: (madeRatio * 360) // Start where Missed ends? No, rotate by Made degrees
                        }}
                        transition={springTransition}
                        style={{
                            filter: 'url(#doughnut-goo)',
                            opacity: 0.8
                        }}
                    />

                    {/* MADE Arc (Emerald Green) - Foreground Layer */}
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#10B981" // Emerald Green
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: madeOffset }}
                        transition={springTransition}
                        style={{
                            filter: 'url(#doughnut-goo)',
                            opacity: 0.9,
                            filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))'
                        }}
                    />

                    {/* Glass Specular Overlay */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="url(#glass-shine)"
                        strokeWidth={strokeWidth}
                        style={{ opacity: 0.3, pointerEvents: 'none' }}
                    />
                </svg>
            </div>

            {/* Legend */}
            <div className="flex gap-8 mt-8">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-gray-300 font-medium">Made ({safeMade})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                    <span className="text-gray-300 font-medium">Missed ({safeMissed})</span>
                </div>
            </div>
        </div>
    );
};

export default LiquidGlassGraph;
