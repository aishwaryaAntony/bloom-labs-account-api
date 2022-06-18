var express = require('express');
var router = express.Router();
import userController from '../../../controllers/user';
import checkAuth from "../../../middleware/check-auth";
import { upload } from "../../../helpers/attachments";

router.post('/login', userController.login);

router.post('/verify-otp', userController.verify_otp_credentials);

router.post('/login-internal-user', userController.login_internal_user);

router.post('/verify-internal-user', userController.verify_internal_user);

router.post('/change-password', userController.change_password);

router.get('/authenticate', checkAuth, userController.authenticate);

router.get('/validate-token', checkAuth, userController.validate_token);

router.post('/create-new-account', upload.fields([{ name: 'id_image_file', maxCount: 1 }, { name: 'insurance_front_file', maxCount: 1 }, { name: 'insurance_back_file', maxCount: 1 }]), userController.create_new_account);

router.post('/forgot-password', userController.forgotPassword);

router.post('/reset-password', userController.resetPassword);

router.get('/qr-code/:qrCode', userController.createQRCode);

router.get('/internal-users', userController.fetchAllInternalUsers);

router.post('/create-new-internal-user', userController.createInternalUser);

router.put('/update-internal-user/:id', userController.updateInternalUser);

router.post('/send-qr-code', userController.sendQRCode);

router.put('/change-internal-user-role/:id', userController.changeInternalUserRole);

module.exports = router;
