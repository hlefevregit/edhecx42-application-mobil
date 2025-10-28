const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

// Log + délègue au controller
router.get('/', (req, res) => {
  console.log('🛰️ /api/feed query:', req.query);
  console.log('🧑 req.user:', req.user);
  return feedController.getPersonalizedFeed(req, res);
});

// Alias /personalized -> même handler
router.get('/personalized', (req, res) => {
  console.log('🛰️ /api/feed/personalized query:', req.query);
  console.log('🧑 req.user:', req.user);
  return feedController.getPersonalizedFeed(req, res);
});

module.exports = router;