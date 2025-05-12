const Alert = require('../models/Alert');
const createError = require('http-errors');

exports.createAlert = async (req, res, next) => {
  try {
    const alertData = { ...req.body, user: req.user.id };
    const alert = await Alert.create(alertData);
    res.status(201).json({ ok: true, alert });
  } catch (err) {
    next(err);
  }
};

exports.listAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ user: req.user.id });
    res.json({ ok: true, alerts });
  } catch (err) {
    next(err);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: 'Alerta eliminada' });
  } catch (err) {
    next(err);
  }
};
