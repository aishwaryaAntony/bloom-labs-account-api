"use strict";

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

var _accounts = require("../helpers/accounts");

var _crypto = require("../helpers/crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _attachments = require("../helpers/attachments");

var _constants = require("../helpers/constants");

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bcrypt = require('bcryptjs');

const Sequelize = require("sequelize");
const { Op } = require("sequelize");

exports.fetch_members = async (req, res, next) => {
	try {

		let { page } = req.query;
		let fetchMembers = [];
		if (page !== undefined && page !== null) {
			let limit = 10;
			const offset = (page - 1) * limit;
			fetchMembers = await _models2.default.Member.findAll({
				limit: limit,
				offset: offset,
				order: [['id', 'DESC']]
			});
		} else {
			fetchMembers = await _models2.default.Member.findAll({
				order: [['id', 'DESC']]
			});
		}

		res.status(200).json({
			status: 'success',
			payload: fetchMembers,
			message: 'Members Fetched successfully'
		});
	} catch (error) {
		console.log("Error at fetching members method- GET / :" + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while fetching members'
		});
	}
};

exports.fetch_member_by_id = async (req, res, next) => {
	try {

		let { id } = req.params;
		let fetchMember = await _models2.default.Member.findOne({
			where: {
				id: id
			}
		});

		res.status(200).json({
			status: 'success',
			payload: fetchMember,
			message: 'Member Fetched successfully'
		});
	} catch (error) {
		console.log("Error at fetching member method- GET / :id " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while fetching member'
		});
	}
};

exports.fetch_member_by_token = async (req, res, next) => {
	try {

		let { token } = req.params;
		let fetchMember = await _models2.default.Member.findOne({
			where: {
				member_token: token
			},
			include: [{
				model: _models2.default.MemberInsurance,
				as: 'memberInsurances'
			}]
		});

		res.status(200).json({
			status: 'success',
			payload: fetchMember,
			message: 'Member Fetched successfully'
		});
	} catch (error) {
		console.log("Error at fetching member method- GET / :token " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while fetching member'
		});
	}
};

