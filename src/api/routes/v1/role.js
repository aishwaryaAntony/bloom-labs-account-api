var express = require('express');
var router = express.Router();
import roleController from '../../../controllers/role';
import checkAuth from "../../../middleware/check-auth"

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
router.get('/', checkAuth, roleController.fetch_all_roles);

router.post('/', checkAuth, roleController.create_role);

router.put('/:id', checkAuth, roleController.update_role);

module.exports = router;
