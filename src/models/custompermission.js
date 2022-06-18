'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomPermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CustomPermission.belongsTo(models.Account, { as: 'permissionSet', foreignKey: 'account_id', targetKey: 'id' });
    }
  };
  CustomPermission.init({
    permission: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
			references: {
				model: 'Accounts',
				key: 'id'
			}
    }
  }, {
    sequelize,
    modelName: 'CustomPermission',
  });
  return CustomPermission;
};