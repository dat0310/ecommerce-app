const express = require('express');
const cors = require('cors');
const purchaseRoutes = require('./routes/purchaseRoutes');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Mount routes
app.use('/', purchaseRoutes);

module.exports = app;
