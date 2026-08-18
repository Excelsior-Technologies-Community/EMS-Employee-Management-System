import db from "../config/db.js";

/**
 * Apply for Leave
 */
export const applyLeave = async (req, res) => {
    try {
        const { leave_type_id, start_date, end_date, reason } = req.body;
        const employee_id = req.user.id;

        // Validation
        if (!leave_type_id) {
            return res.status(400).json({
                success: false,
                message: "leave_type_id is required."
            });
        }
        if (!start_date) {
            return res.status(400).json({
                success: false,
                message: "start_date is required."
            });
        }
        if (!end_date) {
            return res.status(400).json({
                success: false,
                message: "end_date is required."
            });
        }
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "reason is required."
            });
        }

        // Validate date formats
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Use YYYY-MM-DD."
            });
        }

        // Validate start_date <= end_date
        if (start_date > end_date) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be greater than end date."
            });
        }

        // Validate date has not passed
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        if (start_date < todayStr) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be in the past."
            });
        }

        // Validate leave type exists and is active (status = 1)
        const [leaveTypeRows] = await db.query(
            "SELECT status FROM leave_types WHERE id = ?",
            [leave_type_id]
        );

        if (leaveTypeRows.length === 0 || leaveTypeRows[0].status !== 1) {
            return res.status(404).json({
                success: false,
                message: "Invalid or inactive leave type."
            });
        }

        // Check overlapping leave (status = 'Pending' or 'Approved')
        const [overlapRows] = await db.query(
            `SELECT 1 FROM leaves 
             WHERE employee_id = ? 
               AND status IN ('Pending', 'Approved') 
               AND start_date <= ? 
               AND end_date >= ? 
             LIMIT 1`,
            [employee_id, end_date, start_date]
        );

        if (overlapRows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You already have a leave request for one or more selected dates."
            });
        }

        // Calculate total_days
        const startDateParsed = new Date(start_date);
        const endDateParsed = new Date(end_date);
        const diffTime = Math.abs(endDateParsed - startDateParsed);
        const total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Call SP_ApplyLeave
        await db.query(
            "CALL SP_ApplyLeave(?, ?, ?, ?, ?, ?)",
            [
                employee_id,
                parseInt(leave_type_id, 10),
                start_date,
                end_date,
                total_days,
                reason
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Leave application submitted successfully."
        });

    } catch (error) {
        console.error("Error in applyLeave:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Get My Leaves
 */
export const getMyLeaves = async (req, res) => {
    try {
        const employee_id = req.user.id;

        const [result] = await db.query(
            "CALL SP_GetMyLeaves(?)",
            [employee_id]
        );

        return res.status(200).json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error("Error in getMyLeaves:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Get Leave by ID
 */
export const getLeaveById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const employee_id = req.user.id;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID."
            });
        }

        const [rows] = await db.query(
            `SELECT l.id, l.employee_id, l.leave_type_id, lt.leave_name, 
                    DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date, 
                    DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date, 
                    l.total_days, l.reason, l.status, l.approved_by, l.approved_at, l.created_at
             FROM leaves l
             INNER JOIN leave_types lt ON l.leave_type_id = lt.id
             WHERE l.id = ? AND l.employee_id = ?`,
            [id, employee_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Leave application not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Error in getLeaveById:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Get Pending Leaves
 */
export const getPendingLeaves = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;

        let deptId = null;

        // If the user is a Manager, they can only view leaves in their own department
        if (userRole === "Manager") {
            const [empRows] = await db.query(
                "SELECT department_id FROM employees WHERE id = ?",
                [userId]
            );
            if (empRows.length === 0 || empRows[0].department_id === null) {
                return res.status(200).json({
                    success: true,
                    data: []
                });
            }
            deptId = empRows[0].department_id;
        }

        const [result] = await db.query(
            "CALL SP_GetPendingLeaves(?)",
            [deptId]
        );

        return res.status(200).json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error("Error in getPendingLeaves:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Approve Leave
 */
export const approveLeave = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const approverId = req.user.id;
        const approverRole = req.user.role;
        const { approval_reason } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID."
            });
        }

        // 1. Get leave and verify it exists
        const [result] = await db.query(
            "CALL SP_GetLeaveByIdForApproval(?)",
            [id]
        );
        const leaveRows = result[0];

        if (leaveRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Leave application not found."
            });
        }

        const leave = leaveRows[0];

        // 2. Prevent self approval
        if (leave.employee_id === approverId) {
            return res.status(403).json({
                success: false,
                message: "You cannot approve or reject your own leave."
            });
        }

        // 3. Prevent double approval / status validation
        if (leave.status === "Approved") {
            return res.status(400).json({
                success: false,
                message: "Leave is already approved."
            });
        }
        if (leave.status === "Rejected") {
            return res.status(400).json({
                success: false,
                message: "Rejected leave cannot be approved."
            });
        }
        if (leave.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leaves can be approved."
            });
        }

        // 4. Role-based / department-based checks for Managers
        if (approverRole === "Manager") {
            const [approverRows] = await db.query(
                "SELECT department_id FROM employees WHERE id = ?",
                [approverId]
            );
            if (approverRows.length === 0 || approverRows[0].department_id === null || approverRows[0].department_id !== leave.department_id) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied. You can only approve leaves of your team members."
                });
            }
        }

        // 5. Call SP_ApproveLeave
        const [appResult] = await db.query(
            "CALL SP_ApproveLeave(?, ?, ?)",
            [
                id,
                approverId,
                approval_reason || null
            ]
        );

        const affectedRows = appResult[0][0]?.affected_rows || 0;
        if (affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "Failed to approve leave application."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Leave approved successfully."
        });

    } catch (error) {
        console.error("Error in approveLeave:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Reject Leave
 */
export const rejectLeave = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const rejecterId = req.user.id;
        const rejecterRole = req.user.role;
        const { rejection_reason } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID."
            });
        }

        // Validate rejection reason is required
        if (!rejection_reason) {
            return res.status(400).json({
                success: false,
                message: "rejection_reason is required."
            });
        }

        // 1. Get leave and verify it exists
        const [result] = await db.query(
            "CALL SP_GetLeaveByIdForApproval(?)",
            [id]
        );
        const leaveRows = result[0];

        if (leaveRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Leave application not found."
            });
        }

        const leave = leaveRows[0];

        // 2. Prevent self rejection
        if (leave.employee_id === rejecterId) {
            return res.status(403).json({
                success: false,
                message: "You cannot approve or reject your own leave."
            });
        }

        // 3. Status checks
        if (leave.status === "Approved") {
            return res.status(400).json({
                success: false,
                message: "Approved leave cannot be rejected."
            });
        }
        if (leave.status === "Rejected") {
            return res.status(400).json({
                success: false,
                message: "Leave is already rejected."
            });
        }
        if (leave.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leaves can be rejected."
            });
        }

        // 4. Role check for Manager
        if (rejecterRole === "Manager") {
            const [approverRows] = await db.query(
                "SELECT department_id FROM employees WHERE id = ?",
                [rejecterId]
            );
            if (approverRows.length === 0 || approverRows[0].department_id === null || approverRows[0].department_id !== leave.department_id) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied. You can only reject leaves of your team members."
                });
            }
        }

        // 5. Call SP_RejectLeave
        const [rejResult] = await db.query(
            "CALL SP_RejectLeave(?, ?, ?)",
            [
                id,
                rejecterId,
                rejection_reason
            ]
        );

        const affectedRows = rejResult[0][0]?.affected_rows || 0;
        if (affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "Failed to reject leave application."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Leave rejected successfully."
        });

    } catch (error) {
        console.error("Error in rejectLeave:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Get All Leaves
 */
export const getAllLeaves = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;

        let deptId = null;

        // If the user is a Manager, they can only view leaves in their own department
        if (userRole === "Manager") {
            const [empRows] = await db.query(
                "SELECT department_id FROM employees WHERE id = ?",
                [userId]
            );
            if (empRows.length === 0 || empRows[0].department_id === null) {
                return res.status(200).json({
                    success: true,
                    data: []
                });
            }
            deptId = empRows[0].department_id;
        }

        const [result] = await db.query(
            "CALL SP_GetAllLeaves(?)",
            [deptId]
        );

        return res.status(200).json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error("Error in getAllLeaves:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

