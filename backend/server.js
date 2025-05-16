require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const app = express();

// Conexión y middleware
connectDB();
app.use(express.json());
app.use(require('cors')());

// Rutas
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/pets',     require('./routes/pets'));
app.use('/api/alerts',   require('./routes/alerts'));
app.use('/api/requests', require('./routes/requests'));

// Error 404
app.use((req,res)=> res.status(404).json({ msg: 'Ruta no encontrada' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`🚀 Servidor en puerto ${PORT}`));
