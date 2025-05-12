const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        
        // Verificar si ya existe un usuario con ese email
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }
        
        // Crear el usuario (puedes agregar más campos según tu modelo)
        const user = await User.create({ name, email, password, city: '', role: 'user' });
        
        res.status(201).json({ message: 'Usuario registrado correctamente', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;