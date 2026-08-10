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

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin or local network private IP origins
        if (!origin || 
            allowedOrigins.includes(origin) || 
            origin.startsWith('http://10.') || 
            origin.startsWith('http://192.168.') || 
            origin.startsWith('http://172.')) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
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

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});