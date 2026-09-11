

CREATE DATABASE IF NOT EXISTS EMS;
USE EMS;


-- =========================================================================
-- 2. ROLES
-- =========================================================================


CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by INT DEFAULT NULL
);

-- Stored Procedures
DELIMITER $$

CREATE PROCEDURE SP_GetAllRoles()
BEGIN
    SELECT * 
    FROM roles;
END $$

CREATE PROCEDURE SP_GetRoleByName(
    IN p_role_name VARCHAR(50)
)
BEGIN
    SELECT * 
    FROM roles 
    WHERE role_name = p_role_name;
END $$

CREATE PROCEDURE SP_GetRoleById(
    IN p_role_id INT
)
BEGIN
    SELECT * 
    FROM roles 
    WHERE id = p_role_id;
END $$

CREATE PROCEDURE SP_AddRole(
    IN p_role_name VARCHAR(50)
)
BEGIN
    INSERT INTO roles (role_name) 
    VALUES (p_role_name);
END $$

DELIMITER ;

-- =========================================================================
-- 3. DEPARTMENTS
-- =========================================================================

-- Table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by INT DEFAULT NULL
);

-- Stored Procedures
DELIMITER $$

CREATE PROCEDURE SP_AddDepartment(
    IN p_department_name VARCHAR(100),
    IN p_description VARCHAR(255)
)
BEGIN
    INSERT INTO departments (department_name, description)
    VALUES (p_department_name, p_description);
END $$

CREATE PROCEDURE SP_GetDepartmentByName(
    IN p_name VARCHAR(100)
)
BEGIN
    SELECT * 
    FROM departments 
    WHERE department_name = p_name;
END $$

CREATE PROCEDURE SP_GetAllDepartments()
BEGIN
    SELECT d.id, d.department_name, d.description 
    FROM departments d;
END $$

CREATE PROCEDURE SP_GetDepartmentById(
    IN p_dept_id INT
)
BEGIN
    SELECT d.id, d.department_name, d.description 
    FROM departments d 
    WHERE id = p_dept_id;
END $$

CREATE PROCEDURE SP_UpdateDepartment(
    IN p_dept_id INT,
    IN p_department_name VARCHAR(100),
    IN p_description VARCHAR(255)
)
BEGIN
    UPDATE departments 
    SET department_name = p_department_name, 
        description = p_description, 
        updated_at = NOW() 
    WHERE id = p_dept_id;
END $$

CREATE PROCEDURE SP_DeleteDepartment(
    IN p_dept_id INT
)
BEGIN
    DELETE FROM departments 
    WHERE id = p_dept_id;
END $$

DELIMITER ;

-- =========================================================================
-- 4. EMPLOYEES
-- =========================================================================

-- Table
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    department_id INT,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,

    CONSTRAINT fk_employee_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL
);

ALTER TABLE employees ADD CONSTRAINT uq_employees_email UNIQUE (email);

-- Stored Procedures
DELIMITER $$

CREATE PROCEDURE SP_AddEmployee(
    IN p_name VARCHAR(100), 
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_role_id INT,
    IN p_department_id INT
)
BEGIN
    INSERT INTO employees (name, email, password, role_id, department_id)
    VALUES (p_name, p_email, p_password, p_role_id, p_department_id);
END $$

CREATE PROCEDURE SP_GetEmployeeByEmail(
    IN p_email VARCHAR(100)
)
BEGIN
    SELECT e.*, r.role_name, d.department_name 
    FROM employees e 
    INNER JOIN roles r ON e.role_id = r.id 
    LEFT JOIN departments d ON e.department_id = d.id 
    WHERE e.email = p_email;
END $$

CREATE PROCEDURE SP_GetEmployeesCount(
    IN p_search VARCHAR(100)
)
BEGIN
    IF p_search IS NOT NULL AND p_search != '' THEN
        SELECT COUNT(*) AS total
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        WHERE e.name LIKE p_search 
           OR e.email LIKE p_search 
           OR r.role_name LIKE p_search;
    ELSE
        SELECT COUNT(*) AS total
        FROM employees;
    END IF;
END $$

