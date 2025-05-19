// backend/controllers/userController.js
const User = require('../models/User');
const Pet = require('../models/Pet');
const { validationResult } = require('express-validator');
// bcryptjs ya no se necesita aquí directamente si el cambio de contraseña lo maneja el pre-save hook de User

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (err) {
        console.error("Error en getMe:", err.message);
        next({ status: 500, message: 'Error del servidor al obtener perfil' });
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
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        
        user = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true, runValidators: true }).select('-password');
        res.json({ message: 'Perfil actualizado exitosamente', user });
    } catch (err) {
        console.error("Error en updateMe:", err.message);
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
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) return res.status(400).json({ errors: [{ msg: 'La contraseña actual es incorrecta' }] });
        
        user.password = newPassword; // El hook pre-save en el modelo User se encargará de hashear
        await user.save();
        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (err) {
        console.error("Error en changePassword:", err.message);
        next({ status: 500, message: 'Error del servidor al cambiar contraseña' });
    }
};

exports.getUserPets = async (req, res, next) => {
    try {
        const pets = await Pet.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(pets);
    } catch (err) {
        console.error("Error en getUserPets:", err.message);
        next({ status: 500, message: 'Error del servidor al obtener las mascotas del usuario.' });
    }
};