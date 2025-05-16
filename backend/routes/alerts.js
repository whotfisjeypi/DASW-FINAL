const r = require('express').Router();
const auth = require('../middleware/auth');
const ac = require('../controllers/alertController');

r.get('/', auth, ac.list);
r.post('/', auth, ac.create);
r.put('/:id', auth, ac.update);
r.delete('/:id', auth, ac.remove);

module.exports = r;
