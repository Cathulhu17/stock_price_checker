'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt');

// Inicializa la app de Express primero ✅
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta base
app.get('/', (req, res) => {
  res.send('Stock Price Checker API funcionando 🚀');
});

// Importar las rutas después de definir app ✅
const apiRoutes = require('./routes/api.js');
apiRoutes(app);

// Puerto
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;

