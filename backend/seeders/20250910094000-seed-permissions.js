'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const permissions = [
      // Role management
      { name: 'role:create', action: 'create', resource: 'role', description: 'Create role', created_at: now, updated_at: now },
      { name: 'role:read', action: 'read', resource: 'role', description: 'Read roles', created_at: now, updated_at: now },
      { name: 'role:update', action: 'update', resource: 'role', description: 'Update role', created_at: now, updated_at: now },
      { name: 'role:delete', action: 'delete', resource: 'role', description: 'Delete role', created_at: now, updated_at: now },
      { name: 'role:assign', action: 'assign', resource: 'role', description: 'Assign role to user', created_at: now, updated_at: now },

      // User management within hotel
      { name: 'user:create', action: 'create', resource: 'user', description: 'Create user', created_at: now, updated_at: now },
      { name: 'user:read', action: 'read', resource: 'user', description: 'Read users', created_at: now, updated_at: now },
      { name: 'user:update', action: 'update', resource: 'user', description: 'Update user', created_at: now, updated_at: now },
      { name: 'user:delete', action: 'delete', resource: 'user', description: 'Delete user', created_at: now, updated_at: now },

      // Hotel resources examples
      { name: 'room:create', action: 'create', resource: 'room', description: 'Create room', created_at: now, updated_at: now },
      { name: 'room:read', action: 'read', resource: 'room', description: 'Read rooms', created_at: now, updated_at: now },
      { name: 'room:update', action: 'update', resource: 'room', description: 'Update room', created_at: now, updated_at: now },
      { name: 'room:delete', action: 'delete', resource: 'room', description: 'Delete room', created_at: now, updated_at: now },

      { name: 'booking:create', action: 'create', resource: 'booking', description: 'Create booking', created_at: now, updated_at: now },
      { name: 'booking:read', action: 'read', resource: 'booking', description: 'Read bookings', created_at: now, updated_at: now },
      { name: 'booking:update', action: 'update', resource: 'booking', description: 'Update booking', created_at: now, updated_at: now },
      { name: 'booking:delete', action: 'delete', resource: 'booking', description: 'Delete booking', created_at: now, updated_at: now }
    ];

    // Insert while avoiding duplicates on unique triplet; rely on unique index to skip where exists
    await queryInterface.bulkInsert('permissions', permissions, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};



