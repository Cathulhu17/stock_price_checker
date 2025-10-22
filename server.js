'use strict';
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const fccTesting = require('./routes/fcctesting.js');
const apiRoutes = require('./routes/api.js');

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

// Rutas de testing FCC
fccTesting(app);

// Rutas principales del proyecto
apiRoutes(app);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('✅ Stock Price Checker listo sin MongoDB');
});

// Iniciar servidor
const listener = app.listen(process.env.PORT || 10000, () => {
  console.log('🚀 Servidor corriendo en el puerto ' + listener.address().port);
});

module.exports = app;