"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("role_permissions", "roleId", "role_id");
    await queryInterface.renameColumn("role_permissions", "permissionId", "permission_id");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("role_permissions", "role_id", "roleId");
    await queryInterface.renameColumn("role_permissions", "permission_id", "permissionId");
  },
};
