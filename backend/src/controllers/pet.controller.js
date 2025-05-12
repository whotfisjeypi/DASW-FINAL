const Pet = require('../models/Pet');
const createError = require('http-errors');

exports.createPet = async (req, res, next) => {
  try {
    const petData = { ...req.body, owner: req.user.id };
    if (req.files) {
      petData.photos = req.files.map(file => file.path);
    }
    const pet = await Pet.create(petData);
    res.status(201).json({ ok: true, pet });
  } catch (err) {
    next(err);
  }
};

exports.listPets = async (req, res, next) => {
  try {
    // Se pueden agregar filtros en req.query
    const pets = await Pet.find();
    res.json({ ok: true, pets });
  } catch (err) {
    next(err);
  }
};

exports.getPet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) throw createError(404, 'Mascota no encontrada');
    res.json({ ok: true, pet });
  } catch (err) {
    next(err);
  }
};

exports.updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pet) throw createError(404, 'Mascota no encontrada');
    res.json({ ok: true, pet });
  } catch (err) {
    next(err);
  }
};

exports.deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) throw createError(404, 'Mascota no encontrada');
    res.json({ ok: true, message: 'Mascota eliminada' });
  } catch (err) {
    next(err);
  }
};
