import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { sendOTPEmail } from '../config/emailService.js';
import {OAuth2Client} from 'google-auth-library';
const googleClient  = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, );

// Startup pe JWT_SECRET validate karo

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not defined in environment variables. Exiting.');
    process.exit(1);
}

export const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required!" });
        }

      
        const [users] = await db.query(
            `SELECT e.*, r.role_name FROM employees e 
             INNER JOIN roles r ON e.role_id = r.id 
             WHERE e.email = ?`, [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid Email or Password!" });
        }

        const user = users[0];

        // Check if employee account is active
        if (user.status === 0) {
            return res.status(403).json({ success: false, message: "Your account has been deactivated. Please contact your administrator." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid Email or Password!" });
        }

       
        const token = jwt.sign(
            { id: user.id, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } 
        );

        res.status(200).json({
            success: true,
            message: "Login successful!",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const logoutEmployee = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Logged out successfully!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required!" });
        }

        // Generate a 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // OTP Expiry: 15 minutes
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        // Store OTP in database as reset_token
        const [result] = await db.query(
            "CALL SP_SetResetToken(?, ?, ?)",
            [email, otp, expiry]
        );

        const affectedRows = result[0][0]?.affected_rows || 0;
        if (affectedRows === 0) {
            return res.status(400).json({ success: false, message: "Email address not found or account is inactive." });
        }

        // Send OTP email
        await sendOTPEmail(email, otp, "Valued Team Member");

        res.status(200).json({
            success: true,
            message: "OTP has been sent to your registered email address."
        });
    } catch (error) {
        console.error("Forgot password error:", error.message);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required!" });
        }

        // Call SP_VerifyOTP Stored Procedure
        const [rows] = await db.query(
            "CALL SP_VerifyOTP(?, ?)",
            [email, otp]
        );

        const matchedEmployee = rows[0];
        if (!matchedEmployee || matchedEmployee.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }

        // Generate a short-lived reset token (expires in 5 minutes)
        const resetToken = jwt.sign(
            { email, otp, purpose: "password_reset" },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
            resetToken
        });
    } catch (error) {
        console.error("Verify OTP error:", error.message);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).json({ success: false, message: "Reset token and new password are required!" });
        }

        // Verify the temporary reset JWT
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Reset token has expired or is invalid." });
        }

        if (decoded.purpose !== "password_reset" || !decoded.email || !decoded.otp) {
            return res.status(400).json({ success: false, message: "Invalid reset token." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in DB using SP_ResetPasswordWithEmail
        const [result] = await db.query(
            "CALL SP_ResetPasswordWithEmail(?, ?, ?)",
            [decoded.email, decoded.otp, hashedPassword]
        );

        const affectedRows = result[0][0]?.affected_rows || 0;
        if (affectedRows === 0) {
            return res.status(400).json({ success: false, message: "Failed to reset password. The OTP may have expired or already been used." });
        }

        res.status(200).json({
            success: true,
            message: "Password reset successful! You can now sign in with your new password."
        });
    } catch (error) {
        console.error("Reset password error:", error.message);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

export const loginWithGoogle = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: "idToken is required." });
        }
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('GOOGLE_CLIENT_ID is not configured.');
            return res.status(500).json({ success: false, message: "Google login is not configured on the server." });
        }

       
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload.email_verified) {
            return res.status(401).json({ success: false, message: "Google email is not verified." });
        }

       
        const [users] = await db.query(
            `SELECT e.*, r.role_name FROM employees e
             INNER JOIN roles r ON e.role_id = r.id
             WHERE e.email = ? AND e.status = 1`,
            [payload.email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No account found for this email. Contact your Administrator."
            });
        }

        const user = users[0];

        const token = jwt.sign(
            { id: user.id, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: "Google login successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error('Google login error:', error.message);
        res.status(401).json({ success: false, message: "Invalid or expired Google token." });
    }
};
