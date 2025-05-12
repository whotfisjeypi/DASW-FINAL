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

// 4) Servir el frontend estático desde ../frontend/public
const frontendPath = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(frontendPath));

// 5) Catch-all para Vue/React o Deep links, servir Home.html
app.get('*', (req, res, next) => {
  res.sendFile(path.join(frontendPath, 'Home.html'));
});

// 6) Error 404 y handler final
app.use((req, res, next) => next(createError(404, 'Not Found')));
app.use(errorHandler);

// 7) Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