CREATE PROCEDURE SP_GetAllEmployees(
    IN p_search VARCHAR(100),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    IF p_search IS NOT NULL AND p_search != '' THEN
        SELECT e.id, e.name, e.email, e.role_id, r.role_name,
               e.department_id, d.department_name, d.description AS department_description,
               e.status
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.name LIKE p_search 
           OR e.email LIKE p_search 
           OR r.role_name LIKE p_search
        ORDER BY e.id ASC
        LIMIT p_limit OFFSET p_offset;
    ELSE
        SELECT e.id, e.name, e.email, e.role_id, r.role_name,
               e.department_id, d.department_name, d.description AS department_description,
               e.status
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN departments d ON e.department_id = d.id
        ORDER BY e.id ASC
        LIMIT p_limit OFFSET p_offset;
    END IF;
END $$

CREATE PROCEDURE SP_GetEmployeeById(
    IN p_emp_id INT
)
BEGIN
    SELECT e.id, e.name, e.email, e.role_id, r.role_name, 
           e.department_id, d.department_name, d.description AS department_description,
           e.status
    FROM employees e 
    LEFT JOIN roles r ON e.role_id = r.id 
    LEFT JOIN departments d ON e.department_id = d.id 
    WHERE e.id = p_emp_id;
END $$

CREATE PROCEDURE SP_UpdateEmployee(
    IN p_emp_id INT,
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_role_id INT,
    IN p_department_id INT
)
BEGIN
    UPDATE employees 
    SET name = p_name, 
        email = p_email, 
        password = p_password, 
        role_id = p_role_id, 
        department_id = p_department_id,
        updated_at = NOW()
    WHERE id = p_emp_id;
END $$

CREATE PROCEDURE SP_DeleteEmployee(
    IN p_emp_id INT
)
BEGIN
    DELETE FROM employees 
    WHERE id = p_emp_id;
END $$

CREATE PROCEDURE SP_ToggleEmployeeStatus(
    IN p_emp_id INT,
    IN p_status INT,
    IN p_updated_by INT
)
BEGIN
    UPDATE employees 
    SET status = p_status, 
        updated_by = p_updated_by,
        updated_at = NOW()
    WHERE id = p_emp_id;
END $$

DELIMITER ;

-- =========================================================================
-- 5. AUTHENTICATION / FORGOT PASSWORD
-- =========================================================================

DELIMITER $$

CREATE PROCEDURE SP_SetResetToken(
    IN p_email VARCHAR(100),
    IN p_token VARCHAR(255),
    IN p_expiry DATETIME
)
BEGIN
    UPDATE employees
    SET reset_token = p_token,
        reset_token_expiry = p_expiry
    WHERE email = p_email AND status = 1;
    
    SELECT ROW_COUNT() AS affected_rows;
END $$

CREATE PROCEDURE SP_ResetPassword(
    IN p_token VARCHAR(255),
    IN p_hashed_password VARCHAR(255)
)
BEGIN
    UPDATE employees
    SET password = p_hashed_password,
        reset_token = NULL,
        reset_token_expiry = NULL
    WHERE reset_token = p_token
      AND reset_token_expiry > NOW()
      AND status = 1;
      
    SELECT ROW_COUNT() AS affected_rows;
END $$

CREATE PROCEDURE SP_VerifyOTP(
    IN p_email VARCHAR(100),
    IN p_otp VARCHAR(255)
)
BEGIN
    SELECT id, email, name
    FROM employees
    WHERE email = p_email
      AND reset_token = p_otp
      AND reset_token_expiry > NOW()
      AND status = 1;
END $$

CREATE PROCEDURE SP_ResetPasswordWithEmail(
    IN p_email VARCHAR(100),
    IN p_token VARCHAR(255),
    IN p_hashed_password VARCHAR(255)
)
BEGIN
    UPDATE employees
    SET password = p_hashed_password,
        reset_token = NULL,
        reset_token_expiry = NULL
    WHERE email = p_email
      AND reset_token = p_token
      AND reset_token_expiry > NOW()
      AND status = 1;
      
    SELECT ROW_COUNT() AS affected_rows;
END $$

DELIMITER ;

-- =========================================================================
-- 6. OFFICE LOCATION
-- =========================================================================

CREATE TABLE office_location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    office_name VARCHAR(200),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    radius INT DEFAULT 500,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stored Procedures
DELIMITER $$

CREATE PROCEDURE SP_GetActiveOfficeLocations()
BEGIN
    SELECT id, office_name, latitude, longitude, radius, status, created_at
    FROM office_location
    WHERE status = 1;
END $$

DELIMITER ;

-- =========================================================================
-- 7. ATTENDANCE
-- =========================================================================

-- Table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in DATETIME NULL,
    check_out DATETIME NULL,
    check_in_latitude DECIMAL(10,8),
    check_in_longitude DECIMAL(11,8),
    check_out_latitude DECIMAL(10,8),
    check_out_longitude DECIMAL(11,8),
    check_in_accuracy DECIMAL(10,2),
    check_out_accuracy DECIMAL(10,2),
    work_hours DECIMAL(5,2),
    remarks VARCHAR(255),
    status ENUM(
        'Present',
        'Absent',
        'Late',
        'Half Day'
    ) DEFAULT 'Present',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
);

-- Stored Procedures
DELIMITER $$

