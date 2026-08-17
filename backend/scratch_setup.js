import db from './config/db.js';

async function setup() {
    try {
        console.log("Setting up database tables and procedures...");

        // 1. Create leaves table
        await db.query(`
            CREATE TABLE IF NOT EXISTS leaves (
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_leaves_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
                CONSTRAINT fk_leaves_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
                CONSTRAINT fk_leaves_approver FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
            )
        `);
        console.log("✓ Table 'leaves' created or verified.");

        // 2. Drop and recreate SP_DeleteLeaveType
        await db.query(`DROP PROCEDURE IF EXISTS SP_DeleteLeaveType`);
        await db.query(`
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
            END
        `);
        console.log("✓ Stored Procedure 'SP_DeleteLeaveType' created.");

        // 3. Drop and recreate SP_ApplyLeave
        await db.query(`DROP PROCEDURE IF EXISTS SP_ApplyLeave`);
        await db.query(`
            CREATE PROCEDURE SP_ApplyLeave(
                IN p_employee_id INT,
                IN p_leave_type_id INT,
                IN p_start_date DATE,
                IN p_end_date DATE,
                IN p_reason VARCHAR(255)
            )
            BEGIN
                DECLARE v_active TINYINT(1) DEFAULT 0;
                DECLARE v_exists INT DEFAULT 0;

                SELECT COUNT(*), IFNULL(MAX(status), 0) INTO v_exists, v_active
                FROM leave_types
                WHERE id = p_leave_type_id;

                IF v_exists = 0 THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Leave type not found.';
                ELSEIF v_active = 0 THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Leave type is inactive.';
                END IF;

                IF p_end_date < p_start_date THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'End date cannot be before start date.';
                END IF;

                IF EXISTS (
                    SELECT 1
                    FROM leaves
                    WHERE employee_id = p_employee_id
                      AND status IN ('Pending', 'Approved')
                      AND start_date <= p_end_date
                      AND end_date >= p_start_date
                ) THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Overlapping leave application exists.';
                END IF;

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
                    DATEDIFF(p_end_date, p_start_date) + 1,
                    p_reason,
                    'Pending'
                );
            END
        `);
        console.log("✓ Stored Procedure 'SP_ApplyLeave' created.");
        console.log("Setup completed successfully!");
    } catch (e) {
        console.error("Setup failed with error:", e.message);
    }
    process.exit(0);
}

setup();
