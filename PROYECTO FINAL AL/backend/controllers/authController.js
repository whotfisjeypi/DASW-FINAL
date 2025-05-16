const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

// @route   POST api/auth/register
// @desc    Registrar un usuario
// @access  Public
exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, city, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'El usuario ya existe' }] });
        }

        user = new User({
            name,
            email,
            password,
            city,
            role: role || 'adoptante'
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, userId: user.id, name: user.name, role: user.role });
            }
        );
    } catch (err) {
        console.error(err.message);
        next({ status: 500, message: 'Error del servidor al registrar usuario' });
    }
};

// @route   POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Credenciales inválidas' }] });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Credenciales inválidas' }] });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, userId: user.id, name: user.name, role: user.role });
            }
        );
    } catch (err) {
        console.error(err.message);
        next({ status: 500, message: 'Error del servidor al iniciar sesión' });
    }
};

// @route   GET api/auth/me
// @desc    Obtener datos del usuario logueado
// @access  Private
exports.getLoggedInUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        next({ status: 500, message: 'Error del servidor al obtener datos del usuario' });
    }
};
