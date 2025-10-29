const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const { authenticateToken } = require('./middleware/auth');
const configRoutes = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas públicas
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    apk_url: `${process.env.BASE_URL}/downloads/business-app.apk`,
    last_update: new Date().toISOString()
  });
});

// Rutas protegidas
app.use('/api/config', configRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health\n`);
});