CREATE PROCEDURE SP_CheckIn(
    IN p_employee_id INT,
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_accuracy DECIMAL(10,2),
    IN p_remarks VARCHAR(255)
)
BEGIN
    DECLARE v_status ENUM('Present', 'Absent', 'Late', 'Half Day') DEFAULT 'Present';

    IF EXISTS (
        SELECT 1
        FROM attendance
        WHERE employee_id = p_employee_id
          AND attendance_date = CURDATE()
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Already Checked In';
    ELSE
        IF TIME(NOW()) > '10:00:00' THEN
            SET v_status = 'Late';
        END IF;

        INSERT INTO attendance (
            employee_id,
            attendance_date,
            check_in,
            check_in_latitude,
            check_in_longitude,
            check_in_accuracy,
            remarks,
            status
        )
        VALUES (
            p_employee_id,
            CURDATE(),
            NOW(),
            p_latitude,
            p_longitude,
            p_accuracy,
            p_remarks,
            v_status
        );
    END IF;
END $$

CREATE PROCEDURE SP_CheckOut(
    IN p_employee_id INT,
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_accuracy DECIMAL(10,2),
    IN p_remarks VARCHAR(255)
)
BEGIN
    DECLARE v_check_in DATETIME;
    DECLARE v_check_out DATETIME;
    DECLARE v_work_hours DECIMAL(5,2);
    DECLARE v_status ENUM('Present', 'Absent', 'Late', 'Half Day');
    DECLARE v_current_remarks VARCHAR(255);

    SELECT check_in, check_out, remarks
    INTO v_check_in, v_check_out, v_current_remarks
    FROM attendance
    WHERE employee_id = p_employee_id
      AND attendance_date = CURDATE()
    LIMIT 1;

    IF v_check_in IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Check-out denied. You have not checked in today.';
    ELSEIF v_check_out IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Already Checked Out today.';
    ELSE
        SET v_work_hours = ROUND(TIMESTAMPDIFF(MINUTE, v_check_in, NOW()) / 60, 2);

        IF v_work_hours < 4 THEN
            SET v_status = 'Half Day';
        ELSEIF TIME(v_check_in) > '10:00:00' THEN
            SET v_status = 'Late';
        ELSE
            SET v_status = 'Present';
        END IF;

        UPDATE attendance
        SET check_out = NOW(),
            check_out_latitude = p_latitude,
            check_out_longitude = p_longitude,
            check_out_accuracy = p_accuracy,
            work_hours = v_work_hours,
            status = v_status,
            remarks = CASE
                WHEN p_remarks IS NOT NULL AND p_remarks != '' THEN
                    IF(v_current_remarks IS NULL OR v_current_remarks = '', p_remarks, CONCAT(v_current_remarks, ' | Check-out: ', p_remarks))
                ELSE remarks
            END
        WHERE employee_id = p_employee_id
          AND attendance_date = CURDATE();
    END IF;
END $$

CREATE PROCEDURE SP_GetTodayAttendanceStatus(
    IN p_employee_id INT
)
BEGIN
    SELECT *
    FROM attendance
    WHERE employee_id = p_employee_id
      AND attendance_date = CURDATE();
END $$

CREATE PROCEDURE SP_GetMyAttendanceHistory(
    IN p_employee_id INT,
    IN p_from_date DATE,
    IN p_to_date DATE
)
BEGIN
    SELECT *
    FROM attendance
    WHERE employee_id = p_employee_id
      AND (p_from_date IS NULL OR attendance_date >= p_from_date)
      AND (p_to_date IS NULL OR attendance_date <= p_to_date)
    ORDER BY attendance_date DESC
    LIMIT 100;
END $$

CREATE PROCEDURE SP_GetMonthlyAttendanceReport(
    IN p_employee_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        attendance_date,
        check_in,
        check_out,
        status,
        work_hours,
        remarks
    FROM attendance
    WHERE employee_id = p_employee_id
      AND attendance_date >= p_start_date
      AND attendance_date <= p_end_date
    ORDER BY attendance_date ASC;
END $$

CREATE PROCEDURE SP_GetMonthlyAttendanceReportAll(
    IN p_month INT,
    IN p_year INT,
    IN p_department_id INT
)
BEGIN
    SELECT 
        e.name,
        e.email,
        d.department_name,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_days,
        SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_days,
        SUM(CASE WHEN a.status = 'Half Day' THEN 1 ELSE 0 END) AS half_days,
        COUNT(a.id) AS marked_days,
        COALESCE(SUM(a.work_hours), 0) AS total_work_hours
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN attendance a ON e.id = a.employee_id 
                          AND MONTH(a.attendance_date) = p_month 
                          AND YEAR(a.attendance_date) = p_year
    WHERE e.status = 1
      AND (p_department_id IS NULL OR e.department_id = p_department_id)
    GROUP BY e.id, e.name, e.email, d.department_name
    ORDER BY e.name ASC;
END $$

CREATE PROCEDURE SP_GetAllAttendance(
    IN p_date DATE,
    IN p_department_id INT,
    IN p_employee_id INT
)
BEGIN
    SELECT 
        a.id,
        a.employee_id,
        e.name AS employee_name,
        d.department_name,
        a.attendance_date,
        a.check_in,
        a.check_out,
        a.work_hours,
        a.status,
        a.remarks
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE (p_date IS NULL OR a.attendance_date = p_date)
      AND (p_department_id IS NULL OR e.department_id = p_department_id)
      AND (p_employee_id IS NULL OR a.employee_id = p_employee_id)
    ORDER BY a.attendance_date DESC, e.name ASC;
END $$

CREATE PROCEDURE SP_SaveAttendanceManual(
    IN p_employee_id INT,
    IN p_attendance_date DATE,
    IN p_check_in DATETIME,
    IN p_check_out DATETIME,
    IN p_status ENUM('Present', 'Absent', 'Late', 'Half Day'),
    IN p_remarks VARCHAR(255),
    IN p_work_hours DECIMAL(5,2)
)
BEGIN
    DECLARE v_id INT;

    SELECT id INTO v_id
    FROM attendance
    WHERE employee_id = p_employee_id
      AND attendance_date = p_attendance_date
    LIMIT 1;

    IF v_id IS NOT NULL THEN
        UPDATE attendance
        SET check_in = p_check_in,
            check_out = p_check_out,
            status = p_status,
            remarks = p_remarks,
            work_hours = p_work_hours
        WHERE id = v_id;

        SELECT 'UPDATED' AS action, v_id AS id;
    ELSE
        INSERT INTO attendance (
            employee_id,
            attendance_date,
            check_in,
            check_out,
            status,
            remarks,
            work_hours
        )
        VALUES (
            p_employee_id,
            p_attendance_date,
            p_check_in,
            p_check_out,
            p_status,
            p_remarks,
            p_work_hours
        );

        SELECT 'INSERTED' AS action, LAST_INSERT_ID() AS id;
    END IF;
END $$

DELIMITER ;

-- =========================================================================
-- 8. LEAVE TYPES
-- =========================================================================


CREATE TABLE leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leave_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    max_days INT NOT NULL DEFAULT 15,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by INT DEFAULT NULL
);


DELIMITER $$

CREATE PROCEDURE SP_AddLeaveType(
    IN p_leave_name VARCHAR(100),
    IN p_description VARCHAR(300),
    IN p_created_by INT
)
BEGIN
    INSERT INTO leave_types (leave_name, description, created_by)
    VALUES (p_leave_name, p_description, p_created_by);
END $$

CREATE PROCEDURE SP_GetAllLeaveTypes()
BEGIN
    SELECT id, leave_name, description, status, created_at, created_by, updated_at, updated_by
    FROM leave_types
    ORDER BY id DESC;
END $$

CREATE PROCEDURE SP_GetLeaveTypeById(
    IN p_id INT
)
BEGIN
    SELECT id, leave_name, description, status, created_at, created_by, updated_at, updated_by
    FROM leave_types
    WHERE id = p_id;
END $$

CREATE PROCEDURE SP_UpdateLeaveType(
    IN p_id INT,
    IN p_leave_name VARCHAR(100),
    IN p_description VARCHAR(255),
    IN p_updated_by INT
)
BEGIN
    UPDATE leave_types
    SET leave_name = p_leave_name,
        description = p_description,
        updated_at = NOW(),
        updated_by = p_updated_by
    WHERE id = p_id;
END $$

CREATE PROCEDURE SP_DeleteLeaveType(
    IN p_id INT,
    IN p_updated_by INT
)
BEGIN
    UPDATE leave_types
    SET status = 0,
        updated_by = p_updated_by,
        updated_at = NOW()
    WHERE id = p_id;
END $$

DELIMITER ;

-- =========================================================================
-- 9. LEAVES
-- =========================================================================


CREATE TABLE leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason VARCHAR(255) NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    approved_by INT DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    approval_reason VARCHAR(255) NULL,
    rejection_reason VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT DEFAULT NULL,

    CONSTRAINT fk_leaves_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id) 
        ON DELETE CASCADE,

    CONSTRAINT fk_leaves_type 
        FOREIGN KEY (leave_type_id) 
        REFERENCES leave_types(id) 
        ON DELETE CASCADE,

    CONSTRAINT fk_leaves_approver 
        FOREIGN KEY (approved_by) 
        REFERENCES employees(id) 
        ON DELETE SET NULL
);


