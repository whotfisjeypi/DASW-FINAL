const mongoose = require('mongoose');
require('dotenv').config(); // Para cargar variables de .env

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // useNewUrlParser: true, // Ya no son necesarias en Mongoose 6+
            // useUnifiedTopology: true,
        });
        console.log('MongoDB Conectada...');
    } catch (err) {
        console.error('Error de conexión a MongoDB:', err.message);
        // Salir del proceso con falla
        process.exit(1);
    }
};

module.exports = connectDB;