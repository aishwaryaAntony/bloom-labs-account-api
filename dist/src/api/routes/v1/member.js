'use strict';

var _member = require('../../../controllers/member');

var _member2 = _interopRequireDefault(_member);

var _checkAuth = require('../../../middleware/check-auth');

var _checkAuth2 = _interopRequireDefault(_checkAuth);

var _attachments = require('../../../helpers/attachments');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();


/**
 * @swagger
 *  /members:
 *    get:
 *     summary: Get the Members 
 *     description: "Fetch the members data Created_by: Gopinath"
 *     tags: [Member]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: page
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
 *                 $ref: "#/definitions/Member"
 *            message:
 *              type: string
 *              example: "Members fetched successfully"
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
router.get('/', _checkAuth2.default, _member2.default.fetch_members);

/**
 * @swagger
 *  /members/{id}:
 *    get:
 *     summary: Get the Member By id 
 *     description: "Fetch the member by id data Created_by: Gopinath"
 *     tags: [Member]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
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
 *                $ref: "#/definitions/Member"
 *            message:
 *              type: string
 *              example: "Member fetched successfully"
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
router.get('/:id', _checkAuth2.default, _member2.default.fetch_member_by_id);

/**
 * @swagger
 *  /members/member-token/{token}:
 *    get:
 *     summary: Get the Member By token 
 *     description: "Fetch the member by token data Created_by: Gopinath"
 *     tags: [Member]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         type: string
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
 *                $ref: "#/definitions/Member"
 *            message:
 *              type: string
 *              example: "Member fetched successfully"
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
// router.get('/member-token/:token', checkAuth, memberController.fetch_member_by_token);
router.get('/member-token/:token', _member2.default.fetch_member_by_token);

/**
 * @swagger
 *  /members:
 *    post:
 *     summary: Create a new member
 *     description: "Create a new member Created_by: Gopinath"
 *     tags: [Member]
 *     parameters:
 *       - in: body
 *         name: member
 *         required: true
 *         description: Member details
 *         schema:
 *          type: object
 *          properties:
 *            account_id:
 *              type: number
 *            first_name:
 *              type: string
 *            middle_name:
 *              type: string
 *            last_name:
 *              type: string
 *            country_code:
 *              type: string
 *            phone_number:
 *              type: string
 *            email:
 *              type: string
 *            is_primary_member:
 *              type: boolean
 *            gender:
 *              type: string
 *            birth_date:
 *              type: string
 *            race:
 *              type: string
 *            ethnicity:
 *              type: string
 *            driver_license_number:
 *              type: string
 *            passport_number:
 *              type: string
 *            ssn:
 *              type: string
 *            address_line1:
 *              type: string
 *            address_line2:
 *              type: string
 *            city:
 *              type: string
 *            state:
 *              type: string
 *            country:
 *              type: string
 *            zipcode:
 *              type: string
 *            qr_code:
 *              type: string
 *            status:
 *              type: string
 *          example:
 *            account_id: 1
 *            first_name: "Gopinath"
 *            middle_name: "Maha"
 *            last_name: "Raja"
 *            country_code: "+91"
 *            phone_number: "1234567890"
 *            email: "gopinathm@kenlasystems.com"
 *            is_primary_member: true
 *            gender: "Male"
 *            birth_date: "2021-12-20"
 *            race: "Asian"
 *            ethnicity: "His"
 *            driver_license_number: "345"
 *            passport_number: "567"
 *            ssn: "9090909"
 *            address_line1: "Kenla"
 *            address_line2: "Adayar"
 *            city: "Chennai"
 *            state: "TamilNadu"
 *            country: "India"
 *            zipcode: "600020"
 *            qr_code: "DFE678HH"
 *            status: "ACTIVE"
 *     produces:
 *       - application/json
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
 *                $ref: "#/definitions/Member"
 *            message:
 *              type: string
 *              example: "Member created successfully"
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
 *            message: "Error while creating members"
 */
router.post('/', _checkAuth2.default, _attachments.upload.fields([{ name: 'id_image_file', maxCount: 1 }, { name: 'signature_file', maxCount: 1 }, { name: 'insurance_front_file', maxCount: 1 }, { name: 'insurance_back_file', maxCount: 1 }]), _member2.default.create_member);

