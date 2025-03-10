require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Blog = require('./shared/models/Blog');
const authenticate = require('./shared/middleware/authenticate');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI) 
    .then(() => console.log("Delete service is Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));

app.delete('/blog/admin/delete/:id', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ status: 403, message: 'Forbidden: Only admins can delete blogs' });
        }

        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

        if (!deletedBlog) {
            return res.status(404).json({ status: 404, message: 'Blog not found' });
        }

        res.status(200).json({ status: 200, message: 'Blog deleted' });

    } catch (error) {
        console.error("Delete Blog Error:", error);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
});

app.listen(process.env.DELETE_BLOG_PORT, () => console.log(`Delete Blog service on ${process.env.DELETE_BLOG_PORT}`));