"use strict";

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

var _constants = require("../helpers/constants");

var _crypto = require("../helpers/crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _accounts = require("../helpers/accounts");

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _qrcode = require("qrcode");

var _qrcode2 = _interopRequireDefault(_qrcode);

var _stream = require("stream");

var _MessageUtils = require("../helpers/MessageUtils");

var _MessageUtils2 = _interopRequireDefault(_MessageUtils);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Sequelize = require("sequelize");
const { Op } = require("sequelize");

exports.login = async (req, res, next) => {
    try {
        // console.log(`Hit Login released`)
        let { lab_code, country_code, phone_number, email, preferred_login, date_of_birth } = req.body;

        let whereObj = {};
        whereObj.lab_code = lab_code;
        whereObj.internal_user = false;

        if (preferred_login === "MOB") {
            whereObj.country_code = await _crypto2.default.hash_from_string(country_code);
            whereObj.phone_number = await _crypto2.default.hash_from_string(phone_number);
        }

        if (preferred_login === "EML") {
            whereObj.email = await _crypto2.default.hash_from_string(email);
        }

        let fetchUser = await _models2.default.User.findOne({
            where: whereObj
        });

        if (fetchUser === null) {
            // console.log(`user --error`)
            return res.json({
                status: 'failed',
                payload: null,
                message: "user doesn't exist"
            });
        }

        if (date_of_birth !== undefined && date_of_birth !== null) {
            // console.log(`Date of birth added -> ${date_of_birth}`)
            let hashed_user_id = await _crypto2.default.hash_from_string(fetchUser.id);
            //find account
            let fetchAccount = await _models2.default.Account.findOne({
                where: {
                    hashed_user_id: hashed_user_id
                }
            });

            if (fetchAccount === null) {
                // console.log(`Account --error`)
                return res.json({
                    status: 'failed',
                    payload: null,
                    message: "user doesn't exist"
                });
            }

            let fetchMember = await _models2.default.Member.findOne({
                where: {
                    account_id: fetchAccount.id,
                    birth_date: date_of_birth
                }
            });

            if (fetchMember === null) {
                // console.log(`Member --error`)
                return res.json({
                    status: 'failed',
                    payload: null,
                    message: "Invalid phone number or birthdate"
                });
            }
        }

        let verificationCode = _constants.NODE_ENV === "development" ? "000000" : await (0, _accounts.createVerificationCode)();
        let data = {};
        data.verification_code = verificationCode;

        await _models2.default.User.update({
            verification_code: verificationCode
        }, {
            where: {
                id: fetchUser.id
            }
        });

        let message = "Hi, Please use the verification code to login - " + verificationCode + ".";

        if (preferred_login === "MOB") {
            let message_data = {};
            message_data.member_token = null;
            message_data.name = "User";
            message_data.phone_number = phone_number;
            message_data.country_code = country_code;
            message_data.email = null;
            message_data.type = "SMS";
            message_data.description = message;
            message_data.message_purpose = "OTP";
            message_data.email_content = null;
            _MessageUtils2.default.sendMessage(message_data);
        }

        if (preferred_login === "EML") {
            let message_data = {};
            message_data.member_token = null;
            message_data.name = "User";
            message_data.phone_number = null;
            message_data.country_code = null;
            message_data.email = email;
            message_data.type = "EMAIL";
            message_data.description = "Login OTP mail send to " + email;
            message_data.message_purpose = "OTP";
            message_data.email_content = data;
            _MessageUtils2.default.sendMessage(message_data);
        }

        // console.log(`Resp released`)
        res.status(200).json({
            status: 'success',
            payload: null,
            message: 'Account validate successfully'
        });
    } catch (error) {
        console.log("Error at user login method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while login'
        });
    }
};

