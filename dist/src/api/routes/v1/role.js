'use strict';

var _role = require('../../../controllers/role');

var _role2 = _interopRequireDefault(_role);

var _checkAuth = require('../../../middleware/check-auth');

var _checkAuth2 = _interopRequireDefault(_checkAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();


/**
 * @swagger
 *  /roles:
 *    get:
 *     summary: Fetch all roles 
 *     description: "Fetch all roles data Created_by: Gopinath"
 *     tags: [Role]
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
 *                 $ref: "#/definitions/Role"
 *            message:
 *              type: string
 *              example: "Roles fetched successfully"
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
 *            message: "Error while fetching roles"
 */
router.get('/', _checkAuth2.default, _role2.default.fetch_all_roles);

router.post('/', _checkAuth2.default, _role2.default.create_role);

router.put('/:id', _checkAuth2.default, _role2.default.update_role);

module.exports = router;