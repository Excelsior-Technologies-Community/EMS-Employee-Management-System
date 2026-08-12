CREATE DATABASE IF NOT EXISTS EMS;
USE EMS;

-- =========================================================================
-- 1. ROLES
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

INSERT INTO roles(role_name)
VALUES
('Admin'),
('HR'),
('Manager'),
('Employee');

-- Roles Stored Procedures
DELIMITER $$
CREATE PROCEDURE SP_GetAllRoles()
BEGIN
    SELECT * FROM roles;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SP_GetRoleByName(
    IN p_role_name VARCHAR(50)
)
BEGIN
    SELECT * FROM roles WHERE role_name = p_role_name;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SP_GetRoleById(
    IN p_role_id INT
)
BEGIN
    SELECT * FROM roles WHERE id = p_role_id;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SP_AddRole(
    IN p_role_name VARCHAR(50)
)
BEGIN
    INSERT INTO roles (role_name) VALUES (p_role_name);
END $$
DELIMITER ;


-- =========================================================================
-- 2. DEPARTMENTS
-- =========================================================================

-- Departments Table
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

-- Departments Stored Procedures
DELIMITER $$
CREATE PROCEDURE SP_AddDepartment(
    IN p_department_name VARCHAR(100),
    IN p_description VARCHAR(255)
)
BEGIN
    INSERT INTO departments (department_name, description)
    VALUES (p_department_name, p_description);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SP_GetDepartmentByName(
    IN p_name VARCHAR(100)
)
BEGIN
    SELECT * FROM departments WHERE department_name = p_name;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SP_GetAllDepartments()
BEGIN
    SELECT d.id, d.department_name, d.description FROM departments d;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SP_GetDepartmentById(
    IN p_dept_id INT
)
BEGIN
    SELECT d.id, d.department_name, d.description FROM departments d WHERE id = p_dept_id;
END $$
DELIMITER ;

DELIMITER $$
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
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SP_DeleteDepartment(
    IN p_dept_id INT
)
BEGIN
    DELETE FROM departments WHERE id = p_dept_id;
END $$
DELIMITER ;


-- =========================================================================
-- 3. EMPLOYEES
-- =========================================================================

-- Employees Table
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
    FOREIGN KEY(role_id)
    REFERENCES roles(id)
    ON DELETE SET NULL,
    CONSTRAINT fk_employee_department
    FOREIGN KEY(department_id)
    REFERENCES departments(id)
    ON DELETE SET NULL
);

ALTER TABLE employees ADD CONSTRAINT uq_employees_email UNIQUE (email);

-- Employees Stored Procedures
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
DELIMITER ;

DELIMITER $$
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
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SP_GetEmployeesCount(
    IN p_search VARCHAR(100)
)
BEGIN
    IF p_search IS NOT NULL AND p_search != '' THEN
        SELECT COUNT(*) AS total
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        WHERE e.name LIKE p_search OR e.email LIKE p_search OR r.role_name LIKE p_search;
    ELSE
        SELECT COUNT(*) AS total
        FROM employees;
    END IF;
END $$
DELIMITER ;

DELIMITER $$
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
        WHERE e.name LIKE p_search OR e.email LIKE p_search OR r.role_name LIKE p_search
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
DELIMITER ;

DELIMITER $$
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
DELIMITER ;

DELIMITER $$
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
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SP_DeleteEmployee(
    IN p_emp_id INT
)
BEGIN
    DELETE FROM employees WHERE id = p_emp_id;
END $$
DELIMITER ;

DELIMITER $$
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
-- 4. FORGOT / RESET PASSWORD FLOW
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
DELIMITER ;

DELIMITER $$
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
DELIMITER ;

DELIMITER $$
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
DELIMITER ;

DELIMITER $$
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


CREATE TABLE office_location(
id INT AUTO_INCREMENT PRIMARY KEY,
office_name varchar(200),
latitude DECIMAL(10,8),
longitude DECIMAL(11,8),
radius INT DEFAULT 500,
status TINYINT(1) DEFAULT 1 ,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 

INSERT INTO office_location(
office_name, latitude, longitude, radius
)
VALUES(
"Excelsior Technologies",
23.0475,
72.5028,
500);

CREATE TABLE attendance
(
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

    FOREIGN KEY(employee_id)
    REFERENCES employees(id)
);

-- check in store procedure 

DELIMITER $$
CREATE PROCEDURE SP_CheckIn(
IN p_employee_id INT ,
IN p_latitude DECIMAL (10,8),
IN p_longitude DECIMAL (11,8),
IN p_accuracy DECIMAL(10,2)
)
BEGIN
IF EXISTS
(
SELECT 1
FROM attendance
WHERE employee_id = p_employee_id
AND attendance_date = CURDATE()
)
THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT='Already Checked In';

ELSE
INSERT INTO attendance(
employee_id,
attendance_date,
check_in,
check_in_latitude,
check_in_longitude,
check_in_accuracy
)
VALUES(
p_employee_id,
CURDATE(),
NOW(),
p_latitude,
p_longitude,
p_accuracy
);
END IF;

END $$
DELIMITER ;


-- check out store procedure 

 DELIMITER $$
CREATE PROCEDURE SP_CheckOut
(
    IN p_employee_id INT,
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_accuracy DECIMAL(10,2)
)
BEGIN

UPDATE attendance
SET
check_out = NOW(),
check_out_latitude = p_latitude,
check_out_longitude = p_longitude,
check_out_accuracy = p_accuracy,
work_hours = ROUND(
TIMESTAMPDIFF(MINUTE,check_in,NOW())/60,
2)

WHERE employee_id=p_employee_id
AND attendance_date=CURDATE();
END $$

DELIMITER ;

select * from employees;
select * from attendance;