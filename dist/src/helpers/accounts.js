"use strict";

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _crypto3 = require("../helpers/crypto");

var _crypto4 = _interopRequireDefault(_crypto3);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _attachments = require("../helpers/attachments");

var _constants = require("./constants");

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bcrypt = require('bcryptjs');

const OTP_LENGTH = 6;
const QR_LENGTH = 7;
module.exports = {
    /**
    * Create verification code and return the code
    */
    createVerificationCode: async () => {
        let code = "";
        while (true) {
            code = _crypto2.default.randomBytes(Math.ceil(OTP_LENGTH / 2)).toString("hex");
            code = parseInt(code, 16).toString().slice(0, OTP_LENGTH);
            let isExist = await _models2.default.User.findOne({
                where: {
                    verification_code: code
                }
            });
            if (isExist === null) {
                break;
            }
        }
        return code;
    },
    /**
     * Create QR code
    */
    createRandomString: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = _crypto2.default.randomBytes(Math.ceil(QR_LENGTH / 2)).toString('hex') // convert to hexadecimal format
                .slice(0, QR_LENGTH).toUpperCase();
                // console.log("result========>"+result)
                resolve(result);
            } catch (error) {
                console.log("error========>" + error);
                resolve(error);
            }
        });
    },

    /**
    * Create new QR code
    */
    createQrCode: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                let code = "";
                while (true) {
                    code = await module.exports.createRandomString();
                    // console.log("code========>"+code)  
                    let findMember = await _models2.default.Member.findOne({
                        where: {
                            qr_code: code
                        }
                    });
                    // console.log("findMember========>"+JSON.stringify(findMember))
                    if (findMember === null) {
                        break;
                    }
                }
                resolve(code);
            } catch (error) {
                console.log("error========>" + error);
                reject(error);
            }
        });
    },

    authenticate: async (user, password) => {
        return new Promise(function (resolve, reject) {

            if (typeof password !== 'string') {
                resolve(null);
            }

            try {
                if (!user || user.hashed_password === null || !bcrypt.compareSync(password, user.hashed_password)) {
                    resolve(null);
                }

                resolve(user);
            } catch (error) {
                resolve(null);
            }
        });
    },

    findMemberAccount: async req => {
        return new Promise(async (resolve, reject) => {
            try {
                let {
                    race, ethnicity, driver_license_number, passport_number, ssn, address_line1, address_line2, city, state, country, zipcode,
                    policy_number, insurance_provider, policy_group_number, provider_phone_number, insurance_front_file, insurance_back_file,
                    street_address_line1, street_address_line2, provider_city, provider_state, provider_zipcode, provider_country, id_image_file, signature_image, member_ref
                } = req.body;
                let resultObj = {};
                let signature_image_name = null;
                let id_image_name = null;
                let insurance_front_name = null;
                let insurance_back_name = null;

                let findMember = await _models2.default.Member.findOne({
                    where: {
                        id: member_ref
                    }
                });
                if (findMember === null) {
                    resultObj.status = "failed";
                    resultObj.message = "Invalid Member";
                    resultObj.payload = null;
                    return resolve(resultObj);
                }

                if (findMember.signature_image !== null) {
                    await (0, _attachments.deleteDocument)(findMember.signature_image, _constants.S3_USER_BUCKET_NAME);
                }

                if (signature_image !== undefined && signature_image !== null && signature_image !== "") {
                    signature_image_name = await (0, _attachments.uploadBase64Image)(signature_image, _constants.S3_USER_BUCKET_NAME);
                }

                if (findMember.id_card_image !== null) {
                    await (0, _attachments.deleteDocument)(findMember.id_card_image, _constants.S3_USER_BUCKET_NAME);
                }

                if (req.files.id_image_file !== undefined && req.files.id_image_file !== null && req.files.id_image_file !== "" && req.files.id_image_file.length > 0) {
                    id_image_name = await (0, _attachments.uploadDocument)(req.files.id_image_file[0], _constants.S3_USER_BUCKET_NAME);
                }

                await _models2.default.Member.update({
                    race: race !== undefined && race !== 'undefined' && race !== "null" && race !== null ? race : findMember.race,
                    ethnicity: ethnicity !== undefined && ethnicity !== 'undefined' && ethnicity !== "null" && ethnicity !== null ? ethnicity : findMember.ethnicity,
                    driver_license_number: driver_license_number !== undefined && driver_license_number !== 'undefined' && driver_license_number !== "null" && driver_license_number !== null ? driver_license_number : findMember.driver_license_number,
                    passport_number: passport_number !== undefined && passport_number !== 'undefined' && passport_number !== "null" && passport_number !== null ? passport_number : findMember.passport_number,
                    ssn: ssn !== undefined && ssn !== 'undefined' && ssn !== "null" && ssn !== null ? ssn : findMember.ssn,
                    address_line1: address_line1 !== undefined && address_line1 !== 'undefined' && address_line1 !== "null" && address_line1 !== null ? address_line1 : findMember.address_line1,
                    address_line2: address_line2 !== undefined && address_line2 !== 'undefined' && address_line2 !== "null" && address_line2 !== null ? address_line2 : findMember.address_line2,
                    city: city !== undefined && city !== 'undefined' && city !== "null" && city !== null ? city : findMember.city,
                    state: state !== undefined && state !== 'undefined' && state !== "null" && state !== null ? state : findMember.state,
                    country: country !== undefined && country !== 'undefined' && country !== "null" && country !== null ? country : findMember.country,
                    zipcode: zipcode !== undefined && zipcode !== 'undefined' && zipcode !== "null" && zipcode !== null ? zipcode : findMember.zipcode,
                    id_card_image: id_image_name !== null ? id_image_name : findMember.id_card_image,
                    signature_image: signature_image_name
                }, {
                    where: {
                        id: findMember.id
                    },
                    returning: true
                });

                if (insurance_provider !== null && insurance_provider !== 'null' && insurance_provider !== undefined && insurance_provider !== 'undefined' && policy_number !== null && policy_number !== 'null' && policy_number !== undefined && policy_number !== 'undefined') {
                    let findMemberInsurance = await _models2.default.MemberInsurance.findOne({
                        where: {
                            member_id: findMember.id,
                            insurance_provider: insurance_provider,
                            policy_number: policy_number
                        }
                    });

                    if (req.files.insurance_front_file !== undefined && req.files.insurance_front_file !== null && req.files.insurance_front_file !== "" && req.files.insurance_front_file.length > 0) {
                        insurance_front_name = await (0, _attachments.uploadDocument)(req.files.insurance_front_file[0], _constants.S3_INSURANCE_BUCKET_NAME);
                    }

                    if (req.files.insurance_back_file !== undefined && req.files.insurance_back_file !== null && req.files.insurance_back_file !== "" && req.files.insurance_back_file.length > 0) {
                        insurance_back_name = await (0, _attachments.uploadDocument)(req.files.insurance_back_file[0], _constants.S3_INSURANCE_BUCKET_NAME);
                    }
                    if (findMemberInsurance === null) {
                        await _models2.default.MemberInsurance.create({
                            member_id: findMember.id,
                            insurance_provider: insurance_provider,
                            policy_number: policy_number,
                            policy_group_number: policy_group_number,
                            provider_phone_number: provider_phone_number,
                            front_insurance_card_image: insurance_front_name,
                            back_insurance_card_image: insurance_back_name,
                            street_address_line1: street_address_line1,
                            street_address_line2: street_address_line2,
                            city: provider_city,
                            state: provider_state,
                            country: provider_country,
                            zipcode: provider_zipcode,
                            expiry_date: null,
                            status: "ACTIVE"
                        });
                    }
                }

                let memberObj = {};
                memberObj.full_name = findMember.full_name;
                memberObj.birth_date = findMember.birth_date;
                memberObj.qr_code = findMember.qr_code;
                memberObj.member_token = findMember.member_token;

                resultObj.status = "success";
                resultObj.message = "member created successfully";
                resultObj.payload = memberObj;
                resolve(resultObj);
            } catch (error) {
                console.log("error===========>" + error);
                resolve(null);
            }
        });
    },

    createorFindUserAccount: async req => {
        return new Promise(async (resolve, reject) => {
            try {
                let {
                    lab_code, first_name, last_name, gender, country_code, phone_number, email, birth_date, race, ethnicity,
                    driver_license_number, passport_number, ssn, address_line1, address_line2, city, state, country, zipcode,
                    policy_number, insurance_provider, policy_group_number, provider_phone_number, insurance_front_file, insurance_back_file,
                    street_address_line1, street_address_line2, provider_city, provider_state, provider_zipcode, provider_country, id_image_file, signature_image, verified_by
                } = req.body;
                let resultObj = {};

                let signature_image_name = null;
                let id_image_name = null;
                let insurance_front_name = null;
                let insurance_back_name = null;

                let findRole = await _models2.default.Role.findOne({
                    where: {
                        code: "CSR"
                    }
                });

                if (findRole === null) {
                    resultObj.status = "failed";
                    resultObj.message = "Invalid Role";
                    resultObj.payload = null;
                    return resolve(resultObj);
                }

                let findLab = await _models2.default.Lab.findOne({
                    where: {
                        code: lab_code
                    }
                });

                if (findLab === null) {
                    resultObj.status = "failed";
                    resultObj.message = "Invalid Lab";
                    resultObj.payload = null;
                    return resolve(resultObj);
                }

                if (verified_by === null || verified_by === undefined) {
                    resultObj.status = "failed";
                    resultObj.message = "Invalid Member";
                    resultObj.payload = null;
                    return resolve(resultObj);
                }

                let hashedCountryCode = country_code !== null ? await _crypto4.default.hash_from_string(country_code) : null;
                let hashedPhoneNumber = phone_number !== null ? await _crypto4.default.hash_from_string(phone_number) : null;
                let hashedEmail = email !== null ? await _crypto4.default.hash_from_string(email) : null;

                let whereObj = {};
                whereObj.lab_code = lab_code;

                if (verified_by === "PHONE") {
                    whereObj.country_code = hashedCountryCode;
                    whereObj.phone_number = hashedPhoneNumber;
                }

                if (verified_by === "EMAIL") {
                    whereObj.email = hashedEmail;
                }

                let findUser = await _models2.default.User.findOne({
                    where: whereObj
                });

                let newUser = findUser;

                if (newUser === null) {
                    newUser = await _models2.default.User.create({
                        country_code: hashedCountryCode,
                        phone_number: hashedPhoneNumber,
                        internal_user: false,
                        lab_code: lab_code,
                        email: hashedEmail,
                        password: null,
                        status: "ACTIVE"
                    });
                }

                if (newUser.internal_user === true) {
                    resultObj.status = "failed";
                    resultObj.message = "user account already exist for internal user";
                    resultObj.payload = null;
                    return resolve(resultObj);
                }

                console.log("newUser=====>" + JSON.stringify(newUser));
                let hashedUserId = await _crypto4.default.hash_from_string(newUser.id);
                console.log("hashedUserId=====>" + hashedUserId);
                let accountName = `${first_name !== null ? first_name : ""} ${last_name !== null ? last_name : ""}`;
                console.log("accountName=====>" + accountName);
                let findAccount = await _models2.default.Account.findOne({
                    where: {
                        hashed_user_id: hashedUserId
                    }
                });

                let newAccount = findAccount;
                if (newAccount === null) {
                    newAccount = await _models2.default.Account.create({
                        lab_ref: findLab !== null ? findLab.id : null,
                        hashed_user_id: hashedUserId,
                        name: accountName,
                        internal_account: false,
                        status: "ACTIVE"
                    });

                    await _models2.default.AccountRole.create({
                        role_id: findRole.id,
                        account_id: newAccount.id,
                        is_default: true,
                        status: "ACTIVE"
                    });
                }

                console.log("newAccount=====>" + JSON.stringify(newAccount));
                let newQrCode = await module.exports.createQrCode();
                console.log("newQrCode=====>" + newQrCode);

                let filterMember = await _models2.default.Member.findAll({
                    where: {
                        account_id: newAccount.id
                    }
                });
                console.log("filterMember=====>" + JSON.stringify(filterMember));
                let findMember = filterMember.find(x => x.first_name.toLowerCase() === first_name.toLowerCase() && x.last_name.toLowerCase() === last_name.toLowerCase() && (0, _moment2.default)(x.birth_date, "YYYY-MM-DD").format("MM/DD/YYYY") === (0, _moment2.default)(birth_date, "MM/DD/YYYY").format("MM/DD/YYYY"));
                console.log("findMember=====>" + JSON.stringify(findMember));
                let newMember = findMember !== undefined ? findMember : null;

                if (signature_image !== undefined && signature_image !== null && signature_image !== "") {
                    signature_image_name = await (0, _attachments.uploadBase64Image)(signature_image, _constants.S3_USER_BUCKET_NAME);
                }

                if (req.files.id_image_file !== undefined && req.files.id_image_file !== null && req.files.id_image_file !== "" && req.files.id_image_file.length > 0) {
                    id_image_name = await (0, _attachments.uploadDocument)(req.files.id_image_file[0], _constants.S3_USER_BUCKET_NAME);
                }

                if (newMember === null) {
                    newMember = await _models2.default.Member.create({
                        account_id: newAccount.id,
                        first_name: first_name.toLowerCase(),
                        last_name: last_name.toLowerCase(),
                        gender,
                        country_code: country_code,
                        phone_number: phone_number,
                        is_primary_member: filterMember.length === 0 ? true : false,
                        email: email,
                        birth_date,
                        race,
                        ethnicity,
                        driver_license_number,
                        passport_number,
                        ssn,
                        address_line1,
                        address_line2,
                        city,
                        state,
                        country,
                        zipcode,
                        qr_code: newQrCode,
                        signature_image: signature_image_name,
                        id_card_image: id_image_name,
                        status: "ACTIVE"
                    });
                }
                console.log("newMember=====>" + JSON.stringify(newMember));
                console.log("<=====ins=====>");
                if (insurance_provider !== null && insurance_provider !== 'null' && insurance_provider !== undefined && insurance_provider !== 'undefined' && policy_number !== null && policy_number !== 'null' && policy_number !== undefined && policy_number !== 'undefined') {
                    let findMemberInsurance = await _models2.default.MemberInsurance.findOne({
                        where: {
                            member_id: newMember.id,
                            insurance_provider: insurance_provider,
                            policy_number: policy_number
                        }
                    });
                    console.log("findMemberInsurance=====>" + JSON.stringify(findMemberInsurance));
                    if (req.files.insurance_front_file !== undefined && req.files.insurance_front_file !== null && req.files.insurance_front_file !== "" && req.files.insurance_front_file.length > 0) {
                        insurance_front_name = await (0, _attachments.uploadDocument)(req.files.insurance_front_file[0], _constants.S3_INSURANCE_BUCKET_NAME);
                    }

                    if (req.files.insurance_back_file !== undefined && req.files.insurance_back_file !== null && req.files.insurance_back_file !== "" && req.files.insurance_back_file.length > 0) {
                        insurance_back_name = await (0, _attachments.uploadDocument)(req.files.insurance_back_file[0], _constants.S3_INSURANCE_BUCKET_NAME);
                    }
                    if (findMemberInsurance === null) {
                        await _models2.default.MemberInsurance.create({
                            member_id: newMember.id,
                            insurance_provider: insurance_provider,
                            policy_number: policy_number,
                            policy_group_number: policy_group_number,
                            provider_phone_number: provider_phone_number,
                            front_insurance_card_image: insurance_front_name,
                            back_insurance_card_image: insurance_back_name,
                            street_address_line1: street_address_line1,
                            street_address_line2: street_address_line2,
                            city: provider_city,
                            state: provider_state,
                            country: provider_country,
                            zipcode: provider_zipcode,
                            expiry_date: null,
                            status: "ACTIVE"
                        });
                    }
                }

                let memberObj = {};
                memberObj.full_name = newMember.full_name;
                memberObj.birth_date = newMember.birth_date;
                memberObj.qr_code = newMember.qr_code;
                memberObj.member_token = newMember.member_token;
                memberObj.email = newMember.email;

                resultObj.status = "success";
                resultObj.message = "member created successfully";
                resultObj.payload = memberObj;

                resolve(resultObj);
            } catch (error) {
                console.log("error at create user account========>" + error);
                reject(error);
            }
        });
    },

    fetchPermission: async account => {
        return new Promise(function (resolve, reject) {
            try {
                let permissionObj = {};
                if (account.accountRoles.length > 0) {
                    let pluckRole = _underscore2.default.pluck(account.accountRoles, 'role');
                    for (let role of pluckRole) {
                        permissionObj = Object.assign({}, permissionObj, role.permission);
                    }
                }
                if (account.customPermissions.length > 0) {
                    let pluckCustomPermission = _underscore2.default.pluck(account.customPermissions, 'permission');
                    for (let custom of pluckCustomPermission) {
                        permissionObj = Object.assign({}, permissionObj, custom);
                    }
                }
                resolve(permissionObj);
            } catch (error) {
                console.log(`error at fetch Permission===>${error}`);
                resolve({});
            }
        });
    },
    findSessionAccount: async userData => {
        return new Promise(async (resolve, reject) => {
            try {
                let { userId, account_token } = userData;

                let findUser = await _models2.default.User.findOne({
                    where: {
                        id: userId
                    }
                });

                if (findUser === null) {
                    resolve(null);
                }

                let hashed_user_id = await _crypto4.default.hash_from_string(findUser.id);

                let findAccount = await _models2.default.Account.findOne({
                    where: {
                        account_token: account_token,
                        hashed_user_id: hashed_user_id
                    },
                    include: [{
                        model: _models2.default.AccountRole,
                        as: 'accountRoles',
                        include: [{
                            model: _models2.default.Role,
                            as: "role"
                        }]
                    }, {
                        model: _models2.default.Lab,
                        as: 'accountLab'
                    }]
                });

                if (findAccount === null) {
                    resolve(null);
                }

                resolve(findAccount);
            } catch (error) {
                console.log(`error at fetch Permission===>${error}`);
                resolve(null);
            }
        });
    },

    fetchIfUserExist: body => {
        return new Promise(async (resolve, reject) => {
            try {
                let {
                    lab_code, country_code, phone_number, email, verified_by
                } = body;

                let hashedCountryCode = country_code !== null ? await _crypto4.default.hash_from_string(country_code) : null;
                let hashedPhoneNumber = phone_number !== null ? await _crypto4.default.hash_from_string(phone_number) : null;
                let hashedEmail = email !== null ? await _crypto4.default.hash_from_string(email) : null;

                let whereObj = {};
                whereObj.lab_code = lab_code;
                // whereObj.lab_code = 'BLML';

                if (hashedCountryCode !== null && hashedPhoneNumber !== null) {
                    whereObj.country_code = hashedCountryCode;
                    whereObj.phone_number = hashedPhoneNumber;
                }

                if (hashedEmail !== null) {
                    whereObj.email = hashedEmail;
                }

                let fetchUser = await _models2.default.User.findOne({
                    where: whereObj
                });

                // if(fetchUser !== null){
                //     resolve(fetchUser);
                // }

                // fetchUser = await db.User.create({
                //     country_code: hashedCountryCode,
                //     phone_number: hashedPhoneNumber,
                //     internal_user: false,
                //     lab_code: lab_code,
                //     email: hashedEmail,
                //     password: null,
                //     status: "ACTIVE"
                // });

                resolve(fetchUser);
            } catch (error) {
                console.log(`Error while creating new user account => ${error}`);
                resolve(null);
            }
        });
    }
};