DELIMITER $$

CREATE PROCEDURE SP_ApplyLeave(
    IN p_employee_id INT,
    IN p_leave_type_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_total_days INT,
    IN p_reason VARCHAR(255)
)
BEGIN
    INSERT INTO leaves (
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        total_days,
        reason,
        status
    )
    VALUES (
        p_employee_id,
        p_leave_type_id,
        p_start_date,
        p_end_date,
        p_total_days,
        p_reason,
        'Pending'
    );
END $$

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
END $$

CREATE PROCEDURE SP_GetPendingLeaves(
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
            l.created_at
        FROM leaves l
        INNER JOIN employees e ON l.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN leave_types lt ON l.leave_type_id = lt.id
        WHERE l.status = 'Pending' 
          AND e.department_id = p_department_id
        ORDER BY l.created_at ASC;
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
            l.created_at
        FROM leaves l
        INNER JOIN employees e ON l.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN leave_types lt ON l.leave_type_id = lt.id
        WHERE l.status = 'Pending'
        ORDER BY l.created_at ASC;
    END IF;
END $$

CREATE PROCEDURE SP_GetLeaveByIdForApproval(
    IN p_leave_id INT
)
BEGIN
    SELECT 
        l.id,
        l.employee_id,
        e.department_id,
        l.status
    FROM leaves l
    INNER JOIN employees e ON l.employee_id = e.id
    WHERE l.id = p_leave_id;
END $$

CREATE PROCEDURE SP_ApproveLeave(
    IN p_leave_id INT,
    IN p_approved_by INT,
    IN p_approval_reason VARCHAR(255)
)
BEGIN
    UPDATE leaves
    SET status = 'Approved',
        approved_by = p_approved_by,
        approved_at = NOW(),
        approval_reason = p_approval_reason,
        updated_at = NOW(),
        updated_by = p_approved_by
    WHERE id = p_leave_id 
      AND status = 'Pending';
    
    SELECT ROW_COUNT() AS affected_rows;
END $$

CREATE PROCEDURE SP_RejectLeave(
    IN p_leave_id INT,
    IN p_rejected_by INT,
    IN p_rejection_reason VARCHAR(255)
)
BEGIN
    UPDATE leaves
    SET status = 'Rejected',
        approved_by = p_rejected_by,
        approved_at = NOW(),
        rejection_reason = p_rejection_reason,
        updated_at = NOW(),
        updated_by = p_rejected_by
    WHERE id = p_leave_id 
      AND status = 'Pending';
    
    SELECT ROW_COUNT() AS affected_rows;
END $$

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
END $$

DELIMITER ;

-- =========================================================================
-- 10. EMPLOYEE LEAVE BALANCES
-- =========================================================================

CREATE TABLE employee_leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    allocated_days INT NOT NULL,
    used_days INT NOT NULL DEFAULT 0,
    remaining_days INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_elb_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id) 
        ON DELETE CASCADE,

    CONSTRAINT fk_elb_leave_type 
        FOREIGN KEY (leave_type_id) 
        REFERENCES leave_types(id) 
        ON DELETE CASCADE,

    CONSTRAINT uq_employee_leave_type 
        UNIQUE (employee_id, leave_type_id)
);

-- =========================================================================
-- 11. TEAMS
-- =========================================================================

-- Table
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    manager_id INT NOT NULL,
    department_id INT NOT NULL,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by INT DEFAULT NULL,

    CONSTRAINT fk_team_manager
        FOREIGN KEY (manager_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_team_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE CASCADE
);

-- Stored Procedures
DELIMITER $$

CREATE PROCEDURE SP_CreateTeam(
    IN p_team_name VARCHAR(100),
    IN p_manager_id INT,
    IN p_department_id INT,
    IN p_created_by INT
)
BEGIN
    INSERT INTO teams (team_name, manager_id, department_id, created_by)
    VALUES (p_team_name, p_manager_id, p_department_id, p_created_by);
END $$

CREATE PROCEDURE SP_GetAllTeams()
BEGIN
    SELECT 
        t.id,
        t.team_name,
        t.manager_id,
        e.name AS manager_name,
        e.email AS manager_email,
        t.department_id,
        d.department_name,
        (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id AND tm.status = 1) AS active_member_count,
        t.status
    FROM teams t
    INNER JOIN employees e ON t.manager_id = e.id
    INNER JOIN departments d ON t.department_id = d.id;
END $$

