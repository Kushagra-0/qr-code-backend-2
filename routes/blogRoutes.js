const express = require('express');
const { createBlog, getBlogs, deleteBlog, getBlogBySlug, updateBlog } = require('../controllers/blogController');
const router = express.Router();


router.post("/", createBlog);
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);
router.put("/:slug", updateBlog);
router.delete("/:slug", deleteBlog);

module.exports = router;