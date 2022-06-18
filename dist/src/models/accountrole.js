'use strict';

const { Model } = require('sequelize');

/**
 * @swagger
 * definitions:
 *   AccountRole:
 *     type: object
 *     required:
 *       - id
 *       - role_id
 *       - account_id
 *       - is_default
 *       - status
 *     properties:
 *       id:
 *         type: number
 *       role_id:
 *         type: number
 *       account_id:
 *         type: number
 *       is_default:
 *         type: boolean
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        lab_id: 1
 *        role_id: 1
 *        is_default: true
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
	class AccountRole extends Model {
		/**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
		static associate(models) {
			// define association here
			// associations can be defined here
			AccountRole.belongsTo(models.Account, { as: 'account', foreignKey: 'account_id', targetKey: 'id' });
			AccountRole.belongsTo(models.Role, { as: 'role', foreignKey: 'role_id', targetKey: 'id' });
		}
	};
	AccountRole.init({
		account_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Accounts',
				key: 'id'
			}
		},
		role_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Roles',
				key: 'id'
			}
		},
		is_default: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'AccountRole'
	});
	return AccountRole;
};