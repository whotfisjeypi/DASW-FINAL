require('dotenv').config();        // <- Debe ir primero
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const createError = require('http-errors');

const connectDB = require('./src/config/db');
const apiRoutes = require('./src/routes');       // Agrupa todas tus rutas API
const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();

// 1) Conectar a MongoDB
connectDB();

// 2) Middlewares globales
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Rutas API (prefijo /api/v1)
app.use('/api/v1', apiRoutes);

// 4) Definir directorio público del frontend
const frontendPath = path.join(__dirname, '..', 'frontend', 'public');

// 5) Servir estáticos de frontend
app.use(express.static(frontendPath));

// 6) Rutas específicas de páginas
app.get(['/', '/home'], (req, res) => {
  res.sendFile(path.join(frontendPath, 'Home.html'));
});
app.get('/mis-solicitudes', (req, res) => {
  res.sendFile(path.join(frontendPath, 'MisSolicitudes.html'));
});
app.get('/registrar-mascota', (req, res) => {
  res.sendFile(path.join(frontendPath, 'RegistrarMascota.html'));
});
app.get('/perfil', (req, res) => {
  res.sendFile(path.join(frontendPath, 'Perfil.html'));
});
app.get('/mascota/:petId', (req, res) => {
  res.sendFile(path.join(frontendPath, 'Details.html'));
});

// 7) Captura 404 para rutas no definidas
app.use((req, res, next) => {
  next(createError(404, 'Página no encontrada'));
});

// 8) Middleware de manejo de errores
app.use(errorHandler);

// 9) Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
