const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la mascota es requerido'],
        trim: true
    },
    type: { // Perro, gato, conejo, etc.
        type: String,
        required: [true, 'El tipo de animal es requerido'],
        trim: true
    },
    breed: {
        type: String,
        trim: true // Puede no ser siempre conocido
    },
    age: { // Podría ser un número (años/meses) o un string descriptivo (cachorro, adulto)
        type: Number, // Considerar cómo manejar meses vs años
        required: [true, 'La edad es requerida']
    },
    city: {
        type: String,
        required: [true, 'La ciudad es requerida'],
        trim: true
    },
    healthStatus: {
        type: String,
        required: [true, 'El estado de salud es requerido'],
        trim: true
    },
    photos: [{ // Array de URLs de las imágenes
        type: String,
        trim: true
    }],
    description: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: { // Disponible, en proceso, adoptado
        type: String,
        enum: ['disponible', 'en proceso', 'adoptado'],
        default: 'disponible'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pet', PetSchema);