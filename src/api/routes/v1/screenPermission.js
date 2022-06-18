var express = require('express');
var router = express.Router();
import screenPermissionController from '../../../controllers/screenPermission';
import checkAuth from "../../../middleware/check-auth"

router.get('/', checkAuth, screenPermissionController.fetch_all_screens);

router.post('/', checkAuth, screenPermissionController.create_screen);

router.put('/:id', checkAuth, screenPermissionController.update_screen);

module.exports = router;
