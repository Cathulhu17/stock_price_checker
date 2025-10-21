'use strict';
require('dotenv').config();
const app = require('./src/server');
module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => {
    console.log('Server listening on port', PORT);
  });
}
