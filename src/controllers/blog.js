import db from "../models";

exports.fetch_all_blogs = async (req, res, next) => {
    try {
        let { offset, status } = req.query;
        let limit = 50;
        offset = !!offset ? parseInt(offset) : 0;
        let whereObj = {};

        if (!!status) {
            whereObj.status = status
        }

        let fetchBlogs = await db.Blog.findAll({
            where: whereObj,
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']]
        });

        res.status(200).json({
            status: 'success',
            payload: fetchBlogs,
            message: 'Blogs Fetched successfully'
        });
    } catch (error) {
        console.log("Error at fetching Blogs method- GET / :" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while fetching Blogs'
        });
    }
};


exports.fetch_blog_by_slug = async (req, res, next) => {
    try {
        let { slug } = req.params;
        let fetchBlog = await db.Blog.findOne({
            where: {
                slug: slug
            }
        });
        if (fetchBlog === null) {
            return res.status(200).json({
                status: 'failed',
                payload: fetchBlog,
                message: 'Blog does not exist'
            });
        }


        res.status(200).json({
            status: 'success',
            payload: fetchBlog,
            message: 'Blog Fetched successfully'
        });
    } catch (error) {
        console.log("Error at fetching Blog method- GET / :slug" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while fetching Blog'
        });
    }
};

exports.create_blog = async (req, res, next) => {
    try {
        let { slug, title, description, created_by, status, meta_description } = req.body;
        let fetchBlog = await db.Blog.findOne({
            where: {
                slug: slug
            }
        });

        if (fetchBlog !== null) {
            return res.status(200).json({
                status: 'failed',
                payload: null,
                message: 'Blog already exist'
            });
        }

        let newBlog = await db.Blog.create({
            slug,
            title,
            description,
            created_by,
            status,
            meta_description
        });

        res.status(200).json({
            status: 'success',
            payload: newBlog,
            message: 'Blog created successfully'
        });
    } catch (error) {
        console.log("Error at creating Blog method- GET / :slug" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while creating Blog'
        });
    }
};


exports.update_blog = async (req, res, next) => {
    try {
        let { slug, title, description, created_by, status, meta_description } = req.body;
        let { id } = req.params;

        let fetchBlog = await db.Blog.findOne({
            where: {
                id: id
            }
        });

        if (fetchBlog === null) {
            return res.status(200).json({
                status: 'failed',
                payload: null,
                message: 'Blog does not exist'
            });
        }

        await db.Blog.update({
            slug: !!slug ? slug : fetchBlog.slug,
            title: !!title ? title : fetchBlog.title,
            description: !!description ? description : fetchBlog.description,
            created_by: !!created_by ? created_by : fetchBlog.created_by,
            status: !!status ? status : fetchBlog.status,
            meta_description: !!meta_description ? meta_description : fetchBlog.meta_description
        }, {
            where: {
                id: id
            }
        });

        fetchBlog = await db.Blog.findOne({
            where: {
                id: id
            }
        });

        res.status(200).json({
            status: 'success',
            payload: fetchBlog,
            message: 'Blog updated successfully'
        });
    } catch (error) {
        console.log("Error at updating Blog method- GET / :slug" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while updating Blog'
        });
    }
};


exports.delete_blog = async (req, res, next) => {
    try {
        let { id } = req.params;

        let fetchBlog = await db.Blog.findOne({
            where: {
                id: id
            }
        });

        if (fetchBlog === null) {
            return res.status(200).json({
                status: 'failed',
                payload: null,
                message: 'Blog does not exist'
            });
        }


        await db.Blog.destroy({
            where: {
                id: id
            }
        });

        res.status(200).json({
            status: 'success',
            payload: null,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.log("Error at deleting Blog method- GET / :slug" + error);
        res.status(500).json({
            status: 'failed',
            payload: null,
            message: 'Error while deleting Blog'
        });
    }
};