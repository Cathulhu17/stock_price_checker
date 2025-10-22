'use strict';
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const fccTesting = require('./routes/fcctesting.js');

const app = express();

// ✅ Política CSP mínima, como pide FCC
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
    },
  })
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

fccTesting(app);
require('./routes/api.js')(app);

app.get('/', (req, res) => {
  res.send('Stock Price Checker listo ✅');
});

const listener = app.listen(process.env.PORT || 10000, () => {
  console.log('Server running on port ' + listener.address().port);
});

module.exports = app;