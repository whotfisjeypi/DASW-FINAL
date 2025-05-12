require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const petTypes = ['Perro','Gato','Conejo'];
const cities = ['Guadalajara','Zapopan','Tlaquepaque','Tonalá'];
const adoptionStatuses = ['available','in_process','adopted'];

const connectDB = require('../config/db');

const seed = async () => {
  try {
    await connectDB();

    // Crear admin inicial si no existe
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: 'adminpassword',
        city: 'Guadalajara',
        role: 'admin'
      });
      console.log('Admin creado');
    }

    // Sembrado de data extra (petTypes, cities, adoptionStatuses) según convenga
    console.log('Seed completado');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
