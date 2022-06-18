'use strict';

var _applePass = require('../../../controllers/applePass');

var _applePass2 = _interopRequireDefault(_applePass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const express = require('express');
const router = express.Router();


//router.get('/', applePassController.apple_pass);
router.post('/', _applePass2.default.apple_pass);

module.exports = router;