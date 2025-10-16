const express = require('express');
const { registerUser, getUserProfile, updateUserProfile } = require('../controllers/userController'); // Assurez-vous que le chemin est correct

const router = express.Router();

router.post('/register', registerUser); // Vérifiez que registerUser est bien défini
router.get('/:userId', getUserProfile); // Vérifiez que getUserProfile est bien défini
router.put('/:userId', updateUserProfile); // Vérifiez que updateUserProfile est bien défini

module.exports = router;