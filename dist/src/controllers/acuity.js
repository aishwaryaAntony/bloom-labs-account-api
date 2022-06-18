"use strict";

var _acuity = require("../helpers/acuity");

var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const moment = require("moment");

exports.fetchAppointmentDates = async (req, res, next) => {
    try {
        let { calendarId = 6306720, appointmentTypeID = 28950776 } = req.query;
        let monthArray = [moment().format('YYYY-MM'), moment().add(1, 'months').format('YYYY-MM'), moment().add(2, 'months').format('YYYY-MM')];
        // let appointmentTypeID = 28950776;
        // let calendarId = 6306720;
        let appointmentAray = [];
        // let url = `availability/dates?appointmentTypeID=28950776&month=2021-12&calendarID=6306720&timezone=America/New_York`;
        for (let month of monthArray) {
            let appointment = await (0, _acuity.fetchAcuityAvailableDate)(appointmentTypeID, calendarId, month);
            appointmentAray.push(...appointment);
        }

        res.status(200).json({
            status: 'success',
            payload: appointmentAray
        });
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            payload: error
        });
    }
};

exports.fetchAppointmentTimes = async (req, res, next) => {
    try {
        let { date, appointmentTypeID = 28950776, calendarId = 6306720 } = req.query;
        // let appointmentTypeID = 28950776;
        // let calendarId = 6306720;
        // let url = `availability/times?appointmentTypeID=123&calendarID=123&date=2016-02-04`;
        let appointments = await (0, _acuity.fetchAvailableTimeByDate)(appointmentTypeID, calendarId, date);
        res.status(200).json({
            status: 'success',
            payload: appointments
        });
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            payload: error
        });
    }
};

exports.fetchAppointmentWithTimes = async (req, res, next) => {
    try {
        let { appointmentTypeID = 28950776, calendarId = 6306720, start = 0, end = 5 } = req.query;
        // let monthArray = [ moment().format('YYYY-MM'), moment().add(1, 'months').format('YYYY-MM'), moment().add(2, 'months').format('YYYY-MM') ];
        // let monthArray = [ moment().format('YYYY-MM')];

        let appointmentArray = [];
        for (let i = parseInt(start); i < parseInt(end); i++) {
            let date = moment().add(i, 'days').format('YYYY-MM-DD');
            await appointmentArray.push(date);
        }

        // console.log(`Today - ${moment().format('YYYY-MM-DD')}\nZero -> ${moment().add(0, 'days').format('YYYY-MM-DD')} \nStart -> ${start} - ${startDate} \nEnd -> ${endDate}\n`);
        // let appointmentArray = [];
        // for(let month of monthArray){
        //     let appointment = await fetchAcuityAvailableDate(appointmentTypeID, calendarId, month);
        //     appointmentArray.push(...appointment);
        // }

        // let appointmentDateArray = appointmentAray.slice(start, end);

        let appointments = await (0, _acuity.fetchAvailableDateWithTime)(appointmentTypeID, calendarId, appointmentArray);
        res.status(200).json({
            status: 'success',
            payload: appointments
        });
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            payload: error
        });
    }
};

exports.makeUserAppointment = async (req, res, next) => {
    try {
        let { appointmentTypeID = 28950776, calendarId = 6306720, appointment_time, member_ref, verified_by } = req.body;

        let result = await (0, _acuity.checkIfSlotAvailable)(appointmentTypeID, calendarId, appointment_time);
        if (result.valid !== undefined && result.valid === true) {
            let createAppointmentInAcuity = await (0, _acuity.makeAppointment)(req.body);

            // console.log(`Create Appointment ==> ${JSON.stringify(createAppointmentInAcuity)}`);
            let findUserAppointment = await _models2.default.UserAppointment.findOne({
                where: {
                    acuity_appointment_id: createAppointmentInAcuity.id.toString()
                }
            });
            // console.log(`Step 1 ==> `)
            // console.log(`Step 2 ==> ${findUserAppointment}`)
            if (findUserAppointment !== null) {
                return res.json({
                    status: "failed",
                    payload: null,
                    message: "User Appointment already exist"
                });
            }

            let { first_name, last_name, phone_number, country_code, email, location_id, test_type_id,
                location_test_type_id, appointment_date, location_name, test_type_name, test_type_description, price } = req.body;
            let phone = phone_number.toString().replace(/\D/g, "");
            console.log(phone_number + "<=======phone======>" + phone);
            await _models2.default.UserAppointment.create({
                first_name,
                last_name,
                phone_number: phone,
                country_code: country_code,
                email: email,
                location_id,
                test_type_id,
                location_test_type_id,
                appointment_date,
                appointment_time,
                acuity_appointment_id: createAppointmentInAcuity.id,
                location_name: location_name,
                test_type_name: test_type_name,
                test_type_description: test_type_description,
                price,
                member_ref,
                verified_by,
                status: "ACTIVE"
            });

            // console.log(`createUserAppointment --> ${JSON.stringify(createUserAppointment)}`);
            res.status(200).json({
                status: "success",
                payload: createAppointmentInAcuity,
                message: "User Appointment successfully created"
            });
        } else {
            res.status(200).json({
                status: 'failed',
                payload: null,
                message: `The time ${moment(result.datetime).format('YYYY-MM-DD h:mm a')} is completed. Kindly try again with different time slot.`
            });
        }
    } catch (error) {
        console.log(`Error ===> ${error}`);
        res.status(200).json({
            status: 'failed',
            payload: error
        });
    }
};

exports.cancelUserAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (id === undefined || id === null || id === "") {
            return res.json({
                status: "failed",
                payload: null,
                message: "User Appointment doesn't exist"
            });
        }

        let findUserAppointment = await _models2.default.UserAppointment.findOne({
            where: {
                acuity_appointment_id: id
            }
        });

        if (findUserAppointment === null) {
            return res.json({
                status: "failed",
                payload: null,
                message: "User Appointment doesn't exist"
            });
        }

        await (0, _acuity.deleteUserAppointment)(id);

        await _models2.default.UserAppointment.destroy({
            where: {
                acuity_appointment_id: id
            }
        });

        res.status(200).json({
            status: "success",
            payload: null,
            message: "User Appointment successfully deleted"
        });
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            payload: error
        });
    }
};