const Discovery = require('../models/Discovery');
const { demoPapers } = require('../utils/demoData');

function isConnectionFailure(error) {
  return /NJS-503|NJS-500|ECONNREFUSED|connection.*(closed|lost|failed)|no listener/i.test(String(error?.message || error));
}

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
    if (isConnectionFailure(error)) {
      return res.json({
        success: true,
        source: 'demo',
        data: demoPapers.slice(0, limit).map(paper => ({
          ...paper,
          feed_priority: 0,
          feed_reason: 'discovery',
          authors: paper.authors || []
        })),
        pagination: { next_cursor: null, has_more: false, limit },
        onboarding: req.user ? { needs_interests: true } : null
      });
    }
    return res.status(error.status || 500).json({ error: error.message || 'Failed to retrieve feed' });
  }
};

module.exports = { getGlobalFeed };
