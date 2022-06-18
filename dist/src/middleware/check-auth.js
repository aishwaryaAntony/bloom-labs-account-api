"use strict";

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _index = require("../models/index");

var _index2 = _interopRequireDefault(_index);

var _crypto = require("../helpers/crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _constants = require("../helpers/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = async (req, res, next) => {
    try {
        const headers = req.headers;
        if (headers.hasOwnProperty('authorization')) {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = _jsonwebtoken2.default.verify(token, _constants.JWT_PRIVATE_KEY);
            req.userData = decoded;
            // console.log(`Decoded -> ${JSON.stringify(decoded)}`)

            if (Object.keys(decoded).length > 0) {

                if (decoded.userId !== undefined) {
                    let hashedUserId = await _crypto2.default.hash_from_string(decoded.userId);
                    let fetchAccount = await _index2.default.Account.findOne({ where: { hashed_user_id: hashedUserId } });
                    if (fetchAccount === null) {
                        return res.status(401).json({
                            status: 'failed',
                            message: 'Auth failed'
                        });
                    }
                    if (decoded.account_token !== null && decoded.account_token !== undefined) {
                        if (fetchAccount.account_token !== decoded.account_token) {
                            return res.status(401).json({
                                status: 'failed',
                                message: 'Auth failed'
                            });
                        }
                    }
                } else {
                    // Request from other services
                    let account_token = decoded.account_token;
                    if (account_token !== "12345") {
                        return res.status(401).json({
                            status: 'failed',
                            message: 'Auth failed'
                        });
                    }
                }
            } else {
                return res.status(401).json({
                    status: 'failed',
                    message: 'Auth failed'
                });
            }

            next();
        } else {
            return res.status(401).json({
                status: 'failed',
                message: 'Auth failed'
            });
        }
    } catch (error) {
        return res.status(401).json({
            status: 'failed',
            message: 'Auth failed'
        });
    }
};