jest.mock('../../src/config/database',()=>({pool:{query:jest.fn(),call:jest.fn(),end:jest.fn()},testConnection:jest.fn()}));
const request=require('supertest');
const app=require('../../server');
const {pool,testConnection}=require('../../src/config/database');
const Auth=require('../../src/middleware/auth');

beforeEach(()=>{
 const error=Object.assign(new Error('connect ECONNREFUSED internal-private-host:1521'),{code:'ECONNREFUSED'});
 pool.query.mockRejectedValue(error);pool.call.mockRejectedValue(error);testConnection.mockRejectedValue(error);
});
test('liveness stays available when database readiness fails',async()=>{
 const live=await request(app).get('/live');expect(live.status).toBe(200);
 const health=await request(app).get('/health');expect(health.status).toBe(503);expect(health.body.services.database).toBe('unavailable');expect(JSON.stringify(health.body)).not.toContain('internal-private-host');
});
test('API metadata remains available without Oracle',async()=>{const result=await request(app).get('/api/v1');expect(result.status).toBe(200);expect(result.body.endpoints.papers).toBe('/api/v1/papers');});
test.each(['admin','jane_doe','ordinaryresearcher'])('database outage cannot authenticate %s or create a demo session',async username=>{
 const result=await request(app).post('/api/v1/users/login').send({username,password:'incorrect-password'});
 expect(result.status).toBe(503);expect(result.body.code).toBe('DATABASE_UNAVAILABLE');expect(result.body).not.toHaveProperty('token');expect(result.headers).not.toHaveProperty('set-cookie');
});
test('database outage cannot create a pretend account',async()=>{const result=await request(app).post('/api/v1/users/register').send({username:'newresearcher',email:'new@example.com',full_name:'New Researcher',password:'long-enough-password'});expect(result.status).toBe(503);expect(result.body).not.toHaveProperty('token');});
test.each(['/api/v1/feed','/api/v1/papers/top-cited','/api/v1/search?q=physics&type=publications','/api/v1/researchers/institutions/rankings'])('read failure is surfaced, without fabricated content: %s',async path=>{const result=await request(app).get(path);expect(result.status).toBe(503);expect(result.body.success).toBe(false);expect(result.body).not.toHaveProperty('source','demo');});
test('failed persistence does not claim that a saved paper exists',async()=>{const token=Auth.generateToken({user_id:100,username:'test',role:'researcher'});const result=await request(app).post('/api/v1/saved-papers').set('Authorization',`Bearer ${token}`).send({paper_id:1,collection_name:'Reading'});expect(result.status).toBe(503);expect(result.body.success).toBe(false);});
test('malformed cookie does not crash public endpoints',async()=>{const result=await request(app).get('/api/v1/feed').set('Cookie','researchhub_session=%E0%A4%A');expect(result.status).toBe(503);});
