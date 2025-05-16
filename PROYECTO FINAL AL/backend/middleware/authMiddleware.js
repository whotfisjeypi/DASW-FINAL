const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
    // Obtener token del header
    const authHeader = req.header('Authorization');

    // Verificar si no hay token o si no está en el formato Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No hay token o es inválido, autorización denegada' });
    }

    try {
        const token = authHeader.split(' ')[1]; // Extraer el token de "Bearer <token>"
        if (!token) {
             return res.status(401).json({ msg: 'Formato de token inválido, autorización denegada' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Añade el payload del usuario (ej: id, role) a req
        next();
    } catch (err) {
        console.error('Error en middleware de autenticación:', err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Token no es válido' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'El token ha expirado' });
        }
        res.status(500).json({ msg: 'Error del servidor en la autenticación del token' });
    }
};