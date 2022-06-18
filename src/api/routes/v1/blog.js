var express = require('express');
var router = express.Router();
import blogController from '../../../controllers/blog';
import checkAuth from "../../../middleware/check-auth"

router.get('/', blogController.fetch_all_blogs);

router.get('/:slug', blogController.fetch_blog_by_slug);

router.post('/', checkAuth, blogController.create_blog);

router.put('/:id', checkAuth, blogController.update_blog);

router.delete('/:id', checkAuth, blogController.delete_blog);

module.exports = router;
