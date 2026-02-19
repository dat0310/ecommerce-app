const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve uploaded images as static files
app.use('/uploads', express.static(uploadsDir));

// Mount routes
app.use('/api/products', productRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: { message: err.message || 'Internal server error' } });
});

module.exports = app;
