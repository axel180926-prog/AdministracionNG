const express = require('express');
const path = require('path');
const app = require('./server');
const staticApp = express();

// Servir archivos estáticos del frontend desde la carpeta public
staticApp.use(express.static(path.join(__dirname, '../frontend/public')));

// Redirigir rutas no encontradas al index.html (para SPA)
staticApp.get('/*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/build')) {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
  }
});

// Montar la API
staticApp.use('/api', app);

module.exports = staticApp;