exports.create_new_member = async (req, res, next) => {
	try {
		let {
			first_name, middle_name, last_name, country_code, phone_number, email, is_primary_member, gender,
			birth_date, race, ethnicity, driver_license_number, passport_number, ssn, address_line1, address_line2,
			city, state, country, zipcode, status, role, insurance_provider, policy_number, policy_group_number, street_address_line1,
			street_address_line2, provider_phone_number, insurance_state, insurance_city, insurance_country, insurance_zip_code, primary_account_id
		} = req.body;

		console.log(`Body ==> ${JSON.stringify(req.body)}`);
		console.log(`Files => ${JSON.stringify(req.files)}`);

		let findLoggedInUserAccount = await (0, _accounts.findSessionAccount)(req.userData);
		console.log(`findLoggedInUserAccount ==> ${JSON.stringify(findLoggedInUserAccount)}`);

		req.body.lab_code = findLoggedInUserAccount.accountLab.code;

		// console.log(`b --> ${JSON.stringify(req.body)}`)
		let findRole = await _models2.default.Role.findOne({
			where: {
				code: role
			}
		});

		if (findRole === null) {
			return res.status(200).json({
				status: 'failed',
				payload: null,
				message: 'Invalid Role'
			});
		}

		let findLab = await _models2.default.Lab.findOne({
			where: {
				//code: lab_code
				id: findLoggedInUserAccount.lab_ref
			}
		});

		if (findLab === null) {
			return res.status(200).json({
				status: 'failed',
				payload: null,
				message: 'Invalid Lab'
			});
		}

		let newMember = null;
		let newQrCode = await (0, _accounts.createQrCode)();
		let signature_image_name = null;
		let id_image_name = null;
		let insurance_front_name = null;
		let insurance_back_name = null;

		if (findLoggedInUserAccount === null) {
			return res.status(200).json({
				status: 'failed',
				payload: null,
				message: 'Invalid Account'
			});
		}
		// let newQrCode = await createQrCode();

		if (req.files.signature_file !== undefined && req.files.signature_file !== null && req.files.signature_file !== "" && req.files.signature_file.length > 0) {
			signature_image_name = await (0, _attachments.uploadDocument)(req.files.signature_file[0], _constants.S3_USER_BUCKET_NAME);
		}

		if (req.files.id_image_file !== undefined && req.files.id_image_file !== null && req.files.id_image_file !== "" && req.files.id_image_file.length > 0) {
			id_image_name = await (0, _attachments.uploadDocument)(req.files.id_image_file[0], _constants.S3_USER_BUCKET_NAME);
		}

		newMember = await _models2.default.Member.create({
			account_id: findLoggedInUserAccount.id,
			first_name: first_name !== undefined && first_name !== null && first_name !== "null" ? first_name : null,
			middle_name: middle_name !== undefined && middle_name !== null && middle_name !== "null" ? middle_name : null,
			last_name: last_name !== undefined && last_name !== null && last_name !== "null" ? last_name : null,
			country_code: country_code !== undefined && country_code !== null && country_code !== "null" ? country_code : null,
			phone_number: phone_number !== undefined && phone_number !== null && phone_number !== "null" ? phone_number : null,
			email: email !== undefined && email !== null && email !== "null" ? email : null,
			is_primary_member: false,
			gender: gender !== undefined && gender !== null && gender !== "null" ? gender : null,
			birth_date: birth_date !== undefined && birth_date !== null && birth_date !== "null" ? birth_date : null,
			race: race !== undefined && race !== null && race !== "null" ? race : null,
			ethnicity: ethnicity !== undefined && ethnicity !== null && ethnicity !== "null" ? ethnicity : null,
			driver_license_number: driver_license_number !== undefined && driver_license_number !== null && driver_license_number !== "null" ? driver_license_number : null,
			passport_number: passport_number !== undefined && passport_number !== null && passport_number !== "null" ? passport_number : null,
			ssn: ssn !== undefined && ssn !== null && ssn !== "null" ? ssn : null,
			address_line1: address_line1 !== undefined && address_line1 !== null && address_line1 !== "null" ? address_line1 : null,
			address_line2: address_line2 !== undefined && address_line2 !== null && address_line2 !== "null" ? address_line2 : null,
			city: city !== undefined && city !== null && city !== "null" ? city : null,
			state: state !== undefined && state !== null && state !== "null" ? state : null,
			country: country !== undefined && country !== null && country !== "null" ? country : null,
			zipcode: zipcode !== undefined && zipcode !== null && zipcode !== "null" ? zipcode : null,
			qr_code: newQrCode,
			status: 'ACTIVE'
		});

		if (newMember !== null) {
			if (insurance_provider !== null && insurance_provider !== 'null' && insurance_provider !== undefined && insurance_provider !== 'undefined' && policy_number !== null && policy_number !== 'null' && policy_number !== undefined && policy_number !== 'undefined') {
				let findMemberInsurance = await _models2.default.MemberInsurance.findOne({
					where: {
						member_id: newMember.id
						// insurance_provider: insurance_provider,
						// policy_number: policy_number
					}
				});
				// console.log("findMemberInsurance=====>" + JSON.stringify(findMemberInsurance))
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
						city: insurance_city,
						state: insurance_state,
						country: insurance_country,
						zipcode: insurance_zip_code,
						expiry_date: null,
						status: "ACTIVE"
					});
				}
			}
		}

		res.status(200).json({
			status: 'success',
			// payload: newMember,
			message: 'Member created successfully'
		});
	} catch (error) {
		console.log("Error at creating member method- POST / : " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while creating member'
		});
	}
}, exports.create_member = async (req, res, next) => {
	try {

		let {
			first_name, middle_name, last_name, country_code, phone_number, email, is_primary_member, gender,
			birth_date, race, ethnicity, driver_license_number, passport_number, ssn, address_line1, address_line2,
			city, state, country, zipcode, status, role, insurance_provider, policy_number, policy_group_number, street_address_line1,
			street_address_line2, provider_phone_number, insurance_state, insurance_city, insurance_country, insurance_zip_code, primary_account_id
		} = req.body;

		console.log(`Body ==> ${JSON.stringify(req.body)}`);
		console.log(`Files => ${JSON.stringify(req.files)}`);

		/*
  let findAccount = await findSessionAccount(req.userData);
  	if (findAccount === null) {
  	return res.status(200).json({
  		status: 'failed',
  		payload: null,
  		message: 'Invalid Account'
  	});
  }
  let newQrCode = await createQrCode();
  	let newMember = await db.Member.create({
  	account_id: findAccount.id,
  	first_name: first_name,
  	middle_name: middle_name,
  	last_name: last_name,
  	country_code: country_code,
  	phone_number: phone_number,
  	email: email,
  	is_primary_member: is_primary_member,
  	gender: gender,
  	birth_date: birth_date,
  	race: race,
  	ethnicity: ethnicity,
  	driver_license_number: driver_license_number,
  	passport_number: passport_number,
  	ssn: ssn,
  	address_line1: address_line1,
  	address_line2: address_line2,
  	city: city,
  	state: state,
  	country: country,
  	zipcode: zipcode,
  	qr_code: newQrCode,
  	status: status
  });
  */

		let findLoggedInUserAccount = await (0, _accounts.findSessionAccount)(req.userData);
		console.log(`findLoggedInUserAccount ==> ${JSON.stringify(findLoggedInUserAccount)}`);

		req.body.lab_code = findLoggedInUserAccount.accountLab.code;

		// console.log(`b --> ${JSON.stringify(req.body)}`)
		let findRole = await _models2.default.Role.findOne({
			where: {
				code: role
			}
		});

		if (findRole === null) {
			return res.status(200).json({
				status: 'failed',
				payload: null,
				message: 'Invalid Role'
			});
		}

		let findLab = await _models2.default.Lab.findOne({
			where: {
				//code: lab_code
				id: findLoggedInUserAccount.lab_ref
			}
		});

		if (findLab === null) {
			return res.status(200).json({
				status: 'failed',
				payload: null,
				message: 'Invalid Lab'
			});
		}

		let newMember = null;
		let newQrCode = await (0, _accounts.createQrCode)();
		let signature_image_name = null;
		let id_image_name = null;
		let insurance_front_name = null;
		let insurance_back_name = null;

		// If admin selects primary account name
		if (primary_account_id !== null && primary_account_id !== "null") {
			//create user under this primary user
			let fetchAccount = await _models2.default.Account.findOne({
				where: {
					id: primary_account_id
				}
			});

			if (fetchAccount === null) {
				return res.status(200).json({
					status: 'failed',
					payload: null,
					message: 'Invalid user account selected'
				});
			}

			if (req.files.signature_file !== undefined && req.files.signature_file !== null && req.files.signature_file !== "" && req.files.signature_file.length > 0) {
				signature_image_name = await (0, _attachments.uploadDocument)(req.files.signature_file[0], _constants.S3_USER_BUCKET_NAME);
			}

			if (req.files.id_image_file !== undefined && req.files.id_image_file !== null && req.files.id_image_file !== "" && req.files.id_image_file.length > 0) {
				id_image_name = await (0, _attachments.uploadDocument)(req.files.id_image_file[0], _constants.S3_USER_BUCKET_NAME);
			}

			newMember = await _models2.default.Member.create({
				account_id: fetchAccount.id,
				first_name: first_name !== undefined && first_name !== null && first_name !== "null" ? first_name : null,
				middle_name: middle_name !== undefined && middle_name !== null && middle_name !== "null" ? middle_name : null,
				last_name: last_name !== undefined && last_name !== null && last_name !== "null" ? last_name : null,
				country_code: country_code !== undefined && country_code !== null && country_code !== "null" ? country_code : null,
				phone_number: phone_number !== undefined && phone_number !== null && phone_number !== "null" ? phone_number : null,
				email: email !== undefined && email !== null && email !== "null" ? email : null,
				is_primary_member: false,
				gender: gender !== undefined && gender !== null && gender !== "null" ? gender : null,
				birth_date: birth_date !== undefined && birth_date !== null && birth_date !== "null" ? birth_date : null,
				race: race !== undefined && race !== null && race !== "null" ? race : null,
				ethnicity: ethnicity !== undefined && ethnicity !== null && ethnicity !== "null" ? ethnicity : null,
				driver_license_number: driver_license_number !== undefined && driver_license_number !== null && driver_license_number !== "null" ? driver_license_number : null,
				passport_number: passport_number !== undefined && passport_number !== null && passport_number !== "null" ? passport_number : null,
				ssn: ssn !== undefined && ssn !== null && ssn !== "null" ? ssn : null,
				address_line1: address_line1 !== undefined && address_line1 !== null && address_line1 !== "null" ? address_line1 : null,
				address_line2: address_line2 !== undefined && address_line2 !== null && address_line2 !== "null" ? address_line2 : null,
				city: city !== undefined && city !== null && city !== "null" ? city : null,
				state: state !== undefined && state !== null && state !== "null" ? state : null,
				country: country !== undefined && country !== null && country !== "null" ? country : null,
				zipcode: zipcode !== undefined && zipcode !== null && zipcode !== "null" ? zipcode : null,
				qr_code: newQrCode,
				status: 'ACTIVE',
				signature_image: signature_image_name,
				id_card_image: id_image_name
			});
		} else {
			// Here it should be either new account or customer selected account	
			const { lab_code } = req.body;
			let fetchUser = await (0, _accounts.fetchIfUserExist)(req.body);
			// console.log(`\nFetch User ==> ${JSON.stringify(fetchUser)}`)
			if (fetchUser !== null) {
				return res.status(200).json({
					status: 'failed',
					payload: null,
					message: 'Account already exist'
				});
			}

			let hashedCountryCode = country_code !== null && country_code !== "null" ? await _crypto2.default.hash_from_string(country_code) : null;
			let hashedPhoneNumber = phone_number !== null && phone_number !== "null" ? await _crypto2.default.hash_from_string(phone_number) : null;
			let hashedEmail = email !== null && email !== "null" ? await _crypto2.default.hash_from_string(email) : null;

			// create user record 
			let newUser = await _models2.default.User.create({
				country_code: hashedCountryCode,
				phone_number: hashedPhoneNumber,
				internal_user: false,
				lab_code: lab_code,
				email: hashedEmail,
				password: null,
				status: "ACTIVE"
			});

			let hashedUserId = await _crypto2.default.hash_from_string(newUser.id);
			let accountName = `${first_name !== null ? first_name : ""} ${last_name !== null ? last_name : ""}`;

			// create account record
			let newAccount = await _models2.default.Account.create({
				lab_ref: findLab !== null ? findLab.id : null,
				hashed_user_id: hashedUserId,
				name: accountName,
				internal_account: false,
				status: "ACTIVE"
			});

			// create account role
			await _models2.default.AccountRole.create({
				role_id: findRole.id,
				account_id: newAccount.id,
				is_default: true,
				status: "ACTIVE"
			});

			let filterMember = await _models2.default.Member.findAll({
				where: {
					account_id: newAccount.id
				}
			});

			// console.log("filterMember=====>" + JSON.stringify(filterMember))

			let findMember = filterMember.find(x => x.first_name === first_name.toLowerCase() && x.last_name === last_name.toLowerCase() && x.birth_date === birth_date);

			// console.log("findMember=====>" + JSON.stringify(findMember))

			if (findMember !== undefined && findMember !== null) {
				return res.status(200).json({
					status: 'failed',
					payload: null,
					message: 'Member already exist'
				});
			}

			if (req.files.signature_file !== undefined && req.files.signature_file !== null && req.files.signature_file !== "" && req.files.signature_file.length > 0) {
				signature_image_name = await (0, _attachments.uploadDocument)(req.files.signature_file[0], _constants.S3_USER_BUCKET_NAME);
			}

			if (req.files.id_image_file !== undefined && req.files.id_image_file !== null && req.files.id_image_file !== "" && req.files.id_image_file.length > 0) {
				id_image_name = await (0, _attachments.uploadDocument)(req.files.id_image_file[0], _constants.S3_USER_BUCKET_NAME);
			}

			// create member record
			newMember = await _models2.default.Member.create({
				account_id: newAccount.id,
				first_name: first_name !== undefined && first_name !== null && first_name !== "null" ? first_name : null,
				last_name: last_name !== undefined && last_name !== null && last_name !== "null" ? last_name : null,
				gender: gender !== undefined && gender !== null && gender !== "null" ? gender : null,
				country_code: country_code !== undefined && country_code !== null && country_code !== "null" ? country_code : null,
				phone_number: phone_number !== undefined && phone_number !== null && phone_number !== "null" ? phone_number : null,
				is_primary_member: filterMember.length === 0 ? true : false,
				email: email !== undefined && email !== null && email !== "null" ? email : null,
				birth_date: birth_date !== undefined && birth_date !== null && birth_date !== "null" ? birth_date : null,
				race: race !== undefined && race !== null && race !== "null" ? race : null,
				ethnicity: ethnicity !== undefined && ethnicity !== null && ethnicity !== "null" ? ethnicity : null,
				driver_license_number: driver_license_number !== undefined && driver_license_number !== null && driver_license_number !== "null" ? driver_license_number : null,
				passport_number: passport_number !== undefined && passport_number !== null && passport_number !== "null" ? passport_number : null,
				ssn: ssn !== undefined && ssn !== null && ssn !== "null" ? ssn : null,
				address_line1: address_line1 !== undefined && address_line1 !== null && address_line1 !== "null" ? address_line1 : null,
				address_line2: address_line2 !== undefined && address_line2 !== null && address_line2 !== "null" ? address_line2 : null,
				city: city !== undefined && city !== null && city !== "null" ? city : null,
				state: state !== undefined && state !== null && state !== "null" ? state : null,
				country: country !== undefined && country !== null && country !== "null" ? country : null,
				zipcode: zipcode !== undefined && zipcode !== null && zipcode !== "null" ? zipcode : null,
				qr_code: newQrCode,
				signature_image: signature_image_name,
				id_card_image: id_image_name,
				status: "ACTIVE"
			});
		}

		if (newMember !== null) {
			if (insurance_provider !== null && insurance_provider !== 'null' && insurance_provider !== undefined && insurance_provider !== 'undefined' && policy_number !== null && policy_number !== 'null' && policy_number !== undefined && policy_number !== 'undefined') {
				// commented the policy as far now from preventing multiple health insurance
				let findMemberInsurance = await _models2.default.MemberInsurance.findOne({
					where: {
						member_id: newMember.id
						// insurance_provider: insurance_provider,
						// policy_number: policy_number
					}
				});
				// console.log("findMemberInsurance=====>" + JSON.stringify(findMemberInsurance))
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
						city: insurance_city,
						state: insurance_state,
						country: insurance_country,
						zipcode: insurance_zip_code,
						expiry_date: null,
						status: "ACTIVE"
					});
				}
			}
		}

		res.status(200).json({
			status: 'success',
			// payload: newMember,
			message: 'Member created successfully'
		});
	} catch (error) {
		console.log("Error at creating member method- POST / : " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while creating member'
		});
	}
};

