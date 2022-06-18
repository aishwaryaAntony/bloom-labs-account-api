import db from "../models";
import { NODE_ENV, JWT_PRIVATE_KEY, CLIENT_DOMAIN } from "../helpers/constants";
import crypto from "../helpers/crypto";
import { createVerificationCode, authenticate, fetchPermission, createorFindUserAccount, findMemberAccount } from "../helpers/accounts";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { PassThrough } from "stream";
import MessageUtils from "../helpers/MessageUtils";
import _ from "underscore";
const Sequelize = require("sequelize")
const { Op } = require("sequelize");
import moment from "moment";

exports.login = async (req, res, next) => {
    try {
        // console.log(`Hit Login released`)
        let { lab_code, country_code, phone_number, email, preferred_login, date_of_birth } = req.body;

        let whereObj = {};
        whereObj.lab_code = lab_code;
        whereObj.internal_user = false;

        if (preferred_login === "MOB") {
            whereObj.country_code = await crypto.hash_from_string(country_code);
            whereObj.phone_number = await crypto.hash_from_string(phone_number);
        }

        if (preferred_login === "EML") {
            whereObj.email = await crypto.hash_from_string(email);
        }

        let fetchUser = await db.User.findOne({
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

        if(fetchUser.status === 'INACTIVE'){
            return res.json({
                status: 'failed',
                payload: null,
                message: "Your account has been disabled. Please contact admin for further details"
            });
        }

        if(date_of_birth !== undefined && date_of_birth !== null){
            // console.log(`Date of birth added -> ${date_of_birth}`)
            let hashed_user_id = await crypto.hash_from_string(fetchUser.id);
            //find account
            let fetchAccount = await db.Account.findOne({
                where: {
                    hashed_user_id: hashed_user_id
                }
            });

            if(fetchAccount === null){
                // console.log(`Account --error`)
                return res.json({
                    status: 'failed',
                    payload: null,
                    message: "user doesn't exist"
                });
            }

            console.log(`Account --> ${JSON.stringify(fetchAccount)}`);
            let birth_date = moment(date_of_birth, 'YYYY-MM-DD').format('YYYY-MM-DD')
            console.log(`Birth --> ${birth_date}`);
            let fetchMember = await db.Member.findOne({
                where: {
                    account_id: fetchAccount.id,
                    birth_date: birth_date
                }
            });

            console.log(`fetchMember --> ${JSON.stringify(fetchMember)}`);

            if(fetchMember === null){
                // console.log(`Member --error`)
                return res.json({
                    status: 'failed',
                    payload: null,
                    message: "Invalid phone number or birthdate"
                });
            }
        }

        let verificationCode = NODE_ENV === "development" ? "000000" : await createVerificationCode();
        let data = {};
        data.verification_code = verificationCode;

        await db.User.update({
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
            MessageUtils.sendMessage(message_data);
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
            MessageUtils.sendMessage(message_data);
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
            whereObj.country_code = await crypto.hash_from_string(country_code);
            whereObj.phone_number = await crypto.hash_from_string(phone_number);
        }

        if (preferred_login === "EML") {
            whereObj.email = await crypto.hash_from_string(email);
        }

        whereObj.verification_code = verification_code;

        let fetchUser = await db.User.findOne({
            where: whereObj
        });

        if (fetchUser === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "user doesn't exist"
            });
        }

        await db.User.update({
            verification_code: null
        }, {
            where: {
                id: fetchUser.id
            }
        });

        let hashed_user_id = await crypto.hash_from_string(fetchUser.id);

        let findAccount = await db.Account.findOne({
            where: {
                hashed_user_id: hashed_user_id
            },
            attributes: ['account_token'],
            include: [
                {
                    attributes: ['is_default'],
                    model: db.AccountRole,
                    as: 'accountRoles',
                    include: [
                        {
                            attributes: ['permission'],
                            model: db.Role,
                            as: 'role',
                        }
                    ]
                },
                {
                    attributes: ['permission'],
                    model: db.CustomPermission,
                    as: 'customPermissions'
                }
            ]
        });

        if (findAccount === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "Invalid user account"
            });
        }

        let permissionSet = await fetchPermission(findAccount);

        let userObj = {};
        userObj.userId = fetchUser.id;
        userObj.account_token = findAccount.account_token;

        let token = jwt.sign(userObj, JWT_PRIVATE_KEY);

        res.status(200).json({
            status: "success",
            token: token,
            payload: permissionSet,
            message: "login successfully",
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

        whereObj.email = await crypto.hash_from_string(email);
        whereObj.internal_user = true;

        console.log(`Body --> ${JSON.stringify(req.body)}`);

        console.log(`WhereObj --> ${JSON.stringify(whereObj)}`);

        let fetchUser = await db.User.findOne({
            where: {
                ...whereObj,
                [Op.or]: [
                    {
                        lab_code: lab_code
                    },
                    {
                        lab_code: null
                    }
                ]
            }
        });

        if (fetchUser === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "user doesn't exist"
            });
        }

        if(fetchUser.status === 'INACTIVE'){
            return res.json({
                status: 'failed',
                payload: null,
                message: "Your account has been disabled. Please contact admin for further details"
            });
        }

        let authenticate_user = await authenticate(fetchUser, password);

        if (authenticate_user === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "invalid password"
            });
        }

        let verificationCode = NODE_ENV === "development" ? "000000" : await createVerificationCode();
        let data = {};
        data.verification_code = verificationCode;

        await db.User.update({
            verification_code: verificationCode
        }, {
            where: {
                id: fetchUser.id
            }
        });

        let hashedUserId = await crypto.hash_from_string(fetchUser.id);

        let findAccount = await db.Account.findOne({
            where: {
                hashed_user_id: hashedUserId
            },
            include: [
                {
                    model: db.Member,
                    as: "accountMembers",
                    where: {
                        is_primary_member: true
                    }
                }
            ]
        });

        let name = (findAccount !== null && findAccount.accountMembers.length > 0) ? findAccount.accountMembers[0].first_name : "User";
        let country_code = (findAccount !== null && findAccount.accountMembers.length > 0) ? findAccount.accountMembers[0].country_code : null;
        let phone_number = (findAccount !== null && findAccount.accountMembers.length > 0) ? findAccount.accountMembers[0].phone_number : null;

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
            MessageUtils.sendMessage(sms_message_data);
        }

        res.status(200).json({
            status: "success",
            message: "Verification code send successfully",
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
        whereObj.email = await crypto.hash_from_string(email);
        whereObj.internal_user = true;
        whereObj.verification_code = verification_code;

        let fetchUser = await db.User.findOne({
            where: {
                ...whereObj,
                [Op.or]: [
                    {
                        lab_code: lab_code
                    },
                    {
                        lab_code: null
                    }
                ]
            }
        });

        if (fetchUser === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "user doesn't exist"
            });
        }

        await db.User.update({
            verification_code: null
        }, {
            where: {
                id: fetchUser.id
            }
        });

        let hashed_user_id = await crypto.hash_from_string(fetchUser.id);

        let findAccount = await db.Account.findOne({
            where: {
                hashed_user_id: hashed_user_id
            },
            attributes: ['account_token'],
            include: [
                {
                    attributes: ['is_default'],
                    model: db.AccountRole,
                    as: 'accountRoles',
                    include: [
                        {
                            attributes: ['permission'],
                            model: db.Role,
                            as: 'role',
                        }
                    ]
                },
                {
                    attributes: ['permission'],
                    model: db.CustomPermission,
                    as: 'customPermissions'
                }
            ]
        });

        if (findAccount === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: "Invalid user account"
            });
        }
        let permissionSet = await fetchPermission(findAccount);
        let userObj = {};
        userObj.userId = fetchUser.id;
        userObj.account_token = findAccount.account_token;

        let token = jwt.sign(userObj, JWT_PRIVATE_KEY);

        res.status(200).json({
            status: "success",
            token: token,
            payload: permissionSet,
            message: "login successfully",
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

        let fetchUser = await db.User.findOne({
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

        await db.User.update({
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
        let findUser = await db.User.findOne({
            where: {
                id: req.userData.userId
            }
        });
        if (findUser === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Unauthorized User",
            });
        }
        
        if(findUser.status === 'INACTIVE'){
            return res.json({
                status: 'failed',
                payload: null,
                message: "Your account has been disabled. Please contact admin for further details"
            });
        }

        let hashed_user_id = await crypto.hash_from_string(findUser.id);

        let findAccount = await db.Account.findOne({
            where: {
                account_token: req.userData.account_token,
                hashed_user_id: hashed_user_id
            },
            attributes: ['account_token'],
            include: [
                {
                    attributes: ['is_default'],
                    model: db.AccountRole,
                    as: 'accountRoles',
                    include: [
                        {
                            attributes: ['permission'],
                            model: db.Role,
                            as: 'role',
                        }
                    ]
                },
                {
                    attributes: ['permission'],
                    model: db.CustomPermission,
                    as: 'customPermissions'
                }
            ]
        });

        if (findAccount === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Unauthorized",
            });
        }

        let defaultRole = findAccount.accountRoles.length > 0 ? findAccount.accountRoles[0].role.code : null;

        let permissionSet = await fetchPermission(findAccount);

        let userObj = {};
        userObj.userId = findUser.id;
        userObj.account_token = findAccount.account_token;

        let token = jwt.sign(userObj, JWT_PRIVATE_KEY);
        res.status(200).json({
            status: "success",
            token: token,
            payload: permissionSet,
            defaultRole: defaultRole,
            message: "login successfully",
        });


    } catch (error) {
        res.status(500).json({
            status: "failed",
            payload: null,
            message: "Unauthorized",
        });
    }
}

