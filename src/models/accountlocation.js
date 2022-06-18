'use strict';
const { Model } = require('sequelize');

/**
 * @swagger
 * definitions:
 *   AccountLocation:
 *     type: object
 *     required:
 *       - id
 *       - lab_id
 *       - lab_location_id
 *       - account_id
 *       - is_default
 *       - status
 *     properties:
 *       id:
 *         type: number
 *       lab_id:
 *         type: number
 *       lab_location_id:
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
 *        lab_location_id: 1
 *        account_id: 1
 *        is_default: true
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
	class AccountLocation extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			// associations can be defined here
			AccountLocation.belongsTo(models.Account, { as: 'account', foreignKey: 'account_id', targetKey: 'id' });
			AccountLocation.belongsTo(models.Lab, { as: 'lab', foreignKey: 'lab_id', targetKey: 'id' });
			AccountLocation.belongsTo(models.LabLocation, { as: 'labLocation', foreignKey: 'lab_location_id', targetKey: 'id' });

		}
	};
	AccountLocation.init({
		lab_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Labs',
				key: 'id'
			}
		},
		lab_location_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'LabLocations',
				key: 'id'
			}
		},
		account_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Accounts',
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
		modelName: 'AccountLocation',
	});
	return AccountLocation;
};