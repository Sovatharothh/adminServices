require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Blog = require('./shared/models/Blog');
const authenticate = require('./shared/middleware/authenticate');


const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI) 
    .then(() => console.log("Update service is Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));


app.put('/blog/update/:id', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ status: 403, message: 'Forbidden: Only admins can update blogs' });
        }

        const { title, description, blogImage } = req.body;

        if (!title || !description) {
            return res.status(400).json({ status: 400, message: 'Title and description are required' });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, description, blogImage },
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({ status: 404, message: 'Blog not found' });
        }

        res.status(200).json({ status: 200, message: 'Blog updated', body: { blog: updatedBlog } });

    } catch (error) {
        console.error("Update Blog Error:", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ status: 400, message: error.message });
        }
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
});

app.listen(process.env.UPDATE_BLOG_PORT, () => console.log(`Update Blog service on ${process.env.UPDATE_BLOG_PORT}`));