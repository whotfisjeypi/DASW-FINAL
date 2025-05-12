const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { createPet, listPets, getPet, updatePet, deletePet } = require('../controllers/pet.controller');
const { verifyToken } = require('../middlewares/authJwt');
const { checkPet } = require('../middlewares/validations');

router.post('/', verifyToken, upload.array('photos', 5), checkPet, createPet);
router.get('/', listPets);
router.get('/:id', getPet);
router.patch('/:id', verifyToken, checkPet, updatePet);
router.delete('/:id', verifyToken, deletePet);

module.exports = router;
