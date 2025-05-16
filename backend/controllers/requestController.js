const Request = require('../models/Request');

exports.list = async (req, res) => {
    const filter = req.user.role==='admin'
        ? {}
        : { requester: req.user.id };
    const all = await Request.find(filter).populate('pet requester','name email');
    res.json(all);
};

exports.create = async (req, res) => {
    const r = new Request({ pet: req.body.pet, requester: req.user.id });
    await r.save();
    res.status(201).json(r);
};

exports.approve = async (req, res) => {
    const r = await Request.findByIdAndUpdate(req.params.id, { status:'Aprobada' }, { new: true });
    res.json(r);
};

exports.reject = async (req, res) => {
    const r = await Request.findByIdAndUpdate(req.params.id, { status:'Rechazada' }, { new: true });
    res.json(r);
};
