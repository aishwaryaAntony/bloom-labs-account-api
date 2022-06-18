import db from '../models';


exports.fetchUserAppointment = async (req, res, next) => {
	try {
		let { acuity_appointment_id } = req.params;

		if(acuity_appointment_id === undefined){
			return res.json({
				status: "failed",
				payload: null,
				message: "User Appointment doesn't exist",
			});
		}

		let findUserAppointment = await db.UserAppointment.findOne({
			where: {
				acuity_appointment_id: acuity_appointment_id
			},
			include:[
				{
					model: db.Member,
					as: "member",
					attributes: ['race', 'ethnicity', 'driver_license_number', 'ssn', 'passport_number', 'address_line1', 'address_line2', 'city', 'state', 'country', 'zipcode', 'gender', 'birth_date', 'qr_code']
				}
			]
		});

		if (findUserAppointment === null) {
			return res.json({
				status: "failed",
				payload: null,
				message: "User Appointment doesn't exist",
			});
		}

		res.status(200).json({
			status: "success",
			payload: findUserAppointment,
			message: "User Appointment successfully fetched",
		});
	} catch (error) {
		console.log("Error while fetching user appointment ==> " + error);
		res.status(200).json({
			status: "failed",
			payload: {},
			message: "Error while fetching user appointment",
		});
	}
}

exports.deleteUserAppointment = async (req, res, next) => {
	try {
		let { acuity_appointment_id } = req.params;

		let findUserAppointment = await db.UserAppointment.findOne({
			where: {
				acuity_appointment_id: acuity_appointment_id
			}
		});

		if (findUserAppointment === null) {
			return res.json({
				status: "failed",
				payload: null,
				message: "User Appointment doesn't exist",
			});
		}

		await db.UserAppointment.destroy({
			where: {
				acuity_appointment_id: acuity_appointment_id
			}
		});

		res.status(200).json({
			status: "success",
			payload: null,
			message: "User Appointment successfully deleted",
		});
	} catch (error) {
		console.log("Error while deleting user appointment ==> " + error);
		res.status(200).json({
			status: "failed",
			payload: {},
			message: "Error while deleting user appointment",
		});
	}
}