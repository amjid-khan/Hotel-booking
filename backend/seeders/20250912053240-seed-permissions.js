'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const permissions = [
      // User/Auth
      { name: 'user_create', description: 'Register user', created_at: new Date(), updated_at: new Date() },
      { name: 'user_login', description: 'Login user', created_at: new Date(), updated_at: new Date() },
      { name: 'user_view_hotel', description: 'View hotel users', created_at: new Date(), updated_at: new Date() },
      { name: 'user_update_self', description: 'Update own profile', created_at: new Date(), updated_at: new Date() },
      { name: 'user_update_any', description: 'Update any user', created_at: new Date(), updated_at: new Date() },
      { name: 'user_delete_self', description: 'Delete self account', created_at: new Date(), updated_at: new Date() },
      { name: 'user_delete_any', description: 'Delete any user', created_at: new Date(), updated_at: new Date() },
      { name: 'user_view_all', description: 'View all users', created_at: new Date(), updated_at: new Date() },

      // Hotel
      { name: 'hotel_create', description: 'Create hotel', created_at: new Date(), updated_at: new Date() },
      { name: 'hotel_view_own', description: 'View own hotels', created_at: new Date(), updated_at: new Date() },
      { name: 'hotel_view_any', description: 'View any hotel', created_at: new Date(), updated_at: new Date() },
      { name: 'hotel_update_own', description: 'Update own hotel', created_at: new Date(), updated_at: new Date() },
      { name: 'hotel_update_any', description: 'Update any hotel', created_at: new Date(), updated_at: new Date() },
      { name: 'hotel_delete_own', description: 'Delete own hotel', created_at: new Date(), updated_at: new Date() },
      { name: 'hotel_delete_any', description: 'Delete any hotel', created_at: new Date(), updated_at: new Date() },
      { name: 'hotel_dashboard_view', description: 'View hotel dashboard', created_at: new Date(), updated_at: new Date() },

      // Room
      { name: 'room_create', description: 'Add room', created_at: new Date(), updated_at: new Date() },
      { name: 'room_view_any', description: 'View all rooms', created_at: new Date(), updated_at: new Date() },
      { name: 'room_view_self', description: 'View assigned rooms', created_at: new Date(), updated_at: new Date() },
      { name: 'room_update', description: 'Update room', created_at: new Date(), updated_at: new Date() },
      { name: 'room_delete', description: 'Delete room', created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('permissions', permissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
