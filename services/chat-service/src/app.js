const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');
require('dotenv').config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Mount routes
app.use('/api/chat', chatRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: { message: err.message || 'Internal server error' } });
});

module.exports = app;
