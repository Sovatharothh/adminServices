require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Blog = require('./shared/models/Blog');
const authenticate = require('./shared/middleware/authenticate');
const User = require('./shared/models/User');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Admin View service is Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));

app.get('/blog/admin/all', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ status: 403, message: 'Forbidden: Only admins can view all blogs' });
        }

        const blogs = await Blog.find().populate('author', 'firstName lastName email');
        res.status(200).json({ status: 200, message: 'All blogs retrieved', body: { blogs } });

    } catch (error) {
        console.error("Admin View Error:", error);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
});

app.listen(process.env.ADMIN_VIEW_PORT, () => console.log(`Admin View service on ${process.env.ADMIN_VIEW_PORT}`));