exports.validate_token = async (req, res, next) => {
    try {
        // console.log("req.userData=============>"+JSON.stringify(req.userData))
        let findUser = await db.User.findOne({
            where: {
                id: req.userData.userId
            }
        });
        // console.log("findUser=============>"+JSON.stringify(findUser))
        if (findUser === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid User",
            });
        }

        let hashed_user_id = await crypto.hash_from_string(findUser.id);
        // console.log("hashed_user_id=============>" + hashed_user_id)
        let findAccount = await db.Account.findOne({
            where: {
                account_token: req.userData.account_token,
                hashed_user_id: hashed_user_id
            },
            include: [
                {
                    attributes: ['role_id', 'is_default'],
                    model: db.AccountRole,
                    as: 'accountRoles',
                    include: [
                        {
                            attributes: ['code', 'name'],
                            model: db.Role,
                            as: 'role',
                        }
                    ]
                }
            ]
        });
        // console.log("findAccount=============>" + JSON.stringify(findAccount))
        if (findAccount === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid Account",
            });
        }

        let defaultRole = findAccount.accountRoles.length > 0 ? findAccount.accountRoles[0].role.code : null;
        // console.log("defaultRole=============>" + defaultRole)
        let fetchMember = await db.Member.findAll({
            where: {
                account_id: findAccount.id,
                // is_primary_member: true
            },
            attributes: ['id', 'member_token', 'full_name', 'country_code', 'phone_number', 'email', 'gender', 'birth_date', 'race', 'ethnicity', 'driver_license_number', 'passport_number', 'ssn', 'address_line1', 'address_line2', 'city', 'state', 'zipcode', 'country', 'qr_code', 'created_date', 'status'],
            include: [
                {
                    attributes: ['account_token', 'name'],
                    model: db.Account,
                    as: 'memberAccount',
                    include: [
                        {
                            attributes: ['role_id', 'is_default'],
                            model: db.AccountRole,
                            as: 'accountRoles',
                            include: [
                                {
                                    attributes: ['code', 'name'],
                                    model: db.Role,
                                    as: 'role',
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        // console.log("findMember=============>" + JSON.stringify(findMember))
        if (fetchMember.length === 0) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid Member",
            });
        }

        let findMember = fetchMember.length> 0 ? fetchMember.find(x=> x.is_primary_member === true) : null;
        let member = null;
        if(!!findMember){
            member = findMember
        }
        member = fetchMember.length> 0 ? fetchMember[0] : null;

        res.status(200).json({
            status: 'success',
            payload: member,
            defaultRole: defaultRole,
            message: 'Validate user successfully'
        });

    } catch (error) {
        console.log("Error at validate user ==> " + error);
        res.status(500).json({
            status: "failed",
            payload: {},
            message: "Error while validate user",
        });
    }
}

exports.create_new_account = async (req, res, next) => {
    try {
        let { member_ref, verified_by } = req.body;
        // console.log(verified_by + "<==========create_new_account======>" + member_ref)
        let accountMember = null;
        if (member_ref !== "null" && member_ref !== null && member_ref !== "undefined" && member_ref !== undefined) {
            accountMember = await findMemberAccount(req)
        } else {
            accountMember = await createorFindUserAccount(req);
        }
        // console.log("accountMember======>" + JSON.stringify(accountMember))
        if (accountMember === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: 'invalid member',
            });
        }

        if (accountMember.status === "failed") {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: accountMember.message,
            });
        }

        res.status(200).json({
            status: "success",
            payload: accountMember.payload,
            message: "account created successfully",
        });

    } catch (error) {
        console.log("error==========>" + error)
        res.status(500).json({
            status: "failed",
            payload: null,
            message: error,
        });
    }
}

