'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const apiRoutes = require('./routes/api.js');
apiRoutes(app);

const app = express();
fccTesting(app);

// Seguridad con Helmet
app.use(helmet());
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


// Puerto
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor escuchando en puerto ${PORT}`);
});

module.exports = app;
