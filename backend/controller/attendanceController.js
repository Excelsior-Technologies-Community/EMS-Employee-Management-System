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

        // Retrieve the check-in time to update status
        const [attendanceRows] = await db.query(
            "SELECT id, check_in FROM attendance WHERE employee_id = ? AND attendance_date = CURDATE()",
            [employee_id]
        );

        if (attendanceRows.length > 0) {
            const attendance = attendanceRows[0];
            const [timeRows] = await db.query(
                "SELECT TIME(check_in) AS check_in_time FROM attendance WHERE id = ?",
                [attendance.id]
            );
            const checkInTime = timeRows[0].check_in_time;

            let status = "Present";
            if (checkInTime > "10:00:00") {
                status = "Late";
            }

            await db.query(
                "UPDATE attendance SET status = ? WHERE id = ?",
                [status, attendance.id]
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

        // Retrieve work_hours and check_in to update status
        const [updatedRows] = await db.query(
            "SELECT id, check_in, work_hours FROM attendance WHERE employee_id = ? AND attendance_date = CURDATE()",
            [employee_id]
        );

        if (updatedRows.length > 0) {
            const attendance = updatedRows[0];
            const workHours = parseFloat(attendance.work_hours || 0);

            let status = "Present";
            if (workHours < 4) {
                status = "Half Day";
            } else {
                const [timeRows] = await db.query(
                    "SELECT TIME(check_in) AS check_in_time FROM attendance WHERE id = ?",
                    [attendance.id]
                );
                const checkInTime = timeRows[0].check_in_time;
                if (checkInTime > "10:00:00") {
                    status = "Late";
                } else {
                    status = "Present";
                }
            }

            await db.query(
                "UPDATE attendance SET status = ? WHERE id = ?",
                [status, attendance.id]
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
        const { from, to } = req.query;

        let sql = "SELECT * FROM attendance WHERE employee_id = ?";
        const params = [employee_id];

        if (from) {
            sql += " AND attendance_date >= ?";
            params.push(from);
        }
        if (to) {
            sql += " AND attendance_date <= ?";
            params.push(to);
        }

        sql += " ORDER BY attendance_date DESC LIMIT 100";

        const [rows] = await db.query(sql, params);

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

/**
 * Helper to count weekdays (Monday to Friday) in a month
 */
const countWeekdays = (month, year, maxDay = null) => {
    let count = 0;
    const startDate = new Date(year, month - 1, 1);

    let endDate;
    if (maxDay) {
        endDate = new Date(year, month - 1, maxDay);
    } else {
        endDate = new Date(year, month, 0);
    }

    const current = new Date(startDate);
    while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Monday to Friday
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
};

/**
 * Get Monthly Attendance Report for the Logged In User (Self Only)
 */
export const getMonthlyReport = async (req, res) => {
    try {
        const employee_id = req.user.id;
        const month = req.query.month ? parseInt(req.query.month, 10) : new Date().getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

        if (isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                message: "Invalid month. Month must be between 1 and 12."
            });
        }
        if (isNaN(year) || year < 2000 || year > 2100) {
            return res.status(400).json({
                success: false,
                message: "Invalid year."
            });
        }

        // Fetch employee joining/created date
        const [empRows] = await db.query(
            "SELECT DATE(created_at) AS joining_date FROM employees WHERE id = ?",
            [employee_id]
        );
        let joiningDate = null;
        if (empRows.length > 0 && empRows[0].joining_date) {
            joiningDate = new Date(empRows[0].joining_date);
        }

        // Calculate working days based on joining date
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const monthStart = new Date(year, month - 1, 1);
        let endDate = new Date(year, month, 0); // last day of month
        if (year === currentYear && month === currentMonth) {
            endDate = today;
        }

        let effectiveStart = monthStart;
        if (joiningDate && joiningDate > monthStart) {
            effectiveStart = joiningDate;
        }

        let workingDays = 0;
        if (effectiveStart <= endDate) {
            let current = new Date(effectiveStart);
            current.setHours(0, 0, 0, 0);
            const limitDate = new Date(endDate);
            limitDate.setHours(0, 0, 0, 0);

            while (current <= limitDate) {
                const dayOfWeek = current.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Monday to Friday
                    workingDays++;
                }
                current.setDate(current.getDate() + 1);
            }
        }

        // Format dates as YYYY-MM-DD strings for SQL query
        const formatDateStr = (date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };
        const startStr = formatDateStr(effectiveStart);
        const endStr = formatDateStr(endDate);

        // Fetch user records
        const [rows] = await db.query(
            "SELECT attendance_date, check_in, check_out, status, work_hours, remarks FROM attendance WHERE employee_id = ? AND attendance_date >= ? AND attendance_date <= ? ORDER BY attendance_date ASC",
            [employee_id, startStr, endStr]
        );

        let presentDays = 0;
        let lateDays = 0;
        let halfDays = 0;
        let totalWorkHours = 0;

        rows.forEach(r => {
            if (r.status === 'Present') presentDays++;
            else if (r.status === 'Late') lateDays++;
            else if (r.status === 'Half Day') halfDays++;

            if (r.work_hours) {
                totalWorkHours += parseFloat(r.work_hours);
            }
        });

        const markedCount = presentDays + lateDays + halfDays;
        const absentDays = Math.max(0, workingDays - markedCount);

        return res.status(200).json({
            success: true,
            message: "Monthly attendance report retrieved successfully",
            data: {
                summary: {
                    workingDays,
                    presentDays,
                    lateDays,
                    halfDays,
                    absentDays,
                    totalWorkHours: Number(totalWorkHours.toFixed(2))
                },
                breakdown: rows
            }
        });

    } catch (error) {
        console.error("Error occurred fetching monthly report:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Get Monthly Attendance Report for All Active Employees (Admin/HR/Manager Only)
 */
export const getMonthlyReportAll = async (req, res) => {
    try {
        const month = req.query.month ? parseInt(req.query.month, 10) : new Date().getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
        const { department_id } = req.query;

        if (isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                message: "Invalid month. Month must be between 1 and 12."
            });
        }
        if (isNaN(year) || year < 2000 || year > 2100) {
            return res.status(400).json({
                success: false,
                message: "Invalid year."
            });
        }

        let query = `
            SELECT 
                e.name,
                e.email,
                d.department_name,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_days,
                SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_days,
                SUM(CASE WHEN a.status = 'Half Day' THEN 1 ELSE 0 END) AS half_days,
                COUNT(a.id) AS marked_days,
                COALESCE(SUM(a.work_hours), 0) AS total_work_hours
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN attendance a ON e.id = a.employee_id AND MONTH(a.attendance_date) = ? AND YEAR(a.attendance_date) = ?
            WHERE e.status = 1
        `;
        const params = [month, year];

        if (department_id) {
            query += " AND e.department_id = ?";
            params.push(parseInt(department_id, 10));
        }

        query += " GROUP BY e.id, e.name, e.email, d.department_name ORDER BY e.name ASC";

        const [rows] = await db.query(query, params);

        const formattedRows = rows.map(r => ({
            name: r.name,
            email: r.email,
            department_name: r.department_name || "N/A",
            present_days: Number(r.present_days || 0),
            late_days: Number(r.late_days || 0),
            half_days: Number(r.half_days || 0),
            marked_days: Number(r.marked_days || 0),
            total_work_hours: Number(parseFloat(r.total_work_hours || 0).toFixed(2))
        }));

        return res.status(200).json({
            success: true,
            message: "All employees monthly attendance report retrieved successfully",
            data: formattedRows
        });

    } catch (error) {
        console.error("Error occurred fetching all employees monthly report:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

const combineDateAndTime = (dateStr, timeStr) => {
    if (!timeStr) return null;
    if (timeStr.includes('T') || timeStr.includes(' ')) {
        return timeStr;
    }
    const formattedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    // Format date if it contains ISO T
    const formattedDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    return `${formattedDate} ${formattedTime}`;
};

/**
 * Get all attendance records (Admin/HR/Manager)
 */
export const getAllAttendance = async (req, res) => {
    try {
        const { date, department_id, employee_id } = req.query;
        let query = `
            SELECT 
                a.id,
                a.employee_id,
                e.name AS employee_name,
                d.department_name,
                a.attendance_date,
                a.check_in,
                a.check_out,
                a.work_hours,
                a.status,
                a.remarks
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            const formattedDate = date.includes('T') ? date.split('T')[0] : date;
            query += " AND a.attendance_date = ?";
            params.push(formattedDate);
        }
        if (department_id) {
            query += " AND e.department_id = ?";
            params.push(parseInt(department_id, 10));
        }
        if (employee_id) {
            query += " AND a.employee_id = ?";
            params.push(parseInt(employee_id, 10));
        }

        query += " ORDER BY a.attendance_date DESC, e.name ASC";

        const [rows] = await db.query(query, params);

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error occurred while fetching all attendance:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

/**
 * Save manual attendance record (Add or Edit) - Admin/HR only
 */
export const saveAttendanceManual = async (req, res) => {
    try {
        const { employee_id, attendance_date, check_in, check_out, status, remarks } = req.body;

        if (!employee_id || !attendance_date || !status) {
            return res.status(400).json({
                success: false,
                message: "Employee, Date, and Status are required."
            });
        }

        const formattedDate = attendance_date.includes('T') ? attendance_date.split('T')[0] : attendance_date;
        const checkInDateTime = combineDateAndTime(formattedDate, check_in);
        const checkOutDateTime = combineDateAndTime(formattedDate, check_out);

        let work_hours = null;
        if (checkInDateTime && checkOutDateTime) {
            const checkInDate = new Date(checkInDateTime);
            const checkOutDate = new Date(checkOutDateTime);
            if (checkOutDate > checkInDate) {
                const diffMs = checkOutDate - checkInDate;
                work_hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
            }
        }

        // Check if attendance record already exists for this employee on this date
        const [existing] = await db.query(
            "SELECT id FROM attendance WHERE employee_id = ? AND attendance_date = ?",
            [employee_id, formattedDate]
        );

        if (existing && existing.length > 0) {
            // Update
            const recordId = existing[0].id;
            await db.query(
                "UPDATE attendance SET check_in = ?, check_out = ?, status = ?, remarks = ?, work_hours = ? WHERE id = ?",
                [checkInDateTime, checkOutDateTime, status, remarks || null, work_hours, recordId]
            );
            return res.status(200).json({
                success: true,
                message: "Attendance updated successfully!"
            });
        } else {
            // Insert
            await db.query(
                "INSERT INTO attendance (employee_id, attendance_date, check_in, check_out, status, remarks, work_hours) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [employee_id, formattedDate, checkInDateTime, checkOutDateTime, status, remarks || null, work_hours]
            );
            return res.status(201).json({
                success: true,
                message: "Attendance recorded successfully!"
            });
        }
    } catch (error) {
        console.error("Error saving manual attendance:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};