exports.forgotPassword = async (req, res, next) => {
    try {
        let { email } = req.body;

        let hashed_email = await crypto.hash_from_string(email);

        let findUser = await db.User.findOne({
            where: {
                email: hashed_email,
                internal_user: true
            }
        });

        if (findUser === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "User doesn't exist",
            });
        }

        let hashed_user_id = await crypto.hash_from_string(findUser.id);

        let findAccount = await db.Account.findOne({
            where: {
                hashed_user_id: hashed_user_id,
            }
        });

        if (findAccount === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid Account",
            });
        }

        let fetchMember = await db.Member.findOne({
            where: {
                account_id: findAccount.id,
                is_primary_member: true
            }
        });

        if (fetchMember === null) {
            return res.status(200).json({
                status: "failed",
                payload: null,
                message: "Invalid Account",
            });
        }

        let token = Buffer.from(hashed_email).toString('base64');

        let data = {};
        data.link = `${CLIENT_DOMAIN}reset-password?token=${token}`;
        // console.log("data======>" + JSON.stringify(data))

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
        MessageUtils.sendMessage(message_data);

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
            message: "Unable to send mail",
        });
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        let { token, password } = req.body;

        let email = Buffer.from(token, 'base64').toString();

        // let hashed_email = await crypto.hash_from_string(email);

        let findUser = await db.User.findOne({
            where: {
                email: email,
                internal_user: true
            }
        });

        if (findUser === null) {
            return res.json({
                status: "failed",
                payload: null,
                message: "User doesn't exist",
            });
        }

        await db.User.update({
            password: password,
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
            message: "Unable to updated user password",
        });
    }
}

