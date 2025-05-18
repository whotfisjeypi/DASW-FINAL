require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db'); // Conexión a BD

// Rutas
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const userRoutes = require('./routes/userRoutes'); 
const adoptionRequestRoutes = require('./routes/adoptionRequestRoutes'); 

const app = express();

// Conectar a la Base de Datos
connectDB();

// Middlewares
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // Middleware para parsear JSON

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes); // Para perfil de usuario y sus mascotas
app.use('/api/adoption-requests', adoptionRequestRoutes); // Para solicitudes de adopción


app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));


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



app.use((err, req, res, next) => {
    console.error("ERROR STACK:", err.stack); // Loguea el stack trace completo del error
    const statusCode = err.status || 500;
    const message = err.message || 'Error interno del servidor';
    res.status(statusCode).json({
        message: message,
        // Solo incluir el stack de error en desarrollo
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});


app.use((req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ message: 'Endpoint no encontrado' });
    }
    res.status(404).sendFile(path.join(__dirname, '..', 'frontend', 'public', '404.html')); 
  
});


const PORT = process.env.PORT || 3000; // Render usará process.env.PORT
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Frontend accesible en http://localhost:${PORT}`); 
});