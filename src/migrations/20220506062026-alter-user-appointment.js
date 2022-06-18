'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    try {
      await queryInterface.addColumn('UserAppointments', 'gclid', {
        type: Sequelize.STRING,
        allowNull: true
      }); 
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(e);
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    try {
      await queryInterface.removeColumn('UserAppointments', 'gclid');
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(e);
    }
  }
};
