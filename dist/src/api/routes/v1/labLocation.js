'use strict';

var _labLocation = require('../../../controllers/labLocation');

var _labLocation2 = _interopRequireDefault(_labLocation);

var _checkAuth = require('../../../middleware/check-auth');

var _checkAuth2 = _interopRequireDefault(_checkAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();


/**
 * @swagger
 *  /lab-locations:
 *    get:
 *     summary: Fetch all lab locations 
 *     description: "Fetch all lab locations data Created_by: Gopinath"
 *     tags: [LabLocation]
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
 *                 $ref: "#/definitions/LabLocation"
 *            message:
 *              type: string
 *              example: "Lab locations fetched successfully"
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
 *            message: "Error while fetching lab locations"
 */
router.get('/', _checkAuth2.default, _labLocation2.default.fetch_all_lab_locations);
router.post('/', _checkAuth2.default, _labLocation2.default.create_lab_location);
router.put('/:id', _checkAuth2.default, _labLocation2.default.update_lab_location);

module.exports = router;