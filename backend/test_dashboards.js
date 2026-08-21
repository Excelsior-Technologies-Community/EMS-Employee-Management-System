import db from "./config/db.js";
import jwt from "jsonwebtoken";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "MySuperSecretKey@123";
const PORT = process.env.PORT || 5000;

// Helper to make GET requests with authorization headers
const makeGetRequest = (path, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: "localhost",
            port: PORT,
            path: path,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        };

        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, body: parsed });
                } catch (err) {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });

        req.on("error", (err) => {
            reject(err);
        });

        req.end();
    });
};

async function test() {
    try {
        console.log("\n==================================================");
        console.log("RUNNING EMS DASHBOARD ENDPOINT VERIFICATION TESTS");
        console.log("==================================================\n");

        // 1. Fetch users for each role from DB
        const [users] = await db.query(`
            SELECT e.id, e.name, e.email, r.role_name 
            FROM employees e 
            JOIN roles r ON e.role_id = r.id
            WHERE e.status = 1
        `);

        const adminUser = users.find(u => u.role_name === "Admin");
        const hrUser = users.find(u => u.role_name === "HR");
        const managerUser = users.find(u => u.role_name === "Manager");
        const employeeUser = users.find(u => u.role_name === "Employee");

        console.log("Users Found in DB:");
        console.log("  Admin:   ", adminUser ? `${adminUser.name} (${adminUser.email})` : "NOT FOUND (Will skip Admin tests)");
        console.log("  HR:      ", hrUser ? `${hrUser.name} (${hrUser.email})` : "NOT FOUND (Will skip HR tests)");
        console.log("  Manager: ", managerUser ? `${managerUser.name} (${managerUser.email})` : "NOT FOUND (Will skip Manager tests)");
        console.log("  Employee:", employeeUser ? `${employeeUser.name} (${employeeUser.email})` : "NOT FOUND (Will skip Employee tests)");
        console.log("");

        // Generate tokens
        const adminToken = adminUser ? jwt.sign({ id: adminUser.id, role: adminUser.role_name }, JWT_SECRET, { expiresIn: "1h" }) : null;
        const hrToken = hrUser ? jwt.sign({ id: hrUser.id, role: hrUser.role_name }, JWT_SECRET, { expiresIn: "1h" }) : null;
        const managerToken = managerUser ? jwt.sign({ id: managerUser.id, role: managerUser.role_name }, JWT_SECRET, { expiresIn: "1h" }) : null;
        const employeeToken = employeeUser ? jwt.sign({ id: employeeUser.id, role: employeeUser.role_name }, JWT_SECRET, { expiresIn: "1h" }) : null;

        const endpoints = [
            { path: "/api/dashboard/admin", allowedRole: "Admin", token: adminToken },
            { path: "/api/dashboard/hr", allowedRole: "HR", token: hrToken },
            { path: "/api/dashboard/manager", allowedRole: "Manager", token: managerToken },
            { path: "/api/dashboard/employee", allowedRole: "Employee", token: employeeToken }
        ];

        let failedTests = 0;

        // Test 1: Unauthenticated Requests (No token)
        console.log("--- TEST group 1: Unauthenticated Requests (Expect 401) ---");
        for (const ep of endpoints) {
            const res = await makeGetRequest(ep.path, null);
            if (res.statusCode === 401) {
                console.log(`  [PASS] GET ${ep.path} without token -> 401 Unauthorized`);
            } else {
                console.log(`  [FAIL] GET ${ep.path} without token -> Expected 401 but got ${res.statusCode}`);
                failedTests++;
            }
        }
        console.log("");

        // Test 2: Dashboard Authorization (Role Checks)
        console.log("--- TEST group 2: Dashboard Authorization (Expect 403 for other roles) ---");
        const tokensMap = {
            "Admin": adminToken,
            "HR": hrToken,
            "Manager": managerToken,
            "Employee": employeeToken
        };

        for (const ep of endpoints) {
            for (const [roleName, token] of Object.entries(tokensMap)) {
                if (!token) continue; // Skip if role not found in DB

                const res = await makeGetRequest(ep.path, token);

                if (roleName === ep.allowedRole) {
                    if (res.statusCode === 200) {
                        console.log(`  [PASS] GET ${ep.path} with ${roleName} token -> 200 OK`);
                        
                        // Structure Validation
                        if (ep.allowedRole === "Admin") {
                            const data = res.body.data;
                            if (data && 'totalEmployees' in data && 'todayPresent' in data && 'todayAbsent' in data) {
                                console.log("         Structure valid: contains employee counts and attendance counts.");
                            } else {
                                console.log("         [FAIL] Invalid Admin Dashboard payload structure:", res.body);
                                failedTests++;
                            }
                        } else if (ep.allowedRole === "HR") {
                            const data = res.body.data;
                            if (data && 'departmentWiseEmployees' in data && 'attendanceSummary' in data) {
                                console.log("         Structure valid: contains departmentWise count and attendanceSummary.");
                            } else {
                                console.log("         [FAIL] Invalid HR Dashboard payload structure:", res.body);
                                failedTests++;
                            }
                        } else if (ep.allowedRole === "Manager") {
                            const data = res.body.data;
                            if (data && 'totalTeamMembers' in data && Array.isArray(data.todayTeamAttendance)) {
                                console.log("         Structure valid: contains totalTeamMembers and todayTeamAttendance array.");
                            } else {
                                console.log("         [FAIL] Invalid Manager Dashboard payload structure:", res.body);
                                failedTests++;
                            }
                        } else if (ep.allowedRole === "Employee") {
                            const data = res.body.data;
                            if (data && 'ownAttendanceSummary' in data && Array.isArray(data.leaveBalance)) {
                                console.log("         Structure valid: contains ownAttendanceSummary and leaveBalance array.");
                            } else {
                                console.log("         [FAIL] Invalid Employee Dashboard payload structure:", res.body);
                                failedTests++;
                            }
                        }

                    } else {
                        console.log(`  [FAIL] GET ${ep.path} with ${roleName} token -> Expected 200 but got ${res.statusCode}`, res.body);
                        failedTests++;
                    }
                } else {
                    if (res.statusCode === 403) {
                        console.log(`  [PASS] GET ${ep.path} with ${roleName} token -> 403 Forbidden`);
                    } else {
                        console.log(`  [FAIL] GET ${ep.path} with ${roleName} token -> Expected 403 but got ${res.statusCode}`);
                        failedTests++;
                    }
                }
            }
        }
        console.log("");

        console.log("==================================================");
        if (failedTests === 0) {
            console.log(" ALL TESTS PASSED SUCCESSFULLY! ✅");
        } else {
            console.log(` ${failedTests} TESTS FAILED! ❌`);
        }
        console.log("==================================================\n");

    } catch (error) {
        console.error("Test execution failed:", error);
    } finally {
        process.exit(0);
    }
}

test();
