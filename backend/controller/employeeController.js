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
        const [emailRows] = await db.query(
            "CALL SP_GetEmployeeByEmail(?)",
            [email]
        );
        const emailCheck = emailRows[0];
        if (emailCheck.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Validate role_id exists
        const [roleRows] = await db.query(
            "CALL SP_GetRoleById(?)",
            [role_id]
        );
        const roleCheck = roleRows[0];
        if (roleCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid role_id. Role does not exist."
            });
        }

        // Validate department_id exists (if provided)
        if (department_id) {
            const [deptRows] = await db.query(
                "CALL SP_GetDepartmentById(?)",
                [department_id]
            );
            const deptCheck = deptRows[0];
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

        // Insert using stored procedure
        await db.query(
            "CALL SP_AddEmployee(?, ?, ?, ?, ?)",
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

// Get all employees (with optional pagination & search)
export const getAllEmployees = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const search = req.query.search ? `%${req.query.search}%` : null;
        const offset = (page - 1) * limit;

        const [countRows] = await db.query(
            "CALL SP_GetEmployeesCount(?)",
            [search]
        );
        const total = countRows[0][0].total;

        const [listRows] = await db.query(
            "CALL SP_GetAllEmployees(?, ?, ?)",
            [search, limit, offset]
        );
        const rows = listRows[0];

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
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
            "CALL SP_GetEmployeeById(?)",
            [targetId]
        );
        const employees = rows[0];

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.status(200).json({
            success: true,
            data: employees[0]
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
        const [rows] = await db.query(
            "CALL SP_GetEmployeeById(?)",
            [targetId]
        );
        const existing = rows[0];
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
                const [roleRows] = await db.query(
                    "CALL SP_GetRoleById(?)",
                    [role_id]
                );
                const roleCheck = roleRows[0];
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
                    const [deptRows] = await db.query(
                        "CALL SP_GetDepartmentById(?)",
                        [department_id]
                    );
                    const deptCheck = deptRows[0];
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
        const [emailRows] = await db.query(
            "CALL SP_GetEmployeeByEmail(?)",
            [updatedEmail]
        );
        const duplicateEmail = emailRows[0];

        if (duplicateEmail.length > 0 && duplicateEmail[0].id !== targetId) {
            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Determine password
        let updatedPassword;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedPassword = await bcrypt.hash(password, salt);
        } else {
            const [passRows] = await db.query(
                "SELECT password FROM employees WHERE id = ?",
                [targetId]
            );
            updatedPassword = passRows[0]?.password;
        }

        // Update database using stored procedure
        await db.query(
            "CALL SP_UpdateEmployee(?, ?, ?, ?, ?, ?)",
            [targetId, updatedName, updatedEmail, updatedPassword, updatedRoleId, updatedDepartmentId]
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

        const [rows] = await db.query(
            "CALL SP_GetEmployeeById(?)",
            [targetId]
        );
        const existing = rows[0];
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        await db.query(
            "CALL SP_DeleteEmployee(?)",
            [targetId]
        );

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

// Toggle employee active/inactive status
export const toggleEmployeeStatus = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        const { status } = req.body; // expects 0 or 1

        if (status !== 0 && status !== 1) {
            return res.status(400).json({
                success: false,
                message: "Status must be 0 (inactive) or 1 (active)."
            });
        }

        const [rows] = await db.query(
            "CALL SP_GetEmployeeById(?)",
            [targetId]
        );
        const existing = rows[0];
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        await db.query(
            "CALL SP_ToggleEmployeeStatus(?, ?, ?)",
            [targetId, status, req.user.id]
        );

        return res.status(200).json({
            success: true,
            message: `Employee ${status === 1 ? 'activated' : 'deactivated'} successfully!`
        });
    } catch (error) {
        console.error("Error in toggleEmployeeStatus: ", error.message);
        res.status(500).json({
            success: false,
            message: "Database Error: " + error.message
        });
    }
};