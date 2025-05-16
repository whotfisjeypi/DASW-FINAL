const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController'); // Crear este controlador

// GET /api/users/me - Obtener perfil del usuario logueado (reusamos la de authController o creamos una aquí)
router.get('/me', authMiddleware, userController.getMe);

router.get('/me/pets', authMiddleware, userController.getUserPets); 

// PATCH /api/users/me - Actualizar perfil del usuario logueado
router.patch(
    '/me',
    authMiddleware,
    [
        body('name', 'El nombre es requerido').optional().not().isEmpty().trim(),
        body('city', 'La ciudad es requerida').optional().not().isEmpty().trim()
        // No permitir cambiar email o rol directamente aquí por simplicidad y seguridad
    ],
    userController.updateMe
);

// POST /api/users/me/password - Cambiar contraseña
router.post(
    '/me/password',
    authMiddleware,
    [
        body('oldPassword', 'La contraseña actual es requerida').not().isEmpty(),
        body('newPassword', 'La nueva contraseña es requerida y debe tener al menos 6 caracteres').isLength({ min: 6 })
    ],
    userController.changePassword
);


module.exports = router;