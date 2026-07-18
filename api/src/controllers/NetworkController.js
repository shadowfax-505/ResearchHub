const oracledb = require('oracledb');
const { pool } = require('../config/database');

exports.getRecommendations = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const result = await pool.call('BEGIN PKG_NETWORK.get_recommendations(:userId, :limit, :outCursor); END;', {
      userId: req.user.user_id,
      limit,
      outCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    });
    res.json({ success: true, data: result.outCursor || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
