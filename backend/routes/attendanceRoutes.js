import express from "express";
import { CheckIn, CheckOut, getAttendanceStatus, getMyAttendanceHistory } from "../controller/attendanceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

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

export default router;