router.post('/new-member', _checkAuth2.default, _attachments.upload.fields([{ name: 'id_image_file', maxCount: 1 }, { name: 'signature_file', maxCount: 1 }, { name: 'insurance_front_file', maxCount: 1 }, { name: 'insurance_back_file', maxCount: 1 }]), _member2.default.create_new_member);
/**
 * @swagger
 *  /members/{id}:
 *    put:
 *     summary: Update a member
 *     description: "Update a member Created_by: Gopinath"
 *     tags: [Member]
 *     security: [{
 *        bearerAuth: []
 *      }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: number
 *         description: The Member details to update by id
 *       - in: body
 *         name: member
 *         required: true
 *         description: The Member details to update
 *         schema:
 *          type: object
 *          properties:
 *            account_id:
 *              type: number
 *            first_name:
 *              type: string
 *            middle_name:
 *              type: string
 *            last_name:
 *              type: string
 *            country_code:
 *              type: string
 *            phone_number:
 *              type: string
 *            email:
 *              type: string
 *            is_primary_member:
 *              type: boolean
 *            gender:
 *              type: string
 *            birth_date:
 *              type: string
 *            race:
 *              type: string
 *            ethnicity:
 *              type: string
 *            driver_license_number:
 *              type: string
 *            passport_number:
 *              type: string
 *            ssn:
 *              type: string
 *            address_line1:
 *              type: string
 *            address_line2:
 *              type: string
 *            city:
 *              type: string
 *            state:
 *              type: string
 *            country:
 *              type: string
 *            zipcode:
 *              type: string
 *            qr_code:
 *              type: string
 *            status:
 *              type: string
 *          example:
 *            account_id: 1
 *            first_name: "Gopinath"
 *            middle_name: "Maha"
 *            last_name: "Raja"
 *            country_code: "+91"
 *            phone_number: "1234567890"
 *            email: "gopinathm@kenlasystems.com"
 *            is_primary_member: true
 *            gender: "Male"
 *            birth_date: "2021-12-20"
 *            race: "Asian"
 *            ethnicity: "His"
 *            driver_license_number: "345"
 *            passport_number: "567"
 *            ssn: "9090909"
 *            address_line1: "Kenla"
 *            address_line2: "Adayar"
 *            city: "Chennai"
 *            state: "TamilNadu"
 *            country: "India"
 *            zipcode: "600020"
 *            qr_code: "DFE678HH"
 *            status: "ACTIVE"
 *     produces:
 *       - application/json
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
 *                $ref: "#/definitions/Member"
 *            message:
 *              type: string
 *              example: "Member updated successfully"
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
 *            message: "Error while updating members"
 */
router.put('/:id', _checkAuth2.default, _member2.default.update_member);

router.put('/edit-member/:member_token', _checkAuth2.default, _attachments.upload.fields([{ name: 'id_image_file', maxCount: 1 }, { name: 'signature_file', maxCount: 1 }, { name: 'insurance_front_file', maxCount: 1 }, { name: 'insurance_back_file', maxCount: 1 }]), _member2.default.update_member_by_id);

/**
 * @swagger
 *  /members/{id}:
 *    delete:
 *     summary: Delete the Member By id 
 *     description: "Delete the member by id data Created_by: Gopinath"
 *     tags: [Member]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
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
 *              type: string
 *              nullable: true
 *              example: null
 *            message:
 *              type: string
 *              example: "Member deleted successfully"
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
 *            message: "Error while deleting members"
 */
router.delete('/:id', _checkAuth2.default, _member2.default.delete_member_by_id);

router.get('/qr-code/:qr_code', _checkAuth2.default, _member2.default.fetch_member_by_qr_code);

/**
 * @swagger
 *  /members:
 *    get:
 *     summary: Get the Internal Members 
 *     description: "Fetch the internal members data Created_by: Gopinath"
 *     tags: [Member]
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
 *                 $ref: "#/definitions/Member"
 *            message:
 *              type: string
 *              example: "Members fetched successfully"
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
 *            message: "Error while fetching internal members"
 */
router.get('/internal/member', _checkAuth2.default, _member2.default.fetch_all_internal_members);

router.post('/tokens/member', _checkAuth2.default, _member2.default.fetch_members_by_member_tokens);

router.get('/search/:name', _checkAuth2.default, _member2.default.search_members);

module.exports = router;