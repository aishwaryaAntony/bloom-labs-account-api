var express = require('express');
var router = express.Router();
import checkAuth from "../../../middleware/check-auth"


import searchResultController from "../../../controllers/searchResult";

router.get('/', searchResultController.search_member);

router.post('/query-search', checkAuth, searchResultController.query_search);

module.exports = router;