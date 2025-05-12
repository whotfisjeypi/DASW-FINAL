const { check } = require('express-validator');

exports.checkRegister = [
  check('name', 'Name is required').notEmpty(),
  check('email', 'Invalid email').isEmail(),
  check('password', 'Min 8 characters').isLength({ min: 8 }),
  check('city', 'City is required').notEmpty()
];

exports.checkLogin = [
  check('email', 'Invalid email').isEmail(),
  check('password', 'Password is required').notEmpty()
];

exports.checkPet = [
  check('type', 'Tipo de mascota es requerido').notEmpty(),
  // ...otras validaciones según sea necesario
];
