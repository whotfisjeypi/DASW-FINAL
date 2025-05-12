const express = require('express');
const router = express.Router();
const { listUsers, deleteUser, updateRole } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/authJwt');
const requireRole = require('../middlewares/role');

router.get('/', verifyToken, requireRole('admin'), listUsers);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);
router.patch('/:id/role', verifyToken, requireRole('admin'), updateRole);

module.exports = router;
