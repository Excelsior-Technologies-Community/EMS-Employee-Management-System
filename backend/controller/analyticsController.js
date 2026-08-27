import db from "../config/db.js";

/**
 * Helper to validate if a string matches YYYY-MM-DD and represents a valid calendar date.
 */
const validateDate = (dateStr) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && 
           date.getUTCMonth() === month - 1 && 
           date.getUTCDate() === day;
};

/**
 * Helper to validate if a string represents a valid positive integer.
 */
const validateId = (idStr) => {
    const val = Number(idStr);
    return Number.isInteger(val) && val > 0 && String(val) === String(idStr);
};

/**
 * Get active employee counts grouped by department
 * GET /api/analytics/employees-by-department
 */
export const getEmployeesByDepartment = async (req, res) => {
    try {
        const { role_id } = req.query;
        let parsedRoleId = null;

        if (role_id) {
            if (!validateId(role_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role_id."
                });
            }
            parsedRoleId = parseInt(role_id, 10);
            const [roleRows] = await db.query("CALL SP_GetRoleById(?)", [parsedRoleId]);
            if (!roleRows[0] || roleRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found."
                });
            }
        }

        const [rows] = await db.query("CALL SP_GetEmployeesByDepartment(?)", [parsedRoleId]);
        const data = rows[0] || [];

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getEmployeesByDepartment:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * Get active employee counts grouped by role
 * GET /api/analytics/employees-by-role
 */
export const getEmployeesByRole = async (req, res) => {
    try {
        const { department_id } = req.query;
        let parsedDeptId = null;

        if (department_id) {
            if (!validateId(department_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department_id."
                });
            }
            parsedDeptId = parseInt(department_id, 10);
            const [deptRows] = await db.query("CALL SP_GetDepartmentById(?)", [parsedDeptId]);
            if (!deptRows[0] || deptRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found."
                });
            }
        }

        const [rows] = await db.query("CALL SP_GetEmployeesByRole(?)", [parsedDeptId]);
        const data = rows[0] || [];

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getEmployeesByRole:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * Get monthly employee joining statistics
 * GET /api/analytics/employee-joining
 */
export const getMonthlyEmployeeJoining = async (req, res) => {
    try {
        const { start_date, end_date, department_id, role_id } = req.query;

        if (start_date && !validateDate(start_date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid start date format. Must be YYYY-MM-DD."
            });
        }
        if (end_date && !validateDate(end_date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid end date format. Must be YYYY-MM-DD."
            });
        }
        if (start_date && end_date && start_date > end_date) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after end date."
            });
        }

        let parsedDeptId = null;
        if (department_id) {
            if (!validateId(department_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department_id."
                });
            }
            parsedDeptId = parseInt(department_id, 10);
            const [deptRows] = await db.query("CALL SP_GetDepartmentById(?)", [parsedDeptId]);
            if (!deptRows[0] || deptRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found."
                });
            }
        }

        let parsedRoleId = null;
        if (role_id) {
            if (!validateId(role_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role_id."
                });
            }
            parsedRoleId = parseInt(role_id, 10);
            const [roleRows] = await db.query("CALL SP_GetRoleById(?)", [parsedRoleId]);
            if (!roleRows[0] || roleRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found."
                });
            }
        }

        const [rows] = await db.query(
            "CALL SP_GetMonthlyEmployeeJoining(?, ?, ?, ?)",
            [
                start_date || null,
                end_date || null,
                parsedDeptId,
                parsedRoleId
            ]
        );
        const data = rows[0] || [];

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getMonthlyEmployeeJoining:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * Get monthly attendance statistics (Present, Late, Half Day, Absent counts) for Employees
 * GET /api/analytics/attendance
 */
