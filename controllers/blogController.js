const Blog = require("../models/Blog");

const createBlog = async (req, res) => {
  try {
    const { title, slug, description, content } = req.body;

    const blog = new Blog({
      title,
      slug,
      description,
      content,
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "Failed to create blog" });
  }
};

// Get All Blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// Get Blog by Slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog" });
  }
};

// Delete Blog by Slug
const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.deleteOne({ slug: req.params.slug });
    if (deleted.deletedCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog" });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, description, content } = req.body;

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { title, description, content },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ error: "Failed to update blog" });
  }
};

module.exports = {
    createBlog,
    getBlogs,
    getBlogBySlug,
    deleteBlog,
    updateBlog,
}