exports.verify_otp_credentials = async (req, res, next) => {
    try {
        let { lab_code, country_code, phone_number, email, verification_code, preferred_login } = req.body;

        let whereObj = {};
        whereObj.lab_code = lab_code;

        if (preferred_login === "MOB") {
            whereObj.country_code = await _crypto2.default.hash_from_string(country_code);
            whereObj.phone_number = await _crypto2.default.hash_from_string(phone_number);
        }

        if (preferred_login === "EML") {
            whereObj.email = await _crypto2.default.hash_from_string(email);
        }

        whereObj.verification_code = verification_code;

        let fetchUser = await _models2.default.User.findOne({
            where: whereObj
        });

        if (fetchUser === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "user doesn't exist"
            });
        }

        await _models2.default.User.update({
            verification_code: null
        }, {
            where: {
                id: fetchUser.id
            }
        });

        let hashed_user_id = await _crypto2.default.hash_from_string(fetchUser.id);

        let findAccount = await _models2.default.Account.findOne({
            where: {
                hashed_user_id: hashed_user_id
            },
            attributes: ['account_token'],
            include: [{
                attributes: ['is_default'],
                model: _models2.default.AccountRole,
                as: 'accountRoles',
                include: [{
                    attributes: ['permission'],
                    model: _models2.default.Role,
                    as: 'role'
                }]
            }, {
                attributes: ['permission'],
                model: _models2.default.CustomPermission,
                as: 'customPermissions'
            }]
        });

        if (findAccount === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "Invalid user account"
            });
        }

        let permissionSet = await (0, _accounts.fetchPermission)(findAccount);

        let userObj = {};
        userObj.userId = fetchUser.id;
        userObj.account_token = findAccount.account_token;

        let token = _jsonwebtoken2.default.sign(userObj, _constants.JWT_PRIVATE_KEY);

        res.status(200).json({
            status: "success",
            token: token,
            payload: permissionSet,
            message: "login successfully"
        });
    } catch (error) {
        console.log("Error at verify credentials method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while verify credentials'
        });
    }
};

exports.login_internal_user = async (req, res, next) => {
    try {
        let { lab_code, email, password } = req.body;

        let whereObj = {};
        // if(lab_code !== null){
        //     whereObj.lab_code = lab_code;
        // }

        whereObj.email = await _crypto2.default.hash_from_string(email);
        whereObj.internal_user = true;

        console.log(`Body --> ${JSON.stringify(req.body)}`);

        console.log(`WhereObj --> ${JSON.stringify(whereObj)}`);

        let fetchUser = await _models2.default.User.findOne({
            where: Object.assign({}, whereObj, {
                [Op.or]: [{
                    lab_code: lab_code
                }, {
                    lab_code: null
                }]
            })
        });

        if (fetchUser === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "user doesn't exist"
            });
        }

        let authenticate_user = await (0, _accounts.authenticate)(fetchUser, password);

        if (authenticate_user === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "invalid password"
            });
        }

        let verificationCode = _constants.NODE_ENV === "development" ? "000000" : await (0, _accounts.createVerificationCode)();
        let data = {};
        data.verification_code = verificationCode;

        await _models2.default.User.update({
            verification_code: verificationCode
        }, {
            where: {
                id: fetchUser.id
            }
        });

        let hashedUserId = await _crypto2.default.hash_from_string(fetchUser.id);

        let findAccount = await _models2.default.Account.findOne({
            where: {
                hashed_user_id: hashedUserId
            },
            include: [{
                model: _models2.default.Member,
                as: "accountMembers",
                where: {
                    is_primary_member: true
                }
            }]
        });

        let name = findAccount !== null && findAccount.accountMembers.length > 0 ? findAccount.accountMembers[0].first_name : "User";
        let country_code = findAccount !== null && findAccount.accountMembers.length > 0 ? findAccount.accountMembers[0].country_code : null;
        let phone_number = findAccount !== null && findAccount.accountMembers.length > 0 ? findAccount.accountMembers[0].phone_number : null;

        // let message_data = {};
        // message_data.member_token = null;
        // message_data.name = name;
        // message_data.phone_number = null;
        // message_data.country_code = null;
        // message_data.email = email;
        // message_data.type = "EMAIL";
        // message_data.description = "Login OTP mail send to " + email;
        // message_data.message_purpose = "OTP";
        // message_data.email_content = data;
        // MessageUtils.sendMessage(message_data);

        if (!!country_code && !!phone_number) {
            let message = "Hi, Please use the verification code to login - " + verificationCode + ".";
            let sms_message_data = {};
            sms_message_data.member_token = null;
            sms_message_data.name = name.charAt(0).toUpperCase() + name.slice(1);
            sms_message_data.phone_number = phone_number;
            sms_message_data.country_code = country_code;
            sms_message_data.email = null;
            sms_message_data.type = "SMS";
            sms_message_data.description = message;
            sms_message_data.message_purpose = "OTP";
            sms_message_data.email_content = null;
            _MessageUtils2.default.sendMessage(sms_message_data);
        }

        res.status(200).json({
            status: "success",
            message: "Verification code send successfully"
        });
    } catch (error) {
        console.log("Error at verify credentials method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while verify credentials'
        });
    }
};

