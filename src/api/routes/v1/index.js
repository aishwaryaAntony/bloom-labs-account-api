var express = require('express');
var router = express.Router();
import db from '../../../models';
import crypto from "../../../helpers/crypto";
import { createVerificationCode } from "../../../helpers/accounts";
import { NODE_ENV, S3_BUCKETS } from "../../../helpers/constants";
import { getImage } from "../../../helpers/attachments";
import MessageUtils from '../../../helpers/MessageUtils';
const cp = require('child_process');
const path = require("path");
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../../config/config.js')[env];

/* GET home page. */
router.get('/', async (req, res, next) => {
	res.json({
		payload: null
	})
});

router.post('/verify-phone', async (req, res, next) => {
	try {
		let { phone, country_code } = req.body;
		console.log(`${JSON.stringify(req.body)}`)
		let otp = NODE_ENV === "development" ? "000000" : await createVerificationCode();
		console.log(`otp=>${otp}`)
		let message = "Hi, Please use the verification code to verify your phone number - " + otp + ".";
		// let phone_number = `${country_code}${phone}`;
		//smsUtils.sendSms(phone_number, message);
		let message_data = {};
		message_data.member_token = null;
		message_data.name = "User";
		message_data.phone_number = phone;
		message_data.country_code = country_code;
		message_data.email = null;
		message_data.type = "SMS";
		message_data.description = message;
		message_data.message_purpose = "OTP";
		message_data.email_content = null;
		MessageUtils.sendMessage(message_data);

		res.status(200).json({
			status: 'success',
			payload: otp,
			message: 'Successfully otp sent'
		});

	} catch (error) {
		console.log("Error ==> " + JSON.stringify(error))
		res.status(500).json({
			status: 'failed',
			payload: {},
			message: 'Error '
		});
	}
});

router.post('/verify-email', async (req, res, next) => {
	try {
		let { email } = req.body;
		let otp = NODE_ENV === "development" ? "000000" : await createVerificationCode();
		let data = {};
		data.verification_code = otp;
		// send_mail("OTP", email, `User`, data);
		let message_data = {};
		message_data.member_token = null;
		message_data.name = "User";
		message_data.phone_number = null;
		message_data.country_code = null;
		message_data.email = email;
		message_data.type = "EMAIL";
		message_data.description = "Verify OTP mail send to " + email;
		message_data.message_purpose = "OTP";
		message_data.email_content = data;
		MessageUtils.sendMessage(message_data);

		res.status(200).json({
			status: 'success',
			payload: otp,
			message: 'Successfully otp sent'
		});

	} catch (error) {
		console.log("Error ==> " + JSON.stringify(error))
		res.status(500).json({
			status: 'failed',
			payload: {},
			message: 'Error '
		});
	}
});


router.get('/internal/healthcheck', async (req, res, next) => {
	res.status(200).json({
		status: 'success',
	});
});


router.post('/internal/run-script', async (req, res, next) => {
	try {
		const { filename, secret_key } = req.body;
		if (secret_key === "BL00M") {
			if (filename !== undefined && filename !== null && filename !== "") {
				let filepath = path.join(__dirname, `../../../../dbscripts/${filename}`);
				cp.exec(`sh ${filepath}`, function (err, stdout, stderr) {
					// handle err, stdout, stderr
					let message = null;
					if (stderr) {
						console.error(`error==> ${stderr}`);
						message = stderr;
					}
					console.log(`success===> ${stdout}`);
					message = stdout;
					res.status(200).json({
						status: 'success',
						message: message
					});
				});
			} else {
				console.log("Error while running script file ==> " + error);
				res.status(500).json({
					status: "failed",
					payload: {},
					message: "Error while running script file",
				});
			}
		} else {
			console.log("key error");
			res.status(500).json({
				status: "failed",
				payload: {},
				message: "Error while running script file",
			});
		}

	} catch (error) {
		console.log("Error while running script file ==> " + error);
		res.status(500).json({
			status: "failed",
			payload: {},
			message: "Error while running script file",
		});
	}
});


router.get('/internal/db-check', async (req, res, next) => {
	let sequelize = new Sequelize(config.database, config.username, config.password, config);

	try {
		await sequelize.authenticate()
		console.log('Connection has been established successfully.');
		res.status(200).json({
			status: 'success'
		});
	} catch (err) {
		console.error('Unable to connect to the database:', err)
		res.status(500).json({
			status: 'failed'
		});
	}
});


router.post('/add-pages', async (req, res, next) => {
	try {
		let { pages, role_code, secret_key } = req.body;
		if (secret_key !== "BL00M") {
			return res.json({
				status: "failed",
				payload: null,
				message: 'invalid key',
			});
		}
		let findRole = await db.Role.findOne({
			where: {
				code: role_code
			}
		});

		if (findRole === null) {
			return res.json({
				status: "failed",
				payload: null,
				message: 'invalid role',
			});
		}
		console.log(JSON.stringify(pages))

		console.log(JSON.stringify(findRole.permission))
		let permissionSetObj = { ...findRole.permission, ...pages }
		console.log(JSON.stringify(permissionSetObj))

		await db.Role.update({
			permission: permissionSetObj
		}, {
			where: {
				code: findRole.code
			}
		});

		res.status(200).json({
			status: 'success',
			payload: null,
			message: 'Successfully pages added'
		});

	} catch (error) {
		console.log("Error ==> " + (error))
		res.status(500).json({
			status: 'failed',
			payload: {},
			message: 'Error '
		});
	}
});

router.get('/image/:type/:imagename', async (req, res, next) => {
    try {
        let { imagename, type } = req.params;

        let findBucket = S3_BUCKETS.find(x => x.code === type);

        if (findBucket === undefined) {
            res.status(500).json({
                status: 'failed',
                payload: {},
                message: 'Error '
            });
        }

        var params = { Bucket: findBucket.bucketName, Key: imagename };

        let data = await getImage(params);

        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(data.Body, 'binary');
        res.end(null, 'binary');
        data.Body.toString('utf-8');

    } catch (error) {
        console.log("Error ==> " + JSON.stringify(error))
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error '
        });
    }
});

module.exports = router;