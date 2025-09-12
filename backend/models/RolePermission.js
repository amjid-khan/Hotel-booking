'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      // this is join table, no direct association needed
    }
  }
  RolePermission.init(
    {
      roleId: DataTypes.INTEGER,
      permissionId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'RolePermission',
      tableName: 'role_permissions',
      underscored: true
    }
  );
  return RolePermission;
};
