'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt');

const apiRoutes = require('./routes/api.js');

const app = express();

// 🛡️ Configurar Content Security Policy con Helmet
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"], // Solo recursos del mismo dominio
      "script-src": [
        "'self'",
        "https://cdn.jsdelivr.net", // 🔸 Permite Bootstrap JS opcionalmente
      ],
      "style-src": [
        "'self'",
        "https://fonts.googleapis.com", // 🔸 Permite fuentes de Google
        "https://cdn.jsdelivr.net",      // 🔸 Permite Bootstrap CSS opcionalmente
      ],
      "font-src": [
        "'self'",
        "https://fonts.gstatic.com",     // 🔸 Permite fuentes externas seguras
      ],
      "img-src": ["'self'", "data:"],   // Permite imágenes locales y embebidas
    },
  })
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta base simple
app.get('/', (req, res) => {
  res.send('🚀 Stock Price Checker API funcionando correctamente');
});

// Rutas principales del proyecto
apiRoutes(app);

// Puerto
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
