const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
});
