require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const createError = require('http-errors');

const connectDB = require('./src/config/db');
const routes = require('./src/routes/auth.routes'); // Placeholder import para agrupar rutas
const apiRoutes = require('./src/routes'); // Se agruparán todas las rutas API

const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();

// Conexión a la BD
connectDB();

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
  
// Rutas de API con prefijo /api/v1
app.use('/api/v1', apiRoutes);

// Static serve (sin eliminar el existente)
app.use(express.static(path.join(__dirname, 'public')));

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, 'Not Found'));
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
