const Joi = require('joi');
const UserSetting = require('../models/UserSetting');
const ResearcherStats = require('../models/ResearcherStats');
const { demoSettings, isDatabaseUnavailable } = require('../utils/demoData');

const settingSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system').default('system'),
  density: Joi.string().valid('comfortable', 'compact').default('comfortable'),
  notifications: Joi.object().unknown(true).default({}),
  privacy: Joi.object().unknown(true).default({}),
  // Flat fields accepted from frontend — mapped to nested format before storage
  email_notifications: Joi.boolean(),
  paper_recommendations: Joi.boolean(),
  profile_visibility: Joi.string().valid('public', 'followers', 'private')
});

function normalizeSettings(settings) {
  if (!settings) return demoSettings;
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
      if (isDatabaseUnavailable(error)) return res.status(200).json({ success: true, source: 'demo', data: demoSettings });
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    const mappedBody = mapFlatToNested(req.body);
    const { error, value } = settingSchema.validate(mappedBody);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const settings = await UserSetting.upsert(req.user.user_id, value);
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(200).json({ success: true, data: normalizeSettings(settings) });
    } catch (err) {
      if (isDatabaseUnavailable(err)) return res.status(200).json({ success: true, source: 'demo', data: normalizeSettings({ ...demoSettings, ...value, user_id: req.user.user_id }) });
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = SettingController;
