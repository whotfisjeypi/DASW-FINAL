const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getProfile, updateProfile } = require('../controllers/auth.controller');
const { checkRegister, checkLogin } = require('../middlewares/validations');

router.post('/register', checkRegister, register);
router.post('/login', checkLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', getProfile);
router.patch('/me', updateProfile);

module.exports = router;
