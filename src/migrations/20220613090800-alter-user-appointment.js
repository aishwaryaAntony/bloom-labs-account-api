'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('UserAppointments', 'test_group_ref', {
        type: Sequelize.INTEGER,
        allowNull: true
      });  
      await queryInterface.addColumn('UserAppointments', 'test_group_name', {
        type: Sequelize.STRING,
        allowNull: true
      });  
      await queryInterface.changeColumn('UserAppointments', 'test_type_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      }); 
      await queryInterface.addColumn('UserAppointments', 'is_group', {
        type: Sequelize.BOOLEAN,
        allowNull: true
      }); 
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('UserAppointments', 'test_group_ref');
      await queryInterface.removeColumn('UserAppointments', 'test_group_name');
      await queryInterface.changeColumn('UserAppointments', 'test_type_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
      });
      await queryInterface.removeColumn('UserAppointments', 'is_group');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
