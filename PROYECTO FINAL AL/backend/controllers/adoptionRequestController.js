const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');
const { validationResult } = require('express-validator');


// POST /api/adoption-requests/pet/:petId (o la ruta que elijas para crear)
exports.createAdoptionRequest = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { petId } = req.params;
    const requesterId = req.user.id;

    try {
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Mascota no encontrada.' });
        }
        if (pet.owner.toString() === requesterId) {
            return res.status(400).json({ message: 'No puedes solicitar adoptar tu propia mascota.' });
        }
        if (pet.status !== 'disponible') {
             return res.status(400).json({ message: 'Esta mascota no está disponible para adopción en este momento.' });
        }

        const existingRequest = await AdoptionRequest.findOne({ pet: petId, requester: requesterId, status: { $in: ['pendiente', 'aceptada'] } });
        if (existingRequest) {
            return res.status(400).json({ message: `Ya tienes una solicitud ${existingRequest.status} para esta mascota.` });
        }

        const newRequest = new AdoptionRequest({
            pet: petId,
            requester: requesterId,
            owner: pet.owner // Guardamos el dueño de la mascota para referencia
        });
        await newRequest.save();
        
        // Opcional: Cambiar estado de la mascota a 'en proceso' podría ser si el dueño lo marca,
        // o si solo se permite una solicitud activa a la vez. Por ahora, lo dejamos así.

        res.status(201).json({ message: 'Solicitud de adopción enviada exitosamente.', request: newRequest });
    } catch (err) {
        console.error("Error en createAdoptionRequest:", err.message);
        next({ status: 500, message: 'Error del servidor al crear solicitud de adopción.' });
    }
};

exports.getMySentRequests = async (req, res, next) => {
    try {
        const requests = await AdoptionRequest.find({ requester: req.user.id })
            .populate({
                path: 'pet',
                select: 'name type photos city status', // Campos de la mascota
                populate: { // Popular el dueño DENTRO de la mascota
                    path: 'owner',
                    select: 'name' // Solo el nombre del dueño de la mascota
                }
            })
            .sort({ requestDate: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        next({ status: 500, message: 'Error del servidor al obtener solicitudes enviadas.' });
    }
};

// GET /api/adoption-requests/pet-owner/:petId (NUEVA)
exports.getRequestsForPetOwner = async (req, res, next) => {
    const { petId } = req.params;
    const currentUserId = req.user.id;

    try {
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Mascota no encontrada.' });
        }
        if (pet.owner.toString() !== currentUserId) {
            return res.status(403).json({ message: 'No autorizado para ver solicitudes de esta mascota.' });
        }

        const requests = await AdoptionRequest.find({ pet: petId })
            .populate('requester', ['name', 'email', 'city']) // Info del solicitante
            .sort({ requestDate: -1 });
        
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        next({ status: 500, message: 'Error del servidor al obtener solicitudes para la mascota.' });
    }
};


exports.updateRequestStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { requestId } = req.params;
    const { status } = req.body; // 'aceptada', 'rechazada', 'cancelada'
    const currentUserId = req.user.id;

    try {
        const request = await AdoptionRequest.findById(requestId).populate('pet');
        if (!request) {
            return res.status(404).json({ message: 'Solicitud no encontrada.' });
        }

        const petOwnerId = request.pet.owner.toString();
        const requesterId = request.requester.toString();

        if (status === 'cancelada') {
            if (requesterId !== currentUserId || request.status !== 'pendiente') {
                return res.status(403).json({ message: 'No autorizado para cancelar o la solicitud ya no está pendiente.' });
            }
        } else if (status === 'aceptada' || status === 'rechazada') {
            if (petOwnerId !== currentUserId) {
                return res.status(403).json({ message: 'No autorizado para aceptar/rechazar esta solicitud.' });
            }
            if (request.status !== 'pendiente') {
                return res.status(400).json({ message: `La solicitud ya está ${request.status}. No se puede cambiar.`});
            }
        } else {
            return res.status(400).json({ message: 'Estado no válido proporcionado.' });
        }
        
        request.status = status;
        request.updatedAt = Date.now();

        if (status === 'aceptada') {
            await Pet.findByIdAndUpdate(request.pet._id, { status: 'adoptado' });
            // Opcional: Rechazar otras solicitudes pendientes para esta mascota
            await AdoptionRequest.updateMany(
               { pet: request.pet._id, status: 'pendiente', _id: { $ne: requestId } },
               { $set: { status: 'rechazada', updatedAt: Date.now() } }
            );
        }
        // Considerar si al rechazar/cancelar una solicitud 'en proceso', la mascota vuelve a 'disponible'
        // Esto depende de tu lógica de negocio si "en proceso" es un estado exclusivo de una solicitud.

        await request.save();
        res.json({ message: `Solicitud ${status}.`, request });

    } catch (err) {
        console.error("Error en updateRequestStatus:", err.message);
        next({ status: 500, message: 'Error del servidor al actualizar solicitud.' });
    }
};