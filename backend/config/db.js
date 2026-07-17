import mysql from 'mysql2';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Create a connection pool to the MySQL database.
 * Utilizing a pool is more efficient for web servers than opening and closing 
 * individual connections for every request.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the database connection pool on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Mysql Connection failed:", err.message);
    } else {
        console.log("Connection to MYSQL database successfully!");
        connection.release(); // Return connection back to pool
    }
});

// Convert pool to support Promise-based async/await syntax
const db = pool.promise();

export default db;