exports.createQRCode = async (req, res, next) => {
    try {
        let { qrCode } = req.params;

        const qrStream = new PassThrough();

        await QRCode.toFileStream(qrStream, qrCode);

        qrStream.pipe(res);
    } catch (error) {
        res.status(200).json({
            status: "failed",
            payload: null,
            message: "Unable to download",
        });
    }
}

exports.fetchAllInternalUsers = async (req, res, next) => {
    try {

        let limit = 50;

        let offset = req.query.offset ? parseInt(req.query.offset) : 0;

        let fetchAccounts = await db.Account.findAll({
            where: {
                internal_account: true
            },
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']],
            include: [
                {
                    model: db.Member,
                    as: "accountMembers",
                    where: {
                        is_primary_member: true
                    }
                },
                {
                    model: db.AccountRole,
                    as: "accountRoles",
                    where: {
                        is_default: true
                    },
                    include: [
                        {
                            model: db.Role,
                            as: "role"
                        }
                    ]
                },
                {
                    model: db.AccountLocation,
                    as: 'accountLocations'
                }
            ]
        })

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

        let findRole = await db.Role.findOne({
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
            findLab = await db.Lab.findOne({
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


        let hashedEmail = email !== null ? await crypto.hash_from_string(email) : null;
      
        let whereObj = {};
        //creating duplicate users if different role selected
        // if (role_code === "LBT" || role_code === "LOM") {
        //     whereObj.lab_code = lab_code;
        // }
        whereObj.email = hashedEmail;
        whereObj.internal_user = true;


        let findUser = await db.User.findOne({
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
            newUser = await db.User.create({
                country_code: null,
                phone_number: null,
                internal_user: true,
                lab_code: lab_code,
                email: hashedEmail,
                password: null,
                status: "ACTIVE"
            });
        }

        let hashedUserId = await crypto.hash_from_string(newUser.id);
        let accountName = `${first_name !== null ? first_name : ""} ${last_name !== null ? last_name : ""}`;

        let findAccount = await db.Account.findOne({
            where: {
                hashed_user_id: hashedUserId
            }
        });

        let newAccount = findAccount;
        if (newAccount === null) {
            newAccount = await db.Account.create({
                lab_ref: findLab !== null ? findLab.id : null,
                hashed_user_id: hashedUserId,
                name: accountName,
                internal_account: true,
                status: "ACTIVE"
            });

            await db.AccountRole.create({
                role_id: findRole.id,
                account_id: newAccount.id,
                is_default: true,
                status: "ACTIVE"
            });
            if (role_code === "LBT" || role_code === "LOM") {
                for(let location of lab_location_code){
                    let findLocation = await db.LabLocation.findOne({
                        where: {
                            id: location
                        }
                    });
                    if (findLocation !== null) {
                        await db.AccountLocation.create({
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

        let fetchMember = await db.Member.findOne({
            where: {
                account_id: newAccount.id
            }
        });

        if (fetchMember === null) {
            fetchMember = await db.Member.create({
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

        let fetchAccounts = await db.Account.findOne({
            where: {
                id: newAccount.id
            },
            include: [
                {
                    model: db.Member,
                    as: "accountMembers",
                    where: {
                        is_primary_member: true
                    }
                },
                {
                    model: db.AccountRole,
                    as: "accountRoles",
                    where: {
                        is_default: true
                    },
                    include: [
                        {
                            model: db.Role,
                            as: "role"
                        }
                    ]
                }
            ]
        })


        let token = Buffer.from(hashedEmail).toString('base64');

        let data = {};
        data.link = `${CLIENT_DOMAIN}reset-password?token=${token}`;
        // console.log("data======>" + JSON.stringify(data))
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
        MessageUtils.sendMessage(message_data);

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

        let findRole = await db.Role.findOne({
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
            findLab = await db.Lab.findOne({
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


        let hashedEmail = email !== null ? await crypto.hash_from_string(email) : null;
      
        let whereObj = {};
        if (role_code === "LBT" || role_code === "LOM") {
            whereObj.lab_code = lab_code;
        }
        whereObj.email = hashedEmail;


        let findUser = await db.User.findOne({
            where: whereObj
        });

        let newUser = findUser;

        let hashedUserId = await crypto.hash_from_string(newUser.id);
        let accountName = `${first_name !== null ? first_name : ""} ${last_name !== null ? last_name : ""}`;

        let findAccount = await db.Account.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: db.Member,
                    as: "accountMembers",
                    where: {
                        is_primary_member: true
                    }
                },
                {
                    model: db.AccountLocation,
                    as: 'accountLocations'
                }
            ]
        });

        if (findAccount.hashed_user_id !== hashedUserId) {
            return res.json({
                status: 'failed',
                payload: null,
                message: 'user email already exist'
            });
        }

        await db.Account.update({
            name: accountName,
            status: status !== undefined ? status : 'ACTIVE'
        }, {
            where: {
                id: id
            }
        })

        newUser = await db.User.update({
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
        await db.Member.update({
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
            let accountLocation = _.pluck(findAccount.accountLocations, "id");
            let difference = accountLocation.filter(x => lab_location_code.every(x2 => x2 !== x));
            let newAccountLocation = lab_location_code.filter(x => !accountLocation.includes(x));
            if(difference.length > 0){
                for(let dif_location_id of difference){
                    await db.AccountLocation.destroy({
                        where: {
                            id: dif_location_id
                        }
                    });
                }
            }
            if(newAccountLocation.length > 0){
                for(let location_id of newAccountLocation){
                    await db.AccountLocation.create({
                        lab_id: findLab !== null ? findLab.id : null,
                        lab_location_id: location_id,
                        account_id: findAccount.id,
                        is_default: false,
                        status: "ACTIVE"
                    });
                }
            }
           
        }

        let fetchAccounts = await db.Account.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: db.Member,
                    as: "accountMembers",
                    where: {
                        is_primary_member: true
                    }
                },
                {
                    model: db.AccountRole,
                    as: "accountRoles",
                    where: {
                        is_default: true
                    },
                    include: [
                        {
                            model: db.Role,
                            as: "role"
                        }
                    ]
                },
                {
                    model: db.AccountLocation,
                    as: 'accountLocations'
                }
            ]
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
}

exports.sendQRCode = async (req, res, next) => {
    try {
        let { qr_code_image, name, email } = req.body;

        let data = {}
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
        MessageUtils.sendMessage(message_data);
        res.status(200).json({
            status: 'success',
            payload: null,
            message: 'Qr code send successfully'
        });
    } catch (error) {
        res.status(200).json({
            status: "failed",
            payload: null,
            message: "Unable to download",
        });
    }
}


exports.changeInternalUserRole = async (req, res, next) => {
    try {
        let { id } = req.params;
        let {
            lab_code, role_code, lab_location_code, email
        } = req.body;

        let findRole = await db.Role.findOne({
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
            findLab = await db.Lab.findOne({
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

        let findAccount = await db.Account.findOne({
            where: {
                id: id,
                internal_account: true
            },
            include: [
                {
                    model: db.AccountRole,
                    as: "accountRoles",
                    where: {
                        is_default: true
                    },
                    include: [
                        {
                            model: db.Role,
                            as: "role"
                        }
                    ]
                },
                {
                    model: db.AccountLocation,
                    as: 'accountLocations'
                }
            ]
        });

        if (findAccount === null) {
            return res.json({
                status: 'failed',
                payload: null,
                message: 'Invalid Account'
            });
        }

        let hashedEmail = email !== null ? await crypto.hash_from_string(email) : null;
        let existRoleCode = findAccount.accountRoles.length > 0 ? findAccount.accountRoles[0].role.code : null
        let whereObj = {};
        if (existRoleCode !== null && (existRoleCode === "LBT" || existRoleCode === "LOM") && (role_code === "LBT" || role_code === "LOM")) {
            whereObj.lab_code = lab_code;
        }

        whereObj.email = hashedEmail;
        whereObj.internal_user = true;

        let findUser = await db.User.findOne({
            where: whereObj
        });

        let newUser = findUser;

        let hashedUserId = await crypto.hash_from_string(newUser.id);

        if (findAccount.hashed_user_id !== hashedUserId) {
            return res.json({
                status: 'failed',
                payload: null,
                message: 'user email already exist'
            });
        }

        newUser = await db.User.update({
            internal_user: true,
            lab_code: lab_code,
        }, {
            where: {
                id: newUser.id
            }
        });

        await db.Account.update({
            lab_ref: findLab !== null ? findLab.id : null,
        },{
            where: {
                id: findAccount.id
            }
        })

        await db.AccountRole.update({
            role_id: findRole.id,
            is_default: true,
            status: "ACTIVE"
        }, {
            where: {
                account_id: findAccount.id
            }
        });

        if (role_code === "LBT" || role_code === "LOM") {
            let accountLocation = _.pluck(findAccount.accountLocations, "id");
            let difference = accountLocation.filter(x => lab_location_code.every(x2 => x2 !== x));
            let newAccountLocation = lab_location_code.filter(x => !accountLocation.includes(x));
            if (difference.length > 0) {
                for (let dif_location_id of difference) {
                    await db.AccountLocation.destroy({
                        where: {
                            id: dif_location_id
                        }
                    });
                }
            }
            if (newAccountLocation.length > 0) {
                for (let location_id of newAccountLocation) {
                    await db.AccountLocation.create({
                        lab_id: findLab !== null ? findLab.id : null,
                        lab_location_id: location_id,
                        account_id: findAccount.id,
                        is_default: false,
                        status: "ACTIVE"
                    });
                }
            }
        }

        let fetchAccounts = await db.Account.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: db.Member,
                    as: "accountMembers",
                    where: {
                        is_primary_member: true
                    }
                },
                {
                    model: db.AccountRole,
                    as: "accountRoles",
                    where: {
                        is_default: true
                    },
                    include: [
                        {
                            model: db.Role,
                            as: "role"
                        }
                    ]
                },
                {
                    model: db.AccountLocation,
                    as: 'accountLocations'
                }
            ]
        });

        res.status(200).json({
            status: 'success',
            payload: fetchAccounts,
            message: 'Internal user role changed successfully'
        });

    } catch (error) {
        console.log("Error at changing internal users role method- PUT / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while changing internal users role'
        });
    }
}
