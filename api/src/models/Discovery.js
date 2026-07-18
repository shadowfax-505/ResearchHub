const oracledb = require('oracledb');
const { pool } = require('../config/database');

function parseCursor(cursor) {
  if (!cursor) return {};
  try {
    const value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    return {
      beforeDate: value.beforeDate ? new Date(value.beforeDate) : null,
      beforeId: Number(value.beforeId) || null,
      beforePriority: Number(value.beforePriority) || 0
    };
  } catch (_error) {
    const error = new Error('Invalid feed cursor');
    error.status = 400;
    throw error;
  }
}

function encodeCursor(paper) {
  return Buffer.from(JSON.stringify({
    beforeDate: paper.publication_date,
    beforeId: paper.paper_id,
    beforePriority: paper.feed_priority
  })).toString('base64url');
}

function normalizePaperRows(rows) {
  const papers = new Map();
  for (const row of rows) {
    let paper = papers.get(row.paper_id);
    if (!paper) {
      paper = {
        paper_id: row.paper_id,
        title: row.title,
        abstract: row.abstract,
        publication_date: row.publication_date,
        doi: row.doi,
        journal_id: row.journal_id,
        journal_name: row.journal_name,
        citation_count: row.citation_count,
        view_count: row.view_count,
        download_count: row.download_count,
        pdf_url: row.pdf_url,
        cover_image_url: row.cover_image_url,
        language: row.language,
        is_peer_reviewed: row.is_peer_reviewed,
        publication_type: row.publication_type,
        is_open_access: row.is_open_access,
        feed_priority: row.feed_priority,
        feed_reason: row.feed_reason,
        authors: []
      };
      papers.set(row.paper_id, paper);
    }
    if (row.author_id && !paper.authors.some(author => author.author_id === row.author_id)) {
      paper.authors.push({
        author_id: row.author_id,
        author_order: row.author_order,
        full_name: row.author_name,
        affiliation: row.author_affiliation,
        country: row.author_country,
        orcid: row.author_orcid,
        claimed_user_id: row.claimed_user_id,
        claimed_profile_slug: row.claimed_profile_slug,
        claimed_profile_headline: row.claimed_profile_headline,
        is_claimed: Boolean(row.claimed_user_id)
      });
    }
  }
  return [...papers.values()];
}

class Discovery {
  static async getFeed(userId, cursor, limit = 20) {
    const parsed = parseCursor(cursor);
    const pageSize = Math.min(Number(limit) || 20, 100);
    const result = await pool.call(
      'BEGIN PKG_DISCOVERY.get_feed(:userId, :beforeDate, :beforeId, :beforePriority, :limit, :cursor); END;',
      {
        userId: userId || null,
        beforeDate: parsed.beforeDate,
        beforeId: parsed.beforeId,
        beforePriority: cursor ? parsed.beforePriority : null,
        limit: pageSize,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    const data = normalizePaperRows(result.cursor || []);
    return {
      data,
      next_cursor: data.length ? encodeCursor(data[data.length - 1]) : null,
      has_more: data.length >= pageSize
    };
  }
}

module.exports = Discovery;
