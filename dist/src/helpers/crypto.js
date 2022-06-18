'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _constants = require('./constants');

var crypto = require('crypto');
exports.default = {

    /**
    *  hash string from parameter
    */
    hash_from_string(text) {
        return new Promise(async (resolve, reject) => {
            let data = text.toString();
            let hash = crypto.createHash('sha256', _constants.ENCRYPTION_KEY).update(data).digest('hex');
            resolve(hash);
        });
    }

};