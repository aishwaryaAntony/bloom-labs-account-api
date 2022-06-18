"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _constants = require("./constants");

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const axios = require('axios');
exports.default = {
	sendMessage(body) {
		return new Promise(async (resolve, reject) => {
			try {
				let data = {};
				data.from = "ACCOUNT_API";
				data.account_token = "12345";

				let token = _jsonwebtoken2.default.sign(data, _constants.JWT_PRIVATE_KEY);
				const instance = axios.create({
					headers: { 'Authorization': 'Bearer ' + token }
				});
				await instance.post(`${_constants.MESSAGE_DOMAIN}message`, body).then(function (response) {
					if (response.statusText === "OK" || response.status === 200) {
						console.log("Message Send Successfully=====================>" + JSON.stringify(response.data));
					} else {
						console.log("Error While sending message api error=====================>");
						console.log(response);
					}
				}).catch(function (error) {
					console.log("Error While sending message api error=====================>" + error);
				});

				resolve("success");
			} catch (error) {
				resolve(null);
				console.log(error);
				console.log("Error While sending message error=====================>" + error);
			}
		});
	}
};