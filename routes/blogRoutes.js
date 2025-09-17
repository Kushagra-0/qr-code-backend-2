import express from 'express';
import {
  createBlog,
  getBlogs,
  deleteBlog,
  getBlogBySlug,
  updateBlog
} from '../controllers/blogController.js';

const router = express.Router();

router.post("/", createBlog);
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);
router.put("/:slug", updateBlog);
router.delete("/:slug", deleteBlog);

export default router;