exports.update_member = async (req, res, next) => {
	try {

		let {
			first_name, middle_name, last_name, country_code, phone_number, email, is_primary_member, gender,
			birth_date, race, ethnicity, driver_license_number, passport_number, ssn, address_line1, address_line2,
			city, state, country, zipcode, status
		} = req.body;

		let { id } = req.params;

		let fetchMember = await _models2.default.Member.findOne({
			where: {
				id: id
			}
		});

		if (fetchMember === null) {
			return res.status(500).json({
				status: 'failed',
				payload: null,
				message: "Member doesn't exist"
			});
		}

		let updatedMember = await _models2.default.Member.update({
			first_name: first_name !== undefined ? first_name : fetchMember.first_name,
			middle_name: middle_name !== undefined ? middle_name : fetchMember.middle_name,
			last_name: last_name !== undefined ? last_name : fetchMember.last_name,
			country_code: country_code !== undefined ? country_code : fetchMember.country_code,
			phone_number: phone_number !== undefined ? phone_number : fetchMember.phone_number,
			email: email !== undefined ? email : fetchMember.email,
			is_primary_member: is_primary_member !== undefined ? is_primary_member : fetchMember.is_primary_member,
			gender: gender !== undefined ? gender : fetchMember.gender,
			birth_date: birth_date !== undefined ? birth_date : fetchMember.birth_date,
			race: race !== undefined ? race : fetchMember.race,
			ethnicity: ethnicity !== undefined ? ethnicity : fetchMember.ethnicity,
			driver_license_number: driver_license_number !== undefined ? driver_license_number : fetchMember.driver_license_number,
			passport_number: passport_number !== undefined ? passport_number : fetchMember.passport_number,
			ssn: ssn !== undefined ? ssn : fetchMember.ssn,
			address_line1: address_line1 !== undefined ? address_line1 : fetchMember.address_line1,
			address_line2: address_line2 !== undefined ? address_line2 : fetchMember.address_line2,
			city: city !== undefined ? city : fetchMember.city,
			state: state !== undefined ? state : fetchMember.state,
			country: country !== undefined ? country : fetchMember.country,
			zipcode: zipcode !== undefined ? zipcode : fetchMember.zipcode,
			// qr_code: qr_code !== undefined ? qr_code : fetchMember.qr_code,
			status: status !== undefined ? status : fetchMember.status
		}, {
			where: {
				id: fetchMember.id
			},
			returning: true
		});
		res.status(200).json({
			status: 'success',
			payload: updatedMember[1].length > 0 ? updatedMember[1][0] : null,
			message: 'Member updated successfully'
		});
	} catch (error) {
		console.log("Error at updating member method- PUT / :id " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while updating member'
		});
	}
};