CREATE PROCEDURE SP_GetTeamById(
    IN p_team_id INT
)
BEGIN
    SELECT 
        t.id,
        t.team_name,
        t.status,
        t.manager_id,
        e.name AS manager_name,
        e.email AS manager_email,
        t.department_id,
        d.department_name,
        t.created_at,
        t.created_by,
        t.updated_at,
        t.updated_by
    FROM teams t
    INNER JOIN employees e ON t.manager_id = e.id
    INNER JOIN departments d ON t.department_id = d.id
    WHERE t.id = p_team_id;
END $$

CREATE PROCEDURE SP_UpdateTeam(
    IN p_team_id INT,
    IN p_team_name VARCHAR(100),
    IN p_manager_id INT,
    IN p_department_id INT,
    IN p_updated_by INT
)
BEGIN
    UPDATE teams
    SET team_name = p_team_name,
        manager_id = p_manager_id,
        department_id = p_department_id,
        updated_by = p_updated_by,
        updated_at = NOW()
    WHERE id = p_team_id;
END $$

CREATE PROCEDURE SP_GetManagerTeam(
    IN p_manager_id INT
)
BEGIN
    SELECT 
        t.id AS team_id,
        t.team_name,
        d.department_name
    FROM teams t
    INNER JOIN departments d ON t.department_id = d.id
    WHERE t.manager_id = p_manager_id 
      AND t.status = 1;
END $$

DELIMITER ;

-- =========================================================================
-- 12. TEAM MEMBERS
-- =========================================================================

-- Table
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    employee_id INT NOT NULL,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL,
    updated_by INT DEFAULT NULL,

    CONSTRAINT uq_team_employee
        UNIQUE (team_id, employee_id),

    CONSTRAINT fk_team_member_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_team_member_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE
);

-- Stored Procedures
DELIMITER $$

CREATE PROCEDURE SP_AddTeamMember(
    IN p_team_id INT,
    IN p_employee_id INT,
    IN p_created_by INT
)
BEGIN
    INSERT INTO team_members (team_id, employee_id, status, created_by)
    VALUES (p_team_id, p_employee_id, 1, p_created_by)
    ON DUPLICATE KEY UPDATE 
        status = 1,
        updated_by = p_created_by,
        updated_at = NOW();
END $$

CREATE PROCEDURE SP_RemoveTeamMember(
    IN p_team_id INT,
    IN p_employee_id INT,
    IN p_updated_by INT
)
BEGIN
    UPDATE team_members
    SET status = 0,
        updated_by = p_updated_by,
        updated_at = NOW()
    WHERE team_id = p_team_id 
      AND employee_id = p_employee_id;
END $$

CREATE PROCEDURE SP_GetTeamMembers(
    IN p_team_id INT
)
BEGIN
    SELECT 
        tm.employee_id,
        e.name,
        e.email,
        d.department_name AS department,
        tm.status,
        tm.created_at
    FROM team_members tm
    INNER JOIN employees e ON tm.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE tm.team_id = p_team_id;
END $$

CREATE PROCEDURE SP_GetManagerTeamAttendance(
    IN p_manager_id INT
)
BEGIN
    SELECT DISTINCT
        e.id AS employee_id,
        e.name AS employee_name,
        e.email AS employee_email,
        a.attendance_date,
        a.check_in,
        a.check_out,
        a.status,
        a.work_hours,
        a.remarks
    FROM team_members tm
    INNER JOIN teams t ON tm.team_id = t.id
    INNER JOIN employees e ON tm.employee_id = e.id
    INNER JOIN attendance a ON e.id = a.employee_id
    WHERE t.manager_id = p_manager_id
      AND tm.status = 1
      AND e.status = 1
    ORDER BY a.attendance_date DESC, e.name ASC;
END $$

CREATE PROCEDURE SP_GetManagerTeamLeaves(
    IN p_manager_id INT
)
BEGIN
    SELECT DISTINCT
        l.id AS leave_id,
        e.id AS employee_id,
        e.name AS employee_name,
        e.email AS employee_email,
        lt.leave_name,
        DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
        l.total_days,
        l.reason,
        l.status,
        l.created_at
    FROM team_members tm
    INNER JOIN teams t ON tm.team_id = t.id
    INNER JOIN employees e ON tm.employee_id = e.id
    INNER JOIN leaves l ON e.id = l.employee_id
    INNER JOIN leave_types lt ON l.leave_type_id = lt.id
    WHERE t.manager_id = p_manager_id
      AND tm.status = 1
      AND e.status = 1
    ORDER BY l.created_at DESC;
END $$

DELIMITER ;

-- =========================================================================
-- 13. DASHBOARD STORED PROCEDURES
-- =========================================================================

DELIMITER $$

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

    -- Total Employees
    SELECT COUNT(*) INTO v_total_employees FROM employees;

    -- Total Departments
    SELECT COUNT(*) INTO v_total_departments FROM departments;

    -- Total Roles
    SELECT COUNT(*) INTO v_total_roles FROM roles;

    -- Active Employees
    SELECT COUNT(*) INTO v_active_employees FROM employees WHERE status = 1;

    -- Inactive Employees
    SELECT COUNT(*) INTO v_inactive_employees FROM employees WHERE status = 0;

  
    SELECT COUNT(DISTINCT e.id) INTO v_today_present
    FROM employees e
    JOIN roles r ON e.role_id = r.id
    JOIN attendance a ON e.id = a.employee_id
    WHERE r.role_name = 'Employee'
      AND e.status = 1
      AND a.attendance_date = CURDATE()
      AND a.status IN ('Present', 'Late', 'Half Day');

    -- Today's Absent Employees (active Employees only with no attendance record today)
    SELECT COUNT(DISTINCT e.id) INTO v_today_absent
    FROM employees e
    JOIN roles r ON e.role_id = r.id
    WHERE r.role_name = 'Employee'
      AND e.status = 1
      AND e.id NOT IN (
          SELECT employee_id FROM attendance WHERE attendance_date = CURDATE()
      );

    -- Pending Leaves
    SELECT COUNT(*) INTO v_pending_leaves FROM leaves WHERE status = 'Pending';

    -- Return as single row
    SELECT 
        v_total_employees AS totalEmployees,
        v_total_departments AS totalDepartments,
        v_total_roles AS totalRoles,
        v_active_employees AS activeEmployees,
        v_inactive_employees AS inactiveEmployees,
        v_today_present AS todayPresent,
        v_today_absent AS todayAbsent,
        v_pending_leaves AS pendingLeaves;
