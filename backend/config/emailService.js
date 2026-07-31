import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Transporter using Gmail settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test transporter connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Connection failed:', error.message);
    } else {
        console.log('SMTP Server is ready to take messages');
    }
});

/**
 * Send password reset OTP email.
 * @param {string} toEmail 
 * @param {string} otp 
 * @param {string} name 
 */
export const sendOTPEmail = async (toEmail, otp, name = "Employee") => {
    const mailOptions = {
        from: `"EMS Support" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Password Reset OTP - Aws technologies EMS',
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #F6F7FB; padding: 40px; color: #141A2E; margin: 0;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border-left: 4px solid #E8A33D;">
                    <div style="background-color: #26335C; padding: 24px; color: #FFFFFF;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">EMS</h2>
                        <p style="margin: 4px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7);">Employee Portal</p>
                    </div>
                    <div style="padding: 32px; box-sizing: border-box;">
                        <h3 style="margin-top: 0; font-size: 18px; color: #26335C;">Hello ${name},</h3>
                        <p style="font-size: 15px; line-height: 1.6; color: #4A5170;">
                            We received a request to reset your password for your AWS Technologies Employee Portal account. Use the following One-Time Password (OTP) to complete the verification step:
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #E8A33D; letter-spacing: 6px; padding: 12px 24px; background-color: #EEF0F8; border-radius: 8px; border: 1px solid #E4E6F0; display: inline-block;">
                                ${otp}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #D6455A; font-weight: bold;">
                            This OTP is valid for 5 minutes. Please do not share this code with anyone.
                        </p>
                        <hr style="border: 0; border-top: 1px solid #E4E6F0; margin: 24px 0;" />
                        <p style="font-size: 12px; line-height: 1.5; color: #8A91A5; margin-bottom: 0;">
                            If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.
                        </p>
                    </div>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};
