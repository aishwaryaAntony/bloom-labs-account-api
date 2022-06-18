'use strict';

const { Model } = require('sequelize');
/**
 * @swagger
 * definitions:
 *   Account:
 *     type: object
 *     required:
 *       - id
 *       - lab_ref
 *       - hashed_user_id
 *       - account_token
 *       - name
 *       - status
 *     properties:
 *       id:
 *         type: number
 *       lab_ref:
 *         type: number
 *       hashed_user_id:
 *         type: string
 *       account_token:
 *         type: string
 *       name:
 *         type: string
 *       primary_member_ref:
 *         type: string
 *       last_login:
 *         type: date
 *       created_date:
 *         type: date
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        lab_ref: 1
 *        hashed_user_id: "tg45tdf4t5"
 *        account_token: "tg45tdf4t5"
 *        name: "Harry"
 *        primary_member_ref: 1
 *        last_login: 2021-12-22
 *        created_date: "2021-12-29"
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
	class Account extends Model {
		/**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
		static associate(models) {
			// define association here
			// associations can be defined here
			Account.hasMany(models.AccountLocation, { as: 'accountLocations', foreignKey: 'account_id', sourceKey: 'id' });
			Account.hasMany(models.AccountRole, { as: 'accountRoles', foreignKey: 'account_id', sourceKey: 'id' });
			Account.hasMany(models.Member, { as: 'accountMembers', foreignKey: 'account_id', sourceKey: 'id' });
			Account.hasMany(models.CustomPermission, { as: 'customPermissions', foreignKey: 'account_id', sourceKey: 'id' });
			Account.belongsTo(models.Lab, { as: 'accountLab', foreignKey: 'lab_ref', targetKey: 'id' });
		}
	};
	Account.init({
		lab_ref: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: 'Accounts',
				key: 'id'
			}
		},
		hashed_user_id: {
			type: DataTypes.STRING,
			allowNull: false
		},
		account_token: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		primary_member_ref: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		internal_account: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		last_login: {
			type: DataTypes.DATE,
			allowNull: true
		},
		created_date: {
			type: DataTypes.DATE,
			allowNull: true
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'Account',
		hooks: {
			afterCreate: (account, options) => {
				return account.update({
					created_date: new Date()
				});
			}
		}
	});
	return Account;
};