END $$

CREATE PROCEDURE SP_GetHRDashboard()
BEGIN
    -- Result Set 1: Basic counters
    SELECT 
        (SELECT COUNT(*) FROM employees) AS totalEmployees,
        (SELECT COUNT(*) FROM employees WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) AS newEmployeesThisMonth,
        (SELECT COUNT(*) FROM leaves WHERE status = 'Pending') AS pendingLeaves;

    -- Result Set 2: Department-wise employees
    SELECT 
        d.id AS department_id,
        d.department_name,
        COUNT(e.id) AS employee_count
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id
    GROUP BY d.id, d.department_name;

    -- Result Set 3: Attendance Summary (Today's counts for normal employees with role = 'Employee')
    SELECT 
        (SELECT COUNT(DISTINCT e.id)
         FROM employees e
         JOIN roles r ON e.role_id = r.id
         JOIN attendance a ON e.id = a.employee_id
         WHERE r.role_name = 'Employee' 
           AND e.status = 1 
           AND a.attendance_date = CURDATE() 
           AND a.status = 'Present') AS present,

        (SELECT COUNT(DISTINCT e.id)
         FROM employees e
         JOIN roles r ON e.role_id = r.id
         JOIN attendance a ON e.id = a.employee_id
         WHERE r.role_name = 'Employee' 
           AND e.status = 1 
           AND a.attendance_date = CURDATE() 
           AND a.status = 'Late') AS late,

        (SELECT COUNT(DISTINCT e.id)
         FROM employees e
         JOIN roles r ON e.role_id = r.id
         JOIN attendance a ON e.id = a.employee_id
         WHERE r.role_name = 'Employee' 
           AND e.status = 1 
           AND a.attendance_date = CURDATE() 
           AND a.status = 'Half Day') AS halfDay,

        (SELECT COUNT(DISTINCT e.id)
         FROM employees e
         JOIN roles r ON e.role_id = r.id
         WHERE r.role_name = 'Employee' 
           AND e.status = 1 
           AND e.id NOT IN (
               SELECT employee_id FROM attendance WHERE attendance_date = CURDATE()
           )) AS absent;

    -- Result Set 4: Leave Summary
    SELECT 
        (SELECT COUNT(*) FROM leaves WHERE status = 'Approved') AS approved,
        (SELECT COUNT(*) FROM leaves WHERE status = 'Pending') AS pending,
        (SELECT COUNT(*) FROM leaves WHERE status = 'Rejected') AS rejected,
        (SELECT COUNT(*) FROM leaves WHERE status = 'Cancelled') AS cancelled;
END $$

CREATE PROCEDURE SP_GetManagerDashboard(
    IN p_manager_id INT
)
BEGIN
    DECLARE v_total_team INT;
    DECLARE v_present_team INT;
    DECLARE v_absent_team INT;

    -- Total Team Members (active unique employees assigned to teams managed by this manager where team_member status is active)
    SELECT COUNT(DISTINCT tm.employee_id) INTO v_total_team
    FROM team_members tm
    INNER JOIN teams t ON tm.team_id = t.id
    INNER JOIN employees e ON tm.employee_id = e.id
    WHERE t.manager_id = p_manager_id
      AND tm.status = 1
      AND e.status = 1;

    -- Present Team Employees (active unique employees)
    SELECT COUNT(DISTINCT tm.employee_id) INTO v_present_team
    FROM team_members tm
    INNER JOIN teams t ON tm.team_id = t.id
    INNER JOIN employees e ON tm.employee_id = e.id
    INNER JOIN attendance a ON e.id = a.employee_id
    WHERE t.manager_id = p_manager_id
      AND tm.status = 1
      AND e.status = 1
      AND a.attendance_date = CURDATE()
      AND a.status IN ('Present', 'Late', 'Half Day');

    -- Absent Team Employees (active unique employees)
    SELECT COUNT(DISTINCT tm.employee_id) INTO v_absent_team
    FROM team_members tm
    INNER JOIN teams t ON tm.team_id = t.id
    INNER JOIN employees e ON tm.employee_id = e.id
    WHERE t.manager_id = p_manager_id
      AND tm.status = 1
      AND e.status = 1
      AND tm.employee_id NOT IN (
          SELECT employee_id FROM attendance WHERE attendance_date = CURDATE()
      );

    -- Result Set 1: Summary counts
    SELECT 
        COALESCE(v_total_team, 0) AS totalTeamMembers,
        COALESCE(v_present_team, 0) AS presentTeamEmployees,
        COALESCE(v_absent_team, 0) AS absentTeamEmployees;

    -- Result Set 2: Today's Team Attendance List (Deduplicated)
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
    LEFT JOIN attendance a ON e.id = a.employee_id AND a.attendance_date = CURDATE()
    WHERE e.status = 1
      AND e.id IN (
          SELECT DISTINCT tm.employee_id
          FROM team_members tm
          INNER JOIN teams t ON tm.team_id = t.id
          WHERE t.manager_id = p_manager_id AND tm.status = 1
      )
    ORDER BY e.name ASC;

    -- Result Set 3: Team Leave Requests (Pending leaves, Deduplicated)
    SELECT DISTINCT
        l.id AS leave_id,
        e.id AS employee_id,
        e.name AS employee_name,
        lt.leave_name,
        DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
        l.total_days,
        l.reason,
        l.status,
        l.created_at
    FROM team_members tm
    INNER JOIN teams t ON tm.team_id = t.id
    INNER JOIN employees e ON tm.employee_id = e.id
    INNER JOIN leaves l ON e.id = l.employee_id
    INNER JOIN leave_types lt ON l.leave_type_id = lt.id
    WHERE t.manager_id = p_manager_id
      AND tm.status = 1
      AND e.status = 1
      AND l.status = 'Pending'
    ORDER BY l.created_at DESC;

    -- Result Set 4: Upcoming Team Leaves (Approved leaves, Deduplicated)
    SELECT DISTINCT
        l.id AS leave_id,
        e.id AS employee_id,
        e.name AS employee_name,
        lt.leave_name,
        DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date,
        l.total_days,
        l.reason,
        l.status
    FROM team_members tm
    INNER JOIN teams t ON tm.team_id = t.id
    INNER JOIN employees e ON tm.employee_id = e.id
    INNER JOIN leaves l ON e.id = l.employee_id
    INNER JOIN leave_types lt ON l.leave_type_id = lt.id
    WHERE t.manager_id = p_manager_id
      AND tm.status = 1
      AND e.status = 1
      AND l.status = 'Approved'
      AND l.end_date >= CURDATE()
    ORDER BY start_date ASC;
END $$

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

    -- Calculate weekdays (Mon-Fri) from start of current month to today
    WITH RECURSIVE seq AS (
        SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS dt
        UNION ALL
        SELECT dt + INTERVAL 1 DAY FROM seq WHERE dt + INTERVAL 1 DAY <= CURDATE()
    )
    SELECT COUNT(*) INTO v_working_days FROM seq WHERE DAYOFWEEK(dt) NOT IN (1, 7);

    -- Count actual attendance in current month
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

    -- Result Set 1: Attendance Summary for current month
    SELECT 
        v_working_days AS workingDays,
        v_present_days AS presentDays,
        v_late_days AS lateDays,
        v_half_days AS halfDays,
        v_absent_days AS absentDays,
        v_total_work_hours AS totalWorkHours;

    -- Result Set 2: Current Month Attendance List
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

    -- Result Set 3: Leave Balance List
    SELECT 
        lt.leave_name AS leave_type,
        elb.allocated_days,
        elb.used_days,
        elb.remaining_days
    FROM employee_leave_balances elb
    JOIN leave_types lt ON elb.leave_type_id = lt.id
    WHERE elb.employee_id = p_employee_id 
      AND lt.status = 1;

    -- Result Set 4: Pending Leave Requests
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
    WHERE l.employee_id = p_employee_id 
      AND l.status = 'Pending'
    ORDER BY l.created_at DESC;

    -- Result Set 5: Approved Leave History
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
    WHERE l.employee_id = p_employee_id 
      AND l.status = 'Approved'
    ORDER BY l.start_date DESC;

    -- Result Set 6: Rejected Leave History
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
    WHERE l.employee_id = p_employee_id 
      AND l.status = 'Rejected'
    ORDER BY l.start_date DESC;
END $$

DELIMITER ;

-- =========================================================================
-- 14. ANALYTICS STORED PROCEDURES
-- =========================================================================

DELIMITER $$

CREATE PROCEDURE SP_GetEmployeesByDepartment(
    IN p_role_id INT
)
BEGIN
    SELECT 
        d.id AS department_id, 
        d.department_name, 
        COUNT(e.id) AS employee_count
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id 
        AND e.status = 1 
        AND (p_role_id IS NULL OR e.role_id = p_role_id)
    GROUP BY d.id, d.department_name;
END $$

CREATE PROCEDURE SP_GetEmployeesByRole(
    IN p_department_id INT
)
BEGIN
    SELECT 
        r.role_name,
        COUNT(e.id) AS employee_count
    FROM roles r
    LEFT JOIN employees e ON r.id = e.role_id 
        AND e.status = 1 
        AND (p_department_id IS NULL OR e.department_id = p_department_id)
    GROUP BY r.id, r.role_name;
END $$

CREATE PROCEDURE SP_GetMonthlyEmployeeJoining(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_department_id INT,
    IN p_role_id INT
)
BEGIN
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS employee_count
    FROM employees
    WHERE 
        (p_start_date IS NULL OR DATE(created_at) >= p_start_date)
        AND (p_end_date IS NULL OR DATE(created_at) <= p_end_date)
        AND (p_department_id IS NULL OR department_id = p_department_id)
        AND (p_role_id IS NULL OR role_id = p_role_id)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC;
END $$

CREATE PROCEDURE SP_GetMonthlyAttendanceStats(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_department_id INT,
    IN p_employee_id INT
)
BEGIN
    WITH RECURSIVE date_seq AS (
        SELECT COALESCE(p_start_date, DATE(COALESCE((SELECT MIN(created_at) FROM employees), CURDATE()))) AS dt
        UNION ALL
        SELECT dt + INTERVAL 1 DAY FROM date_seq WHERE dt + INTERVAL 1 DAY <= COALESCE(p_end_date, CURDATE())
    ),
    weekdays AS (
        SELECT dt, DATE_FORMAT(dt, '%Y-%m') AS month
        FROM date_seq
        WHERE DAYOFWEEK(dt) NOT IN (1, 7)
    ),
    employee_expected_days AS (
        SELECT 
            e.id AS employee_id,
            w.dt,
            w.month
        FROM employees e
        JOIN roles r ON e.role_id = r.id
        CROSS JOIN weekdays w
        WHERE r.role_name = 'Employee'
          AND e.status = 1
          AND (p_department_id IS NULL OR e.department_id = p_department_id)
          AND (p_employee_id IS NULL OR e.id = p_employee_id)
          AND w.dt >= DATE(e.created_at)
    ),
    attendance_statuses AS (
        SELECT 
            eed.month,
            eed.employee_id,
            eed.dt,
            COALESCE(a.status, 'Absent') AS status
        FROM employee_expected_days eed
        LEFT JOIN attendance a ON eed.employee_id = a.employee_id AND eed.dt = a.attendance_date
    )
    SELECT 
        month,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late,
        SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) AS half_day,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent
    FROM attendance_statuses
    GROUP BY month
    ORDER BY month DESC;
