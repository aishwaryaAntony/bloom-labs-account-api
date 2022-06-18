var express = require('express');
var router = express.Router();
import labLocationController from '../../../controllers/labLocation';
import checkAuth from "../../../middleware/check-auth"

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
router.get('/', checkAuth, labLocationController.fetch_all_lab_locations);
router.post('/', checkAuth, labLocationController.create_lab_location);
router.put('/:id', checkAuth, labLocationController.update_lab_location);

module.exports = router;
