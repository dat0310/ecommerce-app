const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Voucher service running on port ${PORT}`);
});