exports.update_member_by_id = async (req, res, next) => {
	try {
		let {
			first_name, middle_name, last_name, country_code, phone_number, email, is_primary_member, gender, expiry_date,
			birth_date, race, ethnicity, driver_license_number, passport_number, ssn, address_line1, address_line2,
			city, state, country, zipcode, status, role, insurance_provider, policy_number, policy_group_number, street_address_line1,
			street_address_line2, provider_phone_number, insurance_state, insurance_city, insurance_country, insurance_zip_code, primary_account_id
		} = req.body;

		console.log(`Put Body ==> ${JSON.stringify(req.body)}`);
		console.log(`Put Files => ${JSON.stringify(req.files)}`);

		let newMember = null;
		// let newQrCode = await createQrCode();
		let signature_image_name = null;
		let id_image_name = null;
		let insurance_front_name = null;
		let insurance_back_name = null;

		let { member_token } = req.params;

		let fetchMember = await _models2.default.Member.findOne({
			where: {
				member_token: member_token
			}
		});

		if (fetchMember === null) {
			return res.status(500).json({
				status: 'failed',
				payload: null,
				message: "Member doesn't exist"
			});
		}

		if (req.files.signature_file !== undefined && req.files.signature_file !== null && req.files.signature_file !== "" && req.files.signature_file.length > 0) {
			if (fetchMember !== null && fetchMember.signature_image !== null) {
				await (0, _attachments.deleteDocument)(fetchMember.signature_image, _constants.S3_USER_BUCKET_NAME);
			}

			signature_image_name = await (0, _attachments.uploadDocument)(req.files.signature_file[0], _constants.S3_USER_BUCKET_NAME);
		}

		if (req.files.id_image_file !== undefined && req.files.id_image_file !== null && req.files.id_image_file !== "" && req.files.id_image_file.length > 0) {
			if (fetchMember !== null && fetchMember.id_card_image !== null) {
				await (0, _attachments.deleteDocument)(fetchMember.id_card_image, _constants.S3_USER_BUCKET_NAME);
			}

			id_image_name = await (0, _attachments.uploadDocument)(req.files.id_image_file[0], _constants.S3_USER_BUCKET_NAME);
		}

		newMember = await _models2.default.Member.update({
			first_name: first_name !== undefined && first_name !== null && first_name !== "null" ? first_name : fetchMember.first_name,
			middle_name: middle_name !== undefined && middle_name !== null && middle_name !== "null" ? middle_name : fetchMember.middle_name,
			last_name: last_name !== undefined && last_name !== null && last_name !== "null" ? last_name : fetchMember.last_name,
			country_code: country_code !== undefined && country_code !== null && country_code !== "null" ? country_code : fetchMember.country_code,
			phone_number: phone_number !== undefined && phone_number !== null && phone_number !== "null" ? phone_number : fetchMember.phone_number,
			email: email !== undefined && email !== null && email !== "null" ? email : fetchMember.email,
			is_primary_member: fetchMember.is_primary_member,
			gender: gender !== undefined && gender !== null && gender !== "null" ? gender : fetchMember.gender,
			birth_date: birth_date !== undefined && birth_date !== null && birth_date !== "null" ? birth_date : fetchMember.birth_date,
			race: race !== undefined && race !== null && race !== "null" ? race : fetchMember.race,
			ethnicity: ethnicity !== undefined && ethnicity !== null && ethnicity !== "null" ? ethnicity : fetchMember.ethnicity,
			driver_license_number: driver_license_number !== undefined && driver_license_number !== null && driver_license_number !== "null" ? driver_license_number : fetchMember.driver_license_number,
			passport_number: passport_number !== undefined && passport_number !== null && passport_number !== "null" ? passport_number : fetchMember.passport_number,
			ssn: ssn !== undefined && ssn !== null && ssn !== "null" ? ssn : fetchMember.ssn,
			address_line1: address_line1 !== undefined && address_line1 !== null && address_line1 !== "null" ? address_line1 : fetchMember.address_line1,
			address_line2: address_line2 !== undefined && address_line2 !== null && address_line2 !== "null" ? address_line2 : fetchMember.address_line2,
			city: city !== undefined && city !== null && city !== "null" ? city : fetchMember.city,
			state: state !== undefined && state !== null && state !== "null" ? state : fetchMember.city,
			country: country !== undefined && country !== null && country !== "null" ? country : fetchMember.country,
			zipcode: zipcode !== undefined && zipcode !== null && zipcode !== "null" ? zipcode : fetchMember.zipcode,
			signature_image: signature_image_name !== null ? signature_image_name : fetchMember.signature_image,
			id_card_image: id_image_name !== null ? id_image_name : fetchMember.id_card_image,
			status: fetchMember.status
		}, {
			where: {
				id: fetchMember.id
			}
		});

		if (insurance_provider !== null && insurance_provider !== 'null' && insurance_provider !== undefined && insurance_provider !== 'undefined' && policy_number !== null && policy_number !== 'null' && policy_number !== undefined && policy_number !== 'undefined') {
			let findMemberInsurance = await _models2.default.MemberInsurance.findOne({
				where: {
					member_id: fetchMember.id
					// insurance_provider: insurance_provider,
					// policy_number: policy_number
				}
			});
			// console.log("findMemberInsurance=====>" + JSON.stringify(findMemberInsurance))
			if (req.files.insurance_front_file !== undefined && req.files.insurance_front_file !== null && req.files.insurance_front_file !== "" && req.files.insurance_front_file.length > 0) {
				if (findMemberInsurance !== null && findMemberInsurance.front_insurance_card_image !== null) {
					await (0, _attachments.deleteDocument)(findMemberInsurance.front_insurance_card_image, _constants.S3_INSURANCE_BUCKET_NAME);
				}

				insurance_front_name = await (0, _attachments.uploadDocument)(req.files.insurance_front_file[0], _constants.S3_INSURANCE_BUCKET_NAME);
			}

			if (req.files.insurance_back_file !== undefined && req.files.insurance_back_file !== null && req.files.insurance_back_file !== "" && req.files.insurance_back_file.length > 0) {
				if (findMemberInsurance !== null && findMemberInsurance.back_insurance_card_image !== null) {
					await (0, _attachments.deleteDocument)(findMemberInsurance.back_insurance_card_image, _constants.S3_INSURANCE_BUCKET_NAME);
				}

				insurance_back_name = await (0, _attachments.uploadDocument)(req.files.insurance_back_file[0], _constants.S3_INSURANCE_BUCKET_NAME);
			}

			if (findMemberInsurance === null) {
				await _models2.default.MemberInsurance.create({
					member_id: fetchMember.id,
					insurance_provider: insurance_provider !== undefined && insurance_provider !== null && insurance_provider !== "null" ? insurance_provider : null,
					policy_number: policy_number !== undefined && policy_number !== null && policy_number !== "null" ? policy_number : null,
					policy_group_number: policy_group_number !== undefined && policy_group_number !== null && policy_group_number !== "null" ? policy_group_number : null,
					provider_phone_number: provider_phone_number !== undefined && provider_phone_number !== null && provider_phone_number !== "null" ? provider_phone_number : null,
					front_insurance_card_image: insurance_front_name !== undefined && insurance_front_name !== null && insurance_front_name !== "null" ? insurance_front_name : null,
					back_insurance_card_image: insurance_back_name !== undefined && insurance_back_name !== null && insurance_back_name !== "null" ? insurance_back_name : null,
					street_address_line1: street_address_line1 !== undefined && street_address_line1 !== null && street_address_line1 !== "null" ? street_address_line1 : null,
					street_address_line2: street_address_line2 !== undefined && street_address_line2 !== null && street_address_line2 !== "null" ? street_address_line2 : null,
					city: insurance_city !== undefined && insurance_city !== null && insurance_city !== "null" ? insurance_city : null,
					state: insurance_state !== undefined && insurance_state !== null && insurance_state !== "null" ? insurance_state : null,
					country: insurance_country !== undefined && insurance_country !== null && insurance_country !== "null" ? insurance_country : null,
					zipcode: insurance_zip_code !== undefined && insurance_zip_code !== null && insurance_zip_code !== "null" ? insurance_zip_code : null,
					expiry_date: expiry_date !== undefined && expiry_date !== null && expiry_date !== "null" ? expiry_date : null,
					status: status !== undefined && status !== null && status !== "null" ? status : 'ACTIVE'
				});
			} else {
				await _models2.default.MemberInsurance.update({
					member_id: fetchMember.id,
					insurance_provider: insurance_provider !== undefined && insurance_provider !== null && insurance_provider !== "null" ? insurance_provider : findMemberInsurance.insurance_provider,
					policy_number: policy_number !== undefined && policy_number !== null && policy_number !== "null" ? policy_number : findMemberInsurance.policy_number,
					policy_group_number: policy_group_number !== undefined && policy_group_number !== null && policy_group_number !== "null" ? policy_group_number : findMemberInsurance.policy_group_number,
					provider_phone_number: provider_phone_number !== undefined && provider_phone_number !== null && provider_phone_number !== "null" ? provider_phone_number : findMemberInsurance.provider_phone_number,
					front_insurance_card_image: insurance_front_name !== undefined && insurance_front_name !== null && insurance_front_name !== "null" ? insurance_front_name : findMemberInsurance.insurance_front_name,
					back_insurance_card_image: insurance_back_name !== undefined && insurance_back_name !== null && insurance_back_name !== "null" ? insurance_back_name : findMemberInsurance.insurance_back_name,
					street_address_line1: street_address_line1 !== undefined && street_address_line1 !== null && street_address_line1 !== "null" ? street_address_line1 : findMemberInsurance.street_address_line1,
					street_address_line2: street_address_line2 !== undefined && street_address_line2 !== null && street_address_line2 !== "null" ? street_address_line2 : findMemberInsurance.street_address_line2,
					city: insurance_city !== undefined && insurance_city !== null && insurance_city !== "null" ? insurance_city : findMemberInsurance.insurance_city,
					state: insurance_state !== undefined && insurance_state !== null && insurance_state !== "null" ? insurance_state : findMemberInsurance.insurance_state,
					country: insurance_country !== undefined && insurance_country !== null && insurance_country !== "null" ? insurance_country : findMemberInsurance.insurance_country,
					zipcode: insurance_zip_code !== undefined && insurance_zip_code !== null && insurance_zip_code !== "null" ? insurance_zip_code : findMemberInsurance.insurance_zip_code,
					expiry_date: expiry_date !== undefined && expiry_date !== null && expiry_date !== "null" ? expiry_date : findMemberInsurance.expiry_date,
					status: status !== undefined && status !== null && status !== "null" ? status : findMemberInsurance.status
				}, {
					where: {
						id: findMemberInsurance.id
					}
				});
			}
		}

		fetchMember = await _models2.default.Member.findOne({
			where: {
				id: fetchMember.id
			},
			include: [{
				model: _models2.default.MemberInsurance,
				as: 'memberInsurances'
			}]
		});
		res.status(200).json({
			status: 'success',
			payload: fetchMember,
			message: 'Member updated successfully'
		});
	} catch (error) {
		console.log("Error at updating member method- PUT / :id " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while updating member'
		});
	}
};

