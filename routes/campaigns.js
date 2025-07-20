const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (tidak perlu auth)
router.get('/', campaignController.list);
router.get('/:id', campaignController.detail);

// Protected routes (perlu auth)
router.post('/', authMiddleware, campaignController.create);
router.put('/:id', authMiddleware, campaignController.update);
router.delete('/:id', authMiddleware, campaignController.delete);

module.exports = router; 