const { Category, Campaign } = require('../models');

module.exports = {
  // CREATE - Buat category baru (hanya admin)
  create: async (req, res) => {
    try {
      const { name } = req.body;

      // Validasi input
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Nama category wajib diisi' });
      }

      // Cek apakah category sudah ada
      const existingCategory = await Category.findOne({ 
        where: { name: name.trim() } 
      });
      
      if (existingCategory) {
        return res.status(409).json({ message: 'Category dengan nama tersebut sudah ada' });
      }

      // Buat category
      const category = await Category.create({
        name: name.trim()
      });

      res.status(201).json({
        message: 'Category berhasil dibuat',
        category
      });
    } catch (err) {
      console.error('Create category error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // READ - List semua category
  list: async (req, res) => {
    try {
      const categories = await Category.findAll({
        order: [['name', 'ASC']]
      });

      res.json({ categories });
    } catch (err) {
      console.error('List categories error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // READ - Detail category berdasarkan ID
  detail: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id, {
        include: [
          {
            model: Campaign,
            as: 'campaigns',
            attributes: ['id', 'title', 'status', 'target_amount', 'current_amount'],
            where: { status: 'active' },
            required: false
          }
        ]
      });

      if (!category) {
        return res.status(404).json({ message: 'Category tidak ditemukan' });
      }

      res.json({ category });
    } catch (err) {
      console.error('Detail category error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // UPDATE - Update category (hanya admin)
  update: async (req, res) => {
    try {
      const { name } = req.body;
      const categoryId = req.params.id;

      // Cek role admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya admin yang dapat mengubah category' });
      }

      // Validasi input
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Nama category wajib diisi' });
      }

      // Cari category
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category tidak ditemukan' });
      }

      // Cek apakah nama baru sudah ada (kecuali category yang sedang diupdate)
      const existingCategory = await Category.findOne({ 
        where: { 
          name: name.trim(),
          id: { [require('sequelize').Op.ne]: categoryId }
        } 
      });
      
      if (existingCategory) {
        return res.status(409).json({ message: 'Category dengan nama tersebut sudah ada' });
      }

      // Update category
      await category.update({ name: name.trim() });

      res.json({
        message: 'Category berhasil diupdate',
        category
      });
    } catch (err) {
      console.error('Update category error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // DELETE - Hapus category (hanya admin)
  delete: async (req, res) => {
    try {
      const categoryId = req.params.id;

      // Cek role admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya admin yang dapat menghapus category' });
      }

      // Cari category
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category tidak ditemukan' });
      }

      // Cek apakah ada campaign yang menggunakan category ini
      const campaignCount = await Campaign.count({ where: { category: category.name } });
      if (campaignCount > 0) {
        return res.status(400).json({ 
          message: `Tidak dapat menghapus category yang masih digunakan oleh ${campaignCount} campaign` 
        });
      }

      // Hapus category
      await category.destroy();

      res.json({ message: 'Category berhasil dihapus' });
    } catch (err) {
      console.error('Delete category error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}; 