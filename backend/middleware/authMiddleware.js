import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    
    try {

        console.log("========== HEADERS ==========");
        console.log(req.headers);
        console.log("Authorization:", req.headers.authorization);

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access Denied. No Token Provided."
            });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        console.log("Token:", token);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "my_super_secret_key_123"
        );

        console.log("Decoded:", decoded);

        req.user = decoded;

        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token."
        });
    }
};