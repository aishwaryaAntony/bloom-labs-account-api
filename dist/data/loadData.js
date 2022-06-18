"use strict";

var _exceljs = require("exceljs");

var _exceljs2 = _interopRequireDefault(_exceljs);

var _models = require("../src/models");

var _models2 = _interopRequireDefault(_models);

var _crypto = require("../src/helpers/crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _accounts = require("../src/helpers/accounts");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Parse command line arguments using yargs
var argv = require("yargs").command("master", "Load DB", function (yargs) {}).help("help").argv;
var command = argv._[0];


var adminPermission = {
	"P-001": {
		name: "Location",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-004": {
		name: "Test Type",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-002": {
		name: "Location Test Type",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	}, "P-005": {
		name: "User and Access",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-003": {
		name: "Roles and Permission",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-007": {
		name: "Upload Test Result",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-008": {
		name: "Test Results",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-009": {
		name: "Patients",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-010": {
		name: "Test Reports",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-011": {
		name: "Test Uploads",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-013": {
		name: "Application Screens",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	}
};

var ConsumerPermission = {
	"P-006": {
		name: "Dashboard",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-012": {
		name: "Provide Feedback",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	}
};

var LocationManagerPermission = {
	"P-002": {
		name: "Location Test Type",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-007": {
		name: "Upload Test Result",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	}
};

var PCRTechPermission = {
	"P-007": {
		name: "Upload Test Result",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-011": {
		name: "Test Uploads",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	}
};

var LabTechnicianPermission = {
	"P-008": {
		name: "Test Results",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-009": {
		name: "Patients",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	},
	"P-014": {
		name: "Scan Patients",
		permission: {
			view: true,
			add: true,
			edit: true,
			delete: true
		}
	}
};

const loadMasterTable = filename => {
	return new Promise(async (resolve, reject) => {
		try {
			let workbook = new _exceljs2.default.Workbook();
			console.log("File name => " + filename);
			await workbook.xlsx.readFile(filename);
			console.log("\n**********Master tables started loading**********\n");
			await loadLabs(workbook);
			console.log("\u2714 lab data loaded \u2705 \n");
			await loadLocations(workbook);
			console.log("\u2714 location data loaded \u2705 \n");
			await loadRoles(workbook);
			console.log("\u2714 role data loaded \u2705 \n");
			await loadUsers(workbook);
			console.log("\u2714 user data loaded \u2705 \n");
			await loadAppScreens();
			console.log("\u2714 app screens loaded \u2705 \n");
			console.log("\n**********Master tables loaded successfully**********\n");
			resolve("Success");
		} catch (error) {
			console.log("\u274c Error ==> " + error);
			reject(error);
		}
	});
};
const loadLabs = workbook => {
	return new Promise((resolve, reject) => {
		let worksheet = workbook.getWorksheet("labs");
		let lastRow = worksheet.lastRow;
		let isRejected = false;
		let labArray = [];

		try {
			worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
				if (rowNumber > 1) {
					let labObj = {};
					labObj.name = row.getCell(1).value;
					labObj.code = row.getCell(2).value;
					labObj.description = row.getCell(3).value;
					labObj.address1 = row.getCell(4).value;
					labObj.address2 = row.getCell(5).value;
					labObj.city = row.getCell(6).value;
					labObj.state = row.getCell(7).value;
					labObj.country = row.getCell(8).value;
					labObj.zipcode = row.getCell(9).value;
					labObj.phoneNumber = row.getCell(10).value;
					labArray.push(labObj);

					if (row === lastRow) {
						if (!isRejected === true) {
							for (let lab of labArray) {
								const { name, code, description, address1, address2, city, state, country, zipcode, phoneNumber } = lab;
								let findLab = await _models2.default.Lab.findOne({
									where: {
										code: code
									}
								});
								if (findLab === null) {
									await _models2.default.Lab.create({
										name,
										code,
										description,
										address_line_1: address1,
										address_line_2: address2,
										city,
										state,
										country,
										zipcode,
										phone_number: phoneNumber,
										status: "Active"
									});
								}
							}
							resolve("Lab table loaded successfully");
						}
					}
				}
			});
		} catch (error) {
			console.log("\u274c Error ==> " + error);
			resolve(error);
		}
	});
};
const loadRoles = workbook => {
	return new Promise((resolve, reject) => {
		let worksheet = workbook.getWorksheet("roles");
		let lastRow = worksheet.lastRow;
		let isRejected = false;
		let roleArray = [];

		try {
			worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
				if (rowNumber > 1) {
					let roleObj = {};
					roleObj.code = row.getCell(1).value;
					roleObj.name = row.getCell(2).value;
					roleObj.status = row.getCell(3).value;
					roleObj.permission = row.getCell(4).value;
					roleArray.push(roleObj);

					if (row === lastRow) {
						if (!isRejected === true) {
							for (let role of roleArray) {
								const { name, code, status } = role;

								let findRole = await _models2.default.Role.findOne({
									where: {
										code: code
									}
								});
								let permissionSetObj = null;
								if (code === "ADM" || code === "SYA" || code === "DEV" || code === "LBE") {
									permissionSetObj = adminPermission;
								}
								if (code === "CSR") {
									permissionSetObj = ConsumerPermission;
								}
								if (code === "LOM") {
									permissionSetObj = LocationManagerPermission;
								}
								if (code === "LBT") {
									permissionSetObj = LabTechnicianPermission;
								}
								if (code === "PCT") {
									permissionSetObj = PCRTechPermission;
								}

								if (findRole === null) {
									await _models2.default.Role.create({
										name,
										code,
										status,
										permission: permissionSetObj
									});
								}
							}
							resolve("Role table loaded successfully");
						}
					}
				}
			});
		} catch (error) {
			console.log("\u274c Error ==> " + error);
			resolve(error);
		}
	});
};