exports.verify_internal_user = async (req, res, next) => {
    try {
        let { lab_code, email, verification_code } = req.body;

        let whereObj = {};
        // if(lab_code !== null){
        //     whereObj.lab_code = lab_code;
        // }
        // whereObj.lab_code = lab_code;
        whereObj.email = await _crypto2.default.hash_from_string(email);
        whereObj.internal_user = true;
        whereObj.verification_code = verification_code;

        let fetchUser = await _models2.default.User.findOne({
            where: Object.assign({}, whereObj, {
                [Op.or]: [{
                    lab_code: lab_code
                }, {
                    lab_code: null
                }]
            })
        });

        if (fetchUser === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "user doesn't exist"
            });
        }

        await _models2.default.User.update({
            verification_code: null
        }, {
            where: {
                id: fetchUser.id
            }
        });

        let hashed_user_id = await _crypto2.default.hash_from_string(fetchUser.id);

        let findAccount = await _models2.default.Account.findOne({
            where: {
                hashed_user_id: hashed_user_id
            },
            attributes: ['account_token'],
            include: [{
                attributes: ['is_default'],
                model: _models2.default.AccountRole,
                as: 'accountRoles',
                include: [{
                    attributes: ['permission'],
                    model: _models2.default.Role,
                    as: 'role'
                }]
            }, {
                attributes: ['permission'],
                model: _models2.default.CustomPermission,
                as: 'customPermissions'
            }]
        });

        if (findAccount === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "Invalid user account"
            });
        }
        let permissionSet = await (0, _accounts.fetchPermission)(findAccount);
        let userObj = {};
        userObj.userId = fetchUser.id;
        userObj.account_token = findAccount.account_token;

        let token = _jsonwebtoken2.default.sign(userObj, _constants.JWT_PRIVATE_KEY);

        res.status(200).json({
            status: "success",
            token: token,
            payload: permissionSet,
            message: "login successfully"
        });
    } catch (error) {
        console.log("Error at verify credentials method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while verify credentials'
        });
    }
};

exports.change_password = async (req, res, next) => {
    try {
        let { password, user_id } = req.body;

        let fetchUser = await _models2.default.User.findOne({
            where: {
                id: user_id
            }
        });

        if (fetchUser === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "Invalid user account"
            });
        }

        await _models2.default.User.update({
            password: password
        }, {
            where: {
                id: fetchUser.id
            }
        });

        res.status(200).json({
            status: 'success',
            payload: null,
            message: 'password changed successfully'
        });
    } catch (error) {
        console.log("Error at change method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while change password'
        });
    }
};

exports.authenticate = async (req, res, next) => {
    try {
        let findUser = await _models2.default.User.findOne({
            where: {
                id: req.userData.userId
            }
        });
        if (findUser === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Unauthorized User"
            });
        }

        let hashed_user_id = await _crypto2.default.hash_from_string(findUser.id);

        let findAccount = await _models2.default.Account.findOne({
            where: {
                account_token: req.userData.account_token,
                hashed_user_id: hashed_user_id
            },
            attributes: ['account_token'],
            include: [{
                attributes: ['is_default'],
                model: _models2.default.AccountRole,
                as: 'accountRoles',
                include: [{
                    attributes: ['permission'],
                    model: _models2.default.Role,
                    as: 'role'
                }]
            }, {
                attributes: ['permission'],
                model: _models2.default.CustomPermission,
                as: 'customPermissions'
            }]
        });

        if (findAccount === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Unauthorized"
            });
        }

        let defaultRole = findAccount.accountRoles.length > 0 ? findAccount.accountRoles[0].role.code : null;

        let permissionSet = await (0, _accounts.fetchPermission)(findAccount);

        let userObj = {};
        userObj.userId = findUser.id;
        userObj.account_token = findAccount.account_token;

        let token = _jsonwebtoken2.default.sign(userObj, _constants.JWT_PRIVATE_KEY);
        res.status(200).json({
            status: "success",
            token: token,
            payload: permissionSet,
            defaultRole: defaultRole,
            message: "login successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            payload: null,
            message: "Unauthorized"
        });
    }
};

