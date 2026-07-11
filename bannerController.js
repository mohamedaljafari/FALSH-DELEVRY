const { Banner } = require('../models');
const { Op } = require('sequelize');

async function listActiveBanners(req, res, next) {
  try {
    const now = new Date();
    const banners = await Banner.findAll({
      where: {
        is_active: true,
        [Op.and]: [
          { [Op.or]: [{ starts_at: null }, { starts_at: { [Op.lte]: now } }] },
          { [Op.or]: [{ ends_at: null }, { ends_at: { [Op.gte]: now } }] },
        ],
      },
      order: [['display_order', 'ASC']],
    });
    res.json(banners);
  } catch (err) {
    next(err);
  }
}

// إدارة (أدمن)
async function listAll(req, res, next) {
  try {
    const banners = await Banner.findAll({ order: [['display_order', 'ASC']] });
    res.json(banners);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'البانر غير موجود' });
    await banner.update(req.body);
    res.json(banner);
  } catch (err) { next(err); }
}

async function toggle(req, res, next) {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'البانر غير موجود' });
    await banner.update({ is_active: !banner.is_active });
    res.json(banner);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await Banner.destroy({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { listActiveBanners, listAll, create, update, toggle, remove };
