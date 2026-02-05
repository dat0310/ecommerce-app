const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
