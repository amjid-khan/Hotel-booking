'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Optional: create an example role for existing hotels (if any)
    // We will create a role named 'Hotel Manager' with basic permissions in each hotel
    const [hotels] = await queryInterface.sequelize.query('SELECT id FROM hotels');
    if (!hotels.length) return; // nothing to seed if no hotels yet

    const now = new Date();
    const rolesToInsert = hotels.map(h => ({ name: 'Hotel Manager', description: 'Default manager role', hotel_id: h.id, created_at: now, updated_at: now }));
    await queryInterface.bulkInsert('roles', rolesToInsert, {});

    // Fetch role ids for the newly inserted roles
    const [insertedRoles] = await queryInterface.sequelize.query("SELECT r.id, r.hotel_id FROM roles r WHERE r.name = 'Hotel Manager'");
    const [permIds] = await queryInterface.sequelize.query("SELECT id, name FROM permissions WHERE name IN ('room:read','room:create','room:update','booking:read','booking:create')");

    const rolePerms = [];
    for (const role of insertedRoles) {
      for (const p of permIds) {
        rolePerms.push({ role_id: role.id, permission_id: p.id });
      }
    }
    if (rolePerms.length) {
      await queryInterface.bulkInsert('role_permissions', rolePerms, {});
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query("DELETE rp FROM role_permissions rp JOIN roles r ON rp.role_id = r.id WHERE r.name = 'Hotel Manager'");
    await queryInterface.sequelize.query("DELETE FROM roles WHERE name = 'Hotel Manager'");
  }
};



