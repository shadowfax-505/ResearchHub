require('dotenv').config();
const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');
const config = require('../src/config');

const password = 'ResearchHubDemo!2026';
const disciplines = ['Computer Science', 'Physics', 'Biology', 'Chemistry', 'Engineering', 'Mathematics', 'Medicine', 'Environmental Science'];
const institutions = ['Northstar Institute', 'Meridian University', 'Cedar Valley Lab', 'Orbit Research Center', 'Harbor Science College'];
const cities = ['Dhaka', 'Cambridge', 'Toronto', 'Berlin', 'Singapore', 'Melbourne', 'Boston', 'Copenhagen'];

async function row(connection, sql, binds = {}) {
  const result = await connection.execute(sql, binds);
  return result.rows?.[0] || null;
}

async function safe(connection, sql, binds = {}) {
  try { await connection.execute(sql, binds); } catch (error) { if (!/ORA-00001|unique constraint/i.test(String(error.message))) throw error; }
}

async function ensureUser(connection, item) {
  let existing = await row(connection, 'SELECT user_id FROM USERS WHERE username = :username', { username: item.username });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await connection.execute(`INSERT INTO USERS (username, email, password_hash, full_name, role, affiliation, country, bio, is_active, is_verified, email_verified_at, researcher_verified_at, account_status, created_at, updated_at)
      VALUES (:username, :email, :password_hash, :full_name, :role, :affiliation, :country, :bio, 1, 1, SYSTIMESTAMP, CASE WHEN :is_verified = 1 THEN SYSTIMESTAMP ELSE NULL END, 'active', SYSTIMESTAMP, SYSTIMESTAMP)`, { username: item.username, email: item.email, password_hash: passwordHash, full_name: item.full_name, role: item.role || 'researcher', affiliation: item.affiliation, country: item.country, bio: item.bio, is_verified: item.is_verified ? 1 : 0 });
    existing = await row(connection, 'SELECT user_id FROM USERS WHERE username = :username', { username: item.username });
  }
  const userId = Number(existing.USER_ID ?? existing[0]);
  await safe(connection, `MERGE INTO EMAIL_IDENTITIES target USING (SELECT LOWER(:email) normalized_email, :email original_email, :user_id user_id FROM dual) source ON (target.normalized_email = source.normalized_email)
    WHEN MATCHED THEN UPDATE SET target.user_id = source.user_id, target.original_email = source.original_email
    WHEN NOT MATCHED THEN INSERT (normalized_email, original_email, user_id) VALUES (source.normalized_email, source.original_email, source.user_id)`, { email: item.email, user_id: userId });
  return userId;
}

async function ensureProfile(connection, userId, item) {
  await connection.execute(`MERGE INTO RESEARCHER_PROFILES target USING (SELECT :user_id user_id, :slug slug FROM dual) source ON (target.user_id = source.user_id)
    WHEN MATCHED THEN UPDATE SET target.slug = source.slug, target.headline = :headline, target.department = :department, target.position_title = :position_title, target.updated_at = SYSTIMESTAMP
    WHEN NOT MATCHED THEN INSERT (user_id, slug, headline, department, position_title, website_url, orcid, visibility, profile_completed_at) VALUES (source.user_id, source.slug, :headline, :department, :position_title, :website_url, :orcid, 'public', SYSTIMESTAMP)`, { user_id: userId, slug: item.slug, headline: item.headline, department: item.department, position_title: item.position_title, website_url: item.website_url, orcid: item.orcid });
  await safe(connection, 'INSERT INTO USER_DISCIPLINES (user_id, discipline_name) VALUES (:user_id, :name)', { user_id: userId, name: item.discipline });
  await safe(connection, 'INSERT INTO USER_EDUCATION (user_id, institution, degree, field_of_study, start_year, end_year) VALUES (:user_id, :institution, :degree, :field, :start_year, NULL)', { user_id: userId, institution: item.affiliation, degree: 'Research Fellowship', field: item.discipline, start_year: 2018 + (item.index % 5) });
  await safe(connection, 'INSERT INTO USER_EXPERIENCE (user_id, company, position, start_date, description) VALUES (:user_id, :company, :position, TO_DATE(:start_date, \'YYYY-MM-DD\'), :description)', { user_id: userId, company: item.affiliation, position: item.position_title, start_date: '2022-01-01', description: `ResearchHub demo profile in ${item.discipline}.` });
  await safe(connection, 'INSERT INTO USER_SKILLS (user_id, skill_name) VALUES (:user_id, :skill)', { user_id: userId, skill: item.skill });
  await safe(connection, 'INSERT INTO USER_LANGUAGES (user_id, language_name, proficiency) VALUES (:user_id, \'English\', \'Professional\')', { user_id: userId });
}

