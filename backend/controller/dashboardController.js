import db from "../config/db.js";

/**
 * Get Admin Dashboard data
 */
export const getAdminDashboard = async (req, res) => {
    try {
        const [rows] = await db.query("CALL SP_GetAdminDashboard()");
        const stats = rows[0][0];

        return res.status(200).json({
            success: true,
            data: {
                totalEmployees: stats.totalEmployees || 0,
                totalDepartments: stats.totalDepartments || 0,
                totalRoles: stats.totalRoles || 0,
                activeEmployees: stats.activeEmployees || 0,
                inactiveEmployees: stats.inactiveEmployees || 0,
                todayPresent: stats.todayPresent || 0,
                todayAbsent: stats.todayAbsent || 0,
                pendingLeaves: stats.pendingLeaves || 0
            }
        });
    } catch (error) {
        console.error("Error in getAdminDashboard:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * Get HR Dashboard data
 */
export const getHRDashboard = async (req, res) => {
    try {
        const [resultSets] = await db.query("CALL SP_GetHRDashboard()");
        
        const basicCounters = resultSets[0][0] || {};
        const departmentWise = resultSets[1] || [];
        const attendanceSummary = resultSets[2][0] || {};
        const leaveSummary = resultSets[3][0] || {};

        return res.status(200).json({
            success: true,
            data: {
                totalEmployees: basicCounters.totalEmployees || 0,
                newEmployeesThisMonth: basicCounters.newEmployeesThisMonth || 0,
                departmentWiseEmployees: departmentWise,
                attendanceSummary: {
                    present: attendanceSummary.present || 0,
                    late: attendanceSummary.late || 0,
                    halfDay: attendanceSummary.halfDay || 0,
                    absent: attendanceSummary.absent || 0
                },
                leaveSummary: {
                    approved: leaveSummary.approved || 0,
                    pending: leaveSummary.pending || 0,
                    rejected: leaveSummary.rejected || 0,
                    cancelled: leaveSummary.cancelled || 0
                },
                pendingLeaves: basicCounters.pendingLeaves || 0
            }
        });
    } catch (error) {
        console.error("Error in getHRDashboard:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * Get Manager Dashboard data
 */
export const getManagerDashboard = async (req, res) => {
    try {
        const managerId = req.user.id;

        const [resultSets] = await db.query("CALL SP_GetManagerDashboard(?)", [managerId]);

        const summary = resultSets[0][0] || {};
        const todayTeamAttendance = resultSets[1] || [];
        const teamLeaveRequests = resultSets[2] || [];
        const upcomingTeamLeaves = resultSets[3] || [];

        return res.status(200).json({
            success: true,
            data: {
                totalTeamMembers: summary.totalTeamMembers || 0,
                presentTeamEmployees: summary.presentTeamEmployees || 0,
                absentTeamEmployees: summary.absentTeamEmployees || 0,
                todayTeamAttendance,
                teamLeaveRequests,
                upcomingTeamLeaves
            }
        });
    } catch (error) {
        console.error("Error in getManagerDashboard:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * Get Employee Dashboard data
 */
export const getEmployeeDashboard = async (req, res) => {
    try {
        // Security requirement: Ensure the logged-in user is a normal Employee
        if (req.user.role !== "Employee") {
            return res.status(403).json({
                success: false,
                message: "Access Denied. Employee dashboard is only accessible to employees."
            });
        }

        const employeeId = req.user.id;

        const [resultSets] = await db.query("CALL SP_GetEmployeeDashboard(?)", [employeeId]);

        const summary = resultSets[0][0] || {};
        const currentMonthAttendance = resultSets[1] || [];
        const leaveBalance = resultSets[2] || [];
        const pendingLeaveRequests = resultSets[3] || [];
        const approvedLeaveHistory = resultSets[4] || [];
        const rejectedLeaveHistory = resultSets[5] || [];

        return res.status(200).json({
            success: true,
            data: {
                ownAttendanceSummary: {
                    workingDays: summary.workingDays || 0,
                    presentDays: summary.presentDays || 0,
                    lateDays: summary.lateDays || 0,
                    halfDays: summary.halfDays || 0,
                    absentDays: summary.absentDays || 0,
                    totalWorkHours: parseFloat(summary.totalWorkHours || 0)
                },
                currentMonthAttendance,
                leaveBalance,
                pendingLeaveRequests,
                approvedLeaveHistory,
                rejectedLeaveHistory
            }
        });
    } catch (error) {
        console.error("Error in getEmployeeDashboard:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};