exports.validate_token = async (req, res, next) => {
    try {
        // console.log("req.userData=============>"+JSON.stringify(req.userData))
        let findUser = await _models2.default.User.findOne({
            where: {
                id: req.userData.userId
            }
        });
        // console.log("findUser=============>"+JSON.stringify(findUser))
        if (findUser === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid User"
            });
        }

        let hashed_user_id = await _crypto2.default.hash_from_string(findUser.id);
        console.log("hashed_user_id=============>" + hashed_user_id);
        let findAccount = await _models2.default.Account.findOne({
            where: {
                account_token: req.userData.account_token,
                hashed_user_id: hashed_user_id
            },
            include: [{
                attributes: ['role_id', 'is_default'],
                model: _models2.default.AccountRole,
                as: 'accountRoles',
                include: [{
                    attributes: ['code', 'name'],
                    model: _models2.default.Role,
                    as: 'role'
                }]
            }]
        });
        console.log("findAccount=============>" + JSON.stringify(findAccount));
        if (findAccount === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid Account"
            });
        }

        let defaultRole = findAccount.accountRoles.length > 0 ? findAccount.accountRoles[0].role.code : null;
        console.log("defaultRole=============>" + defaultRole);
        let findMember = await _models2.default.Member.findOne({
            where: {
                account_id: findAccount.id,
                is_primary_member: true
            },
            attributes: ['id', 'member_token', 'full_name', 'country_code', 'phone_number', 'email', 'gender', 'birth_date', 'race', 'ethnicity', 'driver_license_number', 'passport_number', 'ssn', 'address_line1', 'address_line2', 'city', 'state', 'zipcode', 'country', 'qr_code', 'created_date', 'status'],
            include: [{
                attributes: ['account_token', 'name'],
                model: _models2.default.Account,
                as: 'memberAccount',
                include: [{
                    attributes: ['role_id', 'is_default'],
                    model: _models2.default.AccountRole,
                    as: 'accountRoles',
                    include: [{
                        attributes: ['code', 'name'],
                        model: _models2.default.Role,
                        as: 'role'
                    }]
                }]
            }]
        });
        console.log("findMember=============>" + JSON.stringify(findMember));
        if (findMember === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid Member"
            });
        }

        res.status(200).json({
            status: 'success',
            payload: findMember,
            defaultRole: defaultRole,
            message: 'Validate user successfully'
        });
    } catch (error) {
        console.log("Error at validate user ==> " + error);
        res.status(500).json({
            status: "failed",
            payload: {},
            message: "Error while validate user"
        });
    }
};

