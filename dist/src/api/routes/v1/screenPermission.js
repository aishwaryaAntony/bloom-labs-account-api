'use strict';

var _screenPermission = require('../../../controllers/screenPermission');

var _screenPermission2 = _interopRequireDefault(_screenPermission);

var _checkAuth = require('../../../middleware/check-auth');

var _checkAuth2 = _interopRequireDefault(_checkAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();


router.get('/', _checkAuth2.default, _screenPermission2.default.fetch_all_screens);

router.post('/', _checkAuth2.default, _screenPermission2.default.create_screen);

router.put('/:id', _checkAuth2.default, _screenPermission2.default.update_screen);

module.exports = router;