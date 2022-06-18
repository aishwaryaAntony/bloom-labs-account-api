'use strict';

var _submittedTestForm = require('../../../controllers/submittedTestForm');

var _submittedTestForm2 = _interopRequireDefault(_submittedTestForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();


router.post('/', _submittedTestForm2.default.create_submitted_test_form);

module.exports = router;