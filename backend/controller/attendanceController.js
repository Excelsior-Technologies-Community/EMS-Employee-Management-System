import db from "../config/db.js";

// Haversine formula to calculate distance between two coordinates in meters
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
};

/**
 * Validate if coordinates are within any active office radius
 */
const validateOfficeRadius = async (lat, lon) => {
    const [offices] = await db.query("SELECT * FROM office_location WHERE status = 1");
    if (!offices || offices.length === 0) {
        return { inRange: true }; // Skip if no office location is defined/active
    }

    let inRange = false;
    let minDistance = Infinity;
    let officeName = "";
    let allowedRadius = 500;

    for (const office of offices) {
        const distance = getDistance(
            parseFloat(lat),
            parseFloat(lon),
            parseFloat(office.latitude),
            parseFloat(office.longitude)
        );

        if (distance <= office.radius) {
            inRange = true;
            officeName = office.office_name;
            break;
        }

        if (distance < minDistance) {
            minDistance = distance;
            officeName = office.office_name;
            allowedRadius = office.radius;
        }
    }

    return {
        inRange,
        distance: minDistance,
        officeName,
        allowedRadius
    };
};

/**
 * Check In
 */
export const CheckIn = async (req, res) => {
    try {
        const { latitude, longitude, accuracy } = req.body;
        let employee_id = req.user.id;

        // Allow Admin or HR to check in on behalf of an employee
        if ((req.user.role === 'Admin' || req.user.role === 'HR') && req.body.employee_id) {
            employee_id = parseInt(req.body.employee_id, 10);
        }

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude are required for check-in."
            });
        }

        // Validate office radius boundary for tagging
        const radiusValidation = await validateOfficeRadius(latitude, longitude);

        const checkInAccuracy = accuracy !== undefined ? accuracy : null;

        // Call the check-in stored procedure
        await db.query(
            "CALL SP_CheckIn(?, ?, ?, ?)",
            [employee_id, latitude, longitude, checkInAccuracy]
        );

        // Tag location as In-Office or WFH based on proximity validation
        const locationTag = radiusValidation.officeName
            ? (radiusValidation.inRange ? 'In-Office' : 'WFH')
            : null;

        if (locationTag) {
            await db.query(
                "UPDATE attendance SET remarks = ? WHERE employee_id = ? AND attendance_date = CURDATE()",
                [locationTag, employee_id]
            );
        }

        return res.status(200).json({
            success: true,
            message: "Checked in successfully!"
        });

    } catch (error) {
        // Detect "Already Checked In" from database signal
        if (error.message && error.message.includes("Already Checked In")) {
            return res.status(400).json({
                success: false,
                message: "Already Checked In today."
            });
        }

        console.error("Error occurred while checking in:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Check Out
 */
export const CheckOut = async (req, res) => {
    try {
        const { latitude, longitude, accuracy } = req.body;
        let employee_id = req.user.id;

        // Allow Admin or HR to check out on behalf of an employee
        if ((req.user.role === 'Admin' || req.user.role === 'HR') && req.body.employee_id) {
            employee_id = parseInt(req.body.employee_id, 10);
        }

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude are required for check-out."
            });
        }

        // Check if attendance record exists for today
        const [attendanceRows] = await db.query(
            "SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = CURDATE()",
            [employee_id]
        );

        if (!attendanceRows || attendanceRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Check-out denied. You have not checked in today."
            });
        }

        const record = attendanceRows[0];
        if (record.check_out) {
            return res.status(400).json({
                success: false,
                message: "Already Checked Out today."
            });
        }

        // Validate office radius boundary for tagging
        const radiusValidation = await validateOfficeRadius(latitude, longitude);

        const checkOutAccuracy = accuracy !== undefined ? accuracy : null;

        // Call the check-out stored procedure
        await db.query(
            "CALL SP_CheckOut(?, ?, ?, ?)",
            [employee_id, latitude, longitude, checkOutAccuracy]
        );

        // Tag location as In-Office or WFH based on proximity validation for Check-out
        const locationTag = radiusValidation.officeName
            ? (radiusValidation.inRange ? 'In-Office' : 'WFH')
            : null;

        if (locationTag) {
            await db.query(
                "UPDATE attendance SET remarks = CONCAT(COALESCE(remarks, ''), ' | Check-out: ', ?) WHERE employee_id = ? AND attendance_date = CURDATE()",
                [locationTag, employee_id]
            );
        }

        return res.status(200).json({
            success: true,
            message: "Checked out successfully!"
        });

    } catch (error) {
        console.error("Error occurred while checking out:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Get Today's Attendance Status
 */
export const getAttendanceStatus = async (req, res) => {
    try {
        let employee_id = req.user.id;

        // Allow Admin or HR to view status of another employee
        if ((req.user.role === 'Admin' || req.user.role === 'HR') && req.query.employee_id) {
            employee_id = parseInt(req.query.employee_id, 10);
        }

        const [rows] = await db.query(
            "SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = CURDATE()",
            [employee_id]
        );

        return res.status(200).json({
            success: true,
            data: rows && rows.length > 0 ? rows[0] : null
        });

    } catch (error) {
        console.error("Error occurred fetching attendance status:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Get Attendance History for Logged In User
 */
export const getMyAttendanceHistory = async (req, res) => {
    try {
        const employee_id = req.user.id;

        // Fetch last 30 attendance records in descending order
        const [rows] = await db.query(
            "SELECT * FROM attendance WHERE employee_id = ? ORDER BY attendance_date DESC LIMIT 30",
            [employee_id]
        );

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Error occurred fetching attendance history:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};