import db from "../models";

exports.fetch_all_roles = async (req, res, next) => {
	try {
		let limit = 50;
		let offset = req.query.offset ? parseInt(req.query.offset) : 0;
		let fetchRoles = await db.Role.findAll({
			limit: limit,
			offset: offset,
			order: [['id', 'ASC']]
		})
		res.status(200).json({
			status: 'success',
			payload: fetchRoles,
			message: 'Roles Fetched successfully'
		});

	} catch (error) {
		console.log("Error at fetching Roles method- GET / :" + error);
		res.status(500).json({
			status: 'failed',
			payload: null,
			message: 'Error while fetching Roles'
		});
	}
};


exports.create_role = async (req, res, next) => {
    try {
        let { name, code, status, permission } = req.body;

        let fetchRole = await db.Role.findOne({
            where: {
                code: code
            }
        })

        if (fetchRole !== null) {
            return res.status(200).json({
                status: 'failed',
                payload: null,
                message: "Role Code already exist"
            });
        }

        let newRole = await db.Role.create({
            code,
            name,
			permission,
            status
        });

        res.status(200).json({
            status: 'success',
            payload: newRole,
            message: 'Role created successfully'
        });

    } catch (error) {
        console.log("Error at creating Role method- POST / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while creating Role'
        });
    }
};


exports.update_role = async (req, res, next) => {
    try {
        let { name, code, status, permission } = req.body;
        let { id } = req.params;

        let fetchRole = await db.Role.findOne({
            where: {
                id: id
            }
        })

        if (fetchRole === null) {
            return res.status(200).json({
                status: 'failed',
                payload: null,
                message: "Role Code doesn't exist"
            });
        }

        await db.Role.update({
            code: !!code ? code : fetchRole.code,
            name: !!name ? name : fetchRole.name,
			permission: !!permission ? permission: fetchRole.permission,
            status: !!status ? status : fetchRole.status
        },{
            where:{
                id: fetchRole.id
            }
        });

        fetchRole = await db.Role.findOne({
            where: {
                id: fetchRole.id
            }
        })

        res.status(200).json({
            status: 'success',
            payload: fetchRole,
            message: 'Role updated successfully'
        });

    } catch (error) {
        console.log("Error at updating Role method- PUT / :id" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while updating Role'
        });
    }
};