const jwt = require('jsonwebtoken');
const createError = require('http-errors');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(createError(401, 'No token provided'));
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(createError(401, 'Unauthorized'));
    req.user = decoded;
    next();
  });
};
