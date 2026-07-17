import express from "express";
import {
    addDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
} from "../controller/departmentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department Management APIs
 */

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Add Department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department_name
 *               - description
 *             properties:
 *               department_name:
 *                 type: string
 *                 example: IT
 *               description:
 *                 type: string
 *                 example: Information Technology Department
 *     responses:
 *       201:
 *         description: Department added successfully
 *       400:
 *         description: Bad request
 */
router.post(
    "/",
    verifyToken,
    authorizeRoles("Admin", "HR"),
    addDepartment
);
/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all departments
 */
router.get(
    "/",
    verifyToken,
    authorizeRoles("Admin", "HR", "Manager"),
    getAllDepartments
);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Department ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Department details
 *       404:
 *         description: Department not found
 */
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("Admin", "HR", "Manager"),
    getDepartmentById
);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Department ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department_name:
 *                 type: string
 *                 example: HR
 *               description:
 *                 type: string
 *                 example: Human Resources Department
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       404:
 *         description: Department not found
 */
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("Admin", "HR"),
    updateDepartment
);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Department ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 */
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("Admin"),
    deleteDepartment
);

export default router;