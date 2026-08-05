import db from '../config/db.js'

//create department 
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
        const [rows] = await db.query(
            "CALL SP_GetDepartmentByName(?)",
            [department_name]
        );
        const existing = rows[0];

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Department already exists."
            });
        }

        // Insert directly using stored procedure
        await db.query(
            "CALL SP_AddDepartment(?, ?)",
            [department_name, description]
        );

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
        const [rows] = await db.query("CALL SP_GetAllDepartments()");
        return res.status(200).json({
            success: true,
            data: rows[0]
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
            "CALL SP_GetDepartmentById(?)", [id]
        );
        const depts = rows[0];
        if (depts.length == 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found!"
            });
        }
        return res.status(200).json({
            success: true,
            data: depts[0]
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

        const [rows] = await db.query(
            "CALL SP_GetDepartmentById(?)", [id]
        );
        const existing = rows[0];
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'department not found!'
            });

        }
        await db.query(
            "CALL SP_UpdateDepartment(?, ?, ?)",
            [id, department_name, description]
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

        const [rows] = await db.query(
            "CALL SP_GetDepartmentById(?)",
            [id]
        );
        const existing = rows[0];
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "department not found"
            });

        }
        await db.query(
            "CALL SP_DeleteDepartment(?)", [id]
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