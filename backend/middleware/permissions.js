// middleware/permissions.js
exports.hasPermission = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please login first." });
        }

        // ✅ Agar role admin ya superadmin hai to bypass karo
        if (req.user.role === "admin" || req.user.role === "superadmin") {
            return next();
        }

        if (!req.user.permissions || req.user.permissions.length === 0) {
            return res.status(403).json({ message: "No permissions assigned to your account." });
        }

        // Allow both string and array inputs
        const required = Array.isArray(requiredPermissions)
            ? requiredPermissions
            : [requiredPermissions];

        // Check if user has at least one of the required permissions
        const hasAny = required.some((perm) => req.user.permissions.includes(perm));

        if (!hasAny) {
            return res.status(403).json({
                message: `Access denied. Required permission(s): ${required.join(", ")}`,
            });
        }

        next();
    };
};
