const { Role, Permission, RolePermission } = require("../models");
const { Op } = require("sequelize");

// Create new role + assign permissions
exports.createRole = async (req, res) => {
    try {
        const { name, permissionIds, hotelId } = req.body; // permissionIds = [1,2,3]

        if (!name) {
            return res.status(400).json({ message: "Role name is required" });
        }

        // Create role with optional hotel scope
        const role = await Role.create({ name, hotelId: hotelId || null });

        // Assign permissions manually in role_permissions table
        if (permissionIds && Array.isArray(permissionIds)) {
            const rolePermissions = permissionIds.map(permissionId => ({
                roleId: role.id,
                permissionId,
            }));

            await RolePermission.bulkCreate(rolePermissions);
        }

        // Fetch role with permissions
        const roleWithPermissions = await Role.findByPk(role.id, {
            include: [
              { model: Permission, as: "permissions" },
            ],
        });

        res.status(201).json({
            message: "Role created successfully",
            role: roleWithPermissions,
        });
    } catch (error) {
        console.error("Error creating role:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all roles with permissions
exports.getRoles = async (req, res) => {
    try {
        const { hotelId } = req.query;
        const where = {};
        if (hotelId) {
          // Return roles that are global (hotelId null) or scoped to this hotel
          where["hotelId"] = { [Op.or]: [null, Number(hotelId)] };
        }
        const roles = await Role.findAll({
            where,
            include: { model: Permission, as: "permissions" },
        });
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
