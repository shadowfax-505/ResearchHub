const { isDatabaseUnavailable, sendDatabaseUnavailable } = require('../utils/errors');
const User = require('../models/User');
const Paper = require('../models/Paper');
const Question = require('../models/Question');
const EmailQueue = require('../models/EmailQueue');
const ResearcherStats = require('../models/ResearcherStats');
const AdminGovernance = require('../models/AdminGovernance');
const Author = require('../models/Author');
const Joi = require('joi');
const VerificationRequest = require('../models/VerificationRequest');

const moderationActionSchema = Joi.object({
  action_type: Joi.string().valid('hide', 'restore', 'warn', 'suspend', 'ban', 'edit_metadata', 'delete').required(),
  notes: Joi.string().max(1000).allow('', null)
});

const userStatusSchema = Joi.object({
  is_active: Joi.boolean().required()
});

const roleSchema = Joi.object({
  role_key: Joi.string().valid('researcher', 'student', 'librarian', 'moderator', 'admin').required()
});

function pageParams(req) {
  return {
    limit: Math.min(parseInt(req.query.limit, 10) || 20, 100),
    offset: Math.max(parseInt(req.query.offset, 10) || 0, 0)
  };
}

class AdminController {
  static async getDashboard(_req, res) {
    try {
      const [userStats, paperStats, questionStats, emailStats, platformStats, recentQuestions] = await Promise.all([
        User.getStats(),
        Paper.getStats(),
        Question.getStats(),
        EmailQueue.getStats(),
        ResearcherStats.getPlatformStats(),
        Question.findAll(5, 0)
      ]);

      res.status(200).json({
        success: true,
        data: {
          users: userStats,
          papers: paperStats,
          questions: questionStats,
          email_queue: emailStats,
          platform: platformStats,
          recent: recentQuestions
        }
      });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: error.message });
    }
  }

  static async getUsers(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const offset = parseInt(req.query.offset, 10) || 0;
      const users = await User.findAll(limit, offset);
      const stats = await User.getStats();
      res.status(200).json({ success: true, data: users, pagination: { limit, offset, total: stats.total } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: error.message });
    }
  }

  static async recalculateStats(_req, res) {
    try {
      const updated = await ResearcherStats.refreshAll();
      res.status(200).json({ success: true, message: 'Researcher stats recalculated', data: { updated_users: updated } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getModerationCases(req, res) {
    const { limit, offset } = pageParams(req);
    try {
      const data = await AdminGovernance.getModerationCases(limit, offset);
      res.status(200).json({ success: true, data, pagination: { limit, offset } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async applyModerationAction(req, res) {
    const { error, value } = moderationActionSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    try {
      await AdminGovernance.applyModerationAction(parseInt(req.params.caseId, 10), req.user.user_id, value.action_type, value.notes);
      res.status(200).json({ success: true, message: 'Moderation action applied' });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getAuditLogs(req, res) {
    const { limit, offset } = pageParams(req);
    try {
      const data = await AdminGovernance.getAuditLogs(limit, offset);
      res.status(200).json({ success: true, data, pagination: { limit, offset } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getEmailQueue(req, res) {
    const { limit, offset } = pageParams(req);
    try {
      const data = await AdminGovernance.getEmailQueue(limit, offset);
      res.status(200).json({ success: true, data, pagination: { limit, offset } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async retryEmail(req, res) {
    try {
      await AdminGovernance.retryEmail(parseInt(req.params.emailId, 10), req.user.user_id);
      res.status(200).json({ success: true, message: 'Email queue item reset to pending' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getPlatformActivity(req, res) {
    try {
      const [messages, projects] = await Promise.all([
        AdminGovernance.getRecentMessages(20),
        AdminGovernance.getRecentProjects(20)
      ]);
      res.status(200).json({ success: true, data: { messages, projects } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async setUserStatus(req, res) {
    const { error, value } = userStatusSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    try {
      await AdminGovernance.setUserActive(parseInt(req.params.userId, 10), value.is_active, req.user.user_id);
      res.status(200).json({ success: true, message: 'User status updated' });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async assignRole(req, res) {
    const { error, value } = roleSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    try {
      await AdminGovernance.assignRole(parseInt(req.params.userId, 10), value.role_key, req.user.user_id);
      res.status(200).json({ success: true, message: 'Role assigned' });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getUnverifiedUsers(req, res) {
    try {
      const users = await User.getUnverifiedUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAuthorClaims(req, res) {
    const { limit, offset } = pageParams(req);
    try {
      const data = await Author.getClaims(limit, offset);
      res.status(200).json({ success: true, data, pagination: { limit, offset } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async verifyUser(req, res) {
    try {
      await User.verifyUser(parseInt(req.params.userId, 10));
      res.status(200).json({ success: true, message: 'User verified successfully' });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getVerificationRequests(req, res) {
    try { res.json({ success: true, data: await VerificationRequest.listPending() }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
  }

  static async decideVerification(req, res) {
    const status = String(req.body.status || '').toLowerCase();
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, error: 'Status must be approved or rejected' });
    try {
      const updated = await VerificationRequest.decide(Number(req.params.requestId), req.user.user_id, status, req.body.reason);
      if (!updated) return res.status(404).json({ success: false, error: 'Verification request not found or already decided' });
      res.json({ success: true, data: { verification_request_id: Number(req.params.requestId), status } });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  }
}

module.exports = AdminController;
