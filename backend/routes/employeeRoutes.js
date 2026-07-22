import express from "express";
import { 
    addEmployee, 
    getAllEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee 
} from "../controller/employeeController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: View all employees
 *     description: Accessible by Admin, HR, and Manager.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all employees list.
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Role Not Allowed)
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/",
    verifyToken,
    authorizeRoles("Admin", "HR", "Manager"),
    getAllEmployees
);

/**
 * @swagger
 * /api/employees/add:
 *   post:
 *     summary: Add a new employee
 *     description: Only Admin and HR can add employees.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Employee added successfully.
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Role Not Allowed)
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/add",
    
    addEmployee
);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: View employee details by ID
 *     description: Accessible by Admin, HR, Manager, or the Employee themselves for their own profile.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The employee ID
 *     responses:
 *       200:
 *         description: Employee details retrieved successfully.
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Permission Denied)
 *       404:
 *         description: Employee Not Found
 *       500:
 *         description: Internal Server Error
 *   put:
 *     summary: Update employee details by ID
 *     description: Accessible by Admin and HR for any employee, and by Employee for their own profile (role_id change restricted to Admin/HR).
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               email:
 *                 type: string
 *                 example: john.updated@example.com
 *               password:
 *                 type: string
 *                 example: newpassword123
 *               role_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Employee updated successfully.
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Permission Denied or Role Escalation attempt)
 *       404:
 *         description: Employee Not Found
 *       500:
 *         description: Internal Server Error
 *   delete:
 *     summary: Delete employee by ID
 *     description: Accessible only by Admin.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The employee ID to delete
 *     responses:
 *       200:
 *         description: Employee deleted successfully.
 *       401:
 *         description: Unauthorized (Token Missing or Invalid)
 *       403:
 *         description: Access Denied (Admin role required)
 *       404:
 *         description: Employee Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", verifyToken, getEmployeeById);
router.put("/:id", verifyToken, updateEmployee);
router.delete("/:id", verifyToken, authorizeRoles("Admin"), deleteEmployee);

export default router;