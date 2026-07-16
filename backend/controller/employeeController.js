import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const addEmployee = async (req, res) => {

    try {
        const { name, email, password, role_id } = req.body;
        if (!name || !email || !password || !role_id) {
            return res.status(400).json({
                success: false,
                message: "All fields are reqired..!"
            })

        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        await db.query('INSERT INTO employees (name, email, password,  role_id) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword,  role_id]);

        res.status(201).json({
            success: true,
            message: "Employee added securely with hashed password!"
        });
        
    } catch (error) {
        console.log("Error ", error.message)
        res.status(500).json({
            success: false,
            message: "Database Error" + error.message
        });
    }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT e.id, e.name, e.email, e.role_id, r.role_name 
             FROM employees e 
             LEFT JOIN roles r ON e.role_id = r.id`
        );
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error in getAllEmployees: ", error.message);
        res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

// Get employee by ID
export const getEmployeeById = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        const { id: currentUserId, role: currentUserRole } = req.user;

       
        if (currentUserRole !== "Admin" && currentUserRole !== "HR" && currentUserRole !== "Manager" && currentUserId !== targetId) {
            return res.status(403).json({
                success: false,
                message: "Access Denied. You can only view your own profile."
            });
        }

        const [rows] = await db.query(
            `SELECT e.id, e.name, e.email, e.role_id, r.role_name 
             FROM employees e 
             LEFT JOIN roles r ON e.role_id = r.id 
             WHERE e.id = ?`,
            [targetId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error("Error in getEmployeeById: ", error.message);
        res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

// Update employee
export const updateEmployee = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        const { id: currentUserId, role: currentUserRole } = req.user;
        const { name, email, password, role_id } = req.body;

        
        if (currentUserRole !== "Admin" && currentUserRole !== "HR" && currentUserId !== targetId) {
            return res.status(403).json({
                success: false,
                message: "Access Denied. You can only update your own profile."
            });
        }

        // Fetch existing employee
        const [existing] = await db.query("SELECT * FROM employees WHERE id = ?", [targetId]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        const currentEmployee = existing[0];

        // Determine final values
        const updatedName = name || currentEmployee.name;
        const updatedEmail = email || currentEmployee.email;
        
        // Prevent non-Admin/non-HR from changing role_id
        let updatedRoleId = currentEmployee.role_id;
        if (role_id !== undefined) {
            if (currentUserRole === "Admin" || currentUserRole === "HR") {
                updatedRoleId = role_id;
            } else if (parseInt(role_id) !== currentEmployee.role_id) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied. Only Admin or HR can change roles."
                });
            }
        }

        // Determine password
        let updatedPassword = currentEmployee.password;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedPassword = await bcrypt.hash(password, salt);
        }

        // Update database
        await db.query(
            "UPDATE employees SET name = ?, email = ?, password = ?, role_id = ? WHERE id = ?",
            [updatedName, updatedEmail, updatedPassword, updatedRoleId, targetId]
        );

        res.status(200).json({
            success: true,
            message: "Employee updated successfully!"
        });

    } catch (error) {
        console.error("Error in updateEmployee: ", error.message);
        res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);

        
        if (req.user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Access Denied. Only Admin can delete employees."
            });
        }

        const [existing] = await db.query("SELECT * FROM employees WHERE id = ?", [targetId]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        await db.query("DELETE FROM employees WHERE id = ?", [targetId]);

        res.status(200).json({
            success: true,
            message: "Employee deleted successfully!"
        });
    } catch (error) {
        console.error("Error in deleteEmployee: ", error.message);
        res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};


