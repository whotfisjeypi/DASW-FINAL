const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/pets', require('./pet.routes'));
router.use('/adoptions', require('./adoption.routes'));
router.use('/alerts', require('./alert.routes'));

module.exports = router;
