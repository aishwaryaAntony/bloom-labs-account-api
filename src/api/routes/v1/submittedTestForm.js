var express = require('express');
var router = express.Router();
import submittedTestFormController from "../../../controllers/submittedTestForm";


router.post('/', submittedTestFormController.create_submitted_test_form);


module.exports = router;