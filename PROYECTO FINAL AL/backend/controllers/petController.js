const Pet = require('../models/Pet');

const User = require('../models/User'); // Para verificar el rol si es necesario

const { validationResult } = require('express-validator');



// @route   POST api/pets

// @desc    Crear una nueva mascota

// @access  Private (necesita autenticación y rol adecuado)


exports.createPet = async (req, res, next) => {




        const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({ errors: errors.array() });

    }



    // req.user.id debería estar disponible gracias al authMiddleware

    const { name, type, breed, age, city, healthStatus, photos, description } = req.body;



    try {

        // Opcional: Verificar si el usuario tiene el rol 'dueño/rescatista'

        // const user = await User.findById(req.user.id);

        // if (!user || user.role !== 'dueño/rescatista') {

        //     return res.status(403).json({ msg: 'Acción no autorizada para este rol de usuario' });

        // }



        const newPet = new Pet({

            name,

            type,

            breed,

            age,

            city,

            healthStatus,

            photos,

            description,

            owner: req.user.id // ID del usuario logueado

        });



        const pet = await newPet.save();

        res.status(201).json(pet);

    } catch (err) {

        console.error(err.message);

        next({ status: 500, message: 'Error del servidor al crear mascota' });

    }


};



// @route   GET api/pets

// @desc    Obtener todas las mascotas con filtros opcionales

// @access  Public



exports.getAllPets = async (req, res, next) => {

    try {

        const { type, city, minAge, maxAge, status } = req.query;

        let query = { status: status || 'disponible' }; // Por defecto solo las disponibles



        if (type) query.type = { $regex: new RegExp(type, "i") }; // Búsqueda insensible a mayúsculas

        if (city) query.city = { $regex: new RegExp(city, "i") };

        if (minAge) query.age = { ...query.age, $gte: parseInt(minAge) };

        if (maxAge) query.age = { ...query.age, $lte: parseInt(maxAge) };

       

        const pets = await Pet.find(query).populate('owner', ['name', 'city', 'email']); // Trae datos del dueño

        res.json(pets);

    } catch (err) {

        console.error(err.message);

        next({ status: 500, message: 'Error del servidor al obtener mascotas' });

    }

};



// @route   GET api/pets/:petId

// @desc    Obtener una mascota por ID

// @access  Public

exports.getPetById = async (req, res, next) => {

    try {

        const pet = await Pet.findById(req.params.petId).populate('owner', ['name', 'city', 'email']);

        if (!pet) {

            return res.status(404).json({ msg: 'Mascota no encontrada' });

        }

        if (pet.status !== 'disponible' && (!req.user || req.user.id.toString() !== pet.owner._id.toString())) {

             // Opcional: restringir acceso si no está disponible, excepto para el dueño

            // return res.status(404).json({ msg: 'Mascota no disponible para visualización' });

        }

        res.json(pet);

    } catch (err) {

        console.error(err.message);

        if (err.kind === 'ObjectId') {

            return res.status(404).json({ msg: 'Mascota no encontrada (ID inválido)' });

        }

        next({ status: 500, message: 'Error del servidor' });

    }

};



// @route   PATCH api/pets/:petId

// @desc    Actualizar una mascota

// @access  Private (solo el dueño)

exports.updatePet = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({ errors: errors.array() });

    }



    const { name, type, breed, age, city, healthStatus, photos, description, status } = req.body;

   

    // Construir objeto con los campos a actualizar

    const petFields = {};

    if (name) petFields.name = name;

    if (type) petFields.type = type;

    if (breed) petFields.breed = breed;

    if (age) petFields.age = age;

    if (city) petFields.city = city;

    if (healthStatus) petFields.healthStatus = healthStatus;

    if (photos) petFields.photos = photos;

    if (description) petFields.description = description;

    if (status) petFields.status = status;



    try {

        let pet = await Pet.findById(req.params.petId);

        if (!pet) {

            return res.status(404).json({ msg: 'Mascota no encontrada' });

        }



        // Verificar que el usuario logueado es el dueño de la mascota

        if (pet.owner.toString() !== req.user.id) {

            return res.status(401).json({ msg: 'Usuario no autorizado para modificar esta mascota' });

        }



        pet = await Pet.findByIdAndUpdate(

            req.params.petId,

            { $set: petFields },

            { new: true, runValidators: true } // new:true devuelve el documento modificado

        ).populate('owner', ['name', 'city']);



        res.json(pet);

    } catch (err) {

        console.error(err.message);

        if (err.kind === 'ObjectId') {

            return res.status(404).json({ msg: 'Mascota no encontrada (ID inválido)' });

        }

        next({ status: 500, message: 'Error del servidor al actualizar mascota' });

    }

};



// @route   DELETE api/pets/:petId

// @desc    Eliminar una mascota

// @access  Private (solo el dueño)

exports.deletePet = async (req, res, next) => {

    try {

        const pet = await Pet.findById(req.params.petId);

        if (!pet) {

            return res.status(404).json({ msg: 'Mascota no encontrada' });

        }



        // Verificar que el usuario logueado es el dueño

        if (pet.owner.toString() !== req.user.id) {

            return res.status(401).json({ msg: 'Usuario no autorizado para eliminar esta mascota' });

        }



        await pet.deleteOne(); // Usar deleteOne() en el documento Mongoose



        // Opcional: Eliminar solicitudes de adopción asociadas

        // await AdoptionRequest.deleteMany({ pet: req.params.petId });



        res.json({ msg: 'Mascota eliminada exitosamente' });

    } catch (err) {

        console.error(err.message);

        if (err.kind === 'ObjectId') {

            return res.status(404).json({ msg: 'Mascota no encontrada (ID inválido)' });

        }

        next({ status: 500, message: 'Error del servidor al eliminar mascota' });

    }

};