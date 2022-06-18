var express = require('express');
var router = express.Router();
import accountController from '../../../controllers/account';
import checkAuth from "../../../middleware/check-auth"
 
/**
 * @swagger
 *  /accounts/account-members:
 *    get:
 *     summary: Fetch all account members 
 *     description: "Fetch all account members data Created_by: Prabhu"
 *     tags: [Account]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: offset
 *         in: query
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *        description: "A successful response"
 *        application/json:
 *        schema:
 *          type: object
 *          properties:
 *            status:
 *              type: string
 *              example: "success"
 *            payload:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/Account"
 *            message:
 *              type: string
 *              example: "Account Members fetched successfully"
 *       500:
 *        description: "Internal Server Error"
 *        application/json:
 *        schema:
 *          type: object
 *          properties:
 *            status:
 *              type: string
 *            payload:
 *              type: string
 *              nullable: true
 *            message:
 *              type: string
 *          example:
 *            status: "failed"
 *            payload: null
 *            message: "Error while fetching members"
 */
router.get('/account-members', checkAuth, accountController.fetch_account_members);

router.get('/', checkAuth, accountController.fetch_user_accounts);

module.exports = router;
