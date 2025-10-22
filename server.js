'use strict';
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const fccTesting = require('./routes/fcctesting.js');
const apiRoutes = require('./routes/api.js');

const app = express();

// Testing
fccTesting(app);

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      connectSrc: ["'self'", "https://stock-price-checker-proxy.freecodecamp.rocks"],
    },
  })
);

// MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error al conectar MongoDB:', err.message));

// Ruta base
app.get('/', (req, res) => {
  res.send('🚀 Stock Price Checker conectado a MongoDB Atlas y funcionando correctamente.');
});

// Rutas API
apiRoutes(app);

// Servidor en puerto 10000
const listener = app.listen(10000, () => {
  console.log('Server running on port ' + listener.address().port);
});

module.exports = app;
