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
    if (createdPaperId) await pool.query('DELETE FROM RESEARCH_PAPERS WHERE paper_id = ?', [createdPaperId]);
    await pool.end();
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
    expect(response.body.data).toHaveProperty('filename');
    expect(response.body.data.content).toContain('@article');
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
});
