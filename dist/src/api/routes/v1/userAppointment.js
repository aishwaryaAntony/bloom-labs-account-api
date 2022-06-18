'use strict';

var _userAppointment = require('../../../controllers/userAppointment');

var _userAppointment2 = _interopRequireDefault(_userAppointment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const express = require('express');
const router = express.Router();


router.get('/:acuity_appointment_id', _userAppointment2.default.fetchUserAppointment);

router.delete('/:acuity_appointment_id', _userAppointment2.default.deleteUserAppointment);

module.exports = router;