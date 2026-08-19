import db from "./config/db.js";

async function run() {
    try {
        console.log("Testing DB connection...");
        const [tables] = await db.query("SHOW TABLES");
        console.log("Tables:", tables);

        const [employeeRows] = await db.query("SELECT id, name, role_id FROM employees LIMIT 5");
        console.log("Employees:", employeeRows);

        const [leaveRows] = await db.query("SELECT id, employee_id, approved_by, status FROM leaves LIMIT 5");
        console.log("Leaves:", leaveRows);
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        process.exit(0);
    }
}

run();
