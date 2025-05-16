require('dotenv').config(); // <--- MOVER AQUÍ, AL INICIO DE TODO

const express = require('express');
const path = require('path');
const connectDB = require('./config/db'); // Ahora connectDB se requiere DESPUÉS de que dotenv se haya configurado
const cors = require('cors');

const app = express();

// Conectar a la Base de Datos
connectDB(); // Esta llamada ahora debería encontrar process.env.MONGODB_URI definido por el dotenv de server.js

// Middlewares
app.use(cors());
app.use(express.json());

// backend/server.js
app.use('/api/adoption-requests', require('./routes/adoptionRequestRoutes'));


// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Definir Rutas de la API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
// app.use('/api/requests', require('./routes/adoptionRequestRoutes'));

// Rutas para servir las páginas HTML principales del frontend
app.get(['/', '/home'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'Home.html'));
});
app.get('/mascota/:petId', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'Details.html'));
});
app.get('/mis-solicitudes', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'MisSolicitudes.html'));
});
app.get('/registrar-mascota', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'RegistrarMascota.html'));
});
app.get('/perfil', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'Perfil.html'));
});

// Middleware de Manejo de Errores Centralizado
app.use((err, req, res, next) => {
    console.error("ERROR STACK:", err.stack);
    const statusCode = err.status || 500;
    const message = err.message || 'Error interno del servidor';
    res.status(statusCode).json({
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Fallback para rutas no encontradas
app.use((req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ message: 'Endpoint no encontrado' });
    }
    res.status(404).send('Página no encontrada');
});

const PORT = process.env.PORT || 3001; // Cambié el puerto por si 3000 está ocupado, puedes volver a 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});