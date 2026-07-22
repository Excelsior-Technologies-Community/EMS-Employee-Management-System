import express from "express";
import { getAllRoles, addRole } from "../controller/roleController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role Management APIs
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all roles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 */
router.get("/", verifyToken, authorizeRoles("Admin", "HR", "Manager"), getAllRoles);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Add Role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_name
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: Developer
 *     responses:
 *       201:
 *         description: Role added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 */
router.post("/", verifyToken, authorizeRoles("Admin"), addRole);

export default router;