async function ensureAuthor(connection, userId, item) {
  const orcid = `0000-0002-${String(1000 + item.index).padStart(4, '0')}-${String(1000 + item.index).padStart(4, '0')}`;
  let existing = await row(connection, 'SELECT author_id FROM AUTHORS WHERE orcid = :orcid', { orcid });
  if (!existing) {
    await connection.execute(`INSERT INTO AUTHORS (full_name, affiliation, country, biography, researcher_url, orcid, created_at, updated_at)
      VALUES (:full_name, :affiliation, :country, :biography, :researcher_url, :orcid, SYSTIMESTAMP, SYSTIMESTAMP)`, { full_name: item.full_name, affiliation: item.affiliation, country: item.country, biography: item.bio, researcher_url: item.slug, orcid });
    existing = await row(connection, 'SELECT author_id FROM AUTHORS WHERE orcid = :orcid', { orcid });
  }
  const authorId = Number(existing.AUTHOR_ID ?? existing[0]);
  await safe(connection, `MERGE INTO USER_AUTHOR_CLAIMS target USING (SELECT :user_id user_id, :author_id author_id FROM dual) source ON (target.user_id = source.user_id AND target.author_id = source.author_id)
    WHEN MATCHED THEN UPDATE SET target.status = 'verified', target.reviewed_at = SYSTIMESTAMP
    WHEN NOT MATCHED THEN INSERT (user_id, author_id, status, reviewed_at) VALUES (source.user_id, source.author_id, 'verified', SYSTIMESTAMP)`, { user_id: userId, author_id: authorId });
  return authorId;
}

async function ensurePaper(connection, userId, authorId, item, paperIndex) {
  const title = `ResearchHub Demo ${item.index + 1}: ${item.discipline} discovery systems ${paperIndex + 1}`;
  let existing = await row(connection, 'SELECT paper_id FROM RESEARCH_PAPERS WHERE title = :title', { title });
  if (!existing) {
    await connection.execute(`INSERT INTO RESEARCH_PAPERS (title, abstract, publication_date, citation_count, view_count, download_count, language, is_peer_reviewed, status, visibility, publication_type, is_open_access, created_at, updated_at)
      VALUES (:title, :abstract, ADD_MONTHS(SYSDATE, :months), :citations, :views, :downloads, 'English', 1, 'published', 'public', 'article', 1, SYSTIMESTAMP, SYSTIMESTAMP)`, { title, abstract: `A fictional ResearchHub demo publication exploring ${item.discipline}, reproducibility, and responsible scientific collaboration.`, months: -(item.index * 2 + paperIndex + 1), citations: item.index * 4 + paperIndex * 3, views: item.index * 100 + 50, downloads: item.index * 15 + 10 });
    existing = await row(connection, 'SELECT paper_id FROM RESEARCH_PAPERS WHERE title = :title', { title });
  }
  const paperId = Number(existing.PAPER_ID ?? existing[0]);
  await safe(connection, 'INSERT INTO PAPER_AUTHORS (paper_id, author_id, author_order) VALUES (:paper_id, :author_id, 1)', { paper_id: paperId, author_id: authorId });
  return paperId;
}

