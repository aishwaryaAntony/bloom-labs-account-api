import db from "../models";
import moment from "moment";

exports.create_submitted_test_form = async (req, res, next) => {
	try {
        const { member_token, form_detail, submitted_date, submitted_at } = req.body;

        let newForm = await db.SubmittedTestForm.create({
            member_token,
            form_detail,
            submitted_date: moment(submitted_date).format("MM-DD-YYYY"),
            submitted_at
        });
		res.status(200).json({
			status: 'success',
			payload: newForm,
			message: 'Submitted Test Form created successfully'
		});

	} catch (error) {
		console.log("Error at creating submitted test form method - POST / :" + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while creating submitted test form'
		});
	}
};
