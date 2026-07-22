import db from '../config/db.js'
//creat department 
export const addDepartment = async (req, res) => {
    try {
        const { department_name, description } = req.body

        if (!department_name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required..!"
            })
        }

        // Check if department already exists
        const [existing] = await db.query(
            "SELECT * FROM departments WHERE department_name = ?",
            [department_name]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Department already exists."
            });
        }

        // Call the stored procedure SP_AddDepartment
        await db.query("CALL SP_AddDepartment(?, ?)", [department_name, description]);

        return res.status(201).json({
            success: true,
            message: "Department added successfully"
        });

    } catch (error) {
        console.log("Error ", error.message)
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
}

// get alldepartments
export const getAllDepartments = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT d.id ,d.department_name ,d.description
            FROM departments d
            `
        );
        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.log("Error in getAllDepartment: ", error.message)
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
}
// get department by ID
export const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            "SELECT d.id, d.department_name ,d.description FROM departments d WHERE id = ?", [id]
        );
        if (rows.length == 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found!"
            });
        }
        return res.status(200).json({
            success: true,
            data: rows[0]
        })

    } catch (error) {
        console.log("Error in getdepartmentById ", error.message)
        res.status(500).json({
            success: false,
            message: "Database Error" + error.message
        });
    }
}

// Update department

export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params
        const { department_name, description } = req.body

        const [existing] = await db.query(
            "SELECT * FROM departments WHERE id = ? ", [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'department not found!'
            });

        }
        await db.query(
            "UPDATE departments SET department_name = ?,description = ? WHERE id = ?",
            [department_name, description, id]
        );
        return res.status(200).json({
            success: true,
            message: "Department updated successfully!"
        });
    } catch (error) {
        console.log("Error in updateDepartment ", error.message)
        res.status(500).json({
            success: false,
            message: "Database Error" + error.message
        });
    }
}

// delete department

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params

        const [existing] = await db.query(
            "SELECT * FROM departments WHERE id = ?",
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "department not found"
            });

        }
        await db.query(
            "DELETE FROM departments WHERE id = ?", [id]
        );
        return res.status(200).json({
            success: true,
            message: "department deleted successfully"
        });


    } catch (error) {
        console.log("Error  in deleteDepartment", error.message)
        return res.status(500).json({
            success: false,
            message: "Database Error" + error.message
        });
    }
}