exports.create_new_account = async (req, res, next) => {
    try {
        let { member_ref, verified_by } = req.body;
        console.log(verified_by + "<==========create_new_account======>" + member_ref);
        let accountMember = null;
        if (member_ref !== "null" && member_ref !== null && member_ref !== "undefined" && member_ref !== undefined) {
            accountMember = await (0, _accounts.findMemberAccount)(req);
        } else {
            accountMember = await (0, _accounts.createorFindUserAccount)(req);
        }
        console.log("accountMember======>" + JSON.stringify(accountMember));
        if (accountMember === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: 'invalid member'
            });
        }

        if (accountMember.status === "failed") {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: accountMember.message
            });
        }

        res.status(200).json({
            status: "success",
            payload: accountMember.payload,
            message: "account created successfully"
        });
    } catch (error) {
        console.log("error==========>" + error);
        res.status(500).json({
            status: "failed",
            payload: null,
            message: error
        });
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        let { email } = req.body;

        let hashed_email = await _crypto2.default.hash_from_string(email);

        let findUser = await _models2.default.User.findOne({
            where: {
                email: hashed_email,
                internal_user: true
            }
        });

        if (findUser === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "User doesn't exist"
            });
        }

        let hashed_user_id = await _crypto2.default.hash_from_string(findUser.id);

        let findAccount = await _models2.default.Account.findOne({
            where: {
                hashed_user_id: hashed_user_id
            }
        });

        if (findAccount === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid Account"
            });
        }

        let fetchMember = await _models2.default.Member.findOne({
            where: {
                account_id: findAccount.id,
                is_primary_member: true
            }
        });

        if (fetchMember === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid Account"
            });
        }

        let token = Buffer.from(hashed_email).toString('base64');

        let data = {};
        data.link = `${_constants.CLIENT_DOMAIN}reset-password?token=${token}`;
        console.log("data======>" + JSON.stringify(data));

        let message_data = {};
        message_data.member_token = fetchMember.member_token;
        message_data.name = fetchMember.full_name.charAt(0).toUpperCase() + fetchMember.full_name.slice(1);
        message_data.phone_number = null;
        message_data.country_code = null;
        message_data.email = email;
        message_data.type = "EMAIL";
        message_data.description = "Forgot password mail send to " + fetchMember.full_name;
        message_data.message_purpose = "FORGOT_PASSWORD";
        message_data.email_content = data;
        _MessageUtils2.default.sendMessage(message_data);

        res.status(200).json({
            status: 'success',
            payload: null,
            message: 'User mail send successfully'
        });
    } catch (error) {
        console.log("Error at updating send mail==> " + error);
        res.status(500).json({
            status: "failed",
            payload: null,
            message: "Unable to send mail"
        });
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        let { token, password } = req.body;

        let email = Buffer.from(token, 'base64').toString();

        // let hashed_email = await crypto.hash_from_string(email);

        let findUser = await _models2.default.User.findOne({
            where: {
                email: email,
                internal_user: true
            }
        });

        if (findUser === null) {
            return res.json({
                status: "failed",
                payload: null,
                message: "User doesn't exist"
            });
        }

        await _models2.default.User.update({
            password: password
        }, {
            where: {
                id: findUser.id
            }
        });

        res.status(200).json({
            status: 'success',
            payload: null,
            message: 'User password updated successfully'
        });
    } catch (error) {
        console.log("Error at updating user password==> " + error);
        res.status(500).json({
            status: "failed",
            payload: null,
            message: "Unable to updated user password"
        });
    }
};

exports.createQRCode = async (req, res, next) => {
    try {
        let { qrCode } = req.params;

        const qrStream = new _stream.PassThrough();

        await _qrcode2.default.toFileStream(qrStream, qrCode);

        qrStream.pipe(res);
    } catch (error) {
        res.status(200).json({
            status: "failed",
            payload: null,
            message: "Unable to download"
        });
    }
};

exports.fetchAllInternalUsers = async (req, res, next) => {
    try {

        let limit = 50;

        let offset = req.query.offset ? parseInt(req.query.offset) : 0;

        let fetchAccounts = await _models2.default.Account.findAll({
            where: {
                internal_account: true
            },
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']],
            include: [{
                model: _models2.default.Member,
                as: "accountMembers",
                where: {
                    is_primary_member: true
                }
            }, {
                model: _models2.default.AccountRole,
                as: "accountRoles",
                where: {
                    is_default: true
                },
                include: [{
                    model: _models2.default.Role,
                    as: "role"
                }]
            }, {
                model: _models2.default.AccountLocation,
                as: 'accountLocations'
            }]
        });

        res.status(200).json({
            status: 'success',
            payload: fetchAccounts,
            message: 'Internal users Fetched successfully'
        });
    } catch (error) {
        console.log("Error at fetching internal users method- GET / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while fetching internal users'
        });
    }
};