exports.delete_member_by_id = async (req, res, next) => {
	try {

		let { id } = req.params;

		let fetchMember = await _models2.default.Member.findOne({
			where: {
				id: id
			}
		});

		if (fetchMember === null) {
			return res.status(500).json({
				status: 'failed',
				payload: null,
				message: "Member doesn't exist"
			});
		}

		await _models2.default.Member.destroy({
			where: {
				id: fetchMember.id
			}
		});
		res.status(200).json({
			status: 'success',
			payload: null,
			message: 'Member Deleted successfully'
		});
	} catch (error) {
		console.log("Error at deleting member method- DELETE / :id " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while deleting member'
		});
	}
};

exports.fetch_member_by_qr_code = async (req, res, next) => {
	try {

		let { qr_code } = req.params;

		let fetchMember = await _models2.default.Member.findOne({
			where: {
				qr_code: qr_code
			},
			attributes: ['email', 'full_name', 'member_token', 'country_code', 'phone_number', 'gender', 'birth_date', 'qr_code']
		});

		if (fetchMember === null) {
			return res.status(500).json({
				status: 'failed',
				payload: null,
				message: "Member doesn't exist"
			});
		}

		res.status(200).json({
			status: 'success',
			payload: fetchMember,
			message: 'Member Deleted successfully'
		});
	} catch (error) {
		console.log("Error at deleting member method- DELETE / :id " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while deleting member'
		});
	}
};

