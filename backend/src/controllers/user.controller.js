const User = require('../models/User');
const createError = require('http-errors');

exports.listUsers = async (req, res, next) => {
  try {
    // Se pueden implementar paginación y filtros
    const users = await User.find();
    res.json({ ok: true, users });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
};
