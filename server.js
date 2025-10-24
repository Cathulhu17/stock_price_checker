'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const fccTesting = require('./routes/fcctesting.js');
const apiRoutes = require('./routes/api.js');

const app = express();

// 🧠 Log inicial para verificar el entorno
console.log('🔧 Entorno actual:', process.env.NODE_ENV || 'no definido');
if (process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ Advertencia: FreeCodeCamp espera que NODE_ENV sea "test" para ejecutar los tests funcionales.');
  console.warn('➡️ Configura NODE_ENV=test en Render o Replit.');
} else {
  console.log('✅ NODE_ENV correctamente configurado como "test".');
}

// 🛡️ Políticas de seguridad (solo recursos del propio servidor)
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

// ⚙️ Rutas de testing y API
fccTesting(app);
apiRoutes(app);

// 🧩 Ruta base
app.get('/', (req, res) => {
  res.send('🚀 Stock Price Checker en ejecución. NODE_ENV = ' + (process.env.NODE_ENV || 'no definido'));
});

// 🔌 Iniciar servidor
const listener = app.listen(process.env.PORT || 10000, () => {
  console.log('✅ Servidor activo en puerto ' + listener.address().port);
});

module.exports = app;

