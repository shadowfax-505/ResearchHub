const request = require('supertest');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = require('../../server');
const { pool } = require('../../src/config/database');
const User = require('../../src/models/User');
const AuthToken = require('../../src/models/AuthToken');

const suffix = crypto.randomBytes(5).toString('hex');
const password = 'ResearchHub-QA-password!';
const users = [];
const papers = [];
const authors = new Set();
const jobs = [];
let owner, peer, outsider, admin, paperId;
const api = (method, route, user) => {
  const call = request(app)[method](`/api/v1${route}`);
  return user ? call.set('Authorization', `Bearer ${user.token}`) : call;
};
async function account(label, role = 'researcher') {
  const username = `qa${label}${suffix}`;
  const email = `${username}@example.com`;
  const id = await User.create({ username, email, full_name: `QA ${label} ${suffix}`, password_hash: await bcrypt.hash(password, 4), role });
  users.push({ id, email });
  const login = await api('post', '/users/login').send({ username, password });
  expect(login.status).toBe(200);
  const user = { id, username, email, token: login.body.token };
  expect((await api('post', '/researchers/me', user).send({})).status).toBe(201);
  return user;
}
async function paper(user, extra = {}) {
  const result = await api('post', '/papers', user).send({ title: `QA publication ${suffix}`, abstract: 'A real persistence test record.', publication_date: '2026-10-11', ...extra });
  expect(result.status).toBe(201);
  const id = result.body.data.paper_id;
  papers.push(id);
  const detail = await api('get', `/papers/${id}`, user);
  (detail.body.data?.authors || []).forEach(author => authors.add(author.author_id));
  return id;
}

beforeAll(async () => {
  expect((await request(app).get('/health')).body.services.database).toBe('connected');
  owner = await account('owner');peer = await account('peer');outsider = await account('other');admin = await account('admin', 'admin');
  paperId = await paper(owner);
});
afterAll(async () => {
  try {
  for (const id of jobs) await pool.query('DELETE FROM JOBS WHERE job_id = ?', [id]);
  for (const id of papers) {
    const [files] = await pool.query('SELECT storage_key FROM PAPER_FILES WHERE paper_id = ?', [id]);
    for (const file of files) fs.rmSync(path.resolve(__dirname, '../../storage/uploads', file.storage_key), { force: true });
    await pool.query('DELETE FROM RESEARCH_PAPERS WHERE paper_id = ?', [id]);
  }
  if (admin) {
    await pool.query('DELETE FROM MODERATION_AUDIT_LOG WHERE moderator_id = ?', [admin.id]);
    await pool.query('DELETE FROM MODERATION_ACTIONS WHERE actor_admin_user_id = ?', [admin.id]);
  }
  // Fixtures belong only to the isolated RH_QA_* schema guarded by setup.js.
  for (const { id, email } of users) {
    await pool.query('DELETE FROM USERS WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM EMAIL_IDENTITIES WHERE normalized_email = ?', [email]);
  }
  for (const id of authors) await pool.query('DELETE FROM AUTHORS WHERE author_id = ? AND NOT EXISTS (SELECT 1 FROM PAPER_AUTHORS WHERE author_id = ?)', [id, id]);
  } finally { await pool.end(); }
});

