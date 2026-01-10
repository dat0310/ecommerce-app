const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'My Purchase Service is running' });
});

// Placeholder for purchase history endpoints
app.get('/purchases', (req, res) => {
  res.json({ message: 'Purchase history endpoint - to be implemented' });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`My Purchase Service running on port ${PORT}`);
});
