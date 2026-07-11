const { buildHeatmap } = require('../services/heatmapService');

async function getHeatmap(req, res, next) {
  try {
    const sinceHours = req.query.since_hours ? Number(req.query.since_hours) : 6;
    const cells = await buildHeatmap({ sinceHours });
    res.json({ generated_at: new Date().toISOString(), cell_size_deg: 0.01, cells });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHeatmap };
