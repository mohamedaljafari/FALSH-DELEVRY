const { DriverLocation, Order } = require('../models');
const { Op } = require('sequelize');

/**
 * تقسّم المنطقة إلى شبكة (grid) بحجم خلية قابل للتعديل بالدرجات،
 * وتُرجع كثافة الطلبات وكثافة السائقين في كل خلية — يعرضها تطبيق السائق كخريطة حرارية
 * لمساعدته على التوجّه لمناطق الطلب المرتفع.
 */
const CELL_SIZE_DEG = 0.01; // ~1.1 كم تقريبًا، قابل للتعديل

function cellKey(lat, lng) {
  const latCell = Math.floor(lat / CELL_SIZE_DEG);
  const lngCell = Math.floor(lng / CELL_SIZE_DEG);
  return `${latCell}:${lngCell}`;
}

function cellCenter(key) {
  const [latCell, lngCell] = key.split(':').map(Number);
  return {
    latitude: (latCell + 0.5) * CELL_SIZE_DEG,
    longitude: (lngCell + 0.5) * CELL_SIZE_DEG,
  };
}

/**
 * يبني خريطة حرارية لآخر N ساعة من الطلبات (طلب = نقطة استلام/توصيل)
 * + مواقع السائقين المتصلين حاليًا، لحساب "فجوة العرض والطلب" لكل خلية.
 */
async function buildHeatmap({ sinceHours = 6 } = {}) {
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

  const recentOrders = await Order.findAll({
    where: {
      created_at: { [Op.gte]: since },
      drop_latitude: { [Op.ne]: null },
      drop_longitude: { [Op.ne]: null },
    },
    attributes: ['drop_latitude', 'drop_longitude'],
    raw: true,
  });

  const onlineDrivers = await DriverLocation.findAll({
    where: { is_online: true },
    attributes: ['latitude', 'longitude', 'is_available'],
    raw: true,
  });

  const demandMap = {};
  for (const o of recentOrders) {
    const key = cellKey(o.drop_latitude, o.drop_longitude);
    demandMap[key] = (demandMap[key] || 0) + 1;
  }

  const supplyMap = {};
  for (const d of onlineDrivers) {
    const key = cellKey(d.latitude, d.longitude);
    supplyMap[key] = (supplyMap[key] || 0) + 1;
  }

  const allKeys = new Set([...Object.keys(demandMap), ...Object.keys(supplyMap)]);
  const cells = [...allKeys].map((key) => {
    const demand = demandMap[key] || 0;
    const supply = supplyMap[key] || 0;
    // "الحرارة": كلما زاد الطلب مقارنة بعدد السائقين المتاحين، زادت شدة اللون في الواجهة
    const intensity = supply === 0 ? demand : demand / supply;
    return { ...cellCenter(key), demand, supply, intensity };
  });

  return cells;
}

module.exports = { buildHeatmap };
