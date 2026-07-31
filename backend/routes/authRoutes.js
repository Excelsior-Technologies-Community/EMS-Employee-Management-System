import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { loginEmployee, logoutEmployee, forgotPassword, verifyOTP, resetPassword } from '../controller/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';


const router = express.Router();

// Brute force protection: 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
});

// Validation middleware
const loginValidation = [
    body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required.'),
];

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Employee Login API
 *     description: Email aur password daal kar JWT Token generator karein.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@ems.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful!
 *       400:
 *         description: Invalid Email or Password
 */
router.post('/login', loginLimiter, loginValidation, handleValidation, loginEmployee);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Employee Logout API
 *     description: Log out the current employee and invalidate their session.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful!
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 */
router.post('/logout', verifyToken, logoutEmployee);

// Rate limiters for Forgot Password flow
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many forgot password requests. Please try again after 15 minutes." },
});

const verifyOTPLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many OTP verification attempts. Please try again after 15 minutes." },
});

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many password reset attempts. Please try again after 15 minutes." },
});

// Validation rules
const forgotPasswordValidation = [
    body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
];

const verifyOTPValidation = [
    body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
    body('otp').isNumeric().isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits.'),
];

const resetPasswordValidation = [
    body('resetToken').notEmpty().withMessage('Reset token is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
];

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     description: Generate and send a 6-digit OTP to the employee's registered email address.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@ems.com
 *     responses:
 *       200:
 *         description: OTP sent successfully!
 *       400:
 *         description: Invalid email or employee account is inactive.
 */
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, handleValidation, forgotPassword);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verify the 6-digit OTP sent to the employee email and return a temporary JWT reset token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@ems.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully. Returns resetToken.
 *       400:
 *         description: Invalid or expired OTP.
 */
router.post('/verify-otp', verifyOTPLimiter, verifyOTPValidation, handleValidation, verifyOTP);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Set a new password using the temporary resetToken generated during OTP verification.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: JWT token received from verify-otp endpoint.
 *               newPassword:
 *                 type: string
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successful.
 *       400:
 *         description: Token is expired, invalid, or password format is incorrect.
 */
router.post('/reset-password', resetPasswordLimiter, resetPasswordValidation, handleValidation, resetPassword);

export default router;