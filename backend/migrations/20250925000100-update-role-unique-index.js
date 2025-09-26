'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing unique index/constraint on name (best-effort for various naming conventions)
    const tableName = 'roles';

    // Attempt different possible index/constraint names without failing the migration if one doesn't exist
    const tryRemove = async (fn, ...args) => {
      try { await fn(...args); } catch (e) { /* ignore if doesn't exist */ }
    };

    // Remove unique index on single column name
    await tryRemove(queryInterface.removeIndex.bind(queryInterface), tableName, 'name');
    await tryRemove(queryInterface.removeIndex.bind(queryInterface), tableName, 'roles_name');
    await tryRemove(queryInterface.removeIndex.bind(queryInterface), tableName, 'roles_name_unique');
    await tryRemove(queryInterface.removeConstraint.bind(queryInterface), tableName, 'name');
    await tryRemove(queryInterface.removeConstraint.bind(queryInterface), tableName, 'roles_name_unique');
    await tryRemove(queryInterface.removeConstraint.bind(queryInterface), tableName, 'roles.name');

    // Add composite unique index on (name, hotelId)
    await queryInterface.addIndex(tableName, ['name', 'hotelId'], {
      unique: true,
      name: 'roles_name_hotelId_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'roles';
    const tryRemove = async (fn, ...args) => {
      try { await fn(...args); } catch (e) { /* ignore if doesn't exist */ }
    };

    // Remove composite unique index
    await tryRemove(queryInterface.removeIndex.bind(queryInterface), tableName, 'roles_name_hotelId_unique');

    // Recreate unique index on name (global uniqueness)
    await queryInterface.addIndex(tableName, ['name'], {
      unique: true,
      name: 'roles_name_unique',
    });
  },
};


