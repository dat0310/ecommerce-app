const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'ShopHubCoin Service is running' });
});

// Placeholder for coin-related endpoints
app.get('/coins', (req, res) => {
  res.json({ message: 'Coin balance endpoint - to be implemented' });
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`ShopHubCoin Service running on port ${PORT}`);
});
