'use strict';

var _models = require('../models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.fetch_all_screens = async (req, res, next) => {
    try {
        let limit = 50;
        let offset = req.query.offset ? parseInt(req.query.offset) : 0;
        let fetchScreenPermissions = await _models2.default.ScreenPermission.findAll({
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']]
        });
        res.status(200).json({
            status: 'success',
            payload: fetchScreenPermissions,
            message: 'Screen Permission Fetched successfully'
        });
    } catch (error) {
        console.log("Error at fetching Screen Permission method- GET / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while fetching Screen Permission'
        });
    }
};

exports.create_screen = async (req, res, next) => {
    try {
        let { name, code, status } = req.body;

        let fetchScreenPermission = await _models2.default.ScreenPermission.findOne({
            where: {
                code: code
            }
        });

        if (fetchScreenPermission !== null) {
            return res.status(200).json({
                status: 'failed',
                payload: null,
                message: "Screen Permission Code already exist"
            });
        }

        let newScreenPermission = await _models2.default.ScreenPermission.create({
            code,
            name,
            status
        });

        res.status(200).json({
            status: 'success',
            payload: newScreenPermission,
            message: 'Screen Permission created successfully'
        });
    } catch (error) {
        console.log("Error at creating Screen Permission method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while creating Screen Permission'
        });
    }
};

exports.update_screen = async (req, res, next) => {
    try {
        let { name, code, status } = req.body;

        let { id } = req.params;

        let fetchScreenPermission = await _models2.default.ScreenPermission.findOne({
            where: {
                id: id
            }
        });

        if (fetchScreenPermission === null) {
            return res.status(200).json({
                status: 'failed',
                payload: null,
                message: "Screen Permission Code doesn't exist"
            });
        }

        await _models2.default.ScreenPermission.update({
            code: !!code ? code : fetchScreenPermission.code,
            name: !!name ? name : fetchScreenPermission.name,
            status: !!status ? status : fetchScreenPermission.status
        }, {
            where: {
                id: fetchScreenPermission.id
            }
        });

        fetchScreenPermission = await _models2.default.ScreenPermission.findOne({
            where: {
                id: fetchScreenPermission.id
            }
        });

        res.status(200).json({
            status: 'success',
            payload: fetchScreenPermission,
            message: 'Screen Permission updated successfully'
        });
    } catch (error) {
        console.log("Error at updating Screen Permission method- PUT / :id" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while updating Screen Permission'
        });
    }
};