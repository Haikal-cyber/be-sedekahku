const { Donation, Campaign, User, PaymentNotification } = require('../models');
const midtransService = require('../services/midtransService');

module.exports = {
  create: async (req, res) => {
    try {
      const { campaign_id, amount, donor_name, payment_type } = req.body;
      const user_id = req.user.id;

      // Validasi input
      if (!campaign_id || !amount) {
        return res.status(400).json({ message: 'Campaign ID dan amount wajib diisi' });
      }

      // Cek campaign exists
      const campaign = await Campaign.findByPk(campaign_id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign tidak ditemukan' });
      }

      // Buat donasi dengan status pending
      const donation = await Donation.create({
        user_id,
        campaign_id,
        amount,
        status: 'pending',
        donor_name: donor_name || null,
        payment_type: payment_type || 'bank_transfer'
      });

      // Ambil data user untuk Midtrans
      const user = await User.findByPk(user_id);

      // Buat transaksi Midtrans
      const midtransData = {
        id: donation.id,
        amount: donation.amount,
        donor_name: donation.donor_name,
        email: user.email,
        phone: user.phone,
        campaign_id: campaign.id,
        campaign_title: campaign.title
      };

      const transaction = await midtransService.createTransaction(midtransData);

      // Update donasi dengan token Midtrans
      await donation.update({
        payment_token: transaction.token,
        redirect_url: transaction.redirect_url
      });

      res.status(201).json({
        message: 'Donasi berhasil dibuat',
        donation: {
          id: donation.id,
          amount: donation.amount,
          status: donation.status,
          payment_token: transaction.token,
          redirect_url: transaction.redirect_url
        }
      });
    } catch (err) {
      console.error('Create donation error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  list: async (req, res) => {
    try {
      let whereClause = {};
      
      // Filter berdasarkan role user
      if (req.user.role !== 'admin') {
        whereClause.user_id = req.user.id;
      }

      const donations = await Donation.findAll({
        where: whereClause,
        include: [
          { model: Campaign, as: 'campaign', attributes: ['id', 'title'] },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({ donations });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  detail: async (req, res) => {
    try {
      const donation = await Donation.findByPk(req.params.id, {
        include: [
          { model: Campaign, as: 'campaign', attributes: ['id', 'title', 'description'] },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ]
      });

      if (!donation) {
        return res.status(404).json({ message: 'Donasi tidak ditemukan' });
      }

      res.json({ donation });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  byCampaign: async (req, res) => {
    try {
      const donations = await Donation.findAll({
        where: { campaign_id: req.params.campaignId },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name'] }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({ donations });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  notify: async (req, res) => {
    try {
      // Verifikasi callback dari Midtrans
      const notification = await midtransService.verifyCallback(req.body);
      
      // Simpan notification
      await PaymentNotification.create({
        donation_id: notification.order_id,
        payload: req.body,
        received_at: new Date()
      });

      // Update status donasi berdasarkan transaction_status
      const donation = await Donation.findByPk(notification.order_id);
      if (!donation) {
        return res.status(404).json({ message: 'Donasi tidak ditemukan' });
      }

      let newStatus = 'pending';
      if (notification.transaction_status === 'capture' || notification.transaction_status === 'settlement') {
        newStatus = 'paid';
      } else if (notification.transaction_status === 'deny' || notification.transaction_status === 'expire') {
        newStatus = 'failed';
      }

      await donation.update({
        status: newStatus,
        paid_at: newStatus === 'paid' ? new Date() : null
      });

      // Update current_amount campaign jika pembayaran berhasil
      if (newStatus === 'paid') {
        const campaign = await Campaign.findByPk(donation.campaign_id);
        if (campaign) {
          await campaign.update({
            current_amount: parseFloat(campaign.current_amount || 0) + parseFloat(donation.amount)
          });
        }
      }

      res.json({ message: 'Callback berhasil diproses', status: newStatus });
    } catch (err) {
      console.error('Callback error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}; 