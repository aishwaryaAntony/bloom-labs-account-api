import db from "../models";

exports.fetch_account_members = async (req, res, next) => {
    try {

        let account_token = req.userData.account_token;

        let limit = 50;

        let offset = req.query.offset ? parseInt(req.query.offset) : 0;
        let findAccount = await db.Account.findOne({
            where: {
                account_token: account_token
            },
        })

        if (findAccount === null) {
            return res.status(500).json({
                status: 'failed',
                payload: null,
                message: "Account doesn't exist"
            });
        }

        let fetchMembers = await db.Member.findAll({
            where: {
                account_id: findAccount.id
            },
            attributes: ['id','email', 'full_name', 'member_token', 'country_code', 'phone_number', 'gender', 'birth_date', 'qr_code'],
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']]
        });

        res.status(200).json({
            status: 'success',
            payload: fetchMembers,
            message: 'Account Members Fetched successfully'
        });

    } catch (error) {
        console.log("Error at fetching account members method- GET / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while fetching account members'
        });
    }
};

exports.fetch_user_accounts = async (req, res, next)=> {
    try {
        // let offset = req.query.offset ? parseInt(req.query.offset) : 0;
        let findAccount = await db.Account.findAll({});

        // if (findAccount === null) {
        //     return res.status(500).json({
        //         status: 'failed',
        //         payload: null,
        //         message: "Account doesn't exist"
        //     });
        // }

        // let fetchMembers = await db.Member.findAll({
        //     where: {
        //         account_id: findAccount.id
        //     },
        //     attributes: ['id','email', 'full_name', 'member_token', 'country_code', 'phone_number', 'gender', 'birth_date', 'qr_code'],
        //     limit: limit,
        //     offset: offset,
        //     order: [['id', 'ASC']]
        // });

        res.status(200).json({
            status: 'success',
            payload: findAccount,
            message: 'Account Fetched successfully'
        });

    } catch (error) {
        console.log("Error at fetching account method- GET / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while fetching accounts'
        });
    }
}