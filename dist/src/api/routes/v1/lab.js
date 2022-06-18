'use strict';

var _lab = require('../../../controllers/lab');

var _lab2 = _interopRequireDefault(_lab);

var _checkAuth = require('../../../middleware/check-auth');

var _checkAuth2 = _interopRequireDefault(_checkAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();


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
router.get('/', _checkAuth2.default, _lab2.default.fetch_all_labs);

module.exports = router;