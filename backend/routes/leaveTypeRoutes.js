import express from "express";

import {
    addLeaveType,
    getAllLeaveTypes,
    getLeaveTypeById,
    updateLeaveType,
    deleteLeaveType
} from "../controller/leaveTypeController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Leave Types
 *   description: Leave Type Management APIs
 */

/**
 * @swagger
 * /api/leave-types:
 *   get:
 *     summary: Get all leave types
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all leave types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       leave_name:
 *                         type: string
 *                         example: Casual Leave
 *                       description:
 *                         type: string
 *                         example: Casual Leave for personal reasons
 *                       status:
 *                         type: integer
 *                         example: 1
 *                       created_by:
 *                         type: integer
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-08-14T04:25:40Z"
 *                       updated_by:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    verifyToken,
    getAllLeaveTypes
);


/**
 * @swagger
 * /api/leave-types/{id}:
 *   get:
 *     summary: Get leave type by ID
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave Type ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Leave type details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     leave_name:
 *                       type: string
 *                       example: Casual Leave
 *                     description:
 *                       type: string
 *                       example: Casual Leave for personal reasons
 *                     status:
 *                       type: integer
 *                       example: 1
 *                     created_by:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-14T04:25:40Z"
 *                     updated_by:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Invalid leave type ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave type not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:id",
    verifyToken,
    getLeaveTypeById
);


/**
 * @swagger
 * /api/leave-types:
 *   post:
 *     summary: Add Leave Type
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_name
 *             properties:
 *               leave_name:
 *                 type: string
 *                 description: Name of the leave type
 *                 example: Sick Leave
 *               description:
 *                 type: string
 *                 description: Detailed description of the leave type
 *                 example: Leave for medical/health issues
 *     responses:
 *       201:
 *         description: Leave type added successfully
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
 *                   example: Leave type added successfully.
 *       400:
 *         description: Leave name is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 *       409:
 *         description: Leave type already exists
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    verifyToken,
    authorizeRoles("Admin", "HR"),
    addLeaveType
);


/**
 * @swagger
 * /api/leave-types/{id}:
 *   put:
 *     summary: Update Leave Type
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave Type ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_name
 *             properties:
 *               leave_name:
 *                 type: string
 *                 description: Updated name of the leave type
 *                 example: Medical Leave
 *               description:
 *                 type: string
 *                 description: Updated description of the leave type
 *                 example: Leave for certified medical checkups and recovery
 *     responses:
 *       200:
 *         description: Leave type updated successfully
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
 *                   example: Leave type updated successfully.
 *       400:
 *         description: Invalid ID or missing leave name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Leave type not found
 *       409:
 *         description: Another leave type with this name already exists
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("Admin", "HR"),
    updateLeaveType
);


/**
 * @swagger
 * /api/leave-types/{id}:
 *   delete:
 *     summary: Delete Leave Type
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave Type ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Leave type deleted successfully
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
 *                   example: Leave type deleted successfully.
 *       400:
 *         description: Invalid ID or leave type already deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Leave type not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("Admin", "HR"),
    deleteLeaveType
);


export default router;