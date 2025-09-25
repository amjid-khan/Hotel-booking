'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('roles', 'hotel_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: { model: 'hotels', key: 'id' },
			onUpdate: 'CASCADE',
			onDelete: 'SET NULL'
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('roles', 'hotel_id');
	}
};


