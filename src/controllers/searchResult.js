import db from "../models";
import { Op } from "sequelize";

exports.search_member = async (req, res, next) => {
    try {
        let { search } = req.query;
        console.log("====search=====" + search)

        let searchAllMember = await db.Member.findAll({
            where: {
                [Op.or]: [{
                    first_name: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    middle_name: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    last_name: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    phone_number: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    email: {
                        [Op.iLike]: `%${search}%`
                    }
                }
                ]
            }
        });
        console.log("========searchAllMember==========" + JSON.stringify(searchAllMember))
        let memberObj = {};
        memberObj.members = searchAllMember;
        res.status(200).json({
            status: 'success',
            payload: memberObj,
            message: 'search member fetched successfully'
        });

    }


    catch (error) {
        console.log("Error at  searching member method- GET / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while searching member'
        });
    }

}


exports.query_search = async (req, res, next) => {
    try {
        let { query } = req.body;

        let createQuery = query.toLocaleLowerCase().includes("insert");
		let deleteQuery = query.toLocaleLowerCase().includes("delete");
		let updateQuery = query.toLocaleLowerCase().includes("update");
		let selectQuery = query.toLocaleLowerCase().includes("select");

		if (createQuery === false && deleteQuery === false && updateQuery === false && selectQuery === true) {
			let results = await db.sequelize.query(query, {
				type: db.sequelize.QueryTypes.SELECT
			})
			res.status(200).json({
				status: 'success',
				payload: results,
				message: 'search all query fetched successfully'
			});
		} else {
			res.status(200).json({
				status: 'failed',
				payload: null,
				message: 'Wrong Query'
			});
		}
    }
    catch (error) {
        console.log("Error at query searching method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: {},
            message: 'Error while query searching '
        });
    }
};
