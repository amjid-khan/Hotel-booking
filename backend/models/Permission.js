'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      Permission.belongsToMany(models.Role, {
        through: models.RolePermission,
        foreignKey: 'permissionId',
        as: 'roles'
      });
    }
  }
  Permission.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Permission',
      tableName: 'permissions',
      underscored: true
    }
  );
  return Permission;
};
