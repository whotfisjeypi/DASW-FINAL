module.exports = {
    secret: process.env.JWT_SECRET || 'cambiame_por_una_clave_segura',
    expiresIn: '7d',
};
