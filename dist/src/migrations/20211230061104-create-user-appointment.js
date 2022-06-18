'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('UserAppointments', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			first_name: {
				allowNull: false,
				type: Sequelize.STRING
			},
			last_name: {
				allowNull: false,
				type: Sequelize.STRING
			},
			phone_number: {
				allowNull: true,
				type: Sequelize.STRING
			},
			country_code: {
				allowNull: true,
				type: Sequelize.STRING
			},
			email: {
				allowNull: true,
				type: Sequelize.STRING
			},
			member_ref: {
				allowNull: true,
				type: Sequelize.INTEGER
			},
			location_id: {
				allowNull: false,
				type: Sequelize.INTEGER
			},
			location_name: {
				allowNull: false,
				type: Sequelize.STRING
			},
			test_type_id: {
				allowNull: false,
				type: Sequelize.INTEGER
			},
			test_type_name: {
				allowNull: false,
				type: Sequelize.STRING
			},
			test_type_description: {
				allowNull: true,
				type: Sequelize.TEXT
			},
			location_test_type_id: {
				allowNull: false,
				type: Sequelize.INTEGER
			},
			appointment_date: {
				allowNull: false,
				type: Sequelize.DATEONLY
			},
			appointment_time: {
				allowNull: false,
				type: Sequelize.DATE
			},
			acuity_appointment_id: {
				allowNull: false,
				type: Sequelize.STRING
			},
			price: {
				allowNull: true,
				type: Sequelize.DOUBLE
			},
			verified_by: {
				allowNull: true,
				type: Sequelize.STRING
			},
			status: {
				allowNull: false,
				type: Sequelize.STRING
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('UserAppointments');
	}
};