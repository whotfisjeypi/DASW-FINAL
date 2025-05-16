const r = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const uc = require('../controllers/userController');

r.get('/', auth, role('admin'), uc.getAll);
r.get('/:id', auth, uc.getOne);
r.patch('/:id', auth, uc.update);
r.delete('/:id', auth, role('admin'), uc.delete);
r.put('/:id/role', auth, role('admin'), uc.changeRole);

module.exports = r;
