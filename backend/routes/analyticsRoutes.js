import express from "express";
import {
    getEmployeesByDepartment,
    getEmployeesByRole,
    getMonthlyEmployeeJoining,
    getMonthlyAttendanceStats,
    getMonthlyLeaveStats,
    getEmployeeStatusStats
} from "../controller/analyticsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply auth middlewares to all analytics routes
router.use(verifyToken);
router.use(authorizeRoles("Admin", "HR"));

/**
 * @swagger
 * /api/analytics/employees-by-department:
 *   get:
 *     summary: Get Employee count by Department
 *     description: Retrieve active employee counts grouped by department, with optional role filter.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter employees by role ID.
 *     responses:
 *       200:
 *         description: Success
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
 *                       department_id:
 *                         type: integer
 *                         example: 1
 *                       department_name:
 *                         type: string
 *                         example: IT
 *                       employee_count:
 *                         type: integer
 *                         example: 8
 *       400:
 *         description: Bad Request (Invalid parameters)
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Admin or HR role required)
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/employees-by-department", getEmployeesByDepartment);

/**
 * @swagger
 * /api/analytics/employees-by-role:
 *   get:
 *     summary: Get Employee count by Role
 *     description: Retrieve active employee counts grouped by role, with optional department filter.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter employees by department ID.
 *     responses:
 *       200:
 *         description: Success
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
 *                       role_name:
 *                         type: string
 *                         example: Admin
 *                       employee_count:
 *                         type: integer
 *                         example: 1
 *       400:
 *         description: Bad Request (Invalid parameters)
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Admin or HR role required)
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/employees-by-role", getEmployeesByRole);

/**
 * @swagger
 * /api/analytics/employee-joining:
 *   get:
 *     summary: Get Monthly Employee Joining Statistics
 *     description: Retrieve month-wise statistics on newly joined employees with optional filters.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date in YYYY-MM-DD format (inclusive).
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date in YYYY-MM-DD format (inclusive).
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by department ID.
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by role ID.
 *     responses:
 *       200:
 *         description: Success
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
 *                       month:
 *                         type: string
 *                         example: "2026-01"
 *                       employee_count:
 *                         type: integer
 *                         example: 3
 *       400:
 *         description: Bad Request (Invalid parameters)
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Admin or HR role required)
 *       404:
 *         description: Department or Role not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/employee-joining", getMonthlyEmployeeJoining);

/**
 * @swagger
 * /api/analytics/attendance:
 *   get:
 *     summary: Get Monthly Attendance Statistics
 *     description: Retrieve monthly aggregation of attendance statuses (Present, Late, Half Day, Absent) for employees with optional filters.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date in YYYY-MM-DD format (inclusive).
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date in YYYY-MM-DD format (inclusive).
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by department ID.
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by employee ID (regular employees only).
 *     responses:
 *       200:
 *         description: Success
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
 *                       month:
 *                         type: string
 *                         example: "2026-07"
 *                       present:
 *                         type: integer
 *                         example: 120
 *                       late:
 *                         type: integer
 *                         example: 15
 *                       half_day:
 *                         type: integer
 *                         example: 4
 *                       absent:
 *                         type: integer
 *                         example: 20
 *       400:
 *         description: Bad Request (Invalid parameters or non-regular Employee filter)
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Admin or HR role required)
 *       404:
 *         description: Department or Employee not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/attendance", getMonthlyAttendanceStats);

/**
 * @swagger
 * /api/analytics/leaves:
 *   get:
 *     summary: Get Monthly Leave Statistics
 *     description: Retrieve monthly counts of leave requests by status (Pending, Approved, Rejected, Cancelled) based on creation date with optional filters.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date in YYYY-MM-DD format (inclusive).
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date in YYYY-MM-DD format (inclusive).
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by department ID.
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by employee ID.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected, Cancelled]
 *         required: false
 *         description: Filter leaves by status.
 *     responses:
 *       200:
 *         description: Success
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
 *                       month:
 *                         type: string
 *                         example: "2026-07"
 *                       pending:
 *                         type: integer
 *                         example: 4
 *                       approved:
 *                         type: integer
 *                         example: 15
 *                       rejected:
 *                         type: integer
 *                         example: 2
 *                       cancelled:
 *                         type: integer
 *                         example: 1
 *       400:
 *         description: Bad Request (Invalid parameters or invalid status enum value)
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Admin or HR role required)
 *       404:
 *         description: Department or Employee not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/leaves", getMonthlyLeaveStats);

/**
 * @swagger
 * /api/analytics/employee-status:
 *   get:
 *     summary: Get Active vs Inactive Employee Statistics
 *     description: Retrieve counts of active vs inactive employees with optional filters.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by department ID.
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by role ID.
 *     responses:
 *       200:
 *         description: Success
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
 *                     active:
 *                       type: integer
 *                       example: 17
 *                     inactive:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Bad Request (Invalid parameters)
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Admin or HR role required)
 *       404:
 *         description: Department or Role not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/employee-status", getEmployeeStatusStats);

export default router;
