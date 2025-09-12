'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'roleId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'roles',
        key: 'id'
      },
      allowNull: true, // or false if every user must have a role
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'roleId');
  }
};
