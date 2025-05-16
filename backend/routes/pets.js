const r = require('express').Router();
const auth = require('../middleware/auth');
const pc = require('../controllers/petController');

r.get('/', pc.list);
r.get('/:id', pc.getOne);
r.post('/', auth, pc.create);
r.put('/:id', auth, pc.update);
r.delete('/:id', auth, pc.remove);

module.exports = r;
