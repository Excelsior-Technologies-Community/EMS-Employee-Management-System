import express from "express";
import { applyLeave } from "../controller/leaveController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leaves
 *   description: Leave application management APIs
 */

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Apply for leave
 *     description: Submits a new leave application. The employee ID is automatically resolved from the authenticated user token.
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_type_id
 *               - start_date
 *               - end_date
 *             properties:
 *               leave_type_id:
 *                 type: integer
 *                 description: ID of the leave type
 *                 example: 1
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Start date of the leave (YYYY-MM-DD)
 *                 example: "2026-08-20"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date of the leave (YYYY-MM-DD)
 *                 example: "2026-08-22"
 *               reason:
 *                 type: string
 *                 description: Reason for requesting the leave
 *                 example: "Personal work"
 *     responses:
 *       201:
 *         description: Leave application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Leave application submitted successfully.
 *       400:
 *         description: Missing or invalid parameters, inactive leave type, or invalid date range
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Leave type not found
 *       409:
 *         description: Overlapping pending or approved leave exists for the same period
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    verifyToken,
    applyLeave
);

export default router;
