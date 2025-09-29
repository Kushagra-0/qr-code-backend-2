import mongoose from "mongoose"

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        coverImageUrl: { 
            type: String, 
            default: null 
        }, 
        description: {
            type: String,
            required: true,
        },
        content: { 
            type: String, 
            required: true 
        },
    },
    {
        timestamps: true,
    }
)

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;