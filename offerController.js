const { Offer } = require('../models');
const { Op } = require('sequelize');

async function listActiveOffers(req, res, next) {
  try {
    const now = new Date();
    const offers = await Offer.findAll({
      where: {
        is_active: true,
        [Op.and]: [
          { [Op.or]: [{ starts_at: null }, { starts_at: { [Op.lte]: now } }] },
          { [Op.or]: [{ ends_at: null }, { ends_at: { [Op.gte]: now } }] },
        ],
      },
      order: [['created_at', 'DESC']],
    });
    res.json(offers);
  } catch (err) { next(err); }
}

async function listAll(req, res, next) {
  try {
    const offers = await Offer.findAll({ order: [['created_at', 'DESC']] });
    res.json(offers);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json(offer);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'العرض غير موجود' });
    await offer.update(req.body);
    res.json(offer);
  } catch (err) { next(err); }
}

async function toggle(req, res, next) {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'العرض غير موجود' });
    await offer.update({ is_active: !offer.is_active });
    res.json(offer);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await Offer.destroy({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { listActiveOffers, listAll, create, update, toggle, remove };
