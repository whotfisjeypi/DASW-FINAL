const express = require('express');
const router = express.Router();
const { createRequest, listMyRequests, updateRequestStatus } = require('../controllers/adoption.controller');
const { verifyToken } = require('../middlewares/authJwt');
const requireRole = require('../middlewares/role');

router.post('/', verifyToken, createRequest);
router.get('/mine', verifyToken, listMyRequests);
router.patch('/:id/status', verifyToken, requireRole('admin'), updateRequestStatus);

module.exports = router;
