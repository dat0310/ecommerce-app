const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`ShopHubCoin Service running on port ${PORT}`);
});
