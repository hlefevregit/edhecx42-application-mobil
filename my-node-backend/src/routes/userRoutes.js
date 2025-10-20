const express = require('express');
const path = require('path');
const multer = require('multer');
const {
  getProfile,
  updateProfile,
} = require('../controllers/userController'); // <- corrige le nom du fichier

const router = express.Router();

// Storage avatars
const storage = multer.diskStorage({
  destination: (_req, _file, cb) =>
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'avatars')),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `avatar-${unique}${ext}`);
  },
});
const upload = multer({ storage });

// Profil
router.get('/:userId', getProfile);
router.put('/:userId', upload.single('avatar'), updateProfile);

module.exports = router;