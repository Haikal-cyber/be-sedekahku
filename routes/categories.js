const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (tidak perlu auth)
router.get('/', categoryController.list);
router.get('/:id', categoryController.detail);

// Protected routes (perlu auth - hanya admin)
router.post('/', authMiddleware, categoryController.create);
router.put('/:id', authMiddleware, categoryController.update);
router.delete('/:id', authMiddleware, categoryController.delete);

module.exports = router; 