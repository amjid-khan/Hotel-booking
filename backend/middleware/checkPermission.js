// middleware/checkPermission.js
const pool = require("../db"); // MySQL connection

function checkPermission(permissionName) {
    return async (req, res, next) => {
        try {
            const userId = req.user.id; // JWT se decode kiya hua
            const hotelId = req.user.hotelId; // JWT se decode kiya hua

            // 1️⃣ User ke roles fetch karo (hotel-specific ya global)
            const [roles] = await pool.query(
                `SELECT r.id, r.name
         FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = ? AND (ur.hotel_id = ? OR r.hotel_id IS NULL)`,
                [userId, hotelId]
            );

            if (roles.length === 0) {
                return res.status(403).json({ message: "No role assigned" });
            }

            const roleIds = roles.map((r) => r.id);

            // 2️⃣ Role ke permissions fetch karo
            const [permissions] = await pool.query(
                `SELECT p.name
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id IN (?)`,
                [roleIds]
            );

            const userPermissions = permissions.map((p) => p.name);

            // 3️⃣ Required permission check karo
            if (!userPermissions.includes(permissionName)) {
                return res.status(403).json({ message: "Access denied" });
            }

            // ✅ Permission valid hai → next
            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };
}

module.exports = checkPermission;
