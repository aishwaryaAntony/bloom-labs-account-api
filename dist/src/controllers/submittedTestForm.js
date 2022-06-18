"use strict";

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.create_submitted_test_form = async (req, res, next) => {
	try {
		const { member_token, form_detail, submitted_date, submitted_at } = req.body;

		let newForm = await _models2.default.SubmittedTestForm.create({
			member_token,
			form_detail,
			submitted_date: (0, _moment2.default)(submitted_date).format("MM-DD-YYYY"),
			submitted_at
		});
		res.status(200).json({
			status: 'success',
			payload: newForm,
			message: 'Submitted Test Form created successfully'
		});
	} catch (error) {
		console.log("Error at creating submitted test form method - POST / :" + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while creating submitted test form'
		});
	}
};