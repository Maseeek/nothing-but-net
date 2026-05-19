import React from 'react';
import { motion } from 'framer-motion';
import '../css/MagicButton.css';

const MagicButton = ({ children, onClick, className = '' }) => {
    return (
        <motion.button
            className={`premium-magic-button ${className}`}
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <div className="button-shimmer-wrap">
                <div className="button-shimmer"></div>
                <span className="button-content">
                    {children}
                </span>
            </div>
        </motion.button>
    );
};

export default MagicButton;
