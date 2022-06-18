import db from "../models";

exports.fetch_all_lab_locations = async (req, res, next) => {
	try {
		let limit = 50;
		let offset = req.query.offset ? parseInt(req.query.offset) : 0;
		let fetchLabLocations = await db.LabLocation.findAll({
			limit: limit,
			offset: offset,
			order: [['id', 'ASC']]
		})
		res.status(200).json({
			status: 'success',
			payload: fetchLabLocations,
			message: 'Lab locations Fetched successfully'
		});

	} catch (error) {
		console.log("Error at fetching Lab locations method- GET / :" + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while fetching Lab locations'
		});
	}
};

exports.create_lab_location = async (req, res, next) => {
    try {
        let { lab_code, code, name, clia, street_address_line1, street_address_line2, city, state, country, zipcode,
            phone_number, timezone, ordering_facility, acuity_ref, status, display_name } = req.body;

		let fetchLabs = await db.Lab.findOne({
			where: {
				code : lab_code
			}
		});

		if (fetchLabs === null) {
            return res.status(200).json({
                status: 'failed',
                payload: null,
                message: 'Invalid lab'
            });
        }
        let new_lab_location = await db.LabLocation.create({
			lab_id : fetchLabs.id,
            lab_code,
            code,
            name,
            lab_name: fetchLabs.name,
            clia,
            street_address_line1,
            street_address_line2,
            city,
            state,
            country,
            zipcode,
            phone_number,
            timezone,
            ordering_facility,
            acuity_ref,           
            status
        });
        res.status(200).json({
            status: 'success',
            payload: new_lab_location,
            message: 'Lab location created successfully'
        });

    } catch (error) {
        console.log("Error at created new location method- GET / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while create lab location'
        });
    }
};

exports.update_lab_location = async (req, res, next) => {
    try {
        let { id } = req.params;

        let { lab_code, code, name, clia, street_address_line1, street_address_line2, city, state, country, zipcode,
            phone_number, timezone, ordering_facility, acuity_ref, status } = req.body;

			let fetchLabs = await db.Lab.findOne({
				where: {
					code : lab_code
				}
			});
	
			if (fetchLabs === null) {
				return res.status(200).json({
					status: 'failed',
					payload: null,
					message: 'Invalid lab'
				});
			}

        let findLocation = await db.LabLocation.findOne({
            where: {
                id: id
            }
        });		
        if (findLocation === null) {
            return res.status(200).json({
                status: 'failed',
                payload: null,
                message: 'Invalid lab location'
            });
        }

        await db.LabLocation.update({
			lab_id: fetchLabs.id,
			lab_code,
			code,
            name,
            lab_name: fetchLabs.name,
            clia,
            street_address_line1,
            street_address_line2,
            city,
            state,
            country,
            zipcode,
            phone_number,
            timezone,
            ordering_facility,
            acuity_ref,           
            status
        }, {
            where: {
                id: id
            }
        });

        let updatedLabLocation = await db.LabLocation.findOne({
            where: {
                id: id
            }
        });

        res.status(200).json({
            status: 'success',
            payload: updatedLabLocation,
            message: 'Lab location fetched successfully'
        });

    } catch (error) {
        console.log("Error at updated Location By Id method- GET / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while lab location'
        });
    }
};
