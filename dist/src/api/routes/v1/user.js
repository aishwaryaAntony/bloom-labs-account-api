'use strict';

var _user = require('../../../controllers/user');

var _user2 = _interopRequireDefault(_user);

var _checkAuth = require('../../../middleware/check-auth');

var _checkAuth2 = _interopRequireDefault(_checkAuth);

var _attachments = require('../../../helpers/attachments');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();


router.post('/login', _user2.default.login);

router.post('/verify-otp', _user2.default.verify_otp_credentials);

router.post('/login-internal-user', _user2.default.login_internal_user);

router.post('/verify-internal-user', _user2.default.verify_internal_user);

router.post('/change-password', _user2.default.change_password);

router.get('/authenticate', _checkAuth2.default, _user2.default.authenticate);

router.get('/validate-token', _checkAuth2.default, _user2.default.validate_token);

router.post('/create-new-account', _attachments.upload.fields([{ name: 'id_image_file', maxCount: 1 }, { name: 'insurance_front_file', maxCount: 1 }, { name: 'insurance_back_file', maxCount: 1 }]), _user2.default.create_new_account);

router.post('/forgot-password', _user2.default.forgotPassword);

router.post('/reset-password', _user2.default.resetPassword);

router.get('/qr-code/:qrCode', _user2.default.createQRCode);

router.get('/internal-users', _user2.default.fetchAllInternalUsers);

router.post('/create-new-internal-user', _user2.default.createInternalUser);

router.put('/update-internal-user/:id', _user2.default.updateInternalUser);

router.post('/send-qr-code', _user2.default.sendQRCode);

module.exports = router;