const request = require('supertest');
const app = require('../../server');
let member, admin;
beforeAll(async()=>{
  const user=await request(app).post('/api/v1/users/login').send({username:'john_smith',password:'password123'});
  const manager=await request(app).post('/api/v1/users/login').send({username:'jane_doe',password:'password123'});
  expect(user.status).toBe(200);expect(manager.status).toBe(200);member=user.body.token;admin=manager.body.token;
});
test.each([
 '/authors?limit=3','/authors/1','/journals?limit=3','/fields','/keywords?limit=3',
 '/papers/stats','/papers/trending-fields','/papers/trending','/papers/feed','/researchers',
 '/researchers/me','/researchers/me/verification-status','/researchers/institutions/rankings',
 '/network/recommendations','/analytics/my-stats','/notifications','/updates','/messages','/messages/search-users?q=jane',
 '/jobs?limit=3','/jobs/filters','/jobs/saved','/interests','/projects','/projects/me',
 '/admin/dashboard','/admin/users','/admin/moderation/cases','/admin/audit-logs','/admin/email-queue',
 '/admin/activity','/admin/unverified-users','/admin/author-claims','/admin/verification-requests'
])('the %s read endpoint executes against the current Oracle schema',async route=>{
 const result=await request(app).get(`/api/v1${route}`).set('Authorization',`Bearer ${route.startsWith('/admin')?admin:member}`);
 expect({status:result.status,error:result.body.error}).toEqual({status:200,error:undefined});
 expect(result.body.source).not.toBe('demo');
 expect(JSON.stringify(result.body)).not.toContain('password_hash');
});
