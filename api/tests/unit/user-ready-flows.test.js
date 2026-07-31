const request = require('supertest');
const app = require('../../server');
const { pool } = require('../../src/config/database');

describe('user-ready application flows', () => {
  let token;
  let createdPaperId;

  async function databaseIsConnected() {
    const response = await request(app).get('/health');
    return response.body.services.database === 'connected';
  }

  beforeAll(async () => {
    const isDbConnected = await databaseIsConnected();
    const credentials = isDbConnected
      ? { username: 'john_smith', password: 'password123' }
      : { username: 'demo', password: 'password123' };

    const response = await request(app)
      .post('/api/v1/users/login')
      .send(credentials);

    token = response.body.token;
  });

  afterAll(async () => {
    try {
      if (createdPaperId) await pool.query('DELETE FROM RESEARCH_PAPERS WHERE paper_id = ?', [createdPaperId]);
      await pool.end();
    } catch (_e) {
      // Ignore database connection failures in demo/offline mode
    }
  });

  it('supports saved papers through authenticated API endpoints', async () => {
    const createResponse = await request(app)
      .post('/api/v1/saved-papers')
      .set('Authorization', `Bearer ${token}`)
      .send({ paper_id: 1, collection_name: 'Machine Learning' });

    expect(createResponse.status).toBeLessThan(300);
    expect(createResponse.body).toHaveProperty('success', true);
    expect(createResponse.body.data).toMatchObject({ paper_id: 1, collection_name: 'Machine Learning' });

    const listResponse = await request(app)
      .get('/api/v1/saved-papers')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveProperty('success', true);
    expect(Array.isArray(listResponse.body.data)).toBe(true);
  });

  it('supports collections as first-class library data', async () => {
    const createResponse = await request(app)
      .post('/api/v1/collections')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Climate Reading', description: 'Papers for climate modeling' });

    expect(createResponse.status).toBeLessThan(300);
    expect(createResponse.body).toHaveProperty('success', true);
    expect(createResponse.body.data).toMatchObject({ name: 'Climate Reading' });

    const listResponse = await request(app)
      .get('/api/v1/collections')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveProperty('success', true);
    expect(Array.isArray(listResponse.body.data)).toBe(true);
  });

  it('supports notifications and read-state updates', async () => {
    const listResponse = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveProperty('success', true);
    expect(Array.isArray(listResponse.body.data)).toBe(true);

    const notificationId = listResponse.body.data[0]?.notification_id || 1;
    const readResponse = await request(app)
      .put(`/api/v1/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(readResponse.status).toBe(200);
    expect(readResponse.body).toHaveProperty('success', true);
  });

  it('supports research requests through authenticated API endpoints', async () => {
    const createResponse = await request(app)
      .post('/api/v1/research-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Request replication package',
        recipient_name: 'Dr. Curie',
        message: 'Could you share the supplementary dataset?'
      });

    expect(createResponse.status).toBeLessThan(300);
    expect(createResponse.body).toHaveProperty('success', true);
    expect(createResponse.body.data).toMatchObject({ title: 'Request replication package', status: 'pending' });

    const listResponse = await request(app)
      .get('/api/v1/research-requests')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveProperty('success', true);
    expect(Array.isArray(listResponse.body.data)).toBe(true);
  });

  it('supports persisted user settings', async () => {
    const updateResponse = await request(app)
      .put('/api/v1/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        theme: 'dark',
        density: 'compact',
        notifications: { citations: true, weekly_digest: false },
        privacy: { public_profile: true }
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toHaveProperty('success', true);
    expect(updateResponse.body.data).toMatchObject({ theme: 'dark', density: 'compact' });

    const getResponse = await request(app)
      .get('/api/v1/settings')
      .set('Authorization', `Bearer ${token}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty('success', true);
    expect(getResponse.body.data).toHaveProperty('theme');
  });

  it('exports citations in API-backed formats', async () => {
    const response = await request(app)
      .get('/api/v1/citations/export?paper_id=1&format=bib')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data.content).toContain('@article');

    const risResponse = await request(app)
      .get('/api/v1/citations/export?paper_id=1&format=ris')
      .set('Authorization', `Bearer ${token}`);
    expect(risResponse.status).toBe(200);
    expect(risResponse.body.data.content).toContain('TY  - JOUR');

    const enwResponse = await request(app)
      .get('/api/v1/citations/export?paper_id=1&format=enw')
      .set('Authorization', `Bearer ${token}`);
    expect(enwResponse.status).toBe(200);
    expect(enwResponse.body.data.content).toContain('%0 Journal Article');
  });

  it('submits research through the authenticated paper API', async () => {
    const response = await request(app)
      .post('/api/v1/papers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'User Ready Research Submission',
        abstract: 'A submission flow backed by the API.',
        publication_date: '2026-07-05',
        language: 'English',
        is_peer_reviewed: true
      });

    expect(response.status).toBeLessThan(300);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('paper_id');
    createdPaperId = response.body.data.paper_id;
  });

  it('supports upvoting answers and accepting them as solutions', async () => {
    const upvoteResponse = await request(app)
      .post('/api/v1/questions/answers/1/upvote')
      .set('Authorization', `Bearer ${token}`);

    expect(upvoteResponse.status).toBe(200);
    expect(upvoteResponse.body).toHaveProperty('success', true);

    const acceptResponse = await request(app)
      .post('/api/v1/questions/answers/1/accept')
      .set('Authorization', `Bearer ${token}`);

    expect(acceptResponse.status).toBe(200);
    expect(acceptResponse.body).toHaveProperty('success', true);
  });

  it('supports posting updates and progress reports to projects', async () => {
    const isDbConnected = await databaseIsConnected();
    if (!isDbConnected) return;

    // 1. Create a project first
    const createProjectResponse = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Project for Logs', description: 'Testing collaborative project updates' });

    expect(createProjectResponse.status).toBe(201);
    const projectId = createProjectResponse.body.data.project_id;

    // 2. Post update
    const postUpdateResponse = await request(app)
      .post(`/api/v1/projects/${projectId}/updates`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Phase 1: Finished setup and data collection.' });

    expect(postUpdateResponse.status).toBe(201);
    expect(postUpdateResponse.body).toHaveProperty('success', true);

    // 3. Get updates
    const getUpdatesResponse = await request(app)
      .get(`/api/v1/projects/${projectId}/updates`)
      .set('Authorization', `Bearer ${token}`);

    expect(getUpdatesResponse.status).toBe(200);
    expect(Array.isArray(getUpdatesResponse.body.data)).toBe(true);
    expect(getUpdatesResponse.body.data.length).toBeGreaterThan(0);
    expect(getUpdatesResponse.body.data[0].body).toBe('Phase 1: Finished setup and data collection.');

    // Cleanup created project
    try {
      await pool.query('DELETE FROM PROJECTS WHERE project_id = ?', [projectId]);
    } catch (_) {}
  });
});
