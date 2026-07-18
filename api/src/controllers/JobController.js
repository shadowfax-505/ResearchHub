const Job = require('../models/Job');
const { demoJobs, isDatabaseUnavailable } = require('../utils/demoData');

function filtersFromQuery(query) {
  return {
    employment_type: query.employment_type,
    country: query.country || query.countries,
    location: query.location,
    discipline: query.discipline || query.disciplines,
    remote_mode: query.remote_mode,
    career_level: query.career_level,
    institution_id: query.institution_id,
    posted_after: query.posted_after,
    posted_before: query.posted_before,
    sort: query.sort
  };
}

class JobController {
  static async getAll(req, res) {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
      const offset = Math.max(Number(req.query.offset) || 0, 0);
      const query = String(req.query.q || '').trim();
      const filters = filtersFromQuery(req.query);
      const [jobs, total] = await Promise.all([Job.getAll(limit, offset, query, filters), Job.getCount(query, filters)]);
      res.json({ success: true, data: jobs, pagination: { limit, offset, total, has_more: offset + jobs.length < total } });
    } catch (error) { if (isDatabaseUnavailable(error)) return res.json({ success: true, source: 'demo', data: demoJobs, pagination: { limit: 20, offset: 0, total: demoJobs.length, has_more: false } }); res.status(500).json({ success: false, error: error.message }); }
  }

  static async getFilters(req, res) {
    try { res.json({ success: true, data: await Job.getFilters() }); }
    catch (error) { if (isDatabaseUnavailable(error)) return res.json({ success: true, source: 'demo', data: { countries: [], disciplines: [], employment_types: [], remote_modes: [], career_levels: [], institutions: [] } }); res.status(500).json({ success: false, error: error.message }); }
  }

  static async getById(req, res) {
    try { const job = await Job.getById(req.params.id); if (!job) return res.status(404).json({ success: false, error: 'Job not found' }); res.json({ success: true, data: job }); }
    catch (error) { if (isDatabaseUnavailable(error)) { const job = demoJobs.find(item => String(item.job_id) === String(req.params.id)); if (job) return res.json({ success: true, source: 'demo', data: job }); } res.status(500).json({ success: false, error: error.message }); }
  }

  static async create(req, res) {
    try { const jobId = await Job.create({ ...req.body, posted_by: req.user.user_id }); res.status(201).json({ success: true, data: { job_id: jobId } }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
  }

  static async getSavedJobs(req, res) { try { res.json({ success: true, data: await Job.getSavedJobs(req.user.user_id, Number(req.query.limit) || 20, Number(req.query.offset) || 0) }); } catch (error) { res.status(500).json({ success: false, error: error.message }); } }
  static async saveJob(req, res) { try { res.json({ success: true, data: { saved: await Job.saveJob(req.user.user_id, req.params.id) } }); } catch (error) { res.status(500).json({ success: false, error: error.message }); } }
  static async unsaveJob(req, res) { try { await Job.unsaveJob(req.user.user_id, req.params.id); res.json({ success: true, data: { unsaved: true } }); } catch (error) { res.status(500).json({ success: false, error: error.message }); } }
}

module.exports = JobController;
