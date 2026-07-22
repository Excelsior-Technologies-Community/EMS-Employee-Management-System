import db from '../config/db.js';


export const getAllRoles = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM roles");
        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error in getAllRoles:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

/**
 * Add a new role
 * Accessible by Admin only
 */
export const addRole = async (req, res) => {
    try {
        const { role_name } = req.body;
        if (!role_name || !role_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Role name is required."
            });
        }

        const trimmedRoleName = role_name.trim();

        // Check if role already exists
        const [existing] = await db.query("SELECT * FROM roles WHERE role_name = ?", [trimmedRoleName]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Role already exists."
            });
        }

        await db.query("INSERT INTO roles (role_name) VALUES (?)", [trimmedRoleName]);

        return res.status(201).json({
            success: true,
            message: "Role added successfully!"
        });
    } catch (error) {
        console.error("Error in addRole:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};