END $$

CREATE PROCEDURE SP_GetMonthlyLeaveStats(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_department_id INT,
    IN p_employee_id INT,
    IN p_status VARCHAR(20)
)
BEGIN
    SELECT 
        DATE_FORMAT(l.created_at, '%Y-%m') AS month,
        SUM(CASE WHEN l.status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN l.status = 'Approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN l.status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN l.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled
    FROM leaves l
    INNER JOIN employees e ON l.employee_id = e.id
    WHERE 
        (p_start_date IS NULL OR DATE(l.created_at) >= p_start_date)
        AND (p_end_date IS NULL OR DATE(l.created_at) <= p_end_date)
        AND (p_department_id IS NULL OR e.department_id = p_department_id)
        AND (p_employee_id IS NULL OR l.employee_id = p_employee_id)
        AND (p_status IS NULL OR l.status = p_status)
    GROUP BY DATE_FORMAT(l.created_at, '%Y-%m')
    ORDER BY month DESC;
END $$

CREATE PROCEDURE SP_GetEmployeeStatusStats(
    IN p_department_id INT,
    IN p_role_id INT
)
BEGIN
    SELECT 
        COALESCE(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END), 0) AS active,
        COALESCE(SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END), 0) AS inactive
    FROM employees
    WHERE 
        (p_department_id IS NULL OR department_id = p_department_id)
        AND (p_role_id IS NULL OR role_id = p_role_id);
