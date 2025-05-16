const r = require('express').Router();
const auth = require('../middleware/auth');
const rc = require('../controllers/requestController');

r.get('/', auth, rc.list);
r.post('/', auth, rc.create);
r.patch('/:id/approve', auth, rc.approve);
r.patch('/:id/reject',  auth, rc.reject);

module.exports = r;
