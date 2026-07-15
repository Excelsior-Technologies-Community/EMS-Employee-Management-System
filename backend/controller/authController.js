import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid Email or Password!" });
        }

       
        const token = jwt.sign(
            { id: user.id, role: user.role_name },
            process.env.JWT_SECRET || 'my_super_secret_key_123', 
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
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};