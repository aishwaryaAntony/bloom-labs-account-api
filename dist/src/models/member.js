'use strict';

const { Model } = require('sequelize');
const { gzipSync, gunzipSync } = require('zlib');
/**
 * @swagger
 * definitions:
 *   Member:
 *     type: object
 *     required:
 *       - id
 *       - is_primary_member
 *     properties:
 *       id:
 *         type: number
 *       account_id:
 *         type: number
 *       member_token:
 *         type: string
 *       first_name:
 *         type: string
 *       middle_name:
 *         type: string
 *       last_name:
 *         type: string
 *       country_code:
 *         type: string
 *       phone_number:
 *         type: string
 *       email:
 *         type: string
 *       is_primary_member:
 *         type: boolean
 *       gender:
 *         type: string
 *       birth_date:
 *         type: string
 *       race:
 *         type: string
 *       ethnicity:
 *         type: string
 *       driver_license_number:
 *         type: string
 *       passport_number:
 *         type: string
 *       ssn:
 *         type: string
 *       address_line1:
 *         type: string
 *       address_line2:
 *         type: string
 *       city:
 *         type: string
 *       state:
 *         type: string
 *       country:
 *         type: string
 *       zipcode:
 *         type: string
 *       qr_code:
 *         type: string
 *       created_date::
 *          type: date
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        member_token: "fdf546dhg57gh57yhf"
 *        account_id: 1
 *        first_name: "Gopinath"
 *        middle_name: "Maha"
 *        last_name: "Raja"
 *        country_code: "+91"
 *        phone_number: "1234567890"
 *        email: "gopinathm@kenlasystems.com"
 *        is_primary_member: true
 *        gender: "Male"
 *        birth_date: "2021-12-20"
 *        race: "Asian"
 *        ethnicity: "His"
 *        driver_license_number: "345"
 *        passport_number: "567"
 *        ssn: "9090909"
 *        address_line1: "Kenla"
 *        address_line2: "Adayar"
 *        city: "Chennai"
 *        state: "TamilNadu"
 *        country: "India"
 *        zipcode: "600020"
 *        qr_code: "DFE678HH"
 *        last_login: 2021-12-22
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // associations can be defined here
      Member.hasMany(models.MemberInsurance, { as: 'memberInsurances', foreignKey: 'member_id', sourceKey: 'id' });
      Member.hasMany(models.UserAppointment, { as: 'userAppointments', foreignKey: 'member_ref', sourceKey: 'id' });
      Member.belongsTo(models.Account, { as: 'memberAccount', foreignKey: 'account_id', targetKey: 'id' });
    }
  };
  Member.init({
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'id'
      }
    },
    member_token: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true
      // get() {
      //   const storedValue = this.getDataValue('first_name');
      //   if (storedValue !== null) {
      //     const gzippedBuffer = Buffer.from(storedValue, 'base64');
      //     const unzippedBuffer = gunzipSync(gzippedBuffer);
      //     return unzippedBuffer.toString();
      //   } else {
      //     return storedValue;
      //   }
      // },
      // set(value) {
      //   if (value !== null) {
      //     const gzippedBuffer = gzipSync(value);
      //     this.setDataValue('first_name', gzippedBuffer.toString('base64'));
      //   } else {
      //     this.setDataValue('first_name', null);
      //   }
      // }
    },
    middle_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
      // get() {
      //   const storedValue = this.getDataValue('last_name');
      //   if (storedValue !== null) {
      //     const gzippedBuffer = Buffer.from(storedValue, 'base64');
      //     const unzippedBuffer = gunzipSync(gzippedBuffer);
      //     return unzippedBuffer.toString();
      //   } else {
      //     return storedValue;
      //   }
      // },
      // set(value) {
      //   if (value !== null) {
      //     const gzippedBuffer = gzipSync(value);
      //     this.setDataValue('last_name', gzippedBuffer.toString('base64'));
      //   } else {
      //     this.setDataValue('last_name', null);
      //   }
      // }
    },
    full_name: {
      type: DataTypes.VIRTUAL(DataTypes.STRING, ['first_name', 'last_name']),
      get() {
        let first_name = this.first_name !== null && this.first_name !== undefined ? this.first_name.toString().replace(/(^|\s)\S/g, letter => letter.toUpperCase()) : "";
        let last_name = this.last_name !== null && this.last_name !== undefined ? this.last_name.toString().replace(/(^|\s)\S/g, letter => letter.toUpperCase()) : "";
        return `${first_name} ${last_name}`;
      },
      set(value) {
        throw new Error('Do not try to set the `fullName` value!');
      }
    },
    // full_name: {
    //   type: DataTypes.VIRTUAL(DataTypes.STRING, ['first_name', 'last_name']),
    //   get() {
    //     const storedFirstName = this.getDataValue('first_name');
    //     let f_name = "";
    //     if (storedFirstName !== null) {
    //       let gzippedBuffer = Buffer.from(storedFirstName, 'base64');
    //       let unzippedBuffer = gunzipSync(gzippedBuffer);
    //       f_name = unzippedBuffer.toString().replace(/(^|\s)\S/g, letter => letter.toUpperCase());
    //     }
    //     const storedLastName = this.getDataValue('last_name');
    //     let l_name = "";
    //     if (storedFirstName !== null) {
    //       let gzippedBuffer = Buffer.from(storedLastName, 'base64');
    //       let unzippedBuffer = gunzipSync(gzippedBuffer);
    //       l_name = unzippedBuffer.toString().replace(/(^|\s)\S/g, letter => letter.toUpperCase());
    //     }
    //     return `${f_name} ${l_name}`;
    //   }
    // },
    country_code: {
      type: DataTypes.STRING,
      allowNull: true
      // get() {
      //   const storedValue = this.getDataValue('country_code');
      //   if (storedValue !== null) {
      //     const gzippedBuffer = Buffer.from(storedValue, 'base64');
      //     const unzippedBuffer = gunzipSync(gzippedBuffer);
      //     return unzippedBuffer.toString();
      //   } else {
      //     return storedValue;
      //   }
      // },
      // set(value) {
      //   if (value !== null) {
      //     const gzippedBuffer = gzipSync(value);
      //     this.setDataValue('country_code', gzippedBuffer.toString('base64'));
      //   } else {
      //     this.setDataValue('country_code', null);
      //   }
      // }
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true
      // get() {
      //   const storedValue = this.getDataValue('phone_number');
      //   if (storedValue !== null) {
      //     const gzippedBuffer = Buffer.from(storedValue, 'base64');
      //     const unzippedBuffer = gunzipSync(gzippedBuffer);
      //     return unzippedBuffer.toString();
      //   } else {
      //     return storedValue;
      //   }
      // },
      // set(value) {
      //   if (value !== null) {
      //     const gzippedBuffer = gzipSync(value);
      //     this.setDataValue('phone_number', gzippedBuffer.toString('base64'));
      //   } else {
      //     this.setDataValue('phone_number', null);
      //   }
      // }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
      // get() {
      //   const storedValue = this.getDataValue('email');
      //   if (storedValue !== null) {
      //     const gzippedBuffer = Buffer.from(storedValue, 'base64');
      //     const unzippedBuffer = gunzipSync(gzippedBuffer);
      //     return unzippedBuffer.toString();
      //   } else {
      //     return storedValue;
      //   }
      // },
      // set(value) {
      //   if (value !== null) {
      //     const gzippedBuffer = gzipSync(value);
      //     this.setDataValue('email', gzippedBuffer.toString('base64'));
      //   } else {
      //     this.setDataValue('email', null);
      //   }
      // }
    },
    is_primary_member: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
      // get() {
      //   const storedValue = this.getDataValue('birth_date');
      //   if (storedValue !== null) {
      //     const gzippedBuffer = Buffer.from(storedValue, 'base64');
      //     const unzippedBuffer = gunzipSync(gzippedBuffer);
      //     return unzippedBuffer.toString();
      //   } else {
      //     return storedValue;
      //   }
      // },
      // set(value) {
      //   if (value !== null) {
      //     const gzippedBuffer = gzipSync(value);
      //     this.setDataValue('birth_date', gzippedBuffer.toString('base64'));
      //   } else {
      //     this.setDataValue('birth_date', null);
      //   }
      // }
    },
    race: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ethnicity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    driver_license_number: {
      type: DataTypes.STRING,
      allowNull: true
      // get() {
      //   const storedValue = this.getDataValue('driver_license_number');
      //   if (storedValue !== null) {
      //     const gzippedBuffer = Buffer.from(storedValue, 'base64');
      //     const unzippedBuffer = gunzipSync(gzippedBuffer);
      //     return unzippedBuffer.toString();
      //   } else {
      //     return storedValue;
      //   }
      // },
      // set(value) {
      //   if (value !== null) {
      //     const gzippedBuffer = gzipSync(value);
      //     this.setDataValue('driver_license_number', gzippedBuffer.toString('base64'));
      //   } else {
      //     this.setDataValue('driver_license_number', null);
      //   }
      // }
    },
    passport_number: {
      type: DataTypes.STRING,
      allowNull: true
      // get() {
      //   const storedValue = this.getDataValue('passport_number');
      //   if (storedValue !== null) {
      //     const gzippedBuffer = Buffer.from(storedValue, 'base64');
      //     const unzippedBuffer = gunzipSync(gzippedBuffer);
      //     return unzippedBuffer.toString();
      //   } else {
      //     return storedValue;
      //   }
      // },
      // set(value) {
      //   if (value !== null) {
      //     const gzippedBuffer = gzipSync(value);
      //     this.setDataValue('passport_number', gzippedBuffer.toString('base64'));
      //   } else {
      //     this.setDataValue('passport_number', null);
      //   }
      // }
    },
    ssn: {
      type: DataTypes.STRING,
      allowNull: true
      // get() {
      //   const storedValue = this.getDataValue('ssn');
      //   if (storedValue !== null) {
      //     const gzippedBuffer = Buffer.from(storedValue, 'base64');
      //     const unzippedBuffer = gunzipSync(gzippedBuffer);
      //     return unzippedBuffer.toString();
      //   } else {
      //     return storedValue;
      //   }
      // },
      // set(value) {
      //   if (value !== null) {
      //     const gzippedBuffer = gzipSync(value);
      //     this.setDataValue('ssn', gzippedBuffer.toString('base64'));
      //   } else {
      //     this.setDataValue('ssn', null);
      //   }
      // }
    },
    address_line1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address_line2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    qr_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    signature_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_card_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Member',
    hooks: {
      afterCreate: (member, options) => {
        return member.update({
          created_date: new Date()
        });
      }
    }
  });
  return Member;
};