const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const petController = require('../controllers/petController');
const authMiddleware = require('../middleware/authMiddleware'); // Asumiendo que lo crearás

// GET /api/pets - Retorna mascotas disponibles con filtros
router.get(
    '/',
    [ // Validaciones opcionales para query params
        query('type').optional().isString().trim(),
        query('city').optional().isString().trim(),
        query('minAge').optional().isInt({ min: 0 }),
        query('maxAge').optional().isInt({ min: 0 })
    ],
    petController.getAllPets
);

// POST /api/pets - Registra una nueva mascota (protegida)
router.post(
    '/',
    authMiddleware, // Proteger esta ruta
    [
        body('name', 'El nombre es requerido').not().isEmpty().trim(),
        body('type', 'El tipo es requerido').not().isEmpty().trim(),
        body('age', 'La edad es requerida y debe ser un número').isNumeric(),
        body('city', 'La ciudad es requerida').not().isEmpty().trim(),
        body('healthStatus', 'El estado de salud es requerido').not().isEmpty().trim(),
        body('description', 'La descripción es requerida').not().isEmpty().trim(),
        body('photos').optional().isArray(),
        body('photos.*').optional().isURL().withMessage('Cada foto debe ser una URL válida')
    ],
    petController.createPet
);

// GET /api/pets/:petId - Retorna detalles de una mascota
router.get(
    '/:petId',
    [param('petId').isMongoId().withMessage('ID de mascota inválido')],
    petController.getPetById
);

// PATCH /api/pets/:petId - Actualiza una mascota (protegida, solo dueño/admin)
router.patch(
    '/:petId',
    authMiddleware, // Proteger esta ruta
    [param('petId').isMongoId().withMessage('ID de mascota inválido')],
    // Añadir validaciones para los campos que se pueden actualizar
    petController.updatePet
);

// DELETE /api/pets/:petId - Elimina una mascota (protegida, solo dueño/admin)
router.delete(
    '/:petId',
    authMiddleware, // Proteger esta ruta
    [param('petId').isMongoId().withMessage('ID de mascota inválido')],
    petController.deletePet
);

module.exports = router;