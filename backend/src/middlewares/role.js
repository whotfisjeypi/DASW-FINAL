module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return next({ status: 403, message: 'Forbidden' });
    }
    next();
  };
};