exports.createInternalUser = async (req, res, next) => {
    try {
        let {
            lab_code, first_name, last_name, email, role_code, gender, lab_location_code, phone_number, country_code
        } = req.body;

        let findRole = await _models2.default.Role.findOne({
            where: {
                code: role_code
            }
        });

        if (findRole === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: 'Invalid Role'
            });
        }
        let findLab = null;

        if (role_code === "LBT" || role_code === "LOM") {
            findLab = await _models2.default.Lab.findOne({
                where: {
                    code: lab_code
                }
            });

            if (findLab === null) {
                return res.json({
                    status: 'failed',
                    payload: null,
                    message: 'Invalid Lab'
                });
            }
        }

        let hashedEmail = email !== null ? await _crypto2.default.hash_from_string(email) : null;

        let whereObj = {};
        if (role_code === "LBT" || role_code === "LOM") {
            whereObj.lab_code = lab_code;
        }
        whereObj.email = hashedEmail;

        let findUser = await _models2.default.User.findOne({
            where: whereObj
        });

        let newUser = findUser;

        if (newUser !== null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: 'user account already exist'
            });
        }

        if (newUser === null) {
            newUser = await _models2.default.User.create({
                country_code: null,
                phone_number: null,
                internal_user: true,
                lab_code: lab_code,
                email: hashedEmail,
                password: null,
                status: "ACTIVE"
            });
        }

        let hashedUserId = await _crypto2.default.hash_from_string(newUser.id);
        let accountName = `${first_name !== null ? first_name : ""} ${last_name !== null ? last_name : ""}`;

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
                internal_account: true,
                status: "ACTIVE"
            });

            await _models2.default.AccountRole.create({
                role_id: findRole.id,
                account_id: newAccount.id,
                is_default: true,
                status: "ACTIVE"
            });
            if (role_code === "LBT" || role_code === "LOM") {
                for (let location of lab_location_code) {
                    let findLocation = await _models2.default.LabLocation.findOne({
                        where: {
                            id: location
                        }
                    });
                    if (findLocation !== null) {
                        await _models2.default.AccountLocation.create({
                            lab_id: findLab !== null ? findLab.id : null,
                            lab_location_id: findLocation.id,
                            account_id: newAccount.id,
                            is_default: true,
                            status: "ACTIVE"
                        });
                    }
                }
            }
        }
        // else {
        //     await db.AccountRole.update({
        //         is_default: false,
        //     }, {
        //         where: {
        //             account_id: newAccount.id
        //         }
        //     });
        //     await db.AccountRole.create({
        //         role_id: findRole.id,
        //         account_id: newAccount.id,
        //         is_default: true,
        //         status: "ACTIVE"
        //     });
        // }

        let fetchMember = await _models2.default.Member.findOne({
            where: {
                account_id: newAccount.id
            }
        });

        if (fetchMember === null) {
            fetchMember = await _models2.default.Member.create({
                account_id: newAccount.id,
                first_name: first_name,
                last_name: last_name,
                gender,
                country_code: country_code,
                phone_number: phone_number,
                is_primary_member: true,
                birth_date: null,
                email: email,
                qr_code: null,
                status: "ACTIVE"
            });
        }

        let fetchAccounts = await _models2.default.Account.findOne({
            where: {
                id: newAccount.id
            },
            include: [{
                model: _models2.default.Member,
                as: "accountMembers",
                where: {
                    is_primary_member: true
                }
            }, {
                model: _models2.default.AccountRole,
                as: "accountRoles",
                where: {
                    is_default: true
                },
                include: [{
                    model: _models2.default.Role,
                    as: "role"
                }]
            }]
        });

        let token = Buffer.from(hashedEmail).toString('base64');

        let data = {};
        data.link = `${_constants.CLIENT_DOMAIN}reset-password?token=${token}`;
        console.log("data======>" + JSON.stringify(data));
        //send_mail("FORGOT_PASSWORD", email, fetchMember.full_name, data);
        let message_data = {};
        message_data.member_token = fetchMember.member_token;
        message_data.name = fetchMember.full_name.charAt(0).toUpperCase() + fetchMember.full_name.slice(1);
        message_data.phone_number = null;
        message_data.country_code = null;
        message_data.email = email;
        message_data.type = "EMAIL";
        message_data.description = "Welcome mail send to " + fetchMember.full_name;
        message_data.message_purpose = "PASSWORD";
        message_data.email_content = data;
        _MessageUtils2.default.sendMessage(message_data);

        res.status(200).json({
            status: 'success',
            payload: fetchAccounts,
            message: 'Internal user created successfully'
        });
    } catch (error) {
        console.log("Error at creating internal users method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while creating internal users'
        });
    }
};