test('rejects missing authentication and wrong credentials', async () => {
  expect((await api('get', '/saved-papers')).status).toBe(401);
  expect((await api('post', '/users/login').send({ username: owner.username, password: 'wrong' })).status).toBe(401);
  expect((await api('get', '/admin/dashboard', owner)).status).toBe(403);
});
test('registers a real account, queues verification, and rejects duplicates', async () => {
  const data = { username: `qareg${suffix}`, email: `qareg${suffix}@example.com`, full_name: 'QA registration', password };
  const result = await api('post', '/users/register').send(data);
  expect(result.status).toBe(201);expect(result.body.data.email_delivery).toBe('queued');expect(result.body.token).toBeTruthy();
  users.push({ id: result.body.data.user_id, email: data.email });
  expect((await api('post', '/users/register').send(data)).status).toBe(409);
  expect((await api('post', '/users/register').send({ ...data, username: `qaother${suffix}`, email: data.email.toUpperCase() })).status).toBe(409);
});
test('does not reserve an email when the user insert rolls back', async () => {
  const email = `qarollback${suffix}@example.com`;
  await expect(User.create({ username: owner.username, email, full_name: 'Rollback', password_hash: 'unused' })).rejects.toHaveProperty('errorNum', 1);
  const [rows] = await pool.query('SELECT normalized_email FROM EMAIL_IDENTITIES WHERE normalized_email = ?', [email]);
  expect(rows).toHaveLength(0);
});
test('creates publication ownership and author links together', async () => {
  const result = await api('get', `/papers/${paperId}`);
  expect(result.status).toBe(200);expect(result.body.data.owner_user_id).toBe(owner.id);
  expect(result.body.data.authors.some(author => author.full_name.includes(suffix))).toBe(true);
});
test('private drafts are readable only by their owner or administrator', async () => {
  const id = await paper(owner, { visibility: 'private', status: 'draft' });
  expect((await api('get', `/papers/${id}`)).status).toBe(404);
  expect((await api('get', `/papers/${id}`, peer)).status).toBe(404);
  expect((await api('get', `/papers/${id}`, owner)).status).toBe(200);
  expect((await api('get', `/papers/${id}`, admin)).status).toBe(200);
  expect((await api('post', '/saved-papers', peer).send({ paper_id: id })).status).toBe(404);
  expect((await api('get', `/citations/export?paper_id=${id}&format=bib`, peer)).status).toBe(404);
  const results = await api('get', `/search?q=${suffix}&type=publications`);
  expect(results.body.data.some(item => item.paper_id === id)).toBe(false);
});
test('uploads and retrieves the exact PDF bytes, enforcing ownership', async () => {
  const bytes = Buffer.from('%PDF-1.4\nResearchHub QA exact round trip\n%%EOF');
  expect((await api('post', `/uploads/papers/${paperId}/file`, peer).attach('file', bytes, 'qa.pdf')).status).toBe(403);
  expect((await api('post', `/uploads/papers/${paperId}/file`, owner).attach('file', Buffer.from('not a PDF'), 'bad.pdf')).status).toBe(400);
  const upload = await api('post', `/uploads/papers/${paperId}/file`, owner).attach('file', bytes, 'qa.pdf');
  expect(upload.status).toBe(201);
  const download = await api('get', `/uploads/${upload.body.data.file_id}`).buffer(true);
  expect(download.status).toBe(200);expect(download.body.equals(bytes)).toBe(true);
});
test('repeated saving is idempotent and moving a paper updates collection counts', async () => {
  for (const name of ['Reading', 'Reading', 'Later']) expect((await api('post', '/saved-papers', owner).send({ paper_id: paperId, collection_name: name })).status).toBe(201);
  const saved = await api('get', '/saved-papers', owner);
  expect(saved.body.data.filter(item => item.paper_id === paperId)).toHaveLength(1);
  expect(saved.body.data.find(item => item.paper_id === paperId).collection_name).toBe('Later');
  const collections = await api('get', '/collections', owner);
  expect(collections.body.data.find(item => item.name === 'Later').paper_count).toBe(1);
  expect(collections.body.data.find(item => item.name === 'Reading').paper_count).toBe(0);
  expect((await api('get', '/collections/Later/papers', owner)).body.data[0].paper_id).toBe(paperId);
  expect((await api('get', '/collections/Later/papers', peer)).body.data).toHaveLength(0);
});
test('collection creation persists and reports duplicate names', async () => {
  expect((await api('post', '/collections', owner).send({ name: 'Climate', description: 'Reading notes' })).status).toBe(201);
  expect((await api('post', '/collections', owner).send({ name: 'Climate' })).status).toBe(409);
  expect((await api('get', '/collections', owner)).body.data.find(item => item.name === 'Climate').description).toBe('Reading notes');
});
test('recommendations are idempotent and can be removed', async () => {
  for (let i = 0; i < 2; i++) expect((await api('post', `/papers/${paperId}/recommend`, peer)).status).toBe(200);
  const [rows] = await pool.query('SELECT COUNT(*) count FROM PAPER_RECOMMENDATIONS WHERE paper_id = ? AND user_id = ?', [paperId, peer.id]);
  expect(rows[0].count).toBe(1);
  expect((await api('delete', `/papers/${paperId}/recommend`, peer)).status).toBe(200);
});
test('persists a question and answer; only the question owner can accept; one vote per account', async () => {
  const q = await api('post', '/questions', owner).send({ title: `QA question ${suffix}`, body: 'How can we reproduce this experiment?', category: 'Engineering' });
  expect(q.status).toBe(201);
  const id = q.body.data.question_id;
  const a = await api('post', `/questions/${id}/answers`, peer).send({ body: 'Document the inputs and compare a baseline.' });
  expect(a.status).toBe(201);
  const answerId = a.body.data.answer_id;
  expect((await api('post', `/questions/answers/${answerId}/accept`, peer)).status).toBe(403);
  for (let i = 0; i < 2; i++) expect((await api('post', `/questions/answers/${answerId}/upvote`, outsider)).status).toBe(200);
  expect((await api('post', `/questions/answers/${answerId}/accept`, owner)).status).toBe(200);
  const detail = await api('get', `/questions/${id}`);
  expect(detail.body.data.answer_count).toBe(1);expect(detail.body.data.answers[0]).toMatchObject({ upvotes: 1, is_accepted: 1 });
  expect((await api('post', '/questions/99999999/answers', peer).send({ body: 'Missing question' })).status).toBe(404);
});
test('follows researchers without allowing self-follow and shows their questions', async () => {
  expect((await api('post', `/researchers/${owner.id}/follow`, owner)).status).toBe(400);
  expect((await api('post', `/researchers/${owner.id}/follow`, peer)).status).toBe(201);
  expect((await api('get', `/researchers/${owner.id}/following`, peer)).body.data.is_following).toBe(true);
  const questions = await api('get', '/questions?tab=following', peer);
  expect(questions.body.data.some(q => q.user_id === owner.id)).toBe(true);
  expect((await api('delete', `/researchers/${owner.id}/follow`, peer)).status).toBe(200);
});
test('research requests can be approved only by the recipient', async () => {
  const result = await api('post', '/research-requests', owner).send({ recipient_user_id: peer.id, title: 'Replication data', message: 'Can we discuss your method?', request_type: 'dataset' });
  expect(result.status).toBe(201);const id = result.body.data.request_id;expect(id).toBeGreaterThan(0);
  expect((await api('put', `/research-requests/${id}/status`, owner).send({ status: 'approved' })).status).toBe(404);
  expect((await api('put', `/research-requests/${id}/status`, outsider).send({ status: 'approved' })).status).toBe(404);
  expect((await api('put', `/research-requests/${id}/status`, peer).send({ status: 'approved' })).status).toBe(200);
  expect((await api('get', '/research-requests', owner)).body.data.find(item => item.request_id === id).status).toBe('approved');
});
test('message consent, conversation privacy and read ownership are enforced', async () => {
  expect((await api('post', '/messages', owner).send({ receiver_id: peer.id, content: 'Before consent' })).status).toBe(409);
  const result = await api('post', '/messages/requests', owner).send({ recipient_id: peer.id, content: 'May we discuss this paper?' });
  expect(result.status).toBe(201);const id = result.body.data.request_id;
  expect((await api('put', `/messages/requests/${id}`, owner).send({ status: 'accepted' })).status).toBe(404);
  expect((await api('put', `/messages/requests/${id}`, peer).send({ status: 'accepted' })).status).toBe(200);
  const sent = await api('post', '/messages', owner).send({ receiver_id: peer.id, content: `A private message ${suffix}` });
  expect(sent.status).toBe(201);const messageId = sent.body.data.message_id;
  expect((await api('get', `/messages/${owner.id}`, peer)).body.data.some(m => m.message_id === messageId)).toBe(true);
  expect((await api('get', `/messages/${owner.id}`, outsider)).body.data).toHaveLength(0);
  expect((await api('put', `/messages/${messageId}/read`, outsider)).status).toBe(404);
  expect((await api('put', `/messages/${messageId}/read`, peer)).status).toBe(200);
});
test('blocked relationships prevent messaging even after earlier messages', async () => {
  await pool.query('INSERT INTO USER_BLOCKS (blocker_user_id, blocked_user_id) VALUES (?, ?)', [peer.id, owner.id]);
  expect((await api('post', '/messages', owner).send({ receiver_id: peer.id, content: 'After block' })).status).toBe(409);
});
test('project progress persists and only its owner can post or change status', async () => {
  const project = await api('post', '/projects', owner).send({ title: `QA project ${suffix}`, description: 'An integration milestone' });
  expect(project.status).toBe(201);const id = project.body.data.project_id;
  expect((await api('post', `/projects/${id}/updates`, peer).send({ body: 'Unauthorized edit' })).status).toBe(403);
  expect((await api('post', `/projects/${id}/updates`, owner).send({ body: 'Baseline completed' })).status).toBe(201);
  expect((await api('get', `/projects/${id}/updates`, peer)).body.data[0].body).toBe('Baseline completed');
  expect((await api('put', `/projects/${id}/status`, peer).send({ status: 'completed' })).status).toBe(404);
  expect((await api('put', `/projects/${id}/status`, owner).send({ status: 'nonsense' })).status).toBe(400);
  expect((await api('put', `/projects/${id}/status`, owner).send({ status: 'completed' })).status).toBe(200);
});
test('settings are persisted per account and citation exports use the requested paper', async () => {
  expect((await api('put', '/settings', owner).send({ theme: 'dark', density: 'compact', notifications: { weekly_digest: false }, privacy: { public_profile: true } })).status).toBe(200);
  expect((await api('get', '/settings', owner)).body.data).toMatchObject({ theme: 'dark', density: 'compact' });
  expect((await api('put', '/settings', owner).send({ theme: 'light' })).status).toBe(200);
  expect((await api('get', '/settings', owner)).body.data).toMatchObject({theme:'light',density:'compact',notifications:{weekly_digest:false}});
  for (const [format, marker] of [['bib', '@article'], ['ris', 'TY  - JOUR'], ['enw', '%0 Journal Article']]) {
    const result = await api('get', `/citations/export?paper_id=${paperId}&format=${format}`, owner);
    expect(result.status).toBe(200);expect(result.body.data.content).toContain(marker);expect(result.body.data.content).toContain(suffix);
  }
});
test('search directories never disclose credential fields and validate numeric filters', async () => {
  for (const type of ['researchers', 'questions']) {
    const result = await api('get', `/search?q=${suffix}&type=${type}`);
    expect(result.status).toBe(200);expect(result.body.data.length).toBeGreaterThan(0);
    expect(JSON.stringify(result.body)).not.toMatch(/password_hash|normalized_email|session_version/);
  }
  expect((await api('get', '/search?year_from=bad')).status).toBe(400);
  expect((await api('get', '/search/facets?q=')).status).toBe(200);
});
test('feed cursor pages contain distinct publications and invalid cursors return 400', async () => {
  const first = await api('get', '/feed?limit=2');
  expect(first.status).toBe(200);expect(first.body.data).toHaveLength(2);
  const second = await api('get', `/feed?limit=2&cursor=${first.body.pagination.next_cursor}`);
  expect(second.status).toBe(200);expect(second.body.data.length).toBeGreaterThan(0);
  expect(second.body.data.some(p => first.body.data.some(previous => previous.paper_id === p.paper_id))).toBe(false);
  for (const cursor of ['not-json', Buffer.from(JSON.stringify({beforeDate:'bad', beforeId:-1})).toString('base64url')]) {
    expect((await api('get', `/feed?cursor=${cursor}`)).status).toBe(400);
  }
});
test('interest replacement deduplicates records, keeps zero weight and isolates accounts', async () => {
  const item = { interest_type:'field', interest_id:1, weight:0 };
  expect((await api('put', '/interests', owner).send({interests:[item,item]})).status).toBe(200);
  expect((await api('get', '/interests', owner)).body.data).toHaveLength(1);
  expect((await api('get', '/interests', owner)).body.data[0].weight).toBe(0);
  expect((await api('get', '/interests', peer)).body.data).toHaveLength(0);
  expect((await api('delete', '/interests/field/1', owner)).status).toBe(200);
});
test('a dismissed paper remains excluded when the feed is fetched again', async () => {
  for (let i=0;i<2;i++) expect((await api('post', '/feed/actions', owner).send({paper_id:paperId,action_type:'not_interested'})).status).toBe(201);
  const feed = await api('get', '/feed?limit=100', owner);
  expect(feed.status).toBe(200);expect(feed.body.data.some(p=>p.paper_id===paperId)).toBe(false);
});
test('private profiles stay editable by their owner and are omitted from public discovery', async () => {
  expect((await api('put', '/researchers/me', owner).send({headline:'Private QA laboratory',visibility:'private'})).status).toBe(200);
  const mine = await api('get', '/researchers/me', owner);
  expect({status:mine.status,error:mine.body.error}).toEqual({status:200,error:undefined});
  expect(mine.body.data.headline).toBe('Private QA laboratory');expect(mine.body.data.papers.some(p=>p.paper_id===paperId)).toBe(true);
  expect((await api('get', `/researchers/${owner.username}`)).status).toBe(404);
  const found = await api('get', `/search?type=researchers&q=${owner.username}`);
  expect(found.body.data).toHaveLength(0);
  expect((await api('put', '/researchers/me', owner).send({headline:'QA laboratory',visibility:'public'})).status).toBe(200);
});
test('profile education and skills persist; another account cannot delete them', async () => {
  expect((await api('post','/researchers/me/education',owner).send({institution:'QA University',degree:'BSc',start_year:2024})).status).toBe(201);
  expect((await api('post','/researchers/me/skills',owner).send({skill_name:'Oracle QA'})).status).toBe(201);
  const mine = (await api('get','/researchers/me',owner)).body.data;
  const education = mine.education.find(item=>item.institution==='QA University');
  expect(education).toBeTruthy();expect(mine.skills.some(item=>item.skill_name==='Oracle QA')).toBe(true);
  await api('delete',`/researchers/me/education/${education.education_id}`,peer);
  expect((await api('get','/researchers/me',owner)).body.data.education).toHaveLength(1);
  expect((await api('delete',`/researchers/me/education/${education.education_id}`,owner)).status).toBe(200);
});
test('notification read state is restricted to the intended account', async () => {
  const Notification = require('../../src/models/Notification');
  const id = await Notification.create(owner.id,'QA notification','A persisted update');
  expect((await api('put',`/notifications/${id}/read`,peer)).status).toBe(404);
  expect((await api('get','/notifications',owner)).body.data.find(n=>n.notification_id===id).is_read).toBe(0);
  expect((await api('put',`/notifications/${id}/read`,owner)).status).toBe(200);
  expect((await api('get','/notifications',owner)).body.data.find(n=>n.notification_id===id).is_read).toBe(1);
});
test('jobs can be posted, filtered, saved without duplication and removed from a library', async () => {
  const created = await api('post','/jobs',owner).send({title:`QA vacancy ${suffix}`,employer:'QA Lab',description:'A fixture position',location:'Khulna',country:'Bangladesh',discipline:'Engineering',remote_mode:'hybrid'});
  expect({status:created.status,error:created.body.error}).toEqual({status:201,error:undefined});
  const id=created.body.data.job_id;jobs.push(id);
  expect((await api('get',`/jobs?q=${suffix}&country=Bangladesh`)).body.data.some(job=>job.job_id===id)).toBe(true);
  for(let i=0;i<2;i++) expect((await api('post',`/jobs/${id}/save`,peer)).status).toBe(200);
  expect((await api('get','/jobs/saved',peer)).body.data.filter(job=>job.job_id===id)).toHaveLength(1);
  expect((await api('get','/jobs/saved',owner)).body.data).toHaveLength(0);
  expect((await api('delete',`/jobs/${id}/save`,peer)).status).toBe(200);
  expect((await api('get','/jobs/saved',peer)).body.data).toHaveLength(0);
});
test('reviews persist partial updates, reject duplicates and respect moderation visibility', async () => {
  const created=await api('post','/reviews',peer).send({paper_id:paperId,rating:4,review_text:'QA discussion'});
  expect(created.status).toBe(201);const id=created.body.data.review_id;
  expect((await api('post','/reviews',peer).send({paper_id:paperId,rating:5})).status).toBe(409);
  expect((await api('put',`/reviews/${id}`,owner).send({rating:1})).status).toBe(404);
  expect((await api('put',`/reviews/${id}`,peer).send({review_text:'An updated discussion'})).status).toBe(200);
  const read=await api('get',`/reviews/paper/${paperId}`);
  expect(read.body.data.find(review=>review.review_id===id)).toMatchObject({rating:4,review_text:'An updated discussion'});
  await pool.query("UPDATE REVIEWS SET status = 'hidden' WHERE review_id = ?",[id]);
  expect((await api('get',`/reviews/paper/${paperId}`)).body.data).toHaveLength(0);
});
test('moderation records and their audit trigger execute against Oracle', async () => {
  const report = await api('post', '/reports', peer).send({ target_type: 'paper', target_id: paperId, reason_code: 'qa-review', details: 'QA moderation flow' });
  expect(report.status).toBe(201);
  const action = await api('post', `/admin/moderation/cases/${report.body.data.case_id}/actions`, admin).send({ action_type: 'hide', notes: 'QA verified' });
  expect({ status: action.status, error: action.body.error }).toEqual({ status: 200, error: undefined });
  const logs = await api('get', '/admin/audit-logs', admin);
  expect(logs.status).toBe(200);
  const [audit] = await pool.query('SELECT COUNT(*) count FROM MODERATION_AUDIT_LOG WHERE moderator_id = ?', [admin.id]);
  expect(audit[0].count).toBeGreaterThan(0);
});
test('role assignments immediately change the permissions of an existing session', async () => {
  expect((await api('post', `/admin/users/${peer.id}/roles`, admin).send({role_key: 'librarian'})).status).toBe(200);
  expect((await api('post', '/papers', peer).send({ title: 'Not permitted', publication_date: '2026-10-11' })).status).toBe(403);
  expect((await api('post', `/admin/users/${peer.id}/roles`, admin).send({role_key: 'researcher'})).status).toBe(200);
});
test('database account changes invalidate existing sessions and enforce current roles', async () => {
  await pool.query("UPDATE USERS SET is_active = 0 WHERE user_id = ?", [outsider.id]);
  expect((await api('get', '/saved-papers', outsider)).status).toBe(401);
  await pool.query("UPDATE USERS SET is_active = 1, role = 'researcher' WHERE user_id = ?", [admin.id]);
  expect((await api('get', '/admin/dashboard', admin)).status).toBe(403);
});
test('reset links are single use and reset passwords revoke earlier sessions', async () => {
  const token = await AuthToken.issue(owner.id, 'password_reset', 30);
  const reset = await api('post', '/users/reset-password').send({ token, password: 'New-QA-password!' });
  expect({ status: reset.status, error: reset.body.error }).toEqual({ status: 200, error: undefined });
  expect((await api('post', '/users/reset-password').send({ token, password })).status).toBe(400);
  expect((await api('get', '/saved-papers', owner)).status).toBe(401);
  expect((await api('post', '/users/login').send({ username: owner.username, password: 'New-QA-password!' })).status).toBe(200);
  expect((await api('post', '/users/verify-email').send({ token: 'bad' })).status).toBe(400);
});
