'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Purane roles delete karo agar already exist karein
    await queryInterface.bulkDelete('roles', {
      name: { [Sequelize.Op.in]: ['superadmin', 'admin'] }
    });

    // Naye roles insert karo
    await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: 'superadmin',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'admin',
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Rollback pe delete karo
    await queryInterface.bulkDelete('roles', {
      name: { [Sequelize.Op.in]: ['superadmin', 'admin'] }
    }, {});
  }
};
