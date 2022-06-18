"use strict";

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

var _sequelize = require("sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.search_member = async (req, res, next) => {
    try {
        let { search } = req.query;
        console.log("====search=====" + search);

        let searchAllMember = await _models2.default.Member.findAll({
            where: {
                [_sequelize.Op.or]: [{
                    first_name: {
                        [_sequelize.Op.iLike]: `%${search}%`
                    }
                }, {
                    middle_name: {
                        [_sequelize.Op.iLike]: `%${search}%`
                    }
                }, {
                    last_name: {
                        [_sequelize.Op.iLike]: `%${search}%`
                    }
                }, {
                    phone_number: {
                        [_sequelize.Op.iLike]: `%${search}%`
                    }
                }, {
                    email: {
                        [_sequelize.Op.iLike]: `%${search}%`
                    }
                }]
            }
        });
        console.log("========searchAllMember==========" + JSON.stringify(searchAllMember));
        let memberObj = {};
        memberObj.members = searchAllMember;
        res.status(200).json({
            status: 'success',
            payload: memberObj,
            message: 'search member fetched successfully'
        });
    } catch (error) {
        console.log("Error at  searching member method- GET / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while searching member'
        });
    }
};