exports.fetch_all_internal_members = async (req, res, next) => {
	try {
		let limit = 50;
		let offset = req.query.offset ? parseInt(req.query.offset) : 0;
		let fetchMembers = await _models2.default.Member.findAll({
			limit: limit,
			offset: offset,
			order: [['id', 'DESC']],
			include: [{
				model: _models2.default.Account,
				as: "memberAccount",
				required: true,
				where: {
					internal_account: false
				}
			}]
		});

		res.status(200).json({
			status: 'success',
			payload: fetchMembers,
			message: 'Members Fetched successfully'
		});
	} catch (error) {
		console.log("Error at fetching members method- GET / :" + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while fetching members'
		});
	}
};

exports.fetch_members_by_member_tokens = async (req, res, next) => {
	try {

		let { member_tokens } = req.body;
		let fetchMembers = await _models2.default.Member.findAll({
			where: {
				member_token: member_tokens
			},
			include: [{
				model: _models2.default.MemberInsurance,
				as: "memberInsurances"
			}]
		});
		let groupMembers = _underscore2.default.indexBy(fetchMembers, 'member_token');
		res.status(200).json({
			status: 'success',
			payload: groupMembers,
			message: 'Member Fetched successfully'
		});
	} catch (error) {
		console.log("Error at fetching member method- POST / :id " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while fetching member'
		});
	}
};

