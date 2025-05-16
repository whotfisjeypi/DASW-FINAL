const Alert = require('../models/Alert');

exports.list = async (req, res) => {
    const alerts = await Alert.find({ user: req.user.id });
    res.json(alerts);
};

exports.create = async (req, res) => {
    const a = new Alert({ ...req.body, user: req.user.id });
    await a.save();
    res.status(201).json(a);
};

exports.update = async (req, res) => {
    const a = await Alert.findById(req.params.id);
    if (!a || a.user.toString()!==req.user.id)
        return res.status(403).json({ msg: 'No autorizado' });
    Object.assign(a, req.body);
    await a.save();
    res.json(a);
};

exports.remove = async (req, res) => {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Alerta eliminada' });
};
