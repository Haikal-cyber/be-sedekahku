const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, donationController.create);
router.get('/', authMiddleware, donationController.list);
router.get('/:id', authMiddleware, donationController.detail);
router.get('/by-campaign/:campaignId', authMiddleware, donationController.byCampaign);
router.post('/notify', donationController.notify); // callback Midtrans tidak perlu auth

module.exports = router; 