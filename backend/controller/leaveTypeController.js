import db from "../config/db.js";

// ==========================================
// ADD LEAVE TYPE
// ==========================================

export const addLeaveType = async (req, res) => {
    try {
        const { leave_name, description } = req.body;

        const created_by = req.user.id;

        // Validation
        if (!leave_name) {
            return res.status(400).json({
                success: false,
                message: "Leave name is required."
            });
        }

        // Check duplicate leave type
        const [existing] = await db.query(
            "SELECT id FROM leave_types WHERE leave_name = ?",
            [leave_name]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Leave type already exists."
            });
        }

        // Stored Procedure
        await db.query(
            "CALL SP_AddLeaveType(?, ?, ?)",
            [
                leave_name,
                description || null,
                created_by
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Leave type added successfully."
        });

    } catch (error) {

        console.error("Error in addLeaveType:", error.message);

        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};


// ==========================================
// GET ALL LEAVE TYPES
// ==========================================

export const getAllLeaveTypes = async (req, res) => {
    try {

        const [result] = await db.query(
            "CALL SP_GetAllLeaveTypes()"
        );

        return res.status(200).json({
            success: true,
            data: result[0]
        });

    } catch (error) {

        console.error("Error in getAllLeaveTypes:", error.message);

        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};


// ==========================================
// GET LEAVE TYPE BY ID
// ==========================================

export const getLeaveTypeById = async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave type ID."
            });
        }

        const [result] = await db.query(
            "CALL SP_GetLeaveTypeById(?)",
            [id]
        );

        const leaveType = result[0];

        if (leaveType.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Leave type not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: leaveType[0]
        });

    } catch (error) {

        console.error("Error in getLeaveTypeById:", error.message);

        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};


// ==========================================
// UPDATE LEAVE TYPE
// ==========================================

export const updateLeaveType = async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        const {
            leave_name,
            description
        } = req.body;

        const updated_by = req.user.id;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave type ID."
            });
        }

        if (!leave_name) {
            return res.status(400).json({
                success: false,
                message: "Leave name is required."
            });
        }

        // Check existing leave type
        const [existing] = await db.query(
            "SELECT id FROM leave_types WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Leave type not found."
            });
        }

        // Check duplicate name
        const [duplicate] = await db.query(
            `SELECT id
             FROM leave_types
             WHERE leave_name = ?
             AND id != ?`,
            [leave_name, id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Another leave type with this name already exists."
            });
        }

        await db.query(
            "CALL SP_UpdateLeaveType(?, ?, ?, ?)",
            [
                id,
                leave_name,
                description || null,
                updated_by
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Leave type updated successfully."
        });

    } catch (error) {

        console.error("Error in updateLeaveType:", error.message);

        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};


// ==========================================
// DELETE LEAVE TYPE
// ==========================================

export const deleteLeaveType = async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        const updated_by = req.user.id;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave type ID."
            });
        }

        // Check existing
        const [existing] = await db.query(
            "SELECT id, status FROM leave_types WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Leave type not found."
            });
        }

        // Already inactive
        if (existing[0].status === 0) {
            return res.status(400).json({
                success: false,
                message: "Leave type is already deleted."
            });
        }

        // Soft delete
        await db.query(
            "CALL SP_DeleteLeaveType(?, ?)",
            [id, updated_by]
        );

        return res.status(200).json({
            success: true,
            message: "Leave type deleted successfully."
        });

    } catch (error) {

        console.error("Error in deleteLeaveType:", error.message);

        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};