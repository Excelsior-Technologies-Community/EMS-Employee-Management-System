import db from "./config/db.js";

async function run() {
    try {
        console.log("Updating stored procedures...");

        // 1. Update SP_GetMyLeaves
        console.log("1. Recreating SP_GetMyLeaves...");
        await db.query("DROP PROCEDURE IF EXISTS SP_GetMyLeaves;");
        await db.query(`
            CREATE PROCEDURE SP_GetMyLeaves(
                IN p_employee_id INT
            )
            BEGIN
                SELECT 
                    l.id,
                    l.leave_type_id,
                    lt.leave_name,
                    DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
                    l.total_days,
                    l.reason,
                    l.status,
                    l.approved_by,
                    DATE_FORMAT(l.approved_at, '%Y-%m-%d %H:%i:%s') AS approved_at,
                    l.created_at,
                    emp_app.name AS approved_by_name,
                    r_app.role_name AS approved_by_role,
                    l.rejection_reason
                FROM leaves l
                INNER JOIN leave_types lt ON l.leave_type_id = lt.id
                LEFT JOIN employees emp_app ON l.approved_by = emp_app.id
                LEFT JOIN roles r_app ON emp_app.role_id = r_app.id
                WHERE l.employee_id = p_employee_id
                ORDER BY l.created_at DESC;
            END;
        `);
        console.log("SP_GetMyLeaves recreated successfully.");

        // 2. Update SP_GetAllLeaves
        console.log("2. Recreating SP_GetAllLeaves...");
        await db.query("DROP PROCEDURE IF EXISTS SP_GetAllLeaves;");
        await db.query(`
            CREATE PROCEDURE SP_GetAllLeaves(
                IN p_department_id INT
            )
            BEGIN
                IF p_department_id IS NOT NULL THEN
                    SELECT 
                        l.id,
                        l.employee_id,
                        e.name AS employee_name,
                        e.email AS employee_email,
                        d.department_name,
                        lt.leave_name,
                        DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
                        DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
                        l.total_days,
                        l.reason,
                        l.status,
                        l.approved_by,
                        DATE_FORMAT(l.approved_at, '%Y-%m-%d %H:%i:%s') AS approved_at,
                        l.created_at,
                        emp_app.name AS approved_by_name,
                        r_app.role_name AS approved_by_role,
                        l.rejection_reason
                    FROM leaves l
                    INNER JOIN employees e ON l.employee_id = e.id
                    LEFT JOIN departments d ON e.department_id = d.id
                    INNER JOIN leave_types lt ON l.leave_type_id = lt.id
                    LEFT JOIN employees emp_app ON l.approved_by = emp_app.id
                    LEFT JOIN roles r_app ON emp_app.role_id = r_app.id
                    WHERE e.department_id = p_department_id
                    ORDER BY l.created_at DESC;
                ELSE
                    SELECT 
                        l.id,
                        l.employee_id,
                        e.name AS employee_name,
                        e.email AS employee_email,
                        d.department_name,
                        lt.leave_name,
                        DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
                        DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
                        l.total_days,
                        l.reason,
                        l.status,
                        l.approved_by,
                        DATE_FORMAT(l.approved_at, '%Y-%m-%d %H:%i:%s') AS approved_at,
                        l.created_at,
                        emp_app.name AS approved_by_name,
                        r_app.role_name AS approved_by_role,
                        l.rejection_reason
                    FROM leaves l
                    INNER JOIN employees e ON l.employee_id = e.id
                    LEFT JOIN departments d ON e.department_id = d.id
                    INNER JOIN leave_types lt ON l.leave_type_id = lt.id
                    LEFT JOIN employees emp_app ON l.approved_by = emp_app.id
                    LEFT JOIN roles r_app ON emp_app.role_id = r_app.id
                    ORDER BY l.created_at DESC;
                END IF;
            END;
        `);
        console.log("SP_GetAllLeaves recreated successfully.");

        // 3. Test newly updated SP_GetMyLeaves
        console.log("3. Testing updated SP_GetMyLeaves call...");
        const [testRows] = await db.query("CALL SP_GetMyLeaves(?)", [7]);
        console.log("Test row result:", testRows[0][0] || "No leaves found");

    } catch (e) {
        console.error("Error during procedure updates:", e);
    } finally {
        process.exit(0);
    }
}

run();
