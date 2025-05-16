require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');

async function seed() {
    await connectDB();
    // ejemplo: cargar tipos de mascota, ciudades
    const cities = ['Ciudad de México','Guadalajara','Monterrey'];
    await mongoose.connection.collection('cities').insertMany(cities.map(c=>({name:c})));
    console.log('✨ Seed completado');
    process.exit();
}

seed();
