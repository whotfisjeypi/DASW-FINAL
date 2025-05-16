const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Pet = require('../models/Pet'); // Para cargar mascotas del usuario

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        next({ status: 500, message: 'Error del servidor' });
    }
};

exports.updateMe = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, city } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (city) updateFields.city = city;

    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        user = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true, runValidators: true }).select('-password');
        
        // Actualizar el nombre en localStorage del frontend es tarea del frontend después de esta respuesta
        res.json({ message: 'Perfil actualizado exitosamente', user });
    } catch (err) {
        console.error(err.message);
        next({ status: 500, message: 'Error del servidor al actualizar perfil' });
    }
};

exports.changePassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id); // Model.findById() devuelve el documento completo
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'La contraseña actual es incorrecta' }] });
        }
        user.password = newPassword; // El pre-save hook en UserSchema se encargará del hashing
        await user.save();
        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (err) {
        console.error(err.message);
        next({ status: 500, message: 'Error del servidor al cambiar contraseña' });
    }
};

// Para mostrar las mascotas del usuario en su perfil
exports.getUserPets = async (req, res, next) => {
    try {
        // req.user.id es el ID del usuario logueado, gracias al authMiddleware
        const pets = await Pet.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(pets);
    } catch (err) {
        console.error(err.message);
        next({ status: 500, message: 'Error del servidor al obtener las mascotas del usuario.' });
    }
};