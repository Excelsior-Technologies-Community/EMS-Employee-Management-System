import db from "./config/db.js";

async function run() {
    try {
        console.log("Applying database changes for EMS Dashboard Backend...");

        // 1. Create employee_leave_balances table
        console.log("Creating employee_leave_balances table if not exists...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS employee_leave_balances (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                leave_type_id INT NOT NULL,
                allocated_days INT NOT NULL,
                used_days INT NOT NULL DEFAULT 0,
                remaining_days INT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_elb_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
                CONSTRAINT fk_elb_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
                CONSTRAINT uq_employee_leave_type UNIQUE (employee_id, leave_type_id)
            );
        `);

        // 2. Create indexes
        console.log("Creating indexes if not exists...");
        try {
            await db.query("CREATE INDEX idx_attendance_date ON attendance(attendance_date);");
            console.log("Index idx_attendance_date created.");
        } catch (err) {
            console.log("Index idx_attendance_date already exists or skipped.");
        }
        try {
            await db.query("CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date);");
            console.log("Index idx_attendance_employee_date created.");
        } catch (err) {
            console.log("Index idx_attendance_employee_date already exists or skipped.");
        }
        try {
            await db.query("CREATE INDEX idx_leaves_status ON leaves(status);");
            console.log("Index idx_leaves_status created.");
        } catch (err) {
            console.log("Index idx_leaves_status already exists or skipped.");
        }

        // 3. Drop existing triggers and create new ones
        console.log("Recreating triggers...");
        await db.query("DROP TRIGGER IF EXISTS trg_employees_after_insert;");
        await db.query(`
            CREATE TRIGGER trg_employees_after_insert
            AFTER INSERT ON employees
            FOR EACH ROW
            BEGIN
                INSERT INTO employee_leave_balances (employee_id, leave_type_id, allocated_days, used_days, remaining_days)
                SELECT NEW.id, id, max_days, 0, max_days
                FROM leave_types
                WHERE status = 1;
            END;
        `);

        await db.query("DROP TRIGGER IF EXISTS trg_leave_types_after_insert;");
        await db.query(`
            CREATE TRIGGER trg_leave_types_after_insert
            AFTER INSERT ON leave_types
            FOR EACH ROW
            BEGIN
                INSERT INTO employee_leave_balances (employee_id, leave_type_id, allocated_days, used_days, remaining_days)
                SELECT id, NEW.id, NEW.max_days, 0, NEW.max_days
                FROM employees;
            END;
        `);

        await db.query("DROP TRIGGER IF EXISTS trg_leaves_after_insert;");
        await db.query(`
            CREATE TRIGGER trg_leaves_after_insert
            AFTER INSERT ON leaves
            FOR EACH ROW
            BEGIN
                IF NEW.status = 'Approved' THEN
                    UPDATE employee_leave_balances
                    SET used_days = used_days + NEW.total_days,
                        remaining_days = remaining_days - NEW.total_days
                    WHERE employee_id = NEW.employee_id AND leave_type_id = NEW.leave_type_id;
                END IF;
            END;
        `);

        await db.query("DROP TRIGGER IF EXISTS trg_leaves_after_update;");
        await db.query(`
            CREATE TRIGGER trg_leaves_after_update
            AFTER UPDATE ON leaves
            FOR EACH ROW
            BEGIN
                IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
                    UPDATE employee_leave_balances
                    SET used_days = used_days + NEW.total_days,
                        remaining_days = remaining_days - NEW.total_days
                    WHERE employee_id = NEW.employee_id AND leave_type_id = NEW.leave_type_id;
                END IF;
                
                IF OLD.status = 'Approved' AND NEW.status != 'Approved' THEN
                    UPDATE employee_leave_balances
                    SET used_days = used_days - OLD.total_days,
                        remaining_days = remaining_days + OLD.total_days
                    WHERE employee_id = OLD.employee_id AND leave_type_id = OLD.leave_type_id;
                END IF;
            END;
        `);

        await db.query("DROP TRIGGER IF EXISTS trg_leaves_after_delete;");
        await db.query(`
            CREATE TRIGGER trg_leaves_after_delete
            AFTER DELETE ON leaves
            FOR EACH ROW
            BEGIN
                IF OLD.status = 'Approved' THEN
                    UPDATE employee_leave_balances
                    SET used_days = used_days - OLD.total_days,
                        remaining_days = remaining_days + OLD.total_days
                    WHERE employee_id = OLD.employee_id AND leave_type_id = OLD.leave_type_id;
                END IF;
            END;
        `);

        // 4. Populate pre-existing leave balances
        console.log("Populating pre-existing leave balances...");
        await db.query(`
            INSERT INTO employee_leave_balances (employee_id, leave_type_id, allocated_days, used_days, remaining_days)
            SELECT e.id, lt.id, lt.max_days, 
                   COALESCE((SELECT SUM(l.total_days) FROM leaves l WHERE l.employee_id = e.id AND l.leave_type_id = lt.id AND l.status = 'Approved'), 0) AS used_days,
                   lt.max_days - COALESCE((SELECT SUM(l.total_days) FROM leaves l WHERE l.employee_id = e.id AND l.leave_type_id = lt.id AND l.status = 'Approved'), 0) AS remaining_days
            FROM employees e
            CROSS JOIN leave_types lt
            WHERE lt.status = 1
              AND NOT EXISTS (
                  SELECT 1 FROM employee_leave_balances elb 
                  WHERE elb.employee_id = e.id AND elb.leave_type_id = lt.id
              );
        `);

        // 5. Recreate SPs
        console.log("Recreating stored procedures...");
        
        await db.query("DROP PROCEDURE IF EXISTS SP_GetAdminDashboard;");
        await db.query(`
            CREATE PROCEDURE SP_GetAdminDashboard()
            BEGIN
                DECLARE v_total_employees INT;
                DECLARE v_total_departments INT;
                DECLARE v_total_roles INT;
                DECLARE v_active_employees INT;
                DECLARE v_inactive_employees INT;
                DECLARE v_today_present INT;
                DECLARE v_today_absent INT;
                DECLARE v_pending_leaves INT;

                SELECT COUNT(*) INTO v_total_employees FROM employees;
                SELECT COUNT(*) INTO v_total_departments FROM departments;
                SELECT COUNT(*) INTO v_total_roles FROM roles;
                SELECT COUNT(*) INTO v_active_employees FROM employees WHERE status = 1;
                SELECT COUNT(*) INTO v_inactive_employees FROM employees WHERE status = 0;

                SELECT COUNT(DISTINCT e.id) INTO v_today_present
                FROM employees e
                JOIN roles r ON e.role_id = r.id
                JOIN attendance a ON e.id = a.employee_id
                WHERE r.role_name = 'Employee'
                  AND e.status = 1
                  AND a.attendance_date = CURDATE()
                  AND a.status IN ('Present', 'Late', 'Half Day');

                SELECT COUNT(DISTINCT e.id) INTO v_today_absent
                FROM employees e
                JOIN roles r ON e.role_id = r.id
                WHERE r.role_name = 'Employee'
                  AND e.status = 1
                  AND e.id NOT IN (
                      SELECT employee_id FROM attendance WHERE attendance_date = CURDATE()
                  );

                SELECT COUNT(*) INTO v_pending_leaves FROM leaves WHERE status = 'Pending';

                SELECT 
                    v_total_employees AS totalEmployees,
                    v_total_departments AS totalDepartments,
                    v_total_roles AS totalRoles,
                    v_active_employees AS activeEmployees,
                    v_inactive_employees AS inactiveEmployees,
                    v_today_present AS todayPresent,
                    v_today_absent AS todayAbsent,
                    v_pending_leaves AS pendingLeaves;
            END;
        `);

        await db.query("DROP PROCEDURE IF EXISTS SP_GetHRDashboard;");
        await db.query(`
            CREATE PROCEDURE SP_GetHRDashboard()
            BEGIN
                SELECT 
                    (SELECT COUNT(*) FROM employees) AS totalEmployees,
                    (SELECT COUNT(*) FROM employees WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) AS newEmployeesThisMonth,
                    (SELECT COUNT(*) FROM leaves WHERE status = 'Pending') AS pendingLeaves;

                SELECT 
                    d.id AS department_id,
                    d.department_name,
                    COUNT(e.id) AS employee_count
                FROM departments d
                LEFT JOIN employees e ON d.id = e.department_id
                GROUP BY d.id, d.department_name;

                SELECT 
                    (SELECT COUNT(DISTINCT e.id)
                     FROM employees e
                     JOIN roles r ON e.role_id = r.id
                     JOIN attendance a ON e.id = a.employee_id
                     WHERE r.role_name = 'Employee' AND e.status = 1 AND a.attendance_date = CURDATE() AND a.status = 'Present') AS present,

                    (SELECT COUNT(DISTINCT e.id)
                     FROM employees e
                     JOIN roles r ON e.role_id = r.id
                     JOIN attendance a ON e.id = a.employee_id
                     WHERE r.role_name = 'Employee' AND e.status = 1 AND a.attendance_date = CURDATE() AND a.status = 'Late') AS late,

                    (SELECT COUNT(DISTINCT e.id)
                     FROM employees e
                     JOIN roles r ON e.role_id = r.id
                     JOIN attendance a ON e.id = a.employee_id
                     WHERE r.role_name = 'Employee' AND e.status = 1 AND a.attendance_date = CURDATE() AND a.status = 'Half Day') AS halfDay,

                    (SELECT COUNT(DISTINCT e.id)
                     FROM employees e
                     JOIN roles r ON e.role_id = r.id
                     WHERE r.role_name = 'Employee' AND e.status = 1 AND e.id NOT IN (
                         SELECT employee_id FROM attendance WHERE attendance_date = CURDATE()
                     )) AS absent;

                SELECT 
                    (SELECT COUNT(*) FROM leaves WHERE status = 'Approved') AS approved,
                    (SELECT COUNT(*) FROM leaves WHERE status = 'Pending') AS pending,
                    (SELECT COUNT(*) FROM leaves WHERE status = 'Rejected') AS rejected,
                    (SELECT COUNT(*) FROM leaves WHERE status = 'Cancelled') AS cancelled;
            END;
        `);

        await db.query("DROP PROCEDURE IF EXISTS SP_GetManagerDashboard;");
        await db.query(`
            CREATE PROCEDURE SP_GetManagerDashboard(
                IN p_manager_id INT
            )
            BEGIN
                DECLARE v_dept_id INT;
                DECLARE v_total_team INT;
                DECLARE v_present_team INT;
                DECLARE v_absent_team INT;

                SELECT department_id INTO v_dept_id FROM employees WHERE id = p_manager_id;

                SELECT COUNT(*) INTO v_total_team
                FROM employees e
                JOIN roles r ON e.role_id = r.id
                WHERE e.department_id = v_dept_id
                  AND r.role_name = 'Employee'
                  AND e.status = 1;

                SELECT COUNT(DISTINCT e.id) INTO v_present_team
                FROM employees e
                JOIN roles r ON e.role_id = r.id
                JOIN attendance a ON e.id = a.employee_id
                WHERE e.department_id = v_dept_id
                  AND r.role_name = 'Employee'
                  AND e.status = 1
                  AND a.attendance_date = CURDATE()
                  AND a.status IN ('Present', 'Late', 'Half Day');

                SELECT COUNT(DISTINCT e.id) INTO v_absent_team
                FROM employees e
                JOIN roles r ON e.role_id = r.id
                WHERE e.department_id = v_dept_id
                  AND r.role_name = 'Employee'
                  AND e.status = 1
                  AND e.id NOT IN (
                      SELECT employee_id FROM attendance WHERE attendance_date = CURDATE()
                  );

                SELECT 
                    COALESCE(v_total_team, 0) AS totalTeamMembers,
                    COALESCE(v_present_team, 0) AS presentTeamEmployees,
                    COALESCE(v_absent_team, 0) AS absentTeamEmployees;

                SELECT 
                    e.id AS employee_id,
                    e.name AS employee_name,
                    e.email AS employee_email,
                    a.check_in,
                    a.check_out,
                    a.status,
                    a.work_hours,
                    a.remarks
                FROM employees e
                JOIN roles r ON e.role_id = r.id
                LEFT JOIN attendance a ON e.id = a.employee_id AND a.attendance_date = CURDATE()
                WHERE e.department_id = v_dept_id
                  AND r.role_name = 'Employee'
                  AND e.status = 1
                ORDER BY e.name ASC;

                SELECT 
                    l.id AS leave_id,
                    e.name AS employee_name,
                    lt.leave_name,
                    DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
                    l.total_days,
                    l.reason,
                    l.status,
                    l.created_at
                FROM leaves l
                JOIN employees e ON l.employee_id = e.id
                JOIN roles r ON e.role_id = r.id
                JOIN leave_types lt ON l.leave_type_id = lt.id
                WHERE e.department_id = v_dept_id
                  AND r.role_name = 'Employee'
                  AND l.status = 'Pending'
                ORDER BY l.created_at DESC;

                SELECT 
                    l.id AS leave_id,
                    e.name AS employee_name,
                    lt.leave_name,
                    DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
                    l.total_days,
                    l.reason,
                    l.status
                FROM leaves l
                JOIN employees e ON l.employee_id = e.id
                JOIN roles r ON e.role_id = r.id
                JOIN leave_types lt ON l.leave_type_id = lt.id
                WHERE e.department_id = v_dept_id
                  AND r.role_name = 'Employee'
                  AND l.status = 'Approved'
                  AND l.end_date >= CURDATE()
                ORDER BY l.start_date ASC;
            END;
        `);

        await db.query("DROP PROCEDURE IF EXISTS SP_GetEmployeeDashboard;");
        await db.query(`
            CREATE PROCEDURE SP_GetEmployeeDashboard(
                IN p_employee_id INT
            )
            BEGIN
                DECLARE v_working_days INT;
                DECLARE v_present_days INT;
                DECLARE v_late_days INT;
                DECLARE v_half_days INT;
                DECLARE v_total_work_hours DECIMAL(5,2);
                DECLARE v_marked_days INT;
                DECLARE v_absent_days INT;

                WITH RECURSIVE seq AS (
                    SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS dt
                    UNION ALL
                    SELECT dt + INTERVAL 1 DAY FROM seq WHERE dt + INTERVAL 1 DAY <= CURDATE()
                )
                SELECT COUNT(*) INTO v_working_days FROM seq WHERE DAYOFWEEK(dt) NOT IN (1, 7);

                SELECT 
                    COUNT(CASE WHEN status = 'Present' THEN 1 END),
                    COUNT(CASE WHEN status = 'Late' THEN 1 END),
                    COUNT(CASE WHEN status = 'Half Day' THEN 1 END),
                    COALESCE(SUM(work_hours), 0)
                INTO v_present_days, v_late_days, v_half_days, v_total_work_hours
                FROM attendance
                WHERE employee_id = p_employee_id
                  AND MONTH(attendance_date) = MONTH(CURDATE())
                  AND YEAR(attendance_date) = YEAR(CURDATE());

                SET v_marked_days = v_present_days + v_late_days + v_half_days;
                SET v_absent_days = GREATEST(0, v_working_days - v_marked_days);

                SELECT 
                    v_working_days AS workingDays,
                    v_present_days AS presentDays,
                    v_late_days AS lateDays,
                    v_half_days AS halfDays,
                    v_absent_days AS absentDays,
                    v_total_work_hours AS totalWorkHours;

                SELECT 
                    attendance_date,
                    check_in,
                    check_out,
                    status,
                    work_hours,
                    remarks
                FROM attendance
                WHERE employee_id = p_employee_id
                  AND MONTH(attendance_date) = MONTH(CURDATE())
                  AND YEAR(attendance_date) = YEAR(CURDATE())
                ORDER BY attendance_date DESC;

                SELECT 
                    lt.leave_name AS leave_type,
                    elb.allocated_days,
                    elb.used_days,
                    elb.remaining_days
                FROM employee_leave_balances elb
                JOIN leave_types lt ON elb.leave_type_id = lt.id
                WHERE elb.employee_id = p_employee_id AND lt.status = 1;

                SELECT 
                    l.id AS leave_id,
                    lt.leave_name,
                    DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
                    l.total_days,
                    l.reason,
                    l.status,
                    l.created_at
                FROM leaves l
                JOIN leave_types lt ON l.leave_type_id = lt.id
                WHERE l.employee_id = p_employee_id AND l.status = 'Pending'
                ORDER BY l.created_at DESC;

                SELECT 
                    l.id AS leave_id,
                    lt.leave_name,
                    DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
                    l.total_days,
                    l.reason,
                    l.status,
                    l.approved_at,
                    l.approval_reason
                FROM leaves l
                JOIN leave_types lt ON l.leave_type_id = lt.id
                WHERE l.employee_id = p_employee_id AND l.status = 'Approved'
                ORDER BY l.start_date DESC;

                SELECT 
                    l.id AS leave_id,
                    lt.leave_name,
                    DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
                    DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
                    l.total_days,
                    l.reason,
                    l.status,
                    l.approved_at AS rejected_at,
                    l.rejection_reason
                FROM leaves l
                JOIN leave_types lt ON l.leave_type_id = lt.id
                WHERE l.employee_id = p_employee_id AND l.status = 'Rejected'
                ORDER BY l.start_date DESC;
            END;
        `);

        console.log("Database changes applied successfully!");
    } catch (err) {
        console.error("Failed to apply database changes:", err);
    } finally {
        process.exit(0);
    }
}

run();
