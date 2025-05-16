const mongoose = require('mongoose');

const AdoptionRequestSchema = new mongoose.Schema({
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    requester: { // Usuario que solicita adoptar
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: { // Dueño de la mascota
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pendiente', 'aceptada', 'rechazada', 'cancelada'],
        default: 'pendiente'
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    // Podrías añadir un campo para mensajes o notas
    // messageToOwner: String,
    // responseFromOwner: String,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

AdoptionRequestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('AdoptionRequest', AdoptionRequestSchema);