const loadLocations = workbook => {
	return new Promise((resolve, reject) => {
		let worksheet = workbook.getWorksheet("labLocations");
		let lastRow = worksheet.lastRow;
		let isRejected = false;
		let locationArray = [];

		try {
			worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
				if (rowNumber > 1) {
					let locationObj = {};
					locationObj.lab_code = row.getCell(1).value;
					locationObj.code = row.getCell(2).value;
					locationObj.name = row.getCell(3).value;
					locationObj.street_address_line1 = row.getCell(4).value;
					locationObj.street_address_line2 = row.getCell(5).value;
					locationObj.city = row.getCell(6).value;
					locationObj.state = row.getCell(7).value;
					locationObj.country = row.getCell(8).value;
					locationObj.zipcode = row.getCell(9).value;
					locationObj.phone_number = row.getCell(10).value;
					locationObj.acuity_ref = row.getCell(11).value;
					locationObj.timezone = row.getCell(12).value;
					locationObj.clia = row.getCell(13).value;
					locationArray.push(locationObj);

					if (row === lastRow) {
						if (!isRejected === true) {
							let fetchLabs = await _models2.default.Lab.findAll({});
							for (let location of locationArray) {
								const { name, code, acuity_ref, lab_code, timezone, clia, street_address_line1, street_address_line2, city, state, country, zipcode, phone_number } = location;

								let findLab = fetchLabs.find(x => x.code === lab_code);

								if (findLab !== undefined) {
									try {
										await _models2.default.LabLocation.create({
											lab_id: findLab.id,
											lab_code: findLab.code,
											lab_name: findLab.name,
											name,
											code,
											street_address_line1,
											street_address_line2,
											city,
											state,
											country,
											zipcode,
											phone_number,
											acuity_ref,
											timezone,
											clia,
											status: "ACTIVE"
										});
									} catch (error) {
										console.log(`\nError1 ==> ${error}`);
									}
								}
							}
							resolve("Location table loaded successfully");
						}
					}
				}
			});
		} catch (error) {
			console.log("\u274c Error ==> " + error);
			resolve(error);
		}
	});
};

