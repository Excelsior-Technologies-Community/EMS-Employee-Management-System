import express from 'express';
import { loginEmployee, logoutEmployee } from '../controller/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

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
router.post('/login', loginEmployee);

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