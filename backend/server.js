import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { setupSwagger } from "./config/swagger.js";

import employeeRoutes from "./routes/employeeRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    `http://localhost:${PORT}`,
].filter(Boolean);

const isPrivateIP = (hostname) => {
    if (!hostname) return false;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

    // Check for 10.x.x.x
    if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) return true;

    // Check for 172.16.x.x to 172.31.x.x
    const parts = hostname.split('.');
    if (parts.length === 4) {
        const first = parseInt(parts[0], 10);
        const second = parseInt(parts[1], 10);
        if (first === 172 && second >= 16 && second <= 31) return true;
    }

    // Check for 192.168.x.x
    if (/^192\.168\.\d+\.\d+$/.test(hostname)) return true;

    return false;
};

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) {
            callback(null, true);
            return;
        }

        try {
            const url = new URL(origin);
            const hostname = url.hostname;

            if (allowedOrigins.includes(origin) || isPrivateIP(hostname)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS: origin ${origin} not allowed`));
            }
        } catch (e) {
            callback(new Error(`CORS: Invalid origin ${origin}`));
        }
    },
    credentials: true,
}));
app.use(express.json());

// Swagger
setupSwagger(app);

// Home Route
app.get("/", (req, res) => {
    res.send("EMS Backend is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/attendance", attendanceRoutes);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started at http://localhost:${PORT} (listening on all interfaces: 0.0.0.0)`);
});