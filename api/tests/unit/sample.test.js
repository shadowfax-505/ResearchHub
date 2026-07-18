const request = require('supertest');
const app = require('../../server');
const { pool } = require('../../src/config/database');

describe('ResearchHub API sanity checks', () => {
  afterAll(async () => {
    await pool.end();
  });

  async function databaseIsConnected() {
    const response = await request(app).get('/health');
    return response.body.services.database === 'connected';
  }

  it('responds to /health with API and database service status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(['OK', 'DEGRADED']).toContain(response.body.status);
    expect(response.body.services).toHaveProperty('api', 'available');
    expect(['connected', 'unavailable']).toContain(response.body.services.database);
  });

  it('returns API metadata from /api/v1', async () => {
    const response = await request(app).get('/api/v1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('endpoints');
  });

  it('returns top cited papers from the database or local fallback', async () => {
    const response = await request(app).get('/api/v1/papers/top-cited');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data.length).toBeGreaterThan(0);

    if (await databaseIsConnected()) {
      expect(response.body).not.toHaveProperty('source', 'demo');
      expect(response.body.data[0]).toHaveProperty('paper_id');
    } else {
      expect(response.body).toHaveProperty('source', 'demo');
    }
  });

  it('allows login against the active auth backend', async () => {
    const credentials = await databaseIsConnected()
      ? { username: 'john_smith', password: 'password123' }
      : { username: 'demo', password: 'password123' };

    const response = await request(app)
      .post('/api/v1/users/login')
      .send(credentials);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');
  });
});
