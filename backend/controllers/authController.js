const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');

exports.register = async (req, res) => {
    const { name, email, password, city } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: 'Email ya registrado' });
        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hash, city });
        await user.save();
        res.status(201).json({ msg: 'Usuario creado' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ msg: 'Credenciales inválidas' });
        const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
