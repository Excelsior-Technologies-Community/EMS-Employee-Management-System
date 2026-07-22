import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const addEmployee = async (req, res) => {
    try {
        const { name, email, password, role_id, department_id } = req.body;

        // Check required fields
        if (!name || !email || !password || !role_id || !department_id) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, email, password, role_id, department_id) are required."
            });
        }

        // Validate unique email first
        const [emailCheck] = await db.query(
            "SELECT * FROM employees WHERE email = ?",
            [email]
        );
        if (emailCheck.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Validate role_id exists
        const [roleCheck] = await db.query("SELECT * FROM roles WHERE id = ?", [role_id]);
        if (roleCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid role_id. Role does not exist."
            });
        }

        // Validate department_id exists (if provided)
        if (department_id) {
            const [deptCheck] = await db.query("SELECT * FROM departments WHERE id = ?", [department_id]);
            if (deptCheck.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department_id. Department does not exist."
                });
            }
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Call the stored procedure SP_AddEmployee
        await db.query(
            'CALL SP_AddEmployee(?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role_id, department_id || null]
        );

        return res.status(201).json({
            success: true,
            message: "Employee added securely with hashed password!"
        });

    } catch (error) {
        console.error("Error in addEmployee:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT e.id, e.name, e.email, e.role_id, r.role_name, 
                    e.department_id, d.department_name, d.description AS department_description
             FROM employees e 
             LEFT JOIN roles r ON e.role_id = r.id
             LEFT JOIN departments d ON e.department_id = d.id`
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

        // RBAC Check: Only Admin, HR, Manager or the employee themselves can view details
        if (currentUserRole !== "Admin" && currentUserRole !== "HR" && currentUserRole !== "Manager" && currentUserId !== targetId) {
            return res.status(403).json({
                success: false,
                message: "Access Denied. You can only view your own profile."
            });
        }

        const [rows] = await db.query(
            `SELECT e.id, e.name, e.email, e.role_id, r.role_name, 
                    e.department_id, d.department_name, d.description AS department_description
             FROM employees e 
             LEFT JOIN roles r ON e.role_id = r.id 
             LEFT JOIN departments d ON e.department_id = d.id 
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
        const { name, email, password, role_id, department_id } = req.body;

        // RBAC Check: Only Admin, HR or the employee themselves can update the profile
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
                const [roleCheck] = await db.query("SELECT * FROM roles WHERE id = ?", [role_id]);
                if (roleCheck.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid role_id. Role does not exist."
                    });
                }
                updatedRoleId = role_id;
            } else if (parseInt(role_id) !== currentEmployee.role_id) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied. Only Admin or HR can change roles."
                });
            }
        }

        // Prevent non-Admin/non-HR from changing department_id
        let updatedDepartmentId = currentEmployee.department_id;
        if (department_id !== undefined) {
            if (currentUserRole === "Admin" || currentUserRole === "HR") {
                if (department_id !== null && department_id !== "") {
                    const [deptCheck] = await db.query("SELECT * FROM departments WHERE id = ?", [department_id]);
                    if (deptCheck.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: "Invalid department_id. Department does not exist."
                        });
                    }
                    updatedDepartmentId = department_id;
                } else {
                    updatedDepartmentId = null;
                }
            } else if (department_id !== currentEmployee.department_id) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied. Only Admin or HR can change departments."
                });
            }
        }

        // Prevent duplicate email
        const [duplicateEmail] = await db.query(
            "SELECT * FROM employees WHERE email = ? AND id != ?",
            [updatedEmail, targetId]
        );

        if (duplicateEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Determine password
        let updatedPassword = currentEmployee.password;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedPassword = await bcrypt.hash(password, salt);
        }

        // Update database
        await db.query(
            "UPDATE employees SET name = ?, email = ?, password = ?, role_id = ?, department_id = ? WHERE id = ?",
            [updatedName, updatedEmail, updatedPassword, updatedRoleId, updatedDepartmentId, targetId]
        );

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully!"
        });
    } catch (error) {
        console.error("Error in updateEmployee: ", error.message);
        return res.status(500).json({
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


