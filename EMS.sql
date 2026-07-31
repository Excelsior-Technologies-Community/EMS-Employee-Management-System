CREATE DATABASE EMS;
USE EMS;
-- Roles Table
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
-- add department store procedure 
DELIMITER $$
CREATE PROCEDURE SP_AddDepartment(
    IN p_department_name VARCHAR(100),
    IN p_description VARCHAR(255)
)
BEGIN
INSERT INTO departments
(
department_name,
description
)
VALUES
(
p_department_name,
p_description
);
END $$
DELIMITER ;
-- add Employees store procedure 
DELIMITER $$
CREATE PROCEDURE SP_AddEmployee(
IN p_name VARCHAR(100),
IN p_email VARCHAR(100),
IN p_password VARCHAR(255),
IN p_role_id INT,
IN p_department_id INT
)
BEGIN
INSERT INTO employees
(
name,
email,
password,
role_id,
department_id
)
VALUES
(
p_name,
p_email,
p_password,
p_role_id,
p_department_id
);
END $$
DELIMITER ;
SELECT * FROM roles;
SELECT * FROM departments;
SELECT * FROM employees;
SELECT
e.id,
e.name,
e.email,
r.role_name,
d.department_name
FROM employees e
LEFT JOIN roles r
ON e.role_id=r.id
LEFT JOIN departments d
ON e.department_id=d.id;

-- Stored Procedures for Forgot / Reset Password Feature

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