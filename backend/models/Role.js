'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      // Remove global unique; uniqueness will be enforced via composite index (name, hotelId)
      name: { type: DataTypes.STRING(50), allowNull: false },
      hotelId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "roles",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Role.associate = function (models) {
    // One-to-many: one Role can have many Users
    Role.hasMany(models.User, { foreignKey: "roleId", as: "users" });

    // Many-to-many: Role ↔ Permission
    Role.belongsToMany(models.Permission, {
      through: models.RolePermission,
      foreignKey: "roleId",
      otherKey: "permissionId",
      as: "permissions",
    });

    // Each role may belong to a specific hotel (scoped roles)
    Role.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
  };

  return Role;
};