END $$

DELIMITER ;

-- =========================================================================
-- 15. INDEXES
-- =========================================================================

-- Attendance Indexes
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date);

-- Leaves Indexes
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_created_at ON leaves(created_at);
CREATE INDEX idx_leaves_emp_status_created ON leaves(employee_id, status, created_at);

-- Employees Indexes
CREATE INDEX idx_employees_created_at ON employees(created_at);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_dept_role_status ON employees(department_id, role_id, status);

-- Teams Indexes
CREATE INDEX idx_teams_manager ON teams(manager_id);
CREATE INDEX idx_teams_department ON teams(department_id);

-- Team Members Indexes
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_employee ON team_members(employee_id);
CREATE INDEX idx_team_members_team_status ON team_members(team_id, status);

-- =========================================================================
-- 16. TRIGGERS
-- =========================================================================

DELIMITER $$

CREATE TRIGGER trg_employees_after_insert
AFTER INSERT ON employees
FOR EACH ROW
BEGIN
    INSERT INTO employee_leave_balances (employee_id, leave_type_id, allocated_days, used_days, remaining_days)
    SELECT NEW.id, id, max_days, 0, max_days
    FROM leave_types
    WHERE status = 1;
END $$

CREATE TRIGGER trg_leave_types_after_insert
AFTER INSERT ON leave_types
FOR EACH ROW
BEGIN
    INSERT INTO employee_leave_balances (employee_id, leave_type_id, allocated_days, used_days, remaining_days)
    SELECT id, NEW.id, NEW.max_days, 0, NEW.max_days
    FROM employees;
END $$

CREATE TRIGGER trg_leaves_after_insert
AFTER INSERT ON leaves
FOR EACH ROW
BEGIN
    IF NEW.status = 'Approved' THEN
        UPDATE employee_leave_balances
        SET used_days = used_days + NEW.total_days,
            remaining_days = remaining_days - NEW.total_days
        WHERE employee_id = NEW.employee_id 
          AND leave_type_id = NEW.leave_type_id;
    END IF;
END $$

CREATE TRIGGER trg_leaves_after_update
AFTER UPDATE ON leaves
FOR EACH ROW
BEGIN
    IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
        UPDATE employee_leave_balances
        SET used_days = used_days + NEW.total_days,
            remaining_days = remaining_days - NEW.total_days
        WHERE employee_id = NEW.employee_id 
          AND leave_type_id = NEW.leave_type_id;
    END IF;
    
    IF OLD.status = 'Approved' AND NEW.status != 'Approved' THEN
        UPDATE employee_leave_balances
        SET used_days = used_days - OLD.total_days,
            remaining_days = remaining_days + OLD.total_days
        WHERE employee_id = OLD.employee_id 
          AND leave_type_id = OLD.leave_type_id;
    END IF;
END $$

CREATE TRIGGER trg_leaves_after_delete
AFTER DELETE ON leaves
FOR EACH ROW
BEGIN
    IF OLD.status = 'Approved' THEN
        UPDATE employee_leave_balances
        SET used_days = used_days - OLD.total_days,
            remaining_days = remaining_days + OLD.total_days
        WHERE employee_id = OLD.employee_id 
          AND leave_type_id = OLD.leave_type_id;
    END IF;
END $$

DELIMITER ;

-- =========================================================================
-- 17. SEED / INITIAL DATA
-- =========================================================================

-- Roles Seed
INSERT INTO roles (role_name)
VALUES
('Admin'),
('HR'),
('Manager'),
('Employee');

-- Office Location Seed
INSERT INTO office_location (office_name, latitude, longitude, radius)
VALUES
('Excelsior Technologies', 23.04750000, 72.50280000, 500);

-- Leave Types Seed
INSERT INTO leave_types (leave_name, description, max_days)
VALUES
('Casual Leave', 'Leave for personal or casual reasons', 3),
('Sick Leave', 'Leave due to illness or medical reasons', 5),
('Paid Leave', 'Paid annual leave', 2);

-- Populate Leave Balances for Pre-existing Employees
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



SELECT * FROM roles;



