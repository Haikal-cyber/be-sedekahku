const { Campaign, User, Donation } = require('../models');

module.exports = {
  // CREATE - Buat campaign baru
  create: async (req, res) => {
    try {
      const { title, description, target_amount, image_url, category } = req.body;
      const user_id = req.user.id;

      // Validasi input
      if (!title || !description || !target_amount || !category) {
        return res.status(400).json({ 
          message: 'Title, description, target_amount, dan category wajib diisi' 
        });
      }

      // Buat campaign
      const campaign = await Campaign.create({
        title,
        description,
        target_amount,
        current_amount: 0,
        image_url: image_url || null,
        category,
        status: 'pending',
        user_id
      });

      res.status(201).json({
        message: 'Campaign berhasil dibuat',
        campaign
      });
    } catch (err) {
      console.error('Create campaign error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // READ - List semua campaign
  list: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, category } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) whereClause.status = status;
      if (category) whereClause.category = category;

      const campaigns = await Campaign.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'name', 'email'] 
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        campaigns: campaigns.rows,
        total: campaigns.count,
        current_page: parseInt(page),
        total_pages: Math.ceil(campaigns.count / limit)
      });
    } catch (err) {
      console.error('List campaigns error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // READ - Detail campaign berdasarkan ID
  detail: async (req, res) => {
    try {
      const campaign = await Campaign.findByPk(req.params.id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'name', 'email'] 
          },
          {
            model: Donation,
            as: 'donations',
            attributes: ['id', 'amount', 'status', 'created_at'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign tidak ditemukan' });
      }

      res.json({ campaign });
    } catch (err) {
      console.error('Detail campaign error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // UPDATE - Update campaign
  update: async (req, res) => {
    try {
      const { title, description, target_amount, image_url, category, status } = req.body;
      const campaignId = req.params.id;
      const userId = req.user.id;

      // Cari campaign
      const campaign = await Campaign.findByPk(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign tidak ditemukan' });
      }

      // Cek apakah user adalah pemilik campaign atau admin
      if (campaign.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Tidak memiliki akses untuk mengubah campaign ini' });
      }

      // Update campaign
      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (target_amount) updateData.target_amount = target_amount;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (category) updateData.category = category;
      if (status && req.user.role === 'admin') updateData.status = status;

      await campaign.update(updateData);

      res.json({
        message: 'Campaign berhasil diupdate',
        campaign
      });
    } catch (err) {
      console.error('Update campaign error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // DELETE - Hapus campaign
  delete: async (req, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user.id;

      // Cari campaign
      const campaign = await Campaign.findByPk(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign tidak ditemukan' });
      }

      // Cek apakah user adalah pemilik campaign atau admin
      if (campaign.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Tidak memiliki akses untuk menghapus campaign ini' });
      }

      // Cek apakah ada donasi yang sudah masuk
      const donationCount = await Donation.count({ where: { campaign_id: campaignId } });
      if (donationCount > 0) {
        return res.status(400).json({ 
          message: 'Tidak dapat menghapus campaign yang sudah memiliki donasi' 
        });
      }

      // Hapus campaign
      await campaign.destroy();

      res.json({ message: 'Campaign berhasil dihapus' });
    } catch (err) {
      console.error('Delete campaign error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}; 