async function ensureJob(connection, userId, item) {
  const title = `${item.position_title} - ResearchHub Demo ${item.index + 1}`;
  await safe(connection, `INSERT INTO JOBS (employer, title, location, description, requirements, employment_type, posted_by, country, city, status, discipline, remote_mode, career_level, posted_at, created_at)
    SELECT :employer, :title, :location, :description, :requirements, 'Full-time', :posted_by, :country, :city, 'PUBLISHED', :discipline, :remote_mode, 'Mid-level', SYSTIMESTAMP, SYSTIMESTAMP FROM dual
    WHERE NOT EXISTS (SELECT 1 FROM JOBS WHERE title = :title)`, { employer: item.affiliation, title, location: `${item.city}, ${item.country}`, description: `A fictional ResearchHub opportunity for work in ${item.discipline}.`, requirements: `Experience with ${item.skill} and reproducible research.`, posted_by: userId, country: item.country, city: item.city, discipline: item.discipline, remote_mode: item.index % 3 === 0 ? 'remote' : 'on_site' });
}

async function ensureSocial(connection, userIds, items) {
  for (let index = 0; index < userIds.length; index += 1) {
    const userId = userIds[index];
    const nextId = userIds[(index + 1) % userIds.length];
    await safe(connection, 'INSERT INTO USER_FOLLOWS (follower_user_id, followed_user_id) VALUES (:follower, :followed)', { follower: userId, followed: nextId });
    await safe(connection, 'INSERT INTO USER_FOLLOWS (follower_user_id, followed_user_id) VALUES (:follower, :followed)', { follower: userId, followed: userIds[(index + 2) % userIds.length] });
    await safe(connection, `INSERT INTO MESSAGE_REQUESTS (sender_id, recipient_id, first_message, status, decided_by_user_id, decided_at, created_at, updated_at)
      SELECT :sender, :recipient, :message, 'accepted', :recipient, SYSTIMESTAMP, SYSTIMESTAMP, SYSTIMESTAMP FROM dual
      WHERE NOT EXISTS (SELECT 1 FROM MESSAGE_REQUESTS WHERE sender_id = :sender AND recipient_id = :recipient)`, { sender: userId, recipient: nextId, message: `Hello from the ${items[index].discipline} demo research group.` });
    await safe(connection, `INSERT INTO MESSAGES (sender_id, receiver_id, content, is_read, created_at)
      SELECT :sender, :recipient, :content, 0, SYSTIMESTAMP FROM dual
      WHERE NOT EXISTS (SELECT 1 FROM MESSAGES WHERE sender_id = :sender AND receiver_id = :recipient)`, { sender: userId, recipient: nextId, content: `Welcome to the ResearchHub demo network, ${items[(index + 1) % items.length].full_name}.` });
    await safe(connection, `INSERT INTO RESEARCH_REQUESTS (user_id, recipient_user_id, request_type, title, recipient_name, message, status, created_at, updated_at)
      SELECT :sender, :recipient, 'collaboration', :title, :recipient_name, :message, 'pending', SYSTIMESTAMP, SYSTIMESTAMP FROM dual
      WHERE NOT EXISTS (SELECT 1 FROM RESEARCH_REQUESTS WHERE user_id = :sender AND recipient_user_id = :recipient AND request_type = 'collaboration')`, { sender: userId, recipient: nextId, title: `Collaboration request from ${items[index].discipline}`, recipient_name: items[(index + 1) % items.length].full_name, message: `Would you like to compare methods in ${items[index].discipline}?` });
    await safe(connection, `INSERT INTO ACTIVITY_EVENTS (recipient_user_id, actor_user_id, event_type, source_type, title, body, route_url, created_at)
      SELECT :user_id, NULL, 'system_notice', 'system', 'Welcome to the ResearchHub demo network', 'This fictional profile is connected to publications, jobs, requests, messages, and updates.', '/network', SYSTIMESTAMP FROM dual
      WHERE NOT EXISTS (SELECT 1 FROM ACTIVITY_EVENTS WHERE recipient_user_id = :user_id AND event_type = 'system_notice')`, { user_id: userId });
  }
}

