const jwt = require("jsonwebtoken");

// Protect middleware — verify JWT and attach user data to req
exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach full payload including hotelId
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            hotelId: decoded.hotelId || null,
            permissions: decoded.permissions || []
        };

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token is invalid or expired" });
    }
};

// Check if user role is admin
// middleware/auth.js
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin or Super Admin only.'
        });
    }
    next();
};


exports.isSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin only.'
        });
    }
    next();
};



exports.isAdminOrSuperAdmin = (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "superadmin") {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: "Access denied. Admin or Super Admin only.",
    });
};
