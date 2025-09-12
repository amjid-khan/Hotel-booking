"use strict";
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
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
  };
  Role.associate = function (models) {
    Role.hasMany(models.User, { foreignKey: "roleId", as: "users" });
    Role.belongsToMany(models.Permission, {
      through: "role_permissions",
      foreignKey: "roleId",
      otherKey: "permissionId",
      as: "permissions",
    });
  };

  return Role;
};
