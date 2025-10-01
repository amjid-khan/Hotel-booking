"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("users", "must_reset_password", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn("users", "must_reset_password");
	},
};


