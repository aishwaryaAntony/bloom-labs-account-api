'use strict';
const bcrypt = require('bcryptjs');
const { Model } = require('sequelize');

/**
 * @swagger
 * definitions:
 *   Role:
 *     type: object
 *     required:
 *       - id
 *     properties:
 *       id:
 *         type: number
 *       country_code:
 *         type: string
 *       phone_number:
 *         type: string
 *       email:
 *         type: string
 *       verification_code:
 *         type: string
 *       password:
 *         type: string
 *       internal_user:
 *         type: boolean
 *       lab_code:
 *         type: string
 *       created_date:
 *         type: date
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        country_code: "+91"
 *        phone_number: "1234567890"
 *        email: "gopinathm@kenlasystems.com"
 *        verification_code: "45786"
 *        password: "Password123"
 *        internal_user: true
 *        lab_code: "LL6"
 *        created_date: "2021-12-29"
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // associations can be defined here
    }
  };
  User.init({
    country_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verification_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      defaultValue: null,
      validate: {
        len: [8, 100]
      },
      set: function (value) {
        if (value !== null) {
          var salt = bcrypt.genSaltSync(10);
          var hashed_password = bcrypt.hashSync(value, salt);

          this.setDataValue('password', value);
          this.setDataValue('salt', salt);
          this.setDataValue('hashed_password', hashed_password);
        }
      }
    },
    hashed_password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    internal_user: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    lab_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
			afterCreate: (user, options) => {
				return user.update({
					created_date: new Date()
				});
			  }
		  }
  });
  return User;
};