const loadUsers = workbook => {
	return new Promise((resolve, reject) => {
		let worksheet = workbook.getWorksheet("users");
		let lastRow = worksheet.lastRow;
		let isRejected = false;
		let userArray = [];

		try {
			worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
				if (rowNumber > 1) {
					let userObj = {};
					userObj.first_name = row.getCell(1).value;
					userObj.last_name = row.getCell(2).value;
					userObj.gender = row.getCell(3).value;
					userObj.role_code = row.getCell(4).value;
					userObj.email = row.getCell(5).value;
					userObj.lab_code = row.getCell(6).value;
					userObj.lab_location_code = row.getCell(7).value;
					userObj.phone = row.getCell(8).value;
					userArray.push(userObj);

					if (row === lastRow) {
						if (!isRejected === true) {
							for (let user of userArray) {
								const { first_name, last_name, gender, role_code, email, lab_code, lab_location_code, phone } = user;
								// console.log("user=====>"+JSON.stringify(user))
								let findRole = await _models2.default.Role.findOne({
									where: {
										code: role_code
									}
								});
								// console.log("findRole=====>"+JSON.stringify(findRole))
								let findLab = await _models2.default.Lab.findOne({
									where: {
										code: lab_code
									}
								});
								// console.log("findLab=====>"+JSON.stringify(findLab))
								let hashed_email = email !== null ? await _crypto2.default.hash_from_string(email) : null;
								// console.log("hashed_email=====>"+hashed_email)
								let findUser = await _models2.default.User.findOne({
									where: {
										email: hashed_email,
										lab_code: lab_code
									}
								});
								// console.log("findUser=====>"+JSON.stringify(findUser))
								if (findRole !== null && findUser === null) {

									let newUser = await _models2.default.User.create({
										country_code: null,
										phone_number: null,
										internal_user: true,
										lab_code: lab_code,
										email: hashed_email,
										password: 'Password123',
										status: "ACTIVE"
									});
									// console.log("newUser=====>"+JSON.stringify(newUser))
									let hashedUserId = await _crypto2.default.hash_from_string(newUser.id);
									// console.log("hashedUserId=====>"+hashedUserId)
									let accountName = `${first_name !== null ? first_name : ""} ${last_name !== null ? last_name : ""}`;
									//console.log("accountName=====>"+accountName)
									let newAccount = await _models2.default.Account.create({
										lab_ref: findLab !== null ? findLab.id : null,
										hashed_user_id: hashedUserId,
										name: accountName,
										internal_account: true,
										status: "ACTIVE"
									});
									// console.log("newAccount=====>"+JSON.stringify(newAccount))
									let newQrCode = await (0, _accounts.createQrCode)();
									//console.log("newQrCode=====>"+newQrCode)
									await _models2.default.Member.create({
										account_id: newAccount.id,
										first_name: first_name,
										last_name: last_name,
										gender,
										country_code: "+1",
										phone_number: phone,
										is_primary_member: true,
										birth_date: null,
										email: email,
										qr_code: newQrCode,
										status: "ACTIVE"
									});

									if (lab_location_code !== null) {
										let lab_location_codes = lab_location_code.split(",");
										for (let code of lab_location_codes) {
											let findLocation = await _models2.default.LabLocation.findOne({
												where: {
													code: code
												}
											});

											if (findLocation !== null) {
												await _models2.default.AccountLocation.create({
													lab_id: findLab.id,
													lab_location_id: findLocation.id,
													account_id: newAccount.id,
													is_default: true,
													status: "ACTIVE"
												});
											}
										}
									}
									await _models2.default.AccountRole.create({
										role_id: findRole.id,
										account_id: newAccount.id,
										is_default: true,
										status: "ACTIVE"
									});
								}
							}
							resolve("User table loaded successfully");
						}
					}
				}
			});
		} catch (error) {
			console.log("\u274c Error ==> " + error);
			resolve(error);
		}
	});
};

const loadAppScreens = () => {
	return new Promise(async (resolve, reject) => {
		let appScreens = [{ code: "P-001", name: "Location" }, { code: "P-002", name: "Location Test Type" }, { code: "P-003", name: "Roles and Permission" }, { code: "P-004", name: "Test Type" }, { code: "P-005", name: "User and Access" }, { code: "P-006", name: "Dashboard" }, { code: "P-007", name: "Upload Test Results" }, { code: "P-008", name: "Test Results" }, { code: "P-009", name: "Patients" }, { code: "P-010", name: "Compliance Reporting" }, { code: "P-011", name: "Test Uploads" }, { code: "P-012", name: "Provide Feedback" }, { code: "P-013", name: "Application Screens" }, { code: "P-014", name: "Scan Patients" }];
		try {
			for (let screen of appScreens) {
				const { name, code } = screen;
				let findScreenPermission = await _models2.default.ScreenPermission.findOne({
					where: {
						code: code
					}
				});
				if (findScreenPermission === null) {
					await _models2.default.ScreenPermission.create({
						name,
						code,
						status: "ACTIVE"
					});
				}
			}
			resolve("App screens loaded successfully");
		} catch (error) {
			console.log("\u274c Error ==> " + error);
			resolve(error);
		}
	});
};

if (command === "master") {
	try {
		console.log("Loading data from " + argv._[1]);
		if (argv._[1] !== undefined && argv._[1] !== "") {
			loadMasterTable(argv._[1]).then(result => {
				process.exit();
			});
		}
	} catch (error) {
		console.log("error=================>" + error);
	}
}