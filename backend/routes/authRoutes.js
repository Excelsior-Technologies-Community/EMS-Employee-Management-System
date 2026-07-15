import express from 'express';
import { loginEmployee } from '../controller/authController.js';

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

export default router;