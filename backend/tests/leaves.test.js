async function testAPIs() {
    const baseUrl = 'http://localhost:5000';
    console.log("=== STARTING LEAVE API TESTS ===");

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
        console.log("Logging in as prem@gmail.com (Employee)...");
        const premToken = await login('prem@gmail.com', 'Password@123');
        if (!premToken) throw new Error("Could not log in as prem");
        console.log("✓ Prem logged in successfully.");

        console.log("Logging in as meet@gmail.com (Employee)...");
        const meetToken = await login('meet@gmail.com', 'Password@123');
        if (!meetToken) throw new Error("Could not log in as meet");
        console.log("✓ Meet logged in successfully.");

        // Clear any old leaves for prem to avoid overlapping constraint on rerun
        // We will generate unique dates in the future based on current date
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 30); // 30 days in the future
        
        const formatDate = (d) => d.toISOString().split('T')[0];

        const start1 = formatDate(baseDate);
        baseDate.setDate(baseDate.getDate() + 2);
        const end1 = formatDate(baseDate); // 3 days total

        // 1. Success case: Create leave
        console.log("\n1. Testing successful leave application...");
        let res = await fetch(`${baseUrl}/api/leaves`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${premToken}`
            },
            body: JSON.stringify({
                leave_type_id: 1,
                start_date: start1,
                end_date: end1,
                reason: "Vacation with family"
            })
        });
        let json = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", json);
        if (res.status !== 201 || !json.success) throw new Error("Apply leave failed");

        // 2. Overlapping leave case
        console.log("\n2. Testing overlapping leave application (same dates)...");
        res = await fetch(`${baseUrl}/api/leaves`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${premToken}`
            },
            body: JSON.stringify({
                leave_type_id: 1,
                start_date: start1,
                end_date: end1,
                reason: "Overlapping request"
            })
        });
        json = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", json);
        if (res.status !== 409 || json.success) throw new Error("Overlapping leave was not rejected");

        // 3. Past date validation
        console.log("\n3. Testing past date validation...");
        res = await fetch(`${baseUrl}/api/leaves`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${premToken}`
            },
            body: JSON.stringify({
                leave_type_id: 1,
                start_date: "2026-08-15",
                end_date: "2026-08-16",
                reason: "Past date test"
            })
        });
        json = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", json);
        if (res.status !== 400 || json.success) throw new Error("Past date was not rejected");

        // 4. End date before start date validation
        console.log("\n4. Testing end date before start date validation...");
        res = await fetch(`${baseUrl}/api/leaves`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${premToken}`
            },
            body: JSON.stringify({
                leave_type_id: 1,
                start_date: "2026-09-10",
                end_date: "2026-09-08",
                reason: "Invalid range"
            })
        });
        json = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", json);
        if (res.status !== 400 || json.success) throw new Error("Invalid date range was not rejected");

        // 5. Inactive/invalid leave type validation
        console.log("\n5. Testing invalid leave type validation...");
        res = await fetch(`${baseUrl}/api/leaves`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${premToken}`
            },
            body: JSON.stringify({
                leave_type_id: 999,
                start_date: "2026-09-10",
                end_date: "2026-09-12",
                reason: "Invalid type"
            })
        });
        json = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", json);
        if (res.status !== 404 || json.success) throw new Error("Invalid leave type was not rejected");

        // 6. Get My Leaves
        console.log("\n6. Testing GET /api/leaves/my...");
        res = await fetch(`${baseUrl}/api/leaves/my`, {
            headers: { 'Authorization': `Bearer ${premToken}` }
        });
        json = await res.json();
        console.log("Status:", res.status);
        console.log("First Leave details:", json.data ? json.data[0] : null);
        if (res.status !== 200 || !json.success || !json.data || json.data.length === 0) throw new Error("Get my leaves failed");

        const leaveId = json.data[0].id;

        // 7. Get Leave By ID (Own)
        console.log(`\n7. Testing GET /api/leaves/${leaveId} (Own)...`);
        res = await fetch(`${baseUrl}/api/leaves/${leaveId}`, {
            headers: { 'Authorization': `Bearer ${premToken}` }
        });
        json = await res.json();
        console.log("Status:", res.status);
        console.log("Leave data:", json.data);
        if (res.status !== 200 || !json.success || !json.data || json.data.id !== leaveId) throw new Error("Get leave by ID failed");

        // 8. Get Leave By ID (Other employee's leave)
        console.log(`\n8. Testing GET /api/leaves/${leaveId} (Other employee - Meet trying to access Prem's leave)...`);
        res = await fetch(`${baseUrl}/api/leaves/${leaveId}`, {
            headers: { 'Authorization': `Bearer ${meetToken}` }
        });
        json = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", json);
        if (res.status !== 404 || json.success) throw new Error("Should have returned 404 for other employee's leave");

        console.log("\n=== ALL TESTS PASSED SUCCESSFULLY ===");
    } catch (e) {
        console.error("\nFAIL:", e.message);
        process.exit(1);
    }
    process.exit(0);
}

testAPIs();
