import React from 'react';
import { motion } from 'framer-motion';
import '../../css/LiquidGlassGraph.css';

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
    const madeRatio = safeMade / calcTotal;
    const missedRatio = safeMissed / calcTotal;

    const madeOffset = circumference - (madeRatio * circumference);
    const missedOffset = circumference - (missedRatio * circumference);

    // 4. Animation Config
    const springTransition = { type: "spring", stiffness: 100, damping: 20, mass: 1 };

    return (
        <div className="liquid-graph-wrapper">
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

            {/* The Chart SVG */}
            <div className="chart-svg-container"
                style={{
                    width: size,
                    height: size,
                }}>

                {/* The Badge/Stats in Center */}
                <div className="stats-overlay">
                    <div className="stats-badge">
                        <span className="fg-percent-value">
                            {total > 0 ? Math.round((safeMade / total) * 100) : 0}%
                        </span>
                        <span className="fg-percent-label">FG Percent</span>
                    </div>
                </div>

                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track (Glass Tube Background) */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth={strokeWidth}
                    />

                    {/* MISSED Arc (Ruby Red) */}
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
                            rotate: (madeRatio * 360) 
                        }}
                        transition={springTransition}
                        style={{
                            filter: 'url(#doughnut-goo)',
                            opacity: 0.8
                        }}
                    />

                    {/* MADE Arc (Emerald Green) */}
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
                            opacity: 0.9,
                            filter: 'url(#doughnut-goo) drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))'
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
            <div className="legend-container">
                <div className="legend-item">
                    <div className="legend-color-dot made"></div>
                    <span className="legend-text">Made ({safeMade})</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color-dot missed"></div>
                    <span className="legend-text">Missed ({safeMissed})</span>
                </div>
            </div>
        </div>
    );
};

export default LiquidGlassGraph;
