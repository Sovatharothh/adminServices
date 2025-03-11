require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./shared/models/User');
const Blog = require('./shared/models/Blog');
const authenticate = require('./shared/middleware/authenticate');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Delete service is Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));

app.delete('/blog/admin/delete/:id', authenticate, async (req, res) => {
    try {
        console.log("Received blogId:", req.params.id); // Debugging log

        if (req.user.role !== 'admin') {
            return res.status(403).json({ status: 403, message: 'Forbidden: Only admins can delete blogs' });
        }

        // Validate ObjectId before using it
        const blogId = req.params.id ? req.params.id.trim() : null;
        if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({ status: 400, message: 'Invalid blog ID format' });
        }

        // Check if the blog exists before attempting deletion
        const blogExists = await Blog.findById(blogId);
        if (!blogExists) {
            return res.status(404).json({ status: 404, message: 'Blog not found' });
        }

        // Perform deletion
        await Blog.findByIdAndDelete(blogId);

        res.status(200).json({ status: 200, message: 'Blog deleted successfully' });

    } catch (error) {
        console.error("Delete Blog Error:", error);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
});

app.listen(process.env.DELETE_BLOG_PORT, () => console.log(`Delete Blog service on ${process.env.DELETE_BLOG_PORT}`));
