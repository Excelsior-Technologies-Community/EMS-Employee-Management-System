import db from '../config/db.js';

async function testApprovalWorkflow() {
    const baseUrl = 'http://localhost:5000';
    console.log("=== STARTING LEAVE APPROVAL WORKFLOW TESTS ===");

    // Helper: Login
    async function login(email, password) {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const json = await res.json();
        return json.token;
    }

    try {
        // Setup Test State: set department_id for employees
        console.log("Setting up database departments for testing...");
        // Ensure departments 1 and 2 exist
        const [depts] = await db.query("SELECT id FROM departments LIMIT 2");
        if (depts.length < 2) {
            throw new Error("Test requires at least 2 departments in the database.");
        }
        const dept1 = depts[0].id;
        const dept2 = depts[1].id;

        // Set departments: Prem and Manager in dept1, Meet in dept2
        await db.query("UPDATE employees SET department_id = ? WHERE email = ?", [dept1, "prem@gmail.com"]);
        await db.query("UPDATE employees SET department_id = ? WHERE email = ?", [dept1, "manager@gmail.com"]);
        await db.query("UPDATE employees SET department_id = ? WHERE email = ?", [dept2, "meet@gmail.com"]);
        console.log(`✓ Departments configured: Prem & Manager in Dept ${dept1}, Meet in Dept ${dept2}.`);

        console.log("Logging in users...");
        const premToken = await login('prem@gmail.com', 'Password@123');
        const meetToken = await login('meet@gmail.com', 'Password@123');
        const managerToken = await login('manager@gmail.com', 'Password@123');
        const hrToken = await login('hr@gmail.com', 'Password@123');

        if (!premToken || !meetToken || !managerToken || !hrToken) {
            throw new Error("Failed to log in test users.");
        }
        console.log("✓ All test users logged in successfully.");

        // Clear any pending leaves for test users to start fresh
        const [premUser] = await db.query("SELECT id FROM employees WHERE email = 'prem@gmail.com'");
        const [meetUser] = await db.query("SELECT id FROM employees WHERE email = 'meet@gmail.com'");
        const premId = premUser[0].id;
        const meetId = meetUser[0].id;

        await db.query("DELETE FROM leaves WHERE employee_id IN (?, ?)", [premId, meetId]);
        console.log("✓ Existing leaves cleared for test users.");

        // 1. Apply leaves
        console.log("\n1. Prem applying for leave...");
        let res = await fetch(`${baseUrl}/api/leaves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${premToken}` },
            body: JSON.stringify({
                leave_type_id: 1,
                start_date: "2026-09-01",
                end_date: "2026-09-03",
                reason: "Prem vacation"
            })
        });
        let json = await res.json();
        if (res.status !== 201) throw new Error("Prem apply leave failed");
        console.log("✓ Prem applied successfully.");

        console.log("Meet applying for leave...");
        res = await fetch(`${baseUrl}/api/leaves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${meetToken}` },
            body: JSON.stringify({
                leave_type_id: 1,
                start_date: "2026-09-10",
                end_date: "2026-09-12",
                reason: "Meet sick leave"
            })
        });
        json = await res.json();
        if (res.status !== 201) throw new Error("Meet apply leave failed");
        console.log("✓ Meet applied successfully.");

        // Fetch the leave IDs
        const [premLeaves] = await db.query("SELECT id FROM leaves WHERE employee_id = ? AND status='Pending'", [premId]);
        const [meetLeaves] = await db.query("SELECT id FROM leaves WHERE employee_id = ? AND status='Pending'", [meetId]);
        const premLeaveId = premLeaves[0].id;
        const meetLeaveId = meetLeaves[0].id;
        console.log(`✓ Leave IDs: Prem = ${premLeaveId}, Meet = ${meetLeaveId}`);

        // 2. Prevent self approval / self rejection
        console.log("\n2. Testing self approval prevention...");
        res = await fetch(`${baseUrl}/api/leaves/${premLeaveId}/approve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${premToken}` },
            body: JSON.stringify({ approval_reason: "Self approve" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Response:", json);
        if (res.status !== 403 || json.success) throw new Error("Self-approval should be blocked with 403");

        console.log("Testing self rejection prevention...");
        res = await fetch(`${baseUrl}/api/leaves/${premLeaveId}/reject`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${premToken}` },
            body: JSON.stringify({ rejection_reason: "Self reject" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Response:", json);
        if (res.status !== 403 || json.success) throw new Error("Self-rejection should be blocked with 403");

        // 3. Manager team restriction on pending list
        console.log("\n3. Testing Manager pending queue retrieval...");
        res = await fetch(`${baseUrl}/api/leaves/pending`, {
            headers: { 'Authorization': `Bearer ${managerToken}` }
        });
        json = await res.json();
        console.log("Status:", res.status, "Pending leaves visible to Manager:", json.data.map(l => `${l.employee_name} (ID ${l.employee_id})`));
        // Manager should see Prem's leave but NOT Meet's leave
        const visibleEmployeeIds = json.data.map(l => l.employee_id);
        if (visibleEmployeeIds.includes(meetId)) {
            throw new Error("Manager saw pending leave of employee from another department!");
        }
        if (!visibleEmployeeIds.includes(premId)) {
            throw new Error("Manager could not see team employee's pending leave");
        }
        console.log("✓ Manager team restriction on pending list works perfectly.");

        // 4. Manager team restriction on approving different team
        console.log("\n4. Testing Manager department approval restriction...");
        res = await fetch(`${baseUrl}/api/leaves/${meetLeaveId}/approve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
            body: JSON.stringify({ approval_reason: "Approve different team" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Response:", json);
        if (res.status !== 403 || json.success) throw new Error("Manager should be blocked from approving other team's leaves");

        console.log("Testing Manager department rejection restriction...");
        res = await fetch(`${baseUrl}/api/leaves/${meetLeaveId}/reject`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
            body: JSON.stringify({ rejection_reason: "Reject different team" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Response:", json);
        if (res.status !== 403 || json.success) throw new Error("Manager should be blocked from rejecting other team's leaves");

        // 5. Successful approval by Manager
        console.log("\n5. Testing successful approval by team Manager...");
        res = await fetch(`${baseUrl}/api/leaves/${premLeaveId}/approve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
            body: JSON.stringify({ approval_reason: "Approved for family trip" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Response:", json);
        if (res.status !== 200 || !json.success) throw new Error("Manager approval failed");

        // Verify DB values
        const [premDbRows] = await db.query("SELECT status, approved_by, approved_at, approval_reason FROM leaves WHERE id = ?", [premLeaveId]);
        console.log("DB record post-approval:", premDbRows[0]);
        if (premDbRows[0].status !== 'Approved' || premDbRows[0].approval_reason !== 'Approved for family trip') {
            throw new Error("DB values mismatch after approval");
        }

        // 6. Double approval prevention
        console.log("\n6. Testing double approval prevention...");
        res = await fetch(`${baseUrl}/api/leaves/${premLeaveId}/approve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
            body: JSON.stringify({ approval_reason: "Approve again" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Response:", json);
        if (res.status !== 400 || json.success) throw new Error("Double approval should return 400");

        // 7. Prevent reject after approval
        console.log("\n7. Testing reject after approval prevention...");
        res = await fetch(`${baseUrl}/api/leaves/${premLeaveId}/reject`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
            body: JSON.stringify({ rejection_reason: "Reject approved leave" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Response:", json);
        if (res.status !== 400 || json.success) throw new Error("Reject after approval should return 400");

        // 8. Successful rejection by HR (on Meet's leave in different department)
        console.log("\n8. Testing successful rejection by HR...");
        res = await fetch(`${baseUrl}/api/leaves/${meetLeaveId}/reject`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hrToken}` },
            body: JSON.stringify({ rejection_reason: "Project workload too high" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Response:", json);
        if (res.status !== 200 || !json.success) throw new Error("HR rejection failed");

        // Verify DB values
        const [meetDbRows] = await db.query("SELECT status, approved_by, approved_at, rejection_reason FROM leaves WHERE id = ?", [meetLeaveId]);
        console.log("DB record post-rejection:", meetDbRows[0]);
        if (meetDbRows[0].status !== 'Rejected' || meetDbRows[0].rejection_reason !== 'Project workload too high') {
            throw new Error("DB values mismatch after rejection");
        }

        // 9. Prevent approve after rejection
        console.log("\n9. Testing approve after rejection prevention...");
        res = await fetch(`${baseUrl}/api/leaves/${meetLeaveId}/approve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hrToken}` },
            body: JSON.stringify({ approval_reason: "Approve rejected leave" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Response:", json);
        if (res.status !== 400 || json.success) throw new Error("Approve after rejection should return 400");

        console.log("\n=== ALL APPROVAL WORKFLOW TESTS PASSED SUCCESSFULLY ===");

    } catch (e) {
        console.error("\nFAIL:", e.message);
        process.exit(1);
    }
    process.exit(0);
}

testApprovalWorkflow();
