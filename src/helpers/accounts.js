import db from "../models";
import cryptoModule from "crypto";
import crypto from "../helpers/crypto";
const bcrypt = require('bcryptjs');
import _, { zip } from "underscore";
import { uploadDocument, uploadBase64Image, deleteDocument } from "../helpers/attachments"
import { S3_INSURANCE_BUCKET_NAME, S3_USER_BUCKET_NAME } from "./constants";
import moment from "moment";
const OTP_LENGTH = 6;
const QR_LENGTH = 7;
module.exports = {
    /**
    * Create verification code and return the code
    */
    createVerificationCode: async () => {
        let code = "";
        while (true) {
            code = cryptoModule
                .randomBytes(Math.ceil(OTP_LENGTH / 2))
                .toString("hex");
            code = parseInt(code, 16)
                .toString()
                .slice(0, OTP_LENGTH);
            let isExist = await db.User.findOne({
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
                let result = cryptoModule.randomBytes(Math.ceil(QR_LENGTH / 2))
                    .toString('hex') // convert to hexadecimal format
                    .slice(0, QR_LENGTH).toUpperCase();
                // console.log("result========>"+result)
                resolve(result)
            } catch (error) {
                console.log("error========>" + error)
                resolve(error);
            }
        })
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
                    let findMember = await db.Member.findOne({
                        where: {
                            qr_code: code
                        }
                    });
                    // console.log("findMember========>"+JSON.stringify(findMember))
                    if (findMember === null) {
                        break;
                    }
                }
                resolve(code)
            } catch (error) {
                console.log("error========>" + error)
                reject(error);
            }
        })
    },

    authenticate: async (user, password) => {
        return new Promise(function (resolve, reject) {

            if (typeof password !== 'string') {
                resolve(null)
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

    findMemberAccount: async (req) => {
        return new Promise(async (resolve, reject)=> {
             try {
                let {
                    race, ethnicity,driver_license_number, passport_number, ssn, address_line1, address_line2, city, state, country, zipcode,
                    policy_number, insurance_provider, policy_group_number, provider_phone_number, insurance_front_file, insurance_back_file,
                    street_address_line1, street_address_line2, provider_city, provider_state, provider_zipcode, provider_country, id_image_file, signature_image, member_ref
                } = req.body;
                let resultObj = {};
                let signature_image_name = null;
                let id_image_name = null;
                let insurance_front_name = null;
                let insurance_back_name = null;
               
                let findMember = await db.Member.findOne({
                    where: {
                        id: member_ref
                    }
                });
                if (findMember === null) {
                    resultObj.status = "failed";
                    resultObj.message = "Invalid Member";
                    resultObj.payload = null;
                    return resolve(resultObj)
                }
                
                if(findMember.signature_image !== null){
                    await deleteDocument(findMember.signature_image, S3_USER_BUCKET_NAME);
                }

                if (signature_image !== undefined && signature_image !== null && signature_image !== "") {
                    signature_image_name = await uploadBase64Image(signature_image, S3_USER_BUCKET_NAME);
                }

                if(findMember.id_card_image !== null){
                    await deleteDocument(findMember.id_card_image, S3_USER_BUCKET_NAME);
                }

                if (req.files.id_image_file !== undefined && req.files.id_image_file !== null && req.files.id_image_file !== "" && req.files.id_image_file.length > 0) {
                    id_image_name = await uploadDocument(req.files.id_image_file[0], S3_USER_BUCKET_NAME);
                }

                await db.Member.update({
                    race: (race !== undefined && race !== 'undefined' && race !== "null" && race !== null) ? race : findMember.race,
                    ethnicity: (ethnicity !== undefined && ethnicity !== 'undefined' && ethnicity !== "null" && ethnicity !== null) ? ethnicity : findMember.ethnicity,
                    driver_license_number: (driver_license_number !== undefined && driver_license_number !== 'undefined' && driver_license_number !== "null" && driver_license_number !== null) ? driver_license_number : findMember.driver_license_number,
                    passport_number: (passport_number !== undefined && passport_number !== 'undefined' && passport_number !== "null" && passport_number !== null) ? passport_number : findMember.passport_number,
                    ssn: (ssn !== undefined && ssn !== 'undefined' && ssn !== "null" && ssn !== null) ? ssn : findMember.ssn,
                    address_line1: (address_line1 !== undefined && address_line1 !== 'undefined' && address_line1 !== "null" && address_line1 !== null) ? address_line1 : findMember.address_line1,
                    address_line2: (address_line2 !== undefined && address_line2 !== 'undefined' && address_line2 !== "null" && address_line2 !== null) ? address_line2 : findMember.address_line2,
                    city: (city !== undefined && city !== 'undefined' && city !== "null" && city !== null) ? city : findMember.city,
                    state: (state !== undefined && state !== 'undefined' && state !== "null" && state !== null) ? state : findMember.state,
                    country: (country !== undefined && country !== 'undefined' && country !== "null" && country !== null) ? country : findMember.country,
                    zipcode: (zipcode !== undefined && zipcode !== 'undefined' && zipcode !== "null" && zipcode !== null) ? zipcode : findMember.zipcode,
                    id_card_image: id_image_name !== null ? id_image_name : findMember.id_card_image,
                    signature_image: signature_image_name
                }, {
                    where: {
                        id: findMember.id
                    },
                    returning: true
                });
                
                if((!!insurance_provider && insurance_provider !== 'null' && insurance_provider !== 'undefined') && (!!policy_number && policy_number !== 'null' && policy_number !== 'undefined')){
                    let findMemberInsurance = await db.MemberInsurance.findOne({
                        where: {
                            member_id: findMember.id,
                            insurance_provider: insurance_provider,
                            policy_number: policy_number
                        }
                    });

                    if (req.files.insurance_front_file !== undefined && req.files.insurance_front_file !== null && req.files.insurance_front_file !== "" && req.files.insurance_front_file.length > 0) {
                        insurance_front_name = await uploadDocument(req.files.insurance_front_file[0], S3_INSURANCE_BUCKET_NAME);
                    }

                    if (req.files.insurance_back_file !== undefined && req.files.insurance_back_file !== null && req.files.insurance_back_file !== "" && req.files.insurance_back_file.length > 0) {
                        insurance_back_name = await uploadDocument(req.files.insurance_back_file[0], S3_INSURANCE_BUCKET_NAME);
                    }
                    if (findMemberInsurance === null) {
                        await db.MemberInsurance.create({
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
                memberObj.email = findMember.email;

                resultObj.status = "success";
                resultObj.message = "member created successfully";
                resultObj.payload = memberObj;
                resolve(resultObj);
            } catch (error) {
                console.log("error===========>"+error)
                resolve(null);
            }

        });
    },

    createorFindUserAccount: async (req) => {
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

                let findRole = await db.Role.findOne({
                    where: {
                        code: "CSR"
                    }
                });

                if (findRole === null) {
                    resultObj.status = "failed";
                    resultObj.message = "Invalid Role";
                    resultObj.payload = null;
                    return resolve(resultObj)
                }

                let findLab = await db.Lab.findOne({
                    where: {
                        code: lab_code
                    }
                });

                if (findLab === null) {
                    resultObj.status = "failed";
                    resultObj.message = "Invalid Lab";
                    resultObj.payload = null;
                    return resolve(resultObj)
                }

                if(verified_by === null || verified_by === undefined){
                    resultObj.status = "failed";
                    resultObj.message = "Invalid Member";
                    resultObj.payload = null;
                    return resolve(resultObj)
                }

                // console.log(`Phone Number --> ${country_code}${phone_number}`)

                let hashedCountryCode = country_code !== null ? await crypto.hash_from_string(country_code) : null;
                let hashedPhoneNumber = phone_number !== null ? await crypto.hash_from_string(phone_number.trim()) : null;
                let hashedEmail = email !== null ? await crypto.hash_from_string(email.trim()) : null;

                let whereObj = {};
                whereObj.lab_code = lab_code;

                if(verified_by === "PHONE"){
                    whereObj.country_code = hashedCountryCode;
                    whereObj.phone_number = hashedPhoneNumber;
                }

                if(verified_by === "EMAIL"){
                    whereObj.email = hashedEmail;
                }

                // console.log("whereObj=====>" + JSON.stringify(whereObj))
                let findUser = await db.User.findOne({
                    where: whereObj
                });

                // console.log("findUser=====>" + JSON.stringify(findUser))

                let newUser = findUser;

                if (newUser === null) {
                    newUser = await db.User.create({
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
                    return resolve(resultObj)
                }

                // console.log("newUser=====>" + JSON.stringify(newUser))
                let hashedUserId = await crypto.hash_from_string(newUser.id);
                // console.log("hashedUserId=====>" + hashedUserId)
                let accountName = `${first_name !== null ? first_name : ""} ${last_name !== null ? last_name : ""}`;
                // console.log("accountName=====>" + accountName)
                let findAccount = await db.Account.findOne({
                    where: {
                        hashed_user_id: hashedUserId
                    }
                });

                let newAccount = findAccount;
                // console.log("findAccount=====>" + JSON.stringify(findAccount))
                if (newAccount === null) {
                    newAccount = await db.Account.create({
                        lab_ref: findLab !== null ? findLab.id : null,
                        hashed_user_id: hashedUserId,
                        name: accountName,
                        internal_account: false,
                        status: "ACTIVE"
                    });

                    await db.AccountRole.create({
                        role_id: findRole.id,
                        account_id: newAccount.id,
                        is_default: true,
                        status: "ACTIVE"
                    });
                }

                // console.log("newAccount=====>" + JSON.stringify(newAccount))
                let newQrCode = await module.exports.createQrCode();
                // console.log("newQrCode=====>" + newQrCode)

                let filterMember = await db.Member.findAll({
                    where: {
                        account_id: newAccount.id
                    }
                });
                // console.log("filterMember=====>" + JSON.stringify(filterMember))
                // console.log(`Birthdate --> ${birth_date}`)
                // let findMember = filterMember.find(x => x.first_name.toLowerCase() === first_name.toLowerCase() && x.last_name.toLowerCase() === last_name.toLowerCase() && moment(x.birth_date, "YYYY-MM-DD").format("MM/DD/YYYY") === moment(birth_date, "MM/DD/YYYY").format("MM/DD/YYYY"));
                let findMember = filterMember.find(x => x.birth_date !== null && moment(x.birth_date, "YYYY-MM-DD").format("YYYY-MM-DD") === moment(birth_date, "YYYY-MM-DD").format("YYYY-MM-DD"));
                // console.log("findMember=====>" + JSON.stringify(findMember))
                let newMember = findMember !== undefined ? findMember : null;

                if (signature_image !== undefined && signature_image !== null && signature_image !== "") {
                    signature_image_name = await uploadBase64Image(signature_image, S3_USER_BUCKET_NAME);
                }

                if (req.files.id_image_file !== undefined && req.files.id_image_file !== null && req.files.id_image_file !== "" && req.files.id_image_file.length > 0) {
                    id_image_name = await uploadDocument(req.files.id_image_file[0], S3_USER_BUCKET_NAME);
                }

                if (newMember === null) {
                    newMember = await db.Member.create({
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
                }else{
                    await db.Member.update({
                        account_id: newAccount.id,
                        first_name: first_name.toLowerCase(),
                        last_name: last_name.toLowerCase(),
                        gender: !!gender ? gender : newMember.gender,
                        country_code: !!country_code ? country_code : newMember.country_code,
                        phone_number: !!phone_number ? phone_number : newMember.phone_number,
                        is_primary_member: (filterMember.length === 0 || filterMember.length === 1) ? true : newMember.is_primary_member,
                        email: !!email ? email : newMember.email,
                        birth_date: !!birth_date ? birth_date : newMember.birth_date,
                        race: !!race ? race : newMember.race,
                        ethnicity: !!ethnicity ? ethnicity : newMember.ethnicity,
                        driver_license_number: !!driver_license_number ? driver_license_number : newMember.driver_license_number,
                        passport_number: !!passport_number ? passport_number : newMember.passport_number,
                        ssn: !!ssn ? ssn : newMember.ssn,
                        address_line1: !!address_line1 ? address_line1 : newMember.address_line1,
                        address_line2: !!address_line2 ? address_line2 : newMember.address_line2,
                        city: !!city ? city : newMember.city,
                        state: !!state ? state : newMember.state,
                        country: !!country ? country : newMember.country,
                        zipcode: !!zipcode ? zipcode : newMember.zipcode,
                        qr_code: newQrCode,
                        signature_image: signature_image_name,
                        id_card_image: id_image_name,
                        status: "ACTIVE"
                    }, {
                        where: {
                            id: newMember.id
                        }
                    });
                }


                // console.log("newMember=====>" + JSON.stringify(newMember))
                // console.log("<=====ins=====>")
                if((!!insurance_provider && insurance_provider !== 'null' && insurance_provider !== 'undefined') && (!!policy_number && policy_number !== 'null' && policy_number !== 'undefined')){
                    let findMemberInsurance = await db.MemberInsurance.findOne({
                        where: {
                            member_id: newMember.id,
                            insurance_provider: insurance_provider,
                            policy_number: policy_number
                        }
                    });
                    // console.log("findMemberInsurance=====>" + JSON.stringify(findMemberInsurance))
                    if (req.files.insurance_front_file !== undefined && req.files.insurance_front_file !== null && req.files.insurance_front_file !== "" && req.files.insurance_front_file.length > 0) {
                        insurance_front_name = await uploadDocument(req.files.insurance_front_file[0], S3_INSURANCE_BUCKET_NAME);
                    }

                    if (req.files.insurance_back_file !== undefined && req.files.insurance_back_file !== null && req.files.insurance_back_file !== "" && req.files.insurance_back_file.length > 0) {
                        insurance_back_name = await uploadDocument(req.files.insurance_back_file[0], S3_INSURANCE_BUCKET_NAME);
                    }
                    if (findMemberInsurance === null) {
                        await db.MemberInsurance.create({
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
                    }else{
                        await db.MemberInsurance.update({
                            member_id: newMember.id,
                            insurance_provider: !!insurance_provider ? insurance_provider : findMemberInsurance.insurance_provider,
                            policy_number: !!policy_number ? policy_number : findMemberInsurance.policy_number,
                            policy_group_number: !!policy_group_number ? policy_group_number : findMemberInsurance.policy_group_number,
                            provider_phone_number: !!provider_phone_number ? provider_phone_number : findMemberInsurance.provider_phone_number,
                            front_insurance_card_image: !!insurance_front_name ? insurance_front_name : findMemberInsurance.insurance_front_name,
                            back_insurance_card_image: !!insurance_back_name ? insurance_back_name : findMemberInsurance.insurance_back_name,
                            street_address_line1: !!street_address_line1 ? street_address_line1 : findMemberInsurance.street_address_line1,
                            street_address_line2: !!street_address_line2 ? street_address_line2 : findMemberInsurance.street_address_line2,
                            city: !!provider_city ? provider_city : findMemberInsurance.provider_city,
                            state: !!provider_state ? provider_state : findMemberInsurance.provider_state,
                            country: !!provider_country ? provider_country : findMemberInsurance.provider_country,
                            zipcode: !!provider_zipcode ? provider_zipcode : findMemberInsurance.provider_zipcode,
                            expiry_date: null,
                            status: "ACTIVE"
                        }, {
                            where: {
                                id: findMemberInsurance.id
                            }
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

                resolve(resultObj)
            } catch (error) {
                console.log("error at create user account========>" + error)
                reject(error);
            }
        })
    },

    fetchPermission: async (account) => {
        return new Promise(function (resolve, reject) {
            try {
                let permissionObj = {};
                if (account.accountRoles.length > 0) {
                    let pluckRole = _.pluck(account.accountRoles, 'role');
                    for (let role of pluckRole) {
                        permissionObj = { ...permissionObj, ...role.permission }
                    }
                }
                if (account.customPermissions.length > 0) {
                    let pluckCustomPermission = _.pluck(account.customPermissions, 'permission');
                    for (let custom of pluckCustomPermission) {
                        permissionObj = { ...permissionObj, ...custom }
                    }
                }
                resolve(permissionObj);
            } catch (error) {
                console.log(`error at fetch Permission===>${error}`)
                resolve({});
            }

        });
    },
    findSessionAccount: async (userData) => {
        return new Promise(async (resolve, reject)=> {
            try {
                let { userId, account_token } = userData;

                let findUser = await db.User.findOne({
                    where: {
                        id: userId
                    }
                });

                if (findUser === null) {
                    resolve(null);
                }

                let hashed_user_id = await crypto.hash_from_string(findUser.id);

                let findAccount = await db.Account.findOne({
                    where: {
                        account_token: account_token,
                        hashed_user_id: hashed_user_id
                    },
                    include: [
                        {
                            model: db.AccountRole,
                            as: 'accountRoles',
                            include: [
                                {
                                    model: db.Role,
                                    as: "role"
                                }
                            ]
                        },
                        {
                            model: db.Lab,
                            as: 'accountLab'
                        }
                    ]
                });

                if (findAccount === null) {
                    resolve(null);
                }

                resolve(findAccount);
            } catch (error) {
                console.log(`error at fetch Permission===>${error}`)
                resolve(null);
            }

        });
    },

    fetchIfUserExist: (body)=> {
        return new Promise(async (resolve, reject)=> {
            try {
                let {
                    lab_code, country_code, phone_number, email, verified_by
                } = body;
                
                let hashedCountryCode = country_code !== null ? await crypto.hash_from_string(country_code) : null;
                let hashedPhoneNumber = phone_number !== null ? await crypto.hash_from_string(phone_number) : null;
                // let hashedEmail = email !== null ? await crypto.hash_from_string(email) : null;

                let whereObj = {};
                whereObj.lab_code = lab_code;
                // whereObj.lab_code = 'BLML';

                if(hashedCountryCode !== null && hashedPhoneNumber !== null){
                    whereObj.country_code = hashedCountryCode;
                    whereObj.phone_number = hashedPhoneNumber;
                }

                // Email Checking not needed for Consumer account
                // if(hashedEmail !== null){
                //     whereObj.email = hashedEmail;
                // }

                let fetchUser = await db.User.findOne({
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
                console.log(`Error while creating new user account => ${error}`)
                resolve(null);
            }
        });
    }
}