const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

module.exports = function(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ msg: 'Token faltante' });
    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, secret);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ msg: 'Token inválido' });
    }
};
