'use strict';
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const fccTesting = require('./routes/fcctesting.js');

const app = express();

// Configurar Helmet (CSP correcto para FCC)
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

// Rutas de testing FCC
fccTesting(app);

// Rutas de API
require('./routes/api.js')(app);

// Página base
app.get('/', (req, res) => {
  res.send('Stock Price Checker - modo FreeCodeCamp listo ✅');
});

// Exportar app (necesario para testing)
module.exports = app;

// Iniciar servidor
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Server running on port ' + listener.address().port);
});
