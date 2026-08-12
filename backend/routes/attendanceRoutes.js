import express from "express";
import { 
    CheckIn, 
    CheckOut, 
    getAttendanceStatus, 
    getMyAttendanceHistory,
    getMonthlyReport,
    getMonthlyReportAll,
    getAllAttendance,
    saveAttendanceManual
} from "../controller/attendanceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management APIs (Check In, Check Out, and Status tracking)
 */

/**
 * @swagger
 * /api/attendance/check-in:
 *   post:
 *     summary: Record employee check-in
 *     description: Validates employee location coordinates against active office boundaries and records check-in timestamp.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude coordinates of the check-in location.
 *                 example: 23.0475
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude coordinates of the check-in location.
 *                 example: 72.5028
 *               accuracy:
 *                 type: number
 *                 format: float
 *                 description: GPS accuracy in meters.
 *                 example: 10.5
 *               employee_id:
 *                 type: integer
 *                 description: Optional employee ID. Admin or HR roles can specify a custom employee ID to check in on their behalf.
 *                 example: 3
 *     responses:
 *       200:
 *         description: Checked in successfully
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
 *                   example: Checked in successfully!
 *       400:
 *         description: Out of office range, missing parameters, or already checked in
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
 *                   example: "Check-in denied: Out of boundary. You are 600m away from Excelsior Technologies, but you must be within 500m."
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Database error or internal server failure
 */
router.post("/check-in", verifyToken, CheckIn);

/**
 * @swagger
 * /api/attendance/check-out:
 *   post:
 *     summary: Record employee check-out
 *     description: Validates employee location coordinates against active office boundaries and records check-out timestamp, automatically calculating daily work hours.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude coordinates of the check-out location.
 *                 example: 23.0475
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude coordinates of the check-out location.
 *                 example: 72.5028
 *               accuracy:
 *                 type: number
 *                 format: float
 *                 description: GPS accuracy in meters.
 *                 example: 12.0
 *               employee_id:
 *                 type: integer
 *                 description: Optional employee ID. Admin or HR roles can specify a custom employee ID to check out on their behalf.
 *                 example: 3
 *     responses:
 *       200:
 *         description: Checked out successfully
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
 *                   example: Checked out successfully!
 *       400:
 *         description: Out of office range, missing parameters, not checked in today, or already checked out
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
 *                   example: Check-out denied. You have not checked in today.
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Database error or internal server failure
 */
router.post("/check-out", verifyToken, CheckOut);

/**
 * @swagger
 * /api/attendance/status:
 *   get:
 *     summary: Retrieve today's attendance record
 *     description: Returns the today's check-in / check-out data for the employee.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Optional employee ID. Admin or HR roles can query attendance status for any employee. Defaults to the logged-in user.
 *     responses:
 *       200:
 *         description: Today's attendance retrieved successfully
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
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     employee_id:
 *                       type: integer
 *                       example: 3
 *                     attendance_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-08-07"
 *                     check_in:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-07T09:00:00.000Z"
 *                     check_out:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     work_hours:
 *                       type: number
 *                       format: float
 *                       nullable: true
 *                       example: null
 *                     status:
 *                       type: string
 *                       example: Present
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Database error or internal server failure
 */
router.get("/status", verifyToken, getAttendanceStatus);
router.get("/my", verifyToken, getMyAttendanceHistory);

/**
 * @swagger
 * /api/attendance/monthly-report:
 *   get:
 *     summary: Retrieve monthly attendance report for self
 *     description: Returns the daily breakdown and summary of attendance for the logged-in employee for a given month and year.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         required: false
 *         description: Month number (1-12). Defaults to current month.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: false
 *         description: Four-digit year. Defaults to current year.
 *     responses:
 *       200:
 *         description: Monthly attendance report retrieved successfully
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
 *                   example: Monthly attendance report retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         workingDays:
 *                           type: integer
 *                           example: 22
 *                         presentDays:
 *                           type: integer
 *                           example: 20
 *                         lateDays:
 *                           type: integer
 *                           example: 1
 *                         halfDays:
 *                           type: integer
 *                           example: 1
 *                         absentDays:
 *                           type: integer
 *                           example: 0
 *                         totalWorkHours:
 *                           type: number
 *                           example: 172.5
 *                     breakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           attendance_date:
 *                             type: string
 *                             format: date
 *                             example: "2026-08-03"
 *                           check_in:
 *                             type: string
 *                             format: date-time
 *                           check_out:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             example: Present
 *                           work_hours:
 *                             type: number
 *                           remarks:
 *                             type: string
 *       400:
 *         description: Invalid month or year query parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/monthly-report", verifyToken, getMonthlyReport);

/**
 * @swagger
 * /api/attendance/monthly-report/all:
 *   get:
 *     summary: Retrieve monthly attendance report for all active employees
 *     description: Aggregated monthly report summary per active employee. Accessible by Admin, HR, and Manager roles.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         required: false
 *         description: Month number (1-12). Defaults to current month.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: false
 *         description: Four-digit year. Defaults to current year.
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter results by department.
 *     responses:
 *       200:
 *         description: All employees monthly attendance report retrieved successfully
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
 *                   example: All employees monthly report retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       department_name:
 *                         type: string
 *                       present_days:
 *                         type: integer
 *                       late_days:
 *                         type: integer
 *                       half_days:
 *                         type: integer
 *                       marked_days:
 *                         type: integer
 *                       total_work_hours:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 *       500:
 *         description: Internal server error
 */
router.get("/monthly-report/all", verifyToken, authorizeRoles("Admin", "HR", "Manager"), getMonthlyReportAll);

router.get("/", verifyToken, authorizeRoles("Admin", "HR", "Manager"), getAllAttendance);
router.post("/manual", verifyToken, authorizeRoles("Admin", "HR"), saveAttendanceManual);

export default router;
