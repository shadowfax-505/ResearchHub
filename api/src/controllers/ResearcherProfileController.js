const Joi = require('joi');
const ResearcherProfile = require('../models/ResearcherProfile');
const { demoPapers, demoQuestions, demoUsers, isDatabaseUnavailable } = require('../utils/demoData');
const VerificationRequest = require('../models/VerificationRequest');
const User = require('../models/User');

const profileSchema = Joi.object({
  headline: Joi.string().max(255).allow('', null),
  department: Joi.string().max(150).allow('', null),
  position_title: Joi.string().max(150).allow('', null),
  website_url: Joi.string().uri().max(500).allow('', null),
  orcid: Joi.string().max(50).allow('', null),
  visibility: Joi.string().valid('public', 'network', 'private').default('public')
});

class ResearcherProfileController {
  static async getPublic(req, res) {
    try {
      const profile = await ResearcherProfile.findPublicBySlug(req.params.slug);
      if (!profile) return res.status(404).json({ success: false, error: 'Researcher profile not found' });
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        const user = demoUsers.find(item => item.username === req.params.slug) || demoUsers[0];
        return res.status(200).json({
          success: true,
          source: 'demo',
          data: {
            ...user,
            slug: user.username,
            headline: 'Researcher in computational science and open scholarship',
            followers: 18,
            following: 12,
            total_reads: 1240,
            rg_score: 18,
            papers: demoPapers,
            questions: demoQuestions.filter(question => question.user_id === user.user_id)
          }
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getInstitutionalRankings(req, res) {
    const demoRankings = [
      { institution_name: 'Stanford University', country: 'United States', researchers_count: 42, total_publications: 184, total_citations: 3920, total_reads: 48100 },
      { institution_name: 'Massachusetts Institute of Technology (MIT)', country: 'United States', researchers_count: 38, total_publications: 165, total_citations: 4120, total_reads: 51200 },
      { institution_name: 'Harvard University', country: 'United States', researchers_count: 35, total_publications: 150, total_citations: 3450, total_reads: 41000 },
      { institution_name: 'University of Oxford', country: 'United Kingdom', researchers_count: 29, total_publications: 128, total_citations: 2890, total_reads: 36400 },
      { institution_name: 'ETH Zürich', country: 'Switzerland', researchers_count: 24, total_publications: 110, total_citations: 2410, total_reads: 29800 },
      { institution_name: 'University of Cambridge', country: 'United Kingdom', researchers_count: 26, total_publications: 118, total_citations: 2650, total_reads: 31200 }
    ];

    try {
      const rankings = await ResearcherProfile.getInstitutionalRankings();
      res.status(200).json({ success: true, data: rankings.length ? rankings : demoRankings, count: rankings.length || demoRankings.length });
    } catch (error) {
      res.status(200).json({ success: true, source: 'demo', data: demoRankings, count: demoRankings.length });
    }
  }

  static async listResearchers(req, res) {
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
      const researchers = await ResearcherProfile.getAllResearchers(limit, offset);
      return res.status(200).json({ success: true, data: researchers });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({
          success: true,
          source: 'demo',
          data: demoUsers.map(user => ({
            ...user,
            slug: user.username,
            headline: 'Demo Researcher',
            followers: 5,
            following: 5,
            total_reads: 100,
            rg_score: 5
          })).slice(offset, offset + limit)
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async ensureMine(req, res) {
    const slug = String(req.body.slug || req.user.username || '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{2,99}$/.test(slug)) {
      return res.status(400).json({ success: false, error: 'Slug must use lowercase letters, numbers, and hyphens' });
    }

    try {
      await ResearcherProfile.ensureProfile(req.user.user_id, slug);
      return res.status(201).json({ success: true, data: { slug } });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getMine(req, res) {
    try {
      const profile = await ResearcherProfile.findPublicBySlug(req.user.username);
      if (profile) return res.json({ success: true, data: profile });
      const user = await User.findById(req.user.user_id);
      return res.json({ success: true, data: user });
    } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
  }

  static async updateMine(req, res) {
    const { error, value } = profileSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    try {
      await ResearcherProfile.ensureProfile(req.user.user_id, req.user.username);
      await ResearcherProfile.updateProfile(req.user.user_id, value);
      return res.status(200).json({ success: true, message: 'Researcher profile updated' });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async follow(req, res) {
    const followedId = parseInt(req.params.userId, 10);
    if (isNaN(followedId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    if (req.user.user_id === followedId) {
      return res.status(400).json({ success: false, error: 'A user cannot follow themselves' });
    }

    try {
      await ResearcherProfile.followUser(req.user.user_id, followedId);
      return res.status(201).json({ success: true, message: 'Now following researcher' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(201).json({ success: true, source: 'demo', message: 'Now following researcher (demo)' });
      }
      if (error.message.includes('Already following')) {
        return res.status(409).json({ success: false, error: 'Already following this researcher' });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async unfollow(req, res) {
    const followedId = parseInt(req.params.userId, 10);
    if (isNaN(followedId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    try {
      await ResearcherProfile.unfollowUser(req.user.user_id, followedId);
      return res.status(200).json({ success: true, message: 'Unfollowed researcher' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', message: 'Unfollowed researcher (demo)' });
      }
      if (error.message.includes('Not following')) {
        return res.status(404).json({ success: false, error: 'Not following this researcher' });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async isFollowing(req, res) {
    const followedId = parseInt(req.params.userId, 10);
    if (isNaN(followedId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    try {
      const following = await ResearcherProfile.isFollowing(req.user.user_id, followedId);
      return res.status(200).json({ success: true, data: { is_following: following } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', data: { is_following: false } });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async contributions(req, res) {
    try {
      const profile = await ResearcherProfile.findPublicBySlug(req.params.slug);
      if (!profile) return res.status(404).json({ success: false, error: 'Researcher profile not found' });
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
      const offset = Math.max(Number(req.query.offset) || 0, 0);
      const data = await ResearcherProfile.getContributions(profile.user_id, limit, offset);
      return res.json({ success: true, data, pagination: { limit, offset, has_more: data.length === limit } });
    } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
  }

  static async verificationStatus(req, res) {
    try {
      const [user, request] = await Promise.all([User.findById(req.user.user_id), VerificationRequest.getByUser(req.user.user_id)]);
      const institutionalDomains = String(process.env.INSTITUTIONAL_EMAIL_DOMAINS || '').split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
      const emailDomain = String(user?.email || '').split('@')[1]?.toLowerCase() || '';
      return res.json({ success: true, data: { email_verified: Boolean(user?.email_verified_at), researcher_verified: Boolean(user?.researcher_verified_at), eligible: Boolean(user?.email_verified_at) && (!institutionalDomains.length || institutionalDomains.includes(emailDomain)), request } });
    } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
  }

  static async requestVerification(req, res) {
    try {
      const user = await User.findById(req.user.user_id);
      if (!user?.email_verified_at) return res.status(409).json({ success: false, error: 'Verify your email before requesting researcher verification' });
      const institutionalEmail = String(req.body.institutional_email || user.email).trim().toLowerCase();
      const domain = institutionalEmail.split('@')[1] || '';
      const allowed = String(process.env.INSTITUTIONAL_EMAIL_DOMAINS || '').split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
      if (!domain || (allowed.length && !allowed.includes(domain))) return res.status(400).json({ success: false, error: 'Use an eligible institutional email domain' });
      const request = await VerificationRequest.upsert(req.user.user_id, { institutional_email: institutionalEmail, institutional_domain: domain, evidence: req.body.evidence });
      return res.status(201).json({ success: true, data: request });
    } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
  }
  static async addEducation(req, res) {
    try {
      if (!req.body.institution) return res.status(400).json({ success: false, error: 'Institution is required' });
      if (req.body.start_year) {
        const sy = parseInt(req.body.start_year, 10);
        if (isNaN(sy) || sy < 0 || sy > 9999) return res.status(400).json({ success: false, error: 'Invalid start year' });
        req.body.start_year = sy;
      }
      if (req.body.end_year) {
        const ey = parseInt(req.body.end_year, 10);
        if (isNaN(ey) || ey < 0 || ey > 9999) return res.status(400).json({ success: false, error: 'Invalid end year' });
        req.body.end_year = ey;
      }
      await ResearcherProfile.addEducation(req.user.user_id, req.body);
      return res.status(201).json({ success: true, message: 'Education added' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async deleteEducation(req, res) {
    try {
      await ResearcherProfile.deleteEducation(req.user.user_id, req.params.id);
      return res.status(200).json({ success: true, message: 'Education removed' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async addExperience(req, res) {
    try {
      if (!req.body.company) return res.status(400).json({ success: false, error: 'Company is required' });
      await ResearcherProfile.addExperience(req.user.user_id, req.body);
      return res.status(201).json({ success: true, message: 'Experience added' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async deleteExperience(req, res) {
    try {
      await ResearcherProfile.deleteExperience(req.user.user_id, req.params.id);
      return res.status(200).json({ success: true, message: 'Experience removed' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async addSkill(req, res) {
    try {
      if (!req.body.skill_name) return res.status(400).json({ success: false, error: 'Skill name is required' });
      await ResearcherProfile.addSkill(req.user.user_id, req.body.skill_name);
      return res.status(201).json({ success: true, message: 'Skill added' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async deleteSkill(req, res) {
    try {
      await ResearcherProfile.deleteSkill(req.user.user_id, req.params.id);
      return res.status(200).json({ success: true, message: 'Skill removed' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async addLanguage(req, res) {
    try {
      if (!req.body.language_name) return res.status(400).json({ success: false, error: 'Language name is required' });
      await ResearcherProfile.addLanguage(req.user.user_id, req.body);
      return res.status(201).json({ success: true, message: 'Language added' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async deleteLanguage(req, res) {
    try {
      await ResearcherProfile.deleteLanguage(req.user.user_id, req.params.id);
      return res.status(200).json({ success: true, message: 'Language removed' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async addDiscipline(req, res) {
    try {
      const disciplineName = req.body.discipline_name || req.body.discipline || req.body.name;
      if (!disciplineName) return res.status(400).json({ success: false, error: 'Discipline name is required' });
      await ResearcherProfile.addDiscipline(req.user.user_id, disciplineName);
      return res.status(201).json({ success: true, message: 'Discipline added' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async deleteDiscipline(req, res) {
    try {
      await ResearcherProfile.deleteDiscipline(req.user.user_id, req.params.id);
      return res.status(200).json({ success: true, message: 'Discipline removed' });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  static async getFollowingList(req, res) {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }
    try {
      const data = await ResearcherProfile.getFollowing(userId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', data: [] });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getFollowersList(req, res) {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }
    try {
      const data = await ResearcherProfile.getFollowers(userId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', data: [] });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ResearcherProfileController;
