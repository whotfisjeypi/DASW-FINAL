const express = require('express');
const router = express.Router();
const { createAlert, listAlerts, deleteAlert } = require('../controllers/alert.controller');
const { verifyToken } = require('../middlewares/authJwt');

router.post('/', verifyToken, createAlert);
router.get('/', verifyToken, listAlerts);
router.delete('/:id', verifyToken, deleteAlert);

module.exports = router;
