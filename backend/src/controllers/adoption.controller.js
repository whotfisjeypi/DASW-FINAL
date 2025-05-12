const AdoptionRequest = require('../models/AdoptionRequest');
const createError = require('http-errors');

exports.createRequest = async (req, res, next) => {
  try {
    const { petId, message } = req.body;
    const request = await AdoptionRequest.create({
      pet: petId,
      applicant: req.user.id,
      message
    });
    res.status(201).json({ ok: true, request });
  } catch (err) {
    next(err);
  }
};

exports.listMyRequests = async (req, res, next) => {
  try {
    const requests = await AdoptionRequest.find({ applicant: req.user.id });
    res.json({ ok: true, requests });
  } catch (err) {
    next(err);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await AdoptionRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) throw createError(404, 'Solicitud no encontrada');
    res.json({ ok: true, request });
  } catch (err) {
    next(err);
  }
};
