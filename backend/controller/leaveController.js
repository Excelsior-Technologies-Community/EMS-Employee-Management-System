import db from "../config/db.js";

/**
 * Apply for Leave
 */
export const applyLeave = async (req, res) => {
    try {
        const { leave_type_id, start_date, end_date, reason } = req.body;
        const employee_id = req.user.id;

        // Validation
        if (!leave_type_id || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "leave_type_id, start_date, and end_date are required."
            });
        }

        // Validate date formats
        const startDateParsed = new Date(start_date);
        const endDateParsed = new Date(end_date);

        if (isNaN(startDateParsed.getTime()) || isNaN(endDateParsed.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid start_date or end_date format. Please use YYYY-MM-DD."
            });
        }

        // Validate end date not before start date
        if (endDateParsed < startDateParsed) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date."
            });
        }

        // Call SP_ApplyLeave stored procedure
        await db.query(
            "CALL SP_ApplyLeave(?, ?, ?, ?, ?)",
            [
                employee_id,
                parseInt(leave_type_id, 10),
                start_date,
                end_date,
                reason || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Leave application submitted successfully."
        });

    } catch (error) {
        const errMessage = error.message || "";

        if (errMessage.includes("Leave type not found")) {
            return res.status(404).json({
                success: false,
                message: "Leave type not found."
            });
        }

        if (errMessage.includes("Leave type is inactive")) {
            return res.status(400).json({
                success: false,
                message: "The requested leave type is inactive."
            });
        }

        if (errMessage.includes("End date cannot be before start date")) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date."
            });
        }

        if (errMessage.includes("Overlapping leave application exists")) {
            return res.status(409).json({
                success: false,
                message: "An overlapping pending or approved leave application already exists for this period."
            });
        }

        console.error("Error in applyLeave:", errMessage);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + errMessage
        });
    }
};
