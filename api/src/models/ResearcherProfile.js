const { pool } = require('../config/database');

let oracledb;
try {
  oracledb = require('oracledb');
} catch (_) {
  oracledb = null;
}

class ResearcherProfile {
  static async getInstitutionalRankings() {
    const sql = `
      SELECT u.institution AS institution_name,
             COUNT(DISTINCT u.user_id) AS researchers_count,
             COUNT(DISTINCT rp.paper_id) AS total_publications,
             NVL(SUM(rp.citation_count), 0) AS total_citations,
             NVL(SUM(rp.view_count), 0) AS total_reads
      FROM USERS u
      LEFT JOIN PAPER_AUTHORS pa ON u.user_id = pa.author_id
      LEFT JOIN RESEARCH_PAPERS rp ON pa.paper_id = rp.paper_id
      WHERE u.institution IS NOT NULL
      GROUP BY u.institution
      ORDER BY total_publications DESC, total_citations DESC
    `;
    try {
      const [rows] = await pool.query(sql);
      return rows || [];
    } catch (_) {
      return [];
    }
  }

  static async findPublicBySlug(slug) {
    if (!oracledb) throw new Error('Oracle database driver unavailable.');

    const result = await pool.call(
      'BEGIN PKG_PROFILE.get_public_profile(:slug, :profile, :papers, :questions); END;',
      {
        slug,
        profile: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        papers: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        questions: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    if (!result.profile?.length) return null;
    const profile = result.profile[0];
    const parseJson = (val) => {
      if (!val) return [];
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch (e) { return []; }
    };
    
    return {
      ...profile,
      education: parseJson(profile.education_json),
      experience: parseJson(profile.experience_json),
      skills: parseJson(profile.skills_json),
      languages: parseJson(profile.languages_json),
      disciplines: parseJson(profile.disciplines_json),
      papers: result.papers || [],
      questions: result.questions || []
    };
  }

  static async getAllResearchers(limit = 20, offset = 0) {
    if (!oracledb) throw new Error('Oracle database driver unavailable.');

    const result = await pool.call(
      'BEGIN PKG_PROFILE.get_all_researchers(:limit, :offset, :outCursor); END;',
      {
        limit,
        offset,
        outCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const parseJson = (val) => {
      if (!val) return [];
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch (e) { return []; }
    };

    return (result.outCursor || []).map(profile => ({
      ...profile,
      education: parseJson(profile.education_json),
      experience: parseJson(profile.experience_json),
      skills: parseJson(profile.skills_json),
      languages: parseJson(profile.languages_json),
      disciplines: parseJson(profile.disciplines_json),
    }));
  }

  static async getContributions(userId, limit = 20, offset = 0) {
    if (!oracledb) throw new Error('Oracle database driver unavailable.');
    const result = await pool.call('BEGIN PKG_PROFILE.get_contributions(:userId, :limit, :offset, :outCursor); END;', {
      userId,
      limit,
      offset,
      outCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    });
    return result.outCursor || [];
  }

  static async ensureProfile(userId, slug) {
    return pool.call('BEGIN PKG_PROFILE.ensure_profile(:userId, :slug); END;', { userId, slug });
  }

  static async updateProfile(userId, profile) {
    return pool.call(
      `BEGIN PKG_PROFILE.update_profile(
        :userId, :headline, :department, :positionTitle, :websiteUrl, :orcid, :visibility
      ); END;`,
      {
        userId,
        headline: profile.headline || null,
        department: profile.department || null,
        positionTitle: profile.position_title || null,
        websiteUrl: profile.website_url || null,
        orcid: profile.orcid || null,
        visibility: profile.visibility || 'public'
      }
    );
  }

  static async followUser(followerId, followedId) {
    return pool.call('BEGIN PKG_PROFILE.follow_user(:followerId, :followedId); END;', { followerId, followedId });
  }

  static async unfollowUser(followerId, followedId) {
    return pool.call('BEGIN PKG_PROFILE.unfollow_user(:followerId, :followedId); END;', { followerId, followedId });
  }

  static async isFollowing(followerId, followedId) {
    const [rows] = await pool.query(
      'SELECT 1 AS is_following FROM USER_FOLLOWS WHERE follower_user_id = ? AND followed_user_id = ?',
      [followerId, followedId]
    );
    return rows.length > 0;
  }

  static async addEducation(userId, data) {
    return pool.query(
      `INSERT INTO USER_EDUCATION (user_id, institution, degree, field_of_study, start_year, end_year)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, data.institution, data.degree || null, data.field_of_study || null, data.start_year || null, data.end_year || null]
    );
  }

  static async deleteEducation(userId, educationId) {
    return pool.query('DELETE FROM USER_EDUCATION WHERE user_id = ? AND education_id = ?', [userId, educationId]);
  }

  static async addExperience(userId, data) {
    return pool.query(
      `INSERT INTO USER_EXPERIENCE (user_id, company, position, start_date, end_date, description)
       VALUES (?, ?, ?, TO_DATE(?, 'YYYY-MM-DD'), TO_DATE(?, 'YYYY-MM-DD'), ?)`,
      [userId, data.company, data.position || null, data.start_date || null, data.end_date || null, data.description || null]
    );
  }

  static async deleteExperience(userId, experienceId) {
    return pool.query('DELETE FROM USER_EXPERIENCE WHERE user_id = ? AND experience_id = ?', [userId, experienceId]);
  }

  static async addSkill(userId, skillName) {
    return pool.query(
      'INSERT INTO USER_SKILLS (user_id, skill_name) VALUES (?, ?)',
      [userId, skillName]
    );
  }

  static async deleteSkill(userId, skillId) {
    return pool.query('DELETE FROM USER_SKILLS WHERE user_id = ? AND skill_id = ?', [userId, skillId]);
  }

  static async addLanguage(userId, data) {
    return pool.query(
      'INSERT INTO USER_LANGUAGES (user_id, language_name, proficiency) VALUES (?, ?, ?)',
      [userId, data.language_name, data.proficiency || null]
    );
  }

  static async deleteLanguage(userId, languageId) {
    return pool.query('DELETE FROM USER_LANGUAGES WHERE user_id = ? AND language_id = ?', [userId, languageId]);
  }

  static async addDiscipline(userId, disciplineName) {
    return pool.query(
      'INSERT INTO USER_DISCIPLINES (user_id, discipline_name) VALUES (?, ?)',
      [userId, disciplineName]
    );
  }

  static async deleteDiscipline(userId, disciplineId) {
    return pool.query('DELETE FROM USER_DISCIPLINES WHERE user_id = ? AND discipline_id = ?', [userId, disciplineId]);
  }

  static async getFollowing(userId) {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.full_name, u.affiliation, u.country, rp.headline, rp.position_title, rp.slug
       FROM USER_FOLLOWS uf
       JOIN USERS u ON uf.followed_user_id = u.user_id
       LEFT JOIN RESEARCHER_PROFILES rp ON u.user_id = rp.user_id
       WHERE uf.follower_user_id = ?
       ORDER BY uf.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async getFollowers(userId) {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.full_name, u.affiliation, u.country, rp.headline, rp.position_title, rp.slug
       FROM USER_FOLLOWS uf
       JOIN USERS u ON uf.follower_user_id = u.user_id
       LEFT JOIN RESEARCHER_PROFILES rp ON u.user_id = rp.user_id
       WHERE uf.followed_user_id = ?
       ORDER BY uf.created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = ResearcherProfile;
