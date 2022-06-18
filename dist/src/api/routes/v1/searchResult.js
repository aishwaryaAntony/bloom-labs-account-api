'use strict';

var _searchResult = require('../../../controllers/searchResult');

var _searchResult2 = _interopRequireDefault(_searchResult);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();

router.get('/', _searchResult2.default.search_member);

module.exports = router;