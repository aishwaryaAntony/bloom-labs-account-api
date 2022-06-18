import { JWT_PRIVATE_KEY, MESSAGE_DOMAIN } from "./constants";
const axios = require('axios');
import jwt from "jsonwebtoken";

export default {
	sendMessage(body) {
		return new Promise(async (resolve, reject) => {
			try {
				let data = {};
				data.from = "ACCOUNT_API";
				data.account_token = "12345";

				let token = jwt.sign(data, JWT_PRIVATE_KEY);
				const instance = axios.create({
					headers: { 'Authorization': 'Bearer ' + token }
				});
				await instance.post(`${MESSAGE_DOMAIN}message`, body).then(function (response) {
					if (response.statusText === "OK" || response.status === 200) {
						console.log("Message Send Successfully=====================>" + JSON.stringify(response.data));
					} else {
						console.log("Error While sending message api error=====================>");
						console.log(response)
					}
				}).catch(function (error) {
					console.log("Error While sending message api error=====================>" + error);
				});

				resolve("success")

			} catch (error) {
				resolve(null)
				console.log(error)
				console.log("Error While sending message error=====================>" + error)
			}
		});
	}
}