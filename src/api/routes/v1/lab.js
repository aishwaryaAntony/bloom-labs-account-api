var express = require('express');
var router = express.Router();
import labController from '../../../controllers/lab';
import checkAuth from "../../../middleware/check-auth"

/**
 * @swagger
 *  /labs:
 *    get:
 *     summary: Fetch all labs 
 *     description: "Fetch all labs data Created_by: Gopinath"
 *     tags: [Lab]
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
 *                 $ref: "#/definitions/Lab"
 *            message:
 *              type: string
 *              example: "Labs fetched successfully"
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
 *            message: "Error while fetching labs"
 */
router.get('/', checkAuth, labController.fetch_all_labs);

module.exports = router;
