'use strict';

var _acuity = require('../../../controllers/acuity');

var _acuity2 = _interopRequireDefault(_acuity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const express = require('express');
const router = express.Router();


router.get('/', _acuity2.default.fetchAppointmentDates);

router.get('/appointment-times', _acuity2.default.fetchAppointmentTimes);

router.get('/appointment-slots', _acuity2.default.fetchAppointmentWithTimes);

router.post('/make-appointment', _acuity2.default.makeUserAppointment);

router.delete('/cancel-appointment/:id', _acuity2.default.cancelUserAppointment);

module.exports = router;