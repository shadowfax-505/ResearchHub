const { isDatabaseUnavailable, sendDatabaseUnavailable } = require('../utils/errors');
const Discovery = require('../models/Discovery');


const getGlobalFeed = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  try {
    const feed = await Discovery.getFeed(req.user?.user_id, req.query.cursor, limit);
    return res.json({
      success: true,
      data: feed.data,
      pagination: { next_cursor: feed.next_cursor, has_more: feed.has_more, limit },
      onboarding: req.user ? { needs_interests: feed.data.every(item => item.feed_reason === 'discovery') } : null
    });
  } catch (error) {
    console.error('Error fetching scientific feed:', error);
    if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
    return res.status(error.status || 500).json({ error: error.message || 'Failed to retrieve feed' });
  }
};

module.exports = { getGlobalFeed };