exports.updateInternalUser = async (req, res, next) => {
    try {
        let { id } = req.params;
        let {
            lab_code, first_name, last_name, email, role_code, gender, lab_location_code, status, country_code, phone_number
        } = req.body;

        let findRole = await _models2.default.Role.findOne({
            where: {
                code: role_code
            }
        });

        if (findRole === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: 'Invalid Role'
            });
        }
        let findLab = null;

        if (role_code === "LBT" || role_code === "LOM") {
            findLab = await _models2.default.Lab.findOne({
                where: {
                    code: lab_code
                }
            });

            if (findLab === null) {
                return res.json({
                    status: 'failed',
                    payload: null,
                    message: 'Invalid Lab'
                });
            }
        }

        let hashedEmail = email !== null ? await _crypto2.default.hash_from_string(email) : null;

        let whereObj = {};
        if (role_code === "LBT" || role_code === "LOM") {
            whereObj.lab_code = lab_code;
        }
        whereObj.email = hashedEmail;

        let findUser = await _models2.default.User.findOne({
            where: whereObj
        });

        let newUser = findUser;

        let hashedUserId = await _crypto2.default.hash_from_string(newUser.id);
        let accountName = `${first_name !== null ? first_name : ""} ${last_name !== null ? last_name : ""}`;

        let findAccount = await _models2.default.Account.findOne({
            where: {
                id: id
            },
            include: [{
                model: _models2.default.Member,
                as: "accountMembers",
                where: {
                    is_primary_member: true
                }
            }, {
                model: _models2.default.AccountLocation,
                as: 'accountLocations'
            }]
        });

        if (findAccount.hashed_user_id !== hashedUserId) {
            return res.json({
                status: 'failed',
                payload: null,
                message: 'user email already exist'
            });
        }

        await _models2.default.Account.update({
            name: accountName,
            status: status !== undefined ? status : 'ACTIVE'
        }, {
            where: {
                id: id
            }
        });

        newUser = await _models2.default.User.update({
            internal_user: true,
            lab_code: lab_code,
            email: hashedEmail,
            country_code: null,
            phone_number: null,
            status: status !== undefined ? status : 'ACTIVE'
        }, {
            where: {
                id: newUser.id
            }
        });

        let fetchMemberId = findAccount.accountMembers[0].id;
        await _models2.default.Member.update({
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_number: phone_number,
            country_code: country_code,
            status: status !== undefined ? status : 'ACTIVE'
        }, {
            where: {
                id: fetchMemberId
            }
        });

        if (role_code === "LBT" || role_code === "LOM") {
            let accountLocation = _underscore2.default.pluck(findAccount.accountLocations, "id");
            let difference = accountLocation.filter(x => lab_location_code.every(x2 => x2 !== x));
            let newAccountLocation = lab_location_code.filter(x => !accountLocation.includes(x));
            if (difference.length > 0) {
                for (let dif_location_id of difference) {
                    await _models2.default.AccountLocation.destroy({
                        where: {
                            id: dif_location_id
                        }
                    });
                }
            }
            if (newAccountLocation.length > 0) {
                for (let location_id of newAccountLocation) {
                    await _models2.default.AccountLocation.create({
                        lab_id: findLab !== null ? findLab.id : null,
                        lab_location_id: location_id,
                        account_id: findAccount.id,
                        is_default: false,
                        status: "ACTIVE"
                    });
                }
            }
        }

        let fetchAccounts = await _models2.default.Account.findOne({
            where: {
                id: id
            },
            include: [{
                model: _models2.default.Member,
                as: "accountMembers",
                where: {
                    is_primary_member: true
                }
            }, {
                model: _models2.default.AccountRole,
                as: "accountRoles",
                where: {
                    is_default: true
                },
                include: [{
                    model: _models2.default.Role,
                    as: "role"
                }]
            }, {
                model: _models2.default.AccountLocation,
                as: 'accountLocations'
            }]
        });

        res.status(200).json({
            status: 'success',
            payload: fetchAccounts,
            message: 'Internal user created successfully'
        });
    } catch (error) {
        console.log("Error at updating internal users method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while updating internal users'
        });
    }
};

exports.sendQRCode = async (req, res, next) => {
    try {
        let { qr_code_image, name, email } = req.body;

        let data = {};
        data.qrCodeImage = qr_code_image;
        let message_data = {};
        message_data.member_token = null;
        message_data.name = name.charAt(0).toUpperCase() + name.slice(1);
        message_data.phone_number = null;
        message_data.country_code = null;
        message_data.email = email;
        message_data.type = "EMAIL";
        message_data.description = "QR Code send to " + email;
        message_data.message_purpose = "QR_CODE";
        message_data.email_content = data;
        _MessageUtils2.default.sendMessage(message_data);
        res.status(200).json({
            status: 'success',
            payload: null,
            message: 'Qr code send successfully'
        });
    } catch (error) {
        res.status(200).json({
            status: "failed",
            payload: null,
            message: "Unable to download"
        });
    }
};