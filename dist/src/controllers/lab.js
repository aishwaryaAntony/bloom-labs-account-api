'use strict';

var _models = require('../models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.fetch_all_labs = async (req, res, next) => {
	try {
		let limit = 50;
		let offset = req.query.offset ? parseInt(req.query.offset) : 0;
		let fetchLabs = await _models2.default.Lab.findAll({
			limit: limit,
			offset: offset,
			order: [['id', 'ASC']],
			include: [{
				model: _models2.default.LabLocation,
				as: "labLocations"
			}]
		});

		res.status(200).json({
			status: 'success',
			payload: fetchLabs,
			message: 'Labs Fetched successfully'
		});
	} catch (error) {
		console.log("Error at fetching Labs method- GET / :" + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while fetching Labs'
		});
	}
};