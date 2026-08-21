import express from "express";
import {
    createTeam,
    getAllTeams,
    getMyTeam,
    getTeamById,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    getTeamMembers
} from "../controller/teamController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     description: Only Admin and HR can create teams.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_name
 *               - manager_id
 *               - department_id
 *             properties:
 *               team_name:
 *                 type: string
 *                 example: Backend Team
 *               manager_id:
 *                 type: integer
 *                 example: 5
 *               department_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Team created successfully.
 *       400:
 *         description: Invalid parameters or department/manager role mismatch.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access Denied.
 *       500:
 *         description: Database error.
 *   get:
 *     summary: Get all teams
 *     description: Retrieve a list of all teams with active member count. Allowed for Admin and HR.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access Denied.
 *       500:
 *         description: Database error.
 */
router.post("/", verifyToken, authorizeRoles("Admin", "HR"), createTeam);
router.get("/", verifyToken, authorizeRoles("Admin", "HR"), getAllTeams);

/**
 * @swagger
 * /api/teams/my-team:
 *   get:
 *     summary: Get manager's own team
 *     description: Retrieve details and members of the team managed by the currently logged-in manager.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access Denied.
 *       500:
 *         description: Database error.
 */
router.get("/my-team", verifyToken, authorizeRoles("Manager"), getMyTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     description: Retrieve specific team details. Allowed for Admin and HR, and for Managers managing this team.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The team ID
 *     responses:
 *       200:
 *         description: Success.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access Denied.
 *       404:
 *         description: Team not found.
 *       500:
 *         description: Database error.
 *   put:
 *     summary: Update team details
 *     description: Allowed for Admin and HR.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_name
 *               - manager_id
 *               - department_id
 *             properties:
 *               team_name:
 *                 type: string
 *                 example: Backend Team (Updated)
 *               manager_id:
 *                 type: integer
 *                 example: 6
 *               department_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Team updated successfully.
 *       400:
 *         description: Invalid parameters or department mismatch.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access Denied.
 *       404:
 *         description: Team not found.
 *       500:
 *         description: Database error.
 */
router.get("/:id", verifyToken, authorizeRoles("Admin", "HR", "Manager"), getTeamById);
router.put("/:id", verifyToken, authorizeRoles("Admin", "HR"), updateTeam);

/**
 * @swagger
 * /api/teams/{teamId}/members:
 *   post:
 *     summary: Add employee as a team member
 *     description: Add a member to a team. Allowed for Admin, HR, and Managers managing this team.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 example: 7
 *     responses:
 *       201:
 *         description: Team member added successfully.
 *       400:
 *         description: Invalid parameters, employee inactive, or department mismatch.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access Denied.
 *       404:
 *         description: Team or Employee not found.
 *       409:
 *         description: Employee is already an active member of this team.
 *       500:
 *         description: Database error.
 *   get:
 *     summary: Get team members
 *     description: Retrieve all members of a team. Allowed for Admin, HR, and Managers managing this team.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The team ID
 *     responses:
 *       200:
 *         description: Success.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access Denied.
 *       404:
 *         description: Team not found.
 *       500:
 *         description: Database error.
 */
router.post("/:teamId/members", verifyToken, authorizeRoles("Admin", "HR", "Manager"), addTeamMember);
router.get("/:teamId/members", verifyToken, authorizeRoles("Admin", "HR", "Manager"), getTeamMembers);

/**
 * @swagger
 * /api/teams/{teamId}/members/{employeeId}:
 *   delete:
 *     summary: Remove a team member (soft removal)
 *     description: Soft removal of a team member (status = 0). Allowed for Admin, HR, and Managers managing this team.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The team ID
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The employee ID to remove
 *     responses:
 *       200:
 *         description: Team member removed successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access Denied.
 *       404:
 *         description: Team or Employee not found in team.
 *       500:
 *         description: Database error.
 */
router.delete("/:teamId/members/:employeeId", verifyToken, authorizeRoles("Admin", "HR", "Manager"), removeTeamMember);

export default router;
