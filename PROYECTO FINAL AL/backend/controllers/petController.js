const Pet = require('../models/Pet');
const User = require('../models/User'); // Para verificar el rol si es necesario
const { validationResult } = require('express-validator');

// @route   POST api/pets
// @desc    Crear una nueva mascota
// @access  Private (necesita autenticación y rol adecuado)
exports.createPet = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, breed, age, city, healthStatus, photos, description } = req.body;

    try {
        // Opcional: Verificar si el usuario tiene el rol 'dueño/rescatista'
        const user = await User.findById(req.user.id);
        if (!user || (user.role !== 'dueño/rescatista' && user.role !== 'admin')) { // Admins también pueden
             return res.status(403).json({ msg: 'Acción no autorizada para este rol de usuario' });
        }

        const newPet = new Pet({
            name, type, breed, age, city, healthStatus, photos, description,
            owner: req.user.id
        });

        const pet = await newPet.save();
        res.status(201).json(pet);
    } catch (err) {
        console.error("Error en createPet:",err.message);
        next({ status: 500, message: 'Error del servidor al crear mascota' });
    }
};

// @route   GET api/pets
// @desc    Obtener todas las mascotas con filtros y paginación
// @access  Public
exports.getAllPets = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6; // Mascotas por página
        const skip = (page - 1) * limit;

        const { type, city, minAge, maxAge, status, keyword } = req.query;
        let query = { status: status || 'disponible' };

        if (type) query.type = { $regex: new RegExp(type, "i") };
        if (city) query.city = { $regex: new RegExp(city, "i") };
        
        const ageFilter = {};
        if (minAge) ageFilter.$gte = parseInt(minAge);
        if (maxAge) ageFilter.$lte = parseInt(maxAge);
        if (Object.keys(ageFilter).length > 0) query.age = ageFilter;

        if (keyword) {
            const searchRegex = new RegExp(keyword, "i");
            query.$or = [
                { name: searchRegex },
                { type: searchRegex },
                { breed: searchRegex },
                { description: searchRegex },
                { city: searchRegex }
            ];
        }
        
        console.log("Backend getAllPets Query:", query); // DEBUG
        const totalPets = await Pet.countDocuments(query);
        const pets = await Pet.find(query)
            .populate('owner', ['name', 'city', 'email'])
            .sort({ createdAt: -1 }) // Mascotas más nuevas primero
            .limit(limit)
            .skip(skip);
        
        console.log("Mascotas encontradas en backend:", pets.length); // DEBUG
        res.json({
            pets,
            currentPage: page,
            totalPages: Math.ceil(totalPets / limit),
            totalPets
        });
    } catch (err) {
        console.error("Error en getAllPets:", err.message);
        next({ status: 500, message: 'Error del servidor al obtener mascotas' });
    }
};

// @route   GET api/pets/:petId
// @desc    Obtener una mascota por ID
// @access  Public
exports.getPetById = async (req, res, next) => {
    try {
        const pet = await Pet.findById(req.params.petId).populate('owner', ['name', 'city', 'email']);
        if (!pet) {
            return res.status(404).json({ msg: 'Mascota no encontrada' });
        }
        // La lógica de si se muestra o no aunque no esté disponible, es mejor manejarla en el frontend
        // o si es una restricción dura, aquí. Por ahora, se devuelve si existe.
        res.json(pet);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId' || err.name === 'CastError') {
            return res.status(404).json({ msg: 'Mascota no encontrada (ID inválido)' });
        }
        next({ status: 500, message: 'Error del servidor al obtener detalle de mascota' });
    }
};

// @route   PATCH api/pets/:petId
// @desc    Actualizar una mascota
// @access  Private (solo el dueño o admin)
exports.updatePet = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, type, breed, age, city, healthStatus, photos, description, status } = req.body;
    const petFields = {};
    if (name !== undefined) petFields.name = name;
    if (type !== undefined) petFields.type = type;
    if (breed !== undefined) petFields.breed = breed;
    if (age !== undefined) petFields.age = age;
    if (city !== undefined) petFields.city = city;
    if (healthStatus !== undefined) petFields.healthStatus = healthStatus;
    if (photos !== undefined) petFields.photos = photos; // Asegúrate que el frontend envíe un array
    if (description !== undefined) petFields.description = description;
    if (status !== undefined) petFields.status = status;

    try {
        let pet = await Pet.findById(req.params.petId);
        if (!pet) return res.status(404).json({ msg: 'Mascota no encontrada' });

        const user = await User.findById(req.user.id);
        if (pet.owner.toString() !== req.user.id && user.role !== 'admin') {
            return res.status(401).json({ msg: 'Usuario no autorizado' });
        }

        pet = await Pet.findByIdAndUpdate(
            req.params.petId,
            { $set: petFields },
            { new: true, runValidators: true }
        ).populate('owner', ['name', 'city']);
        res.json(pet);
    } catch (err) {
        console.error("Error en updatePet:", err.message);
        if (err.kind === 'ObjectId' || err.name === 'CastError') return res.status(404).json({ msg: 'Mascota no encontrada (ID inválido)' });
        next({ status: 500, message: 'Error del servidor al actualizar mascota' });
    }
};

// @route   DELETE api/pets/:petId
// @desc    Eliminar una mascota
// @access  Private (solo el dueño o admin)
exports.deletePet = async (req, res, next) => {
    try {
        const pet = await Pet.findById(req.params.petId);
        if (!pet) return res.status(404).json({ msg: 'Mascota no encontrada' });
        
        const user = await User.findById(req.user.id);
        if (pet.owner.toString() !== req.user.id && user.role !== 'admin') {
            return res.status(401).json({ msg: 'Usuario no autorizado' });
        }

        await pet.deleteOne();
        // Opcional: Eliminar solicitudes de adopción asociadas
        // const AdoptionRequest = require('../models/AdoptionRequest'); // Necesitarías importar esto
        // await AdoptionRequest.deleteMany({ pet: req.params.petId });
        res.json({ msg: 'Mascota eliminada exitosamente' });
    } catch (err) {
        console.error("Error en deletePet:", err.message);
        if (err.kind === 'ObjectId' || err.name === 'CastError') return res.status(404).json({ msg: 'Mascota no encontrada (ID inválido)' });
        next({ status: 500, message: 'Error del servidor al eliminar mascota' });
    }
};