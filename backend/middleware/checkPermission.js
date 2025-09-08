// middleware/checkPermission.js
const db = require("../db"); // <-- yaha apna MySQL connection import karo

function checkPermission(requiredPermission) {
    return async function (req, res, next) {
        try {
            const userId = req.user.id;       // JWT ya session se
            const hotelId = req.user.hotelId; // JWT ya session se
            const userRole = req.user.role;   // superadmin/admin/user

            // 🔹 Agar SuperAdmin hai to sab allow
            if (userRole === "superadmin") {
                return next();
            }

            // 🔹 User ke roles nikaalo hotel ke andar
            const [roles] = await db.query(
                "SELECT role_id FROM user_roles WHERE user_id = ? AND hotel_id = ?",
                [userId, hotelId]
            );

            if (!roles.length) {
                return res.status(403).json({ message: "No role assigned for this hotel" });
            }

            const roleIds = roles.map(r => r.role_id);

            // 🔹 Role ke permissions nikaalo
            const [permissions] = await db.query(
                `SELECT p.name 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id IN (?)`,
                [roleIds]
            );

            const userPermissions = permissions.map(p => p.name);

            // 🔹 Check karo user ke paas required permission hai ya nahi
            if (!userPermissions.includes(requiredPermission)) {
                return res.status(403).json({ message: "Access denied" });
            }

            // 🔹 Permission mili → proceed
            next();
        } catch (err) {
            console.error("checkPermission error:", err);
            res.status(500).json({ message: "Server error" });
        }
    };
}

module.exports = checkPermission;