async function run() {
  const connection = await oracledb.getConnection({ user: config.db.user, password: config.db.password, connectString: config.db.connectString });
  try {
    const items = Array.from({ length: 20 }, (_, index) => {
      const discipline = disciplines[index % disciplines.length];
      const institution = institutions[index % institutions.length];
      const city = cities[index % cities.length];
      return { index, username: `demo_researcher_${String(index + 1).padStart(2, '0')}`, email: `demo${String(index + 1).padStart(2, '0')}@researchhub.local`, full_name: `ResearchHub Demo Researcher ${String(index + 1).padStart(2, '0')}`, role: 'researcher', slug: `demo-researcher-${String(index + 1).padStart(2, '0')}`, affiliation: institution, country: city === 'Dhaka' ? 'Bangladesh' : city === 'Cambridge' || city === 'Boston' ? 'United States' : city === 'Toronto' ? 'Canada' : city === 'Berlin' || city === 'Copenhagen' ? 'Europe' : 'Australia', city, discipline, department: `${discipline} Research Group`, position_title: index % 2 ? 'Research Scientist' : 'Assistant Professor', headline: `${discipline} researcher focused on open and reproducible science`, website_url: `https://researchhub.local/${index + 1}`, orcid: `0000-0002-${String(1000 + index + 1).padStart(4, '0')}-${String(1000 + index + 1).padStart(4, '0')}`, skill: ['Reproducible workflows', 'Scientific computing', 'Data visualization', 'Research methods'][index % 4], bio: `Fictional ResearchHub demo researcher ${String(index + 1).padStart(2, '0')} working on connected scholarship in ${discipline}.`, is_verified: index < 6 };
    });
    const userIds = [];
    for (const item of items) {
      const userId = await ensureUser(connection, item);
      userIds.push(userId);
      await ensureProfile(connection, userId, item);
      const authorId = await ensureAuthor(connection, userId, item);
      await ensurePaper(connection, userId, authorId, item, 0);
      await ensurePaper(connection, userId, authorId, item, 1);
      await ensureJob(connection, userId, item);
      await safe(connection, `INSERT INTO QUESTIONS (user_id, title, body, category, status, visibility, created_at, updated_at)
        SELECT :user_id, :title, :body, :category, 'published', 'public', SYSTIMESTAMP, SYSTIMESTAMP FROM dual
        WHERE NOT EXISTS (SELECT 1 FROM QUESTIONS WHERE user_id = :user_id AND title = :title)`, { user_id: userId, title: `ResearchHub demo question: reproducible ${item.discipline} workflows`, body: `What practices help your team reproduce results in ${item.discipline}?`, category: item.discipline });
    }
    await ensureSocial(connection, userIds, items);
    const admin = { ...items[0], username: 'researchhub_demo_admin', email: 'admin@researchhub.local', full_name: 'ResearchHub Demo Moderator', slug: 'researchhub-demo-admin', role: 'admin', is_verified: true, orcid: '0000-0002-9000-9000' };
    const adminId = await ensureUser(connection, admin);
    await ensureProfile(connection, adminId, admin);
    await connection.execute('UPDATE USERS SET role = \'admin\', is_verified = 1, researcher_verified_at = SYSTIMESTAMP WHERE user_id = :user_id', { user_id: adminId });
    for (const userId of userIds) await connection.execute('MERGE INTO RESEARCHER_STATS target USING (SELECT :user_id user_id FROM dual) source ON (target.user_id = source.user_id) WHEN MATCHED THEN UPDATE SET updated_at = SYSTIMESTAMP WHEN NOT MATCHED THEN INSERT (user_id, updated_at) VALUES (source.user_id, SYSTIMESTAMP)', { user_id: userId });
    await connection.commit();
    console.log(`Seeded ${userIds.length} fictional ResearchHub researchers and admin ${adminId}.`);
  } finally { await connection.close(); }
}

run().catch(error => { console.error('Demo network seed failed:', error.message); process.exit(1); });
