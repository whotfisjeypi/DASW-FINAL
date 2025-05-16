const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post(
    '/register',
    [
        body('name', 'El nombre es requerido').not().isEmpty(),
        body('email', 'Por favor incluye un email válido').isEmail(),
        body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
        body('city', 'La ciudad es requerida').not().isEmpty(),
        body('role', 'El rol es requerido').optional().isIn(['adoptante', 'dueño/rescatista'])
    ],
    authController.registerUser
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email', 'Por favor incluye un email válido').isEmail(),
        body('password', 'La contraseña es requerida').exists()
    ],
    authController.loginUser
);

// GET /api/auth/me (ruta protegida para obtener datos del usuario)
router.get(
    '/me',
    authMiddleware,
    authController.getLoggedInUser
);

module.exports = router;
