'use strict';
const express = require('express');
const helmet = require('helmet');
const apiRoutes = require('./routes/api.js');

const app = express();

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

apiRoutes(app);

// Servidor en puerto 10000
const listener = app.listen(10000, () => {
  console.log('Server running on port ' + listener.address().port);
});