exports.search_members = async (req, res, next) => {
	try {

		let { name } = req.params;
		let whereObj = {};
		if (name !== null && name !== undefined && name !== "") {
			//whereObj[Op.or]={first_name:{[Op.like]: `%${name}%`},last_name:{[Op.like]: `%${name}%`}};
			// whereObj[Op.or] = {
			// 	first_name: Sequelize.where(Sequelize.fn('lower', Sequelize.col('first_name')), {
			// 		[Op.like]: `%${name.toLowerCase()}%`,
			// 	}), last_name: Sequelize.where(Sequelize.fn('lower', Sequelize.col('last_name')), {
			// 		[Op.like]: `%${name.toLowerCase()}%`,
			// 	})
			// };
			whereObj[Op.or] = {
				first_name: Sequelize.where(Sequelize.fn('lower', Sequelize.col('first_name')), '=', name.toLowerCase()),
				last_name: Sequelize.where(Sequelize.fn('lower', Sequelize.col('last_name')), '=', name.toLowerCase())
			};
		}
		let fetchMember = await _models2.default.Member.findAll({
			where: whereObj,
			attributes: ['first_name', 'last_name', 'full_name', 'member_token']
		});
		console.log("fetchMember=====>" + JSON.stringify(fetchMember));
		res.status(200).json({
			status: 'success',
			payload: fetchMember,
			message: 'Member Fetched successfully'
		});
	} catch (error) {
		console.log("Error at fetching member method " + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while fetching member'
		});
	}
};