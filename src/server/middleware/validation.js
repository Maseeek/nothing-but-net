import { body, validationResult } from 'express-validator';

// Standardized error response helper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({ field: err.param, message: err.msg }))
        });
    }
    next();
};

export const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .escape(),
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
];

export const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

export const sessionValidation = [
    body('userId').isMongoId().withMessage('Invalid User ID'),
    body('makes').isInt({ min: 0 }).withMessage('Makes must be a non-negative integer'),
    body('misses').isInt({ min: 0 }).withMessage('Misses must be a non-negative integer'),
    body('total_shots').isInt({ min: 0 }).withMessage('Total shots must be a non-negative integer'),
    body('longest_streak').isInt({ min: 0 }).withMessage('Longest streak must be a non-negative integer'),
    body('fg_percentage').isFloat({ min: 0, max: 100 }).withMessage('FG Percentage must be between 0 and 100'),
    body('average_angle').isNumeric().withMessage('Average angle must be a number'),
    body('average_make_angle').isNumeric().withMessage('Average make angle must be a number'),
    body('average_miss_angle').isNumeric().withMessage('Average miss angle must be a number'),
    body('shot_angles').isArray().withMessage('Shot angles must be an array of numbers'),
    body('shots_results').isArray().withMessage('Shots results must be an array of numbers'),
    validate
];

export const analysisValidation = [
    body('totalShots').isInt({ min: 0 }).withMessage('Total shots must be a non-negative integer'),
    body('madeShots').isInt({ min: 0 }).withMessage('Made shots must be a non-negative integer'),
    body('fgPercentage').isFloat({ min: 0, max: 100 }).withMessage('FG Percentage must be between 0 and 100'),
    validate
];

export const emailValidation = [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    validate
];
