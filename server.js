'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const fccTesting = require('./freeCodeCamp/fcctesting.js');

const app = express();
fccTesting(app);

const apiRoutes = require('./routes/api.js');
apiRoutes(app);

// Configurar políticas de seguridad (CSP)
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

// 🔗 Conectar a MongoDB Atlas usando la URI del .env
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectado correctamente a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar MongoDB:', err.message));

// Ruta base
app.get('/', (req, res) => {
  res.send('🚀 Stock Price Checker conectado a MongoDB Atlas y funcionando correctamente.');
});

module.exports = app;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

apiRoutes(app);

// Servidor en puerto 10000
const listener = app.listen(10000, () => {
  console.log('Server running on port ' + listener.address().port);
});
