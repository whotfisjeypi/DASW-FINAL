const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const adoptionRequestController = require('../controllers/adoptionRequestController');

// POST /api/adoption-requests/pet/:petId - Crear una nueva solicitud de adopción para una mascota
// Moví la lógica de /api/pets/:petId/adopt aquí para centralizar las solicitudes.
router.post(
    '/pet/:petId',
    authMiddleware,
    [param('petId').isMongoId().withMessage('ID de mascota inválido')],
    adoptionRequestController.createAdoptionRequest
);

// GET /api/adoption-requests/my-requests - Obtener solicitudes enviadas por el usuario logueado
router.get(
    '/my-requests',
    authMiddleware,
    adoptionRequestController.getMySentRequests
);

// GET /api/adoption-requests/pet-owner/:petId - Obtener solicitudes recibidas para una mascota específica (para el dueño)
// Necesitarás esta si el dueño quiere ver las solicitudes que le han llegado para SUS mascotas
router.get(
    '/pet-owner/:petId',
    authMiddleware,
    [param('petId').isMongoId().withMessage('ID de mascota inválido')],
    adoptionRequestController.getRequestsForPetOwner
);


// PATCH /api/adoption-requests/:requestId - Actualizar estado de una solicitud (dueño de mascota o solicitante para cancelar)
router.patch(
    '/:requestId',
    authMiddleware,
    [
        param('requestId').isMongoId().withMessage('ID de solicitud inválido'),
        body('status', 'El estado es requerido y debe ser válido').isIn(['aceptada', 'rechazada', 'cancelada'])
    ],
    adoptionRequestController.updateRequestStatus
);

// Podrías añadir una ruta DELETE si el usuario puede eliminar (no solo cancelar) una solicitud.
// router.delete('/:requestId', authMiddleware, adoptionRequestController.deleteAdoptionRequest);


module.exports = router;