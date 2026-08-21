import express from "express";
import {
    getAdminDashboard,
    getHRDashboard,
    getManagerDashboard,
    getEmployeeDashboard
} from "../controller/dashboardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get Admin Dashboard data
 *     description: Retrieve key statistics for Admin role, including employees, departments, roles counts, and today's attendance summary.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
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
 *                     totalEmployees:
 *                       type: integer
 *                       example: 100
 *                     totalDepartments:
 *                       type: integer
 *                       example: 5
 *                     totalRoles:
 *                       type: integer
 *                       example: 4
 *                     activeEmployees:
 *                       type: integer
 *                       example: 92
 *                     inactiveEmployees:
 *                       type: integer
 *                       example: 8
 *                     todayPresent:
 *                       type: integer
 *                       example: 80
 *                     todayAbsent:
 *                       type: integer
 *                       example: 12
 *                     pendingLeaves:
 *                       type: integer
 *                       example: 6
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Admin role required)
 *       500:
 *         description: Internal Server Error
 */
router.get("/admin", verifyToken, authorizeRoles("Admin"), getAdminDashboard);

/**
 * @swagger
 * /api/dashboard/hr:
 *   get:
 *     summary: Get HR Dashboard data
 *     description: Retrieve key metrics for HR role, including new employee count, department-wise employee distributions, attendance summary, and leave requests statistics.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
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
 *                     totalEmployees:
 *                       type: integer
 *                       example: 100
 *                     newEmployeesThisMonth:
 *                       type: integer
 *                       example: 5
 *                     departmentWiseEmployees:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           department_id:
 *                             type: integer
 *                             example: 1
 *                           department_name:
 *                             type: string
 *                             example: IT
 *                           employee_count:
 *                             type: integer
 *                             example: 15
 *                     attendanceSummary:
 *                       type: object
 *                       properties:
 *                         present:
 *                           type: integer
 *                           example: 80
 *                         late:
 *                           type: integer
 *                           example: 5
 *                         halfDay:
 *                           type: integer
 *                           example: 2
 *                         absent:
 *                           type: integer
 *                           example: 13
 *                     leaveSummary:
 *                       type: object
 *                       properties:
 *                         approved:
 *                           type: integer
 *                           example: 10
 *                         pending:
 *                           type: integer
 *                           example: 3
 *                         rejected:
 *                           type: integer
 *                           example: 2
 *                         cancelled:
 *                           type: integer
 *                           example: 1
 *                     pendingLeaves:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (HR role required)
 *       500:
 *         description: Internal Server Error
 */
router.get("/hr", verifyToken, authorizeRoles("HR"), getHRDashboard);

/**
 * @swagger
 * /api/dashboard/manager:
 *   get:
 *     summary: Get Manager Dashboard data
 *     description: Retrieve department team metrics for Manager role, including team counts, today's attendance list, pending leave requests, and upcoming team leaves.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
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
 *                     totalTeamMembers:
 *                       type: integer
 *                       example: 10
 *                     presentTeamEmployees:
 *                       type: integer
 *                       example: 8
 *                     absentTeamEmployees:
 *                       type: integer
 *                       example: 2
 *                     todayTeamAttendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           employee_id:
 *                             type: integer
 *                             example: 4
 *                           employee_name:
 *                             type: string
 *                             example: John Doe
 *                           employee_email:
 *                             type: string
 *                             example: john@example.com
 *                           check_in:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           check_out:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           status:
 *                             type: string
 *                             example: Present
 *                           work_hours:
 *                             type: number
 *                             example: 8.5
 *                           remarks:
 *                             type: string
 *                             nullable: true
 *                     teamLeaveRequests:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: []
 *                     upcomingTeamLeaves:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: []
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Manager role required)
 *       500:
 *         description: Internal Server Error
 */
router.get("/manager", verifyToken, authorizeRoles("Manager"), getManagerDashboard);

/**
 * @swagger
 * /api/dashboard/employee:
 *   get:
 *     summary: Get Employee Dashboard data
 *     description: Retrieve personal dashboard data for the authenticated Employee user, including monthly attendance summaries, current month's attendance list, leave balances, and leave history.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
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
 *                     ownAttendanceSummary:
 *                       type: object
 *                       properties:
 *                         workingDays:
 *                           type: integer
 *                           example: 20
 *                         presentDays:
 *                           type: integer
 *                           example: 18
 *                         lateDays:
 *                           type: integer
 *                           example: 1
 *                         halfDays:
 *                           type: integer
 *                           example: 0
 *                         absentDays:
 *                           type: integer
 *                           example: 1
 *                         totalWorkHours:
 *                           type: number
 *                           example: 153.5
 *                     currentMonthAttendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                     leaveBalance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           leave_type:
 *                             type: string
 *                             example: Casual Leave
 *                           allocated_days:
 *                             type: integer
 *                             example: 12
 *                           used_days:
 *                             type: integer
 *                             example: 4
 *                           remaining_days:
 *                             type: integer
 *                             example: 8
 *                     pendingLeaveRequests:
 *                       type: array
 *                       items:
 *                         type: object
 *                     approvedLeaveHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                     rejectedLeaveHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Forbidden for non-Employee users)
 *       500:
 *         description: Internal Server Error
 */
router.get("/employee", verifyToken, authorizeRoles("Employee"), getEmployeeDashboard);

export default router;
