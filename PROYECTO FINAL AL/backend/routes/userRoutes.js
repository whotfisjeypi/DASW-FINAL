// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController'); // Asegúrate que userController.js exista en ../controllers/

// GET /api/users/me - Obtener perfil del usuario logueado
router.get(
    '/me',
    authMiddleware,
    userController.getMe
);

// PATCH /api/users/me - Actualizar perfil del usuario logueado
router.patch(
    '/me',
    authMiddleware,
    [
        body('name', 'El nombre es requerido').optional({checkFalsy: true}).not().isEmpty().trim(),
        body('city', 'La ciudad es requerida').optional({checkFalsy: true}).not().isEmpty().trim()
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

// GET /api/users/me/pets - Obtener las mascotas publicadas por el usuario logueado
router.get(
    '/me/pets',
    authMiddleware,
    userController.getUserPets
);

module.exports = router;