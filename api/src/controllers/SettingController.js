const { isDatabaseUnavailable, sendDatabaseUnavailable } = require('../utils/errors');
const Joi = require('joi');
const UserSetting = require('../models/UserSetting');
const { pool } = require('../config/database');
const ResearcherProfile = require('../models/ResearcherProfile');
const ResearcherStats = require('../models/ResearcherStats');
const { defaultSettings } = require('../utils/defaultSettings');

const settingSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system').default('system'),
  density: Joi.string().valid('comfortable', 'compact').default('comfortable'),
  notifications: Joi.object().unknown(true).default({}),
  privacy: Joi.object({ profile_visibility: Joi.string().valid('public', 'followers', 'private') }).unknown(true).default({}),
  // Flat fields accepted from frontend — mapped to nested format before storage
  email_notifications: Joi.boolean(),
  paper_recommendations: Joi.boolean(),
  profile_visibility: Joi.string().valid('public', 'followers', 'private')
});

function normalizeSettings(settings) {
  if (!settings) return defaultSettings;
  const out = {
    ...settings,
    notifications: typeof settings.notifications === 'string' ? JSON.parse(settings.notifications || '{}') : settings.notifications,
    privacy: typeof settings.privacy === 'string' ? JSON.parse(settings.privacy || '{}') : settings.privacy
  };
  // Flatten nested notification/privacy fields for API response
  if (out.notifications && typeof out.notifications === 'object') {
    out.email_notifications = out.notifications.email_alerts !== false;
    out.paper_recommendations = out.notifications.recommendations !== false;
  }
  if (out.privacy && typeof out.privacy === 'object') {
    out.profile_visibility = out.privacy.profile_visibility || 'public';
  }
  return out;
}

function mapFlatToNested(payload) {
  const mapped = { ...payload };
  if ('email_notifications' in mapped || 'paper_recommendations' in mapped) {
    mapped.notifications = {
      email_alerts: mapped.email_notifications !== false,
      recommendations: mapped.paper_recommendations !== false
    };
    delete mapped.email_notifications;
    delete mapped.paper_recommendations;
  }
  if ('profile_visibility' in mapped) {
    mapped.privacy = { profile_visibility: mapped.profile_visibility };
    delete mapped.profile_visibility;
  }
  return mapped;
}

class SettingController {
  static async get(req, res) {
    try {
      const settings = await UserSetting.findByUser(req.user.user_id);
      res.status(200).json({ success: true, data: normalizeSettings(settings) });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    const mappedBody = mapFlatToNested(req.body);
    const { error, value } = settingSchema.validate(mappedBody, { noDefaults: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      if (value.privacy?.profile_visibility) await ResearcherProfile.ensureProfile(req.user.user_id, req.user.username);
      const settings = await pool.transaction(async tx => {
        await tx.query('SELECT user_id FROM USERS WHERE user_id = ? FOR UPDATE', [req.user.user_id]);
        const current = normalizeSettings(await UserSetting.findByUser(req.user.user_id, tx));
        const merged = { ...current, ...value,
          notifications: { ...current.notifications, ...value.notifications },
          privacy: { ...current.privacy, ...value.privacy } };
        if (value.privacy?.profile_visibility) {
          const visibility = value.privacy.profile_visibility === 'followers' ? 'network' : value.privacy.profile_visibility;
          await tx.query('UPDATE RESEARCHER_PROFILES SET visibility = ?, updated_at = SYSTIMESTAMP WHERE user_id = ?', [visibility, req.user.user_id]);
        }
        return UserSetting.upsert(req.user.user_id, merged, tx);
      });
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(200).json({ success: true, data: normalizeSettings(settings) });
    } catch (err) {
      if (isDatabaseUnavailable(err)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = SettingController;
