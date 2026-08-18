import express from "express";
import { 
    applyLeave, 
    getMyLeaves, 
    getLeaveById, 
    getPendingLeaves, 
    approveLeave, 
    rejectLeave,
    getAllLeaves 
} from "../controller/leaveController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leaves
 *   description: Leave application and approval management APIs
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
 *               - reason
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
 *         description: Validation error (missing fields, past dates, start date greater than end date, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Start date cannot be greater than end date."
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Leave type not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid or inactive leave type."
 *       409:
 *         description: Conflict - Overlapping leave request exists for one or more selected dates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You already have a leave request for one or more selected dates."
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    verifyToken,
    applyLeave
);

router.get(
    "/",
    verifyToken,
    authorizeRoles("Admin", "HR", "Manager"),
    getAllLeaves
);

/**
 * @swagger
 * /api/leaves/pending:
 *   get:
 *     summary: Get pending leaves
 *     description: Retrieve all pending leave applications. Admin/HR can see all leaves, while Managers can only view leaves of employees in their own department.
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending leave applications retrieved successfully
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
 *                         example: 10
 *                       employee_id:
 *                         type: integer
 *                         example: 7
 *                       employee_name:
 *                         type: string
 *                         example: "John"
 *                       employee_email:
 *                         type: string
 *                         example: "john@example.com"
 *                       department_name:
 *                         type: string
 *                         example: "IT"
 *                       leave_name:
 *                         type: string
 *                         example: "Casual Leave"
 *                       start_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-08-20"
 *                       end_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-08-22"
 *                       total_days:
 *                         type: integer
 *                         example: 3
 *                       reason:
 *                         type: string
 *                         example: "Personal work"
 *                       status:
 *                         type: string
 *                         example: "Pending"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-08-17T09:32:55.000Z"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Only Admin, HR, and Manager can access
 *       500:
 *         description: Internal server error
 */
router.get(
    "/pending",
    verifyToken,
    authorizeRoles("Admin", "HR", "Manager"),
    getPendingLeaves
);

/**
 * @swagger
 * /api/leaves/my:
 *   get:
 *     summary: Get logged-in employee's leaves
 *     description: Returns a list of all leave applications submitted by the authenticated employee.
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employee's leaves retrieved successfully
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
 *                       leave_type_id:
 *                         type: integer
 *                         example: 1
 *                       leave_name:
 *                         type: string
 *                         example: Casual Leave
 *                       start_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-08-20"
 *                       end_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-08-22"
 *                       total_days:
 *                         type: integer
 *                         example: 3
 *                       reason:
 *                         type: string
 *                         example: "Personal work"
 *                       status:
 *                         type: string
 *                         enum: [Pending, Approved, Rejected, Cancelled]
 *                         example: "Pending"
 *                       approved_by:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       approved_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-08-17T09:32:55.000Z"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get(
    "/my",
    verifyToken,
    getMyLeaves
);

/**
 * @swagger
 * /api/leaves/{id}:
 *   get:
 *     summary: Get leave application by ID
 *     description: Retrieve details of a specific leave application by ID. Only the employee who applied for the leave can view it.
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave Application ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Leave application details retrieved successfully
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
 *                     employee_id:
 *                       type: integer
 *                       example: 5
 *                     leave_type_id:
 *                       type: integer
 *                       example: 1
 *                     leave_name:
 *                       type: string
 *                       example: Casual Leave
 *                     start_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-08-20"
 *                     end_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-08-22"
 *                     total_days:
 *                       type: integer
 *                       example: 3
 *                     reason:
 *                       type: string
 *                       example: "Personal work"
 *                     status:
 *                       type: string
 *                       enum: [Pending, Approved, Rejected, Cancelled]
 *                       example: "Pending"
 *                     approved_by:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     approved_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-17T09:32:55.000Z"
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Leave application not found or does not belong to the logged-in employee
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:id",
    verifyToken,
    getLeaveById
);

/**
 * @swagger
 * /api/leaves/{id}/approve:
 *   put:
 *     summary: Approve a leave application
 *     description: Approves a pending leave application. Admin/HR can approve any leave, while Managers can only approve leaves of employees in their own department. Employees cannot approve their own leaves.
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave Application ID
 *         schema:
 *           type: integer
 *           example: 10
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approval_reason:
 *                 type: string
 *                 description: Reason for approval
 *                 example: "Approved for personal work."
 *     responses:
 *       200:
 *         description: Leave approved successfully
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
 *                   example: "Leave approved successfully."
 *       400:
 *         description: Validation error (already approved, rejected, not pending, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Leave is already approved."
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Approving own leave, or Manager approving employee from other department
 *       404:
 *         description: Leave application not found
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id/approve",
    verifyToken,
    authorizeRoles("Admin", "HR", "Manager"),
    approveLeave
);

/**
 * @swagger
 * /api/leaves/{id}/reject:
 *   put:
 *     summary: Reject a leave application
 *     description: Rejects a pending leave application. Admin/HR can reject any leave, while Managers can only reject leaves of employees in their own department. Employees cannot reject their own leaves. Rejection reason is required.
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave Application ID
 *         schema:
 *           type: integer
 *           example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejection_reason
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 description: Reason for rejection
 *                 example: "Leave cannot be approved due to workload."
 *     responses:
 *       200:
 *         description: Leave rejected successfully
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
 *                   example: "Leave rejected successfully."
 *       400:
 *         description: Validation error (missing rejection reason, already approved, rejected, not pending, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "rejection_reason is required."
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Rejecting own leave, or Manager rejecting employee from other department
 *       404:
 *         description: Leave application not found
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id/reject",
    verifyToken,
    authorizeRoles("Admin", "HR", "Manager"),
    rejectLeave
);

export default router;
