import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { loginEmployee, logoutEmployee } from '../controller/authController.js';
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

export default router;