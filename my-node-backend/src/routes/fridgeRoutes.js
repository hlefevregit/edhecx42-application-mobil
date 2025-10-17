const express = require('express');
const { getFridgeItems, addFridgeItems, updateFridgeItem, deleteFridgeItem } = require('../controllers/fridgeController');

const router = express.Router();

router.get('/:userId', getFridgeItems);
router.post('/:userId', addFridgeItems);
router.put('/:itemId', updateFridgeItem);
router.delete('/:itemId', deleteFridgeItem);

module.exports = router;