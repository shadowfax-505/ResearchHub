const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../server');
const { pool } = require('../../src/config/database');

describe('discovery and paper persistence flows', () => {
  let token;
  let createdPaperId;

  afterAll(async () => {
    if (createdPaperId) {
      const [files] = await pool.query('SELECT storage_key FROM PAPER_FILES WHERE paper_id = ?', [createdPaperId]);
      for (const file of files) {
        fs.rmSync(path.join(__dirname, '../../storage/uploads', file.storage_key), { force: true });
      }
      await pool.query('DELETE FROM PAPER_FILES WHERE paper_id = ?', [createdPaperId]);
      await pool.query('DELETE FROM PAPER_AUTHORS WHERE paper_id = ?', [createdPaperId]);
      await pool.query('DELETE FROM RESEARCH_PAPERS WHERE paper_id = ?', [createdPaperId]);
      await pool.query('DELETE FROM AUTHORS a WHERE a.full_name = \'Integration Author\' AND NOT EXISTS (SELECT 1 FROM PAPER_AUTHORS pa WHERE pa.author_id = a.author_id)');
    }
    await pool.end();
  });

  beforeAll(async () => {
    const health = await request(app).get('/health');
    if (health.body.services.database !== 'connected') return;
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'john_smith', password: 'password123' });
    token = response.body.token;
  });

  it('returns a paper-only feed and unified scholarly search', async () => {
    const feed = await request(app).get('/api/v1/feed?limit=3');
    expect(feed.status).toBe(200);
    expect(Array.isArray(feed.body.data)).toBe(true);
    expect(feed.body.data.every(item => item.paper_id && !item.question_id && !item.job_id)).toBe(true);

    const search = await request(app).get('/api/v1/search?q=quantum&type=publications&limit=3');
    expect(search.status).toBe(200);
    expect(search.body.type).toBe('publications');
    expect(Array.isArray(search.body.data)).toBe(true);
  });

  it('persists authors and PDF file metadata for a paper', async () => {
    if (!token) return;
    const paper = await request(app)
      .post('/api/v1/papers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Discovery integration paper',
        abstract: 'Integration test record',
        publication_date: '2026-07-13',
        cover_image_url: 'https://cdn.researchhub.test/covers/integration.jpg',
        authors: [{ full_name: 'Integration Author', affiliation: 'ResearchHub Lab' }]
      });
    expect(paper.status).toBe(201);
    const paperId = paper.body.data.paper_id;
    createdPaperId = paperId;

    const upload = await request(app)
      .post(`/api/v1/uploads/papers/${paperId}/file`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('%PDF-1.4 integration'), { filename: 'integration.pdf', contentType: 'application/pdf' });
    expect(upload.status).toBe(201);
    expect(upload.body.data).toMatchObject({ paper_id: paperId, original_name: 'integration.pdf' });

    const detail = await request(app).get(`/api/v1/papers/${paperId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.cover_image_url).toBe('https://cdn.researchhub.test/covers/integration.jpg');
    expect(detail.body.data.authors[0].full_name).toBe('Integration Author');
    expect(detail.body.data.files[0].file_id).toBe(upload.body.data.file_id);
  });
});
