const express = require('express');
const { getKnorrProfile, followUser, unfollowUser } = require('../controllers/knorrProfileController');

const router = express.Router();

router.get('/:userId', getKnorrProfile);
router.post('/follow', followUser);
router.post('/unfollow', unfollowUser);

module.exports = router;