import db from './config/db.js';

async function testQuery() {
    try {
        const [tables] = await db.query("SHOW TABLES");
        console.log("TABLES IN DB:", tables.map(t => Object.values(t)[0]));

        const [procedures] = await db.query("SHOW PROCEDURE STATUS WHERE Db = ?", [process.env.DB_NAME || 'EMS']);
        console.log("PROCEDURES IN DB:", procedures.map(p => p.Name));
    } catch (e) {
        console.error("DB Query error:", e.message);
    }
    process.exit(0);
}

testQuery();
