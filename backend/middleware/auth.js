const jwt = require("jsonwebtoken");

// Protect middleware — verify JWT and attach user data to req
exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user payload (id, email, role) to req.user
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next(); // proceed to next middleware/controller
    } catch (err) {
        return res.status(401).json({ message: "Token is invalid or expired" });
    }
};

// Check if user role is admin
exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};