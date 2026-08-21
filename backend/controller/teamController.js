import db from "../config/db.js";

/**
 * Helper to fetch team details and verify authorization for Manager
 */
async function getTeamDetailsAndVerify(teamId, user, res) {
    const [teamRows] = await db.query("CALL SP_GetTeamById(?)", [teamId]);
    const team = teamRows[0][0];
    if (!team) {
        res.status(404).json({ success: false, message: "Team not found." });
        return null;
    }

    // Manager can only access their own team
    if (user.role === "Manager" && team.manager_id !== user.id) {
        res.status(403).json({ success: false, message: "Access Denied. You do not manage this team." });
        return null;
    }

    return team;
}

/**
 * POST /api/teams
 * Create a team (Admin, HR)
 */
export const createTeam = async (req, res) => {
    try {
        const { team_name, manager_id, department_id } = req.body;
        const created_by = req.user.id;

        if (!team_name || !manager_id || !department_id) {
            return res.status(400).json({
                success: false,
                message: "team_name, manager_id, and department_id are required."
            });
        }

        // Validate manager exists, active, and has Manager role
        const [empRows] = await db.query("CALL SP_GetEmployeeById(?)", [manager_id]);
        const manager = empRows[0][0];
        if (!manager) {
            return res.status(400).json({ success: false, message: "Manager not found." });
        }
        if (manager.status !== 1) {
            return res.status(400).json({ success: false, message: "Assigned manager must be an active employee." });
        }
        if (manager.role_name !== "Manager") {
            return res.status(400).json({ success: false, message: "Assigned employee must have the Manager role." });
        }

        // Validate department exists and is active
        const [deptRows] = await db.query("SELECT status FROM departments WHERE id = ?", [department_id]);
        if (deptRows.length === 0) {
            return res.status(400).json({ success: false, message: "Department not found." });
        }
        if (deptRows[0].status === 0) {
            return res.status(400).json({ success: false, message: "Assigned department is inactive." });
        }

        // Verify manager department equals team department
        if (manager.department_id !== parseInt(department_id)) {
            return res.status(400).json({
                success: false,
                message: "Manager must belong to the same department as the team."
            });
        }

        // Create Team
        await db.query("CALL SP_CreateTeam(?, ?, ?, ?)", [
            team_name,
            manager_id,
            department_id,
            created_by
        ]);

        return res.status(201).json({
            success: true,
            message: "Team created successfully."
        });
    } catch (error) {
        console.error("Error in createTeam:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * GET /api/teams
 * Get all teams (Admin, HR)
 */
export const getAllTeams = async (req, res) => {
    try {
        const [rows] = await db.query("CALL SP_GetAllTeams()");
        return res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error("Error in getAllTeams:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * GET /api/teams/my-team
 * Get manager's own team (Manager only)
 */
export const getMyTeam = async (req, res) => {
    try {
        const managerId = req.user.id;

        // Fetch team details managed by this manager
        const [teamRows] = await db.query("CALL SP_GetManagerTeam(?)", [managerId]);
        const teams = teamRows[0];

        if (!teams || teams.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    teams: []
                },
                message: "You are not managing any active team currently."
            });
        }

        const teamsWithMembers = [];
        for (const team of teams) {
            const [memberRows] = await db.query("CALL SP_GetTeamMembers(?)", [team.team_id]);
            const activeMembers = memberRows[0]
                .filter(m => m.status === 1)
                .map(m => ({
                    employee_id: m.employee_id,
                    name: m.name,
                    email: m.email
                }));
            teamsWithMembers.push({
                team_id: team.team_id,
                team_name: team.team_name,
                department_name: team.department_name,
                members: activeMembers
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                teams: teamsWithMembers
            }
        });
    } catch (error) {
        console.error("Error in getMyTeam:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * GET /api/teams/:id
 * Get team by ID (Admin, HR, Manager)
 */
export const getTeamById = async (req, res) => {
    try {
        const teamId = parseInt(req.params.id);
        const team = await getTeamDetailsAndVerify(teamId, req.user, res);
        if (!team) return; // Response handled inside helper

        // Fetch members
        const [memberRows] = await db.query("CALL SP_GetTeamMembers(?)", [teamId]);
        const members = memberRows[0];

        return res.status(200).json({
            success: true,
            data: {
                ...team,
                members
            }
        });
    } catch (error) {
        console.error("Error in getTeamById:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * PUT /api/teams/:id
 * Update team (Admin, HR)
 */
export const updateTeam = async (req, res) => {
    try {
        const teamId = parseInt(req.params.id);
        const { team_name, manager_id, department_id } = req.body;
        const updated_by = req.user.id;

        if (!team_name || !manager_id || !department_id) {
            return res.status(400).json({
                success: false,
                message: "team_name, manager_id, and department_id are required."
            });
        }

        // Verify team exists
        const [teamRows] = await db.query("CALL SP_GetTeamById(?)", [teamId]);
        const team = teamRows[0][0];
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found." });
        }

        // Validate manager exists, active, and has Manager role
        const [empRows] = await db.query("CALL SP_GetEmployeeById(?)", [manager_id]);
        const manager = empRows[0][0];
        if (!manager) {
            return res.status(400).json({ success: false, message: "Manager not found." });
        }
        if (manager.status !== 1) {
            return res.status(400).json({ success: false, message: "Assigned manager must be an active employee." });
        }
        if (manager.role_name !== "Manager") {
            return res.status(400).json({ success: false, message: "Assigned employee must have the Manager role." });
        }

        // Validate department exists and is active
        const [deptRows] = await db.query("SELECT status FROM departments WHERE id = ?", [department_id]);
        if (deptRows.length === 0) {
            return res.status(400).json({ success: false, message: "Department not found." });
        }
        if (deptRows[0].status === 0) {
            return res.status(400).json({ success: false, message: "Assigned department is inactive." });
        }

        // Verify manager department equals team department
        if (manager.department_id !== parseInt(department_id)) {
            return res.status(400).json({
                success: false,
                message: "Manager must belong to the same department as the team."
            });
        }

        // Update Team
        await db.query("CALL SP_UpdateTeam(?, ?, ?, ?, ?)", [
            teamId,
            team_name,
            manager_id,
            department_id,
            updated_by
        ]);

        return res.status(200).json({
            success: true,
            message: "Team updated successfully."
        });
    } catch (error) {
        console.error("Error in updateTeam:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * POST /api/teams/:teamId/members
 * Add team member (Admin, HR, Manager own team only)
 */
export const addTeamMember = async (req, res) => {
    try {
        const teamId = parseInt(req.params.teamId);
        const { employee_id } = req.body;
        const created_by = req.user.id;

        if (!employee_id) {
            return res.status(400).json({ success: false, message: "employee_id is required." });
        }

        // Verify team exists and get details
        const [teamRows] = await db.query("CALL SP_GetTeamById(?)", [teamId]);
        const team = teamRows[0][0];
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found." });
        }

        // RBAC: Manager can only add members to their own team
        if (req.user.role === "Manager" && team.manager_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "Access Denied. You do not manage this team." });
        }

        // Fetch employee
        const [empRows] = await db.query("CALL SP_GetEmployeeById(?)", [employee_id]);
        const employee = empRows[0][0];
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        // Business Rules checks
        if (employee.status !== 1) {
            return res.status(400).json({ success: false, message: "Cannot add an inactive employee to a team." });
        }
        if (employee.role_name !== "Employee") {
            return res.status(400).json({ success: false, message: "Only employees with the Employee role can be added as team members." });
        }
        if (employee.department_id !== team.department_id) {
            return res.status(400).json({ success: false, message: "Employee must belong to the same department as the team." });
        }

        // Check if already an active member of this team
        const [existing] = await db.query(
            "SELECT status FROM team_members WHERE team_id = ? AND employee_id = ?",
            [teamId, employee_id]
        );

        if (existing.length > 0 && existing[0].status === 1) {
            return res.status(409).json({
                success: false,
                message: "Employee is already a member of this team."
            });
        }

        // Add / Reactivate member
        await db.query("CALL SP_AddTeamMember(?, ?, ?)", [teamId, employee_id, created_by]);

        return res.status(201).json({
            success: true,
            message: "Team member added successfully."
        });
    } catch (error) {
        console.error("Error in addTeamMember:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * DELETE /api/teams/:teamId/members/:employeeId
 * Remove team member (Admin, HR, Manager own team only)
 */
export const removeTeamMember = async (req, res) => {
    try {
        const teamId = parseInt(req.params.teamId);
        const employeeId = parseInt(req.params.employeeId);
        const updated_by = req.user.id;

        // Verify team exists and get details
        const [teamRows] = await db.query("CALL SP_GetTeamById(?)", [teamId]);
        const team = teamRows[0][0];
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found." });
        }

        // RBAC: Manager can only remove members from their own team
        if (req.user.role === "Manager" && team.manager_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "Access Denied. You do not manage this team." });
        }

        // Check if they are currently a member
        const [existing] = await db.query(
            "SELECT status FROM team_members WHERE team_id = ? AND employee_id = ?",
            [teamId, employeeId]
        );

        if (existing.length === 0 || existing[0].status === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee is not a member of this team."
            });
        }

        // Soft-remove team member
        await db.query("CALL SP_RemoveTeamMember(?, ?, ?)", [teamId, employeeId, updated_by]);

        return res.status(200).json({
            success: true,
            message: "Team member removed successfully."
        });
    } catch (error) {
        console.error("Error in removeTeamMember:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * GET /api/teams/:teamId/members
 * Get team members list (Admin, HR, Manager own team only)
 */
export const getTeamMembers = async (req, res) => {
    try {
        const teamId = parseInt(req.params.teamId);
        const team = await getTeamDetailsAndVerify(teamId, req.user, res);
        if (!team) return; // Response handled inside helper

        const [memberRows] = await db.query("CALL SP_GetTeamMembers(?)", [teamId]);
        return res.status(200).json({
            success: true,
            data: memberRows[0]
        });
    } catch (error) {
        console.error("Error in getTeamMembers:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};