export const getMonthlyAttendanceStats = async (req, res) => {
    try {
        const { start_date, end_date, department_id, employee_id } = req.query;

        if (start_date && !validateDate(start_date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid start date format. Must be YYYY-MM-DD."
            });
        }
        if (end_date && !validateDate(end_date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid end date format. Must be YYYY-MM-DD."
            });
        }
        if (start_date && end_date && start_date > end_date) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after end date."
            });
        }

        let parsedDeptId = null;
        if (department_id) {
            if (!validateId(department_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department_id."
                });
            }
            parsedDeptId = parseInt(department_id, 10);
            const [deptRows] = await db.query("CALL SP_GetDepartmentById(?)", [parsedDeptId]);
            if (!deptRows[0] || deptRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found."
                });
            }
        }

        let parsedEmpId = null;
        if (employee_id) {
            if (!validateId(employee_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee_id."
                });
            }
            parsedEmpId = parseInt(employee_id, 10);
            const [empRows] = await db.query("CALL SP_GetEmployeeById(?)", [parsedEmpId]);
            if (!empRows[0] || empRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found."
                });
            }
            // Check if regular employee (role_name = 'Employee')
            const emp = empRows[0][0];
            if (emp.role_name !== "Employee") {
                return res.status(400).json({
                    success: false,
                    message: "Attendance analytics is only available for regular employees."
                });
            }
        }

        const [rows] = await db.query(
            "CALL SP_GetMonthlyAttendanceStats(?, ?, ?, ?)",
            [
                start_date || null,
                end_date || null,
                parsedDeptId,
                parsedEmpId
            ]
        );
        const data = rows[0] || [];

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getMonthlyAttendanceStats:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * Get monthly leave statistics (Pending, Approved, Rejected, Cancelled counts)
 * GET /api/analytics/leaves
 */
export const getMonthlyLeaveStats = async (req, res) => {
    try {
        const { start_date, end_date, department_id, employee_id, status } = req.query;

        if (start_date && !validateDate(start_date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid start date format. Must be YYYY-MM-DD."
            });
        }
        if (end_date && !validateDate(end_date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid end date format. Must be YYYY-MM-DD."
            });
        }
        if (start_date && end_date && start_date > end_date) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after end date."
            });
        }

        if (status && !["Pending", "Approved", "Rejected", "Cancelled"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave status."
            });
        }

        let parsedDeptId = null;
        if (department_id) {
            if (!validateId(department_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department_id."
                });
            }
            parsedDeptId = parseInt(department_id, 10);
            const [deptRows] = await db.query("CALL SP_GetDepartmentById(?)", [parsedDeptId]);
            if (!deptRows[0] || deptRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found."
                });
            }
        }

        let parsedEmpId = null;
        if (employee_id) {
            if (!validateId(employee_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee_id."
                });
            }
            parsedEmpId = parseInt(employee_id, 10);
            const [empRows] = await db.query("CALL SP_GetEmployeeById(?)", [parsedEmpId]);
            if (!empRows[0] || empRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found."
                });
            }
        }

        const [rows] = await db.query(
            "CALL SP_GetMonthlyLeaveStats(?, ?, ?, ?, ?)",
            [
                start_date || null,
                end_date || null,
                parsedDeptId,
                parsedEmpId,
                status || null
            ]
        );
        const data = rows[0] || [];

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getMonthlyLeaveStats:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * Get active vs inactive employee status statistics
 * GET /api/analytics/employee-status
 */
export const getEmployeeStatusStats = async (req, res) => {
    try {
        const { department_id, role_id } = req.query;

        let parsedDeptId = null;
        if (department_id) {
            if (!validateId(department_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department_id."
                });
            }
            parsedDeptId = parseInt(department_id, 10);
            const [deptRows] = await db.query("CALL SP_GetDepartmentById(?)", [parsedDeptId]);
            if (!deptRows[0] || deptRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found."
                });
            }
        }

        let parsedRoleId = null;
        if (role_id) {
            if (!validateId(role_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role_id."
                });
            }
            parsedRoleId = parseInt(role_id, 10);
            const [roleRows] = await db.query("CALL SP_GetRoleById(?)", [parsedRoleId]);
            if (!roleRows[0] || roleRows[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found."
                });
            }
        }

        const [rows] = await db.query(
            "CALL SP_GetEmployeeStatusStats(?, ?)",
            [parsedDeptId, parsedRoleId]
        );
        const data = rows[0][0] || { active: 0, inactive: 0 };

        // Ensure returned fields are integers
        const formattedData = {
            active: parseInt(data.active || 0, 10),
            inactive: parseInt(data.inactive || 0, 10)
        };

        return res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error("Error in getEmployeeStatusStats:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};
