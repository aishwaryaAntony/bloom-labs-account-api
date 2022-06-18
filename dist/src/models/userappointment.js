'use strict';

const { Model } = require('sequelize');
const { gzipSync, gunzipSync } = require('zlib');
module.exports = (sequelize, DataTypes) => {
	class UserAppointment extends Model {
		/**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
		static associate(models) {
			// define association here
			UserAppointment.belongsTo(models.Member, { as: 'member', foreignKey: 'member_ref', targetKey: 'id' });
		}
	};
	UserAppointment.init({
		first_name: {
			allowNull: false,
			type: DataTypes.STRING
			// get() {
			//   const storedValue = this.getDataValue('first_name');
			//   if (storedValue !== null) {
			// 	const gzippedBuffer = Buffer.from(storedValue, 'base64');
			// 	const unzippedBuffer = gunzipSync(gzippedBuffer);
			// 	return unzippedBuffer.toString();
			//   } else {
			// 	return storedValue;
			//   }
			// },
			// set(value) {
			//   if (value !== null) {
			// 	const gzippedBuffer = gzipSync(value);
			// 	this.setDataValue('first_name', gzippedBuffer.toString('base64'));
			//   } else {
			// 	this.setDataValue('first_name', null);
			//   }
			// }
		},
		last_name: {
			allowNull: false,
			type: DataTypes.STRING
			// get() {
			//   const storedValue = this.getDataValue('last_name');
			//   if (storedValue !== null) {
			// 	const gzippedBuffer = Buffer.from(storedValue, 'base64');
			// 	const unzippedBuffer = gunzipSync(gzippedBuffer);
			// 	return unzippedBuffer.toString();
			//   } else {
			// 	return storedValue;
			//   }
			// },
			// set(value) {
			//   if (value !== null) {
			// 	const gzippedBuffer = gzipSync(value);
			// 	this.setDataValue('last_name', gzippedBuffer.toString('base64'));
			//   } else {
			// 	this.setDataValue('last_name', null);
			//   }
			// }
		},
		phone_number: {
			allowNull: true,
			type: DataTypes.STRING
			// get() {
			//   const storedValue = this.getDataValue('phone_number');
			//   if (storedValue !== null) {
			// 	const gzippedBuffer = Buffer.from(storedValue, 'base64');
			// 	const unzippedBuffer = gunzipSync(gzippedBuffer);
			// 	return unzippedBuffer.toString();
			//   } else {
			// 	return storedValue;
			//   }
			// },
			// set(value) {
			//   if (value !== null) {
			// 	const gzippedBuffer = gzipSync(value);
			// 	this.setDataValue('phone_number', gzippedBuffer.toString('base64'));
			//   } else {
			// 	this.setDataValue('phone_number', null);
			//   }
			// }
		},
		country_code: {
			allowNull: true,
			type: DataTypes.STRING
			// get() {
			//   const storedValue = this.getDataValue('country_code');
			//   if (storedValue !== null) {
			// 	const gzippedBuffer = Buffer.from(storedValue, 'base64');
			// 	const unzippedBuffer = gunzipSync(gzippedBuffer);
			// 	return unzippedBuffer.toString();
			//   } else {
			// 	return storedValue;
			//   }
			// },
			// set(value) {
			//   if (value !== null) {
			// 	const gzippedBuffer = gzipSync(value);
			// 	this.setDataValue('country_code', gzippedBuffer.toString('base64'));
			//   } else {
			// 	this.setDataValue('country_code', null);
			//   }
			// }
		},
		email: {
			allowNull: true,
			type: DataTypes.STRING
			// get() {
			//   const storedValue = this.getDataValue('email');
			//   if (storedValue !== null) {
			// 	const gzippedBuffer = Buffer.from(storedValue, 'base64');
			// 	const unzippedBuffer = gunzipSync(gzippedBuffer);
			// 	return unzippedBuffer.toString();
			//   } else {
			// 	return storedValue;
			//   }
			// },
			// set(value) {
			//   if (value !== null) {
			// 	const gzippedBuffer = gzipSync(value);
			// 	this.setDataValue('email', gzippedBuffer.toString('base64'));
			//   } else {
			// 	this.setDataValue('email', null);
			//   }
			// }
		},
		member_ref: {
			allowNull: true,
			type: DataTypes.INTEGER
		},
		location_id: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
		location_name: {
			allowNull: false,
			type: DataTypes.STRING
		},
		location_test_type_id: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
		test_type_id: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
		test_type_name: {
			allowNull: false,
			type: DataTypes.STRING
		},
		test_type_description: {
			allowNull: true,
			type: DataTypes.TEXT
		},
		appointment_date: {
			allowNull: false,
			type: DataTypes.DATEONLY
		},
		appointment_time: {
			allowNull: false,
			type: DataTypes.DATE
		},
		acuity_appointment_id: {
			allowNull: false,
			type: DataTypes.STRING
		},
		price: {
			allowNull: true,
			type: DataTypes.DOUBLE
		},
		verified_by: {
			allowNull: true,
			type: DataTypes.STRING
		},
		status: {
			allowNull: false,
			type: DataTypes.STRING
		}
	}, {
		sequelize,
		modelName: 'UserAppointment'
	});
	return UserAppointment;
};