const Pet = require('../models/Pet');

exports.list = async (req, res) => {
    const filters = {};
    ['type','city'].forEach(f => req.query[f] && (filters[f]=req.query[f]));
    if (req.query.minAge) filters.age = { $gte: +req.query.minAge };
    if (req.query.maxAge) filters.age = { ...(filters.age||{}), $lte: +req.query.maxAge };
    const pets = await Pet.find(filters).populate('owner','name email');
    res.json(pets);
};

exports.getOne = async (req, res) => {
    const p = await Pet.findById(req.params.id).populate('owner','name email');
    if (!p) return res.status(404).json({ msg: 'No existe' });
    res.json(p);
};

exports.create = async (req, res) => {
    const data = { ...req.body, owner: req.user.id };
    const pet = new Pet(data);
    await pet.save();
    res.status(201).json(pet);
};

exports.update = async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    if (!pet || pet.owner.toString() !== req.user.id)
        return res.status(403).json({ msg: 'No autorizado' });
    Object.assign(pet, req.body);
    await pet.save();
    res.json(pet);
};

exports.remove = async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ msg: 'No existe' });
    if (pet.owner.toString() !== req.user.id && req.user.role!=='admin')
        return res.status(403).json({ msg: 'No autorizado' });
    await pet.remove();
    res.json({ msg: 'Eliminada' });
};
