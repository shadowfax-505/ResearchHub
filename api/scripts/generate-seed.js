const fs = require('fs');
const path = require('path');

const NUM_USERS = 50;
const NUM_JOURNALS = 30;
const NUM_PAPERS = 100;
const NUM_JOBS = 50;
const NUM_QUESTIONS = 100;

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const universities = ['MIT', 'Stanford', 'Harvard', 'Caltech', 'Oxford', 'Cambridge', 'ETH Zurich', 'UCL', 'Imperial College London', 'University of Chicago'];
const fields = ['Computer Science', 'Physics', 'Biology', 'Chemistry', 'Mathematics', 'Engineering', 'Medicine', 'Economics', 'Psychology', 'Sociology', 'Linguistics', 'Philosophy', 'Anthropology', 'Political Science', 'Geology', 'Environmental Science'];
const journalNames = ['Nature', 'Science', 'Cell', 'The Lancet', 'NEJM', 'JAMA', 'PNAS', 'Physical Review Letters', 'JACS', 'Angewandte Chemie', 'IEEE T-PAMI', 'AI Magazine', 'Communications of the ACM', 'Bioinformatics', 'PLOS One', 'Scientific Reports', 'Advanced Materials', 'Nano Letters', 'Astrophysical Journal', 'Journal of Finance'];
const paperTitles = ['Deep Learning for', 'Quantum Supremacy in', 'CRISPR Cas9 editing of', 'Novel approach to', 'Impact of climate change on', 'Machine learning models for', 'Blockchain technology in', 'Renewable energy integration in', 'Genetic markers for', 'Data-driven analysis of', 'A comprehensive review of', 'Recent advances in', 'Challenges and opportunities in', 'Future perspectives on', 'Empirical study on'];
const jobTitles = ['Postdoctoral Researcher in', 'Assistant Professor of', 'Data Scientist:', 'Research Scientist:', 'PhD Candidate in'];
const questionTitles = ['What is the best approach for', 'How to handle', 'Any recommendations for', 'Troubleshooting', 'Understanding'];
const locations = ['Remote', 'New York, USA', 'London, UK', 'San Francisco, USA', 'Berlin, Germany', 'Tokyo, Japan', 'Boston, USA', 'Toronto, Canada', 'Sydney, Australia', 'Paris, France'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fixed password hash for "password123" for easier debugging
const PASSWORD_HASH = '$2a$10$E6o03ViYD2zoXNqKthpBn.YSyTNQYD6HaTRVglYeDnZXmya8AF4zW';

let sql = '';

// 2. USERS
sql += 'INSERT INTO USERS (username, email, password_hash, full_name, role, affiliation, country, bio, is_active, created_at, is_verified) VALUES\n';
const userValues = [];
// Keep john_smith and jane_doe
userValues.push(`('john_smith', 'john@university.edu', '${PASSWORD_HASH}', 'John Smith', 'researcher', 'MIT', 'USA', 'Computer Science Researcher', 1, SYSTIMESTAMP, 1)`);
userValues.push(`('jane_doe', 'jane@university.edu', '${PASSWORD_HASH}', 'Jane Doe', 'admin', 'Stanford', 'USA', 'Academic Administrator', 1, SYSTIMESTAMP, 1)`);

for (let i = 0; i < NUM_USERS; i++) {
  const fn = randomItem(firstNames);
  const ln = randomItem(lastNames);
  const username = `${fn.toLowerCase()}_${ln.toLowerCase()}_${i}`;
  const email = `${username}@${randomItem(universities).toLowerCase().replace(/ /g, '')}.edu`;
  const affiliation = randomItem(universities);
  const field = randomItem(fields);
  userValues.push(`('${username}', '${email}', '${PASSWORD_HASH}', '${fn} ${ln}', 'researcher', '${affiliation}', 'USA', '${field} Researcher', 1, SYSTIMESTAMP, ${Math.random() > 0.5 ? 1 : 0})`);
}
sql += userValues.join(',\n') + ';\n\n';

// 3. AUTHORS
sql += 'INSERT INTO AUTHORS (full_name, affiliation, country, email, h_index, biography, orcid, created_at) VALUES\n';
const authorValues = [];
for (let i = 0; i < NUM_USERS + 5; i++) {
  const fn = randomItem(firstNames);
  const ln = randomItem(lastNames);
  const hIndex = randomInt(5, 100);
  authorValues.push(`('${fn} ${ln}', '${randomItem(universities)}', 'USA', '${fn.toLowerCase()}@example.com', ${hIndex}, 'Researcher', '0000-000${randomInt(1,9)}-${randomInt(1000,9999)}-${randomInt(1000,9999)}', SYSTIMESTAMP)`);
}
sql += authorValues.join(',\n') + ';\n\n';

// 4. JOURNALS
sql += 'INSERT INTO JOURNALS (name, issn, publisher, impact_factor, h_index, website, description, created_at) VALUES\n';
const journalValues = [];
for (let i = 0; i < NUM_JOURNALS; i++) {
  const name = journalNames[i % journalNames.length];
  const impact = (Math.random() * 50).toFixed(2);
  const hIndex = randomInt(50, 400);
  journalValues.push(`('${name} ${i}', '0000-${randomInt(1000,9999)}', 'Publisher ${i}', ${impact}, ${hIndex}, 'https://example.com/j${i}', 'Journal description', SYSTIMESTAMP)`);
}
sql += journalValues.join(',\n') + ';\n\n';

const countriesList = ['Germany', 'USA', 'United Kingdom', 'Canada', 'Australia', 'France', 'Japan', 'Switzerland'];
const remoteModesList = ['On-site', 'Hybrid', 'Remote'];
const careerLevelsList = ['Student / Intern', 'Entry Level', 'Associate', 'Mid-Senior', 'Director', 'Executive'];
const employmentTypesList = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
const languagesList = ['English', 'German', 'French', 'Spanish', 'Chinese'];
const pubTypesList = ['article', 'preprint', 'conference', 'book', 'chapter'];

// 5. RESEARCH PAPERS
sql += 'INSERT INTO RESEARCH_PAPERS (journal_id, title, abstract, doi, publication_date, volume, issue, pages, citation_count, view_count, download_count, pdf_url, language, is_peer_reviewed, is_open_access, publication_type, status, created_at) VALUES\n';
const paperValues = [];
for (let i = 1; i <= NUM_PAPERS; i++) {
  const journalId = randomInt(1, NUM_JOURNALS);
  const title = `${randomItem(paperTitles)} ${randomItem(fields)}`;
  const citations = randomInt(0, 500);
  const views = randomInt(100, 10000);
  const downloads = randomInt(50, 5000);
  const lang = randomItem(languagesList);
  const isPeer = Math.random() > 0.25 ? 1 : 0;
  const isOpen = Math.random() > 0.4 ? 1 : 0;
  const pubType = randomItem(pubTypesList);
  paperValues.push(`(${journalId}, '${title}', 'This is a procedurally generated abstract about ${title.toLowerCase()}.', '10.1000/paper${i}', DATE '2024-01-01', ${randomInt(1, 100)}, ${randomInt(1, 12)}, '1-10', ${citations}, ${views}, ${downloads}, 'https://example.com/pdf${i}', '${lang}', ${isPeer}, ${isOpen}, '${pubType}', 'published', SYSTIMESTAMP)`);
}
sql += paperValues.join(',\n') + ';\n\n';

// PAPER AUTHORS
sql += 'INSERT INTO PAPER_AUTHORS (paper_id, author_id, author_order) VALUES\n';
const paperAuthorValues = [];
for (let i = 1; i <= NUM_PAPERS; i++) {
  const numAuthors = randomInt(1, 5);
  const usedAuthors = new Set();
  for (let j = 1; j <= numAuthors; j++) {
    let authorId;
    do {
      authorId = randomInt(1, NUM_USERS + 5);
    } while (usedAuthors.has(authorId));
    usedAuthors.add(authorId);
    paperAuthorValues.push(`(${i}, ${authorId}, ${j})`);
  }
}
sql += paperAuthorValues.join(',\n') + ';\n\n';


// 6. JOBS
sql += 'INSERT INTO JOBS (employer, title, location, description, requirements, salary_range, employment_type, posted_by, country, discipline, remote_mode, career_level, status, posted_at, expires_at) VALUES\n';
const jobValues = [];
for (let i = 1; i <= NUM_JOBS; i++) {
  const employer = randomItem(universities);
  const title = `${randomItem(jobTitles)} ${randomItem(fields)}`;
  const country = randomItem(countriesList);
  const loc = `${country} Main Campus`;
  const desc = 'We are looking for a highly motivated individual to join our team...';
  const req = 'PhD in related field, 3+ years experience, strong publication record.';
  const postedBy = randomInt(1, NUM_USERS + 2); // 1-22
  const empType = randomItem(employmentTypesList);
  const disc = randomItem(fields);
  const remote = randomItem(remoteModesList);
  const career = randomItem(careerLevelsList);
  jobValues.push(`('${employer}', '${title}', '${loc}', '${desc}', '${req}', '$80,000 - $120,000', '${empType}', ${postedBy}, '${country}', '${disc}', '${remote}', '${career}', 'ACTIVE', SYSTIMESTAMP - INTERVAL '${randomInt(1,30)}' DAY, SYSTIMESTAMP + INTERVAL '${randomInt(10,60)}' DAY)`);
}
sql += jobValues.join(',\n') + ';\n\n';

// 7. QUESTIONS
sql += 'INSERT INTO QUESTIONS (user_id, title, body, category, view_count, answer_count, created_at) VALUES\n';
const questionValues = [];
for (let i = 1; i <= NUM_QUESTIONS; i++) {
  const userId = randomInt(1, NUM_USERS + 2);
  const title = `${randomItem(questionTitles)} ${randomItem(fields)}?`;
  const body = `I am currently working on a project and need some advice on ${title.toLowerCase()}. Any help is appreciated!`;
  const category = randomItem(fields);
  questionValues.push(`(${userId}, '${title}', '${body}', '${category}', ${randomInt(10, 500)}, ${randomInt(0, 5)}, SYSTIMESTAMP - INTERVAL '${randomInt(1,30)}' DAY)`);
}
sql += questionValues.join(',\n') + ';\n\n';

// 8. ANSWERS
sql += 'INSERT INTO ANSWERS (question_id, user_id, body, upvotes, is_accepted, created_at) VALUES\n';
const answerValues = [];
// Generate answers for some questions
for (let i = 1; i <= NUM_QUESTIONS; i++) {
  const numAnswers = randomInt(0, 3);
  for (let j = 0; j < numAnswers; j++) {
    const userId = randomInt(1, NUM_USERS + 2);
    const body = `Here is my suggested solution for your problem in ${randomItem(fields)}. You should try...`;
    const isAccepted = (j === 0 && Math.random() > 0.5) ? 1 : 0;
    answerValues.push(`(${i}, ${userId}, '${body}', ${randomInt(0, 20)}, ${isAccepted}, SYSTIMESTAMP - INTERVAL '${randomInt(0,5)}' DAY)`);
  }
}
if (answerValues.length > 0) {
    sql += answerValues.join(',\n') + ';\n\n';
}

// 9. FOLLOWED_AUTHORS
sql += 'INSERT INTO FOLLOWED_AUTHORS (user_id, author_id, followed_at) VALUES\n';
const followValues = [];
for (let i = 1; i <= NUM_USERS + 2; i++) {
  const numFollows = randomInt(2, 10);
  const usedFollows = new Set();
  for (let j = 0; j < numFollows; j++) {
    let authorId;
    do {
      authorId = randomInt(1, NUM_USERS + 5);
    } while (usedFollows.has(authorId) || authorId === i);
    usedFollows.add(authorId);
    followValues.push(`(${i}, ${authorId}, SYSTIMESTAMP - INTERVAL '${randomInt(0,30)}' DAY)`);
  }
}
if (followValues.length > 0) {
    sql += followValues.join(',\n') + ';\n\n';
}

// 10. USER_EDUCATION
sql += 'INSERT INTO USER_EDUCATION (user_id, institution, degree, field_of_study, start_year, end_year) VALUES\n';
const eduValues = [];
const degrees = ['BSc', 'MSc', 'PhD', 'Postdoc'];
for (let i = 1; i <= NUM_USERS + 2; i++) {
  const numEdu = randomInt(1, 3);
  for (let j = 0; j < numEdu; j++) {
    const startYear = randomInt(2000, 2020) + (j * 4);
    const endYear = startYear + randomInt(2, 4);
    eduValues.push(`(${i}, '${randomItem(universities)}', '${degrees[j] || 'BSc'}', '${randomItem(fields)}', ${startYear}, ${endYear})`);
  }
}
if (eduValues.length > 0) sql += eduValues.join(',\n') + ';\n\n';

// 11. USER_EXPERIENCE
sql += 'INSERT INTO USER_EXPERIENCE (user_id, company, position, start_date, end_date, description) VALUES\n';
const expValues = [];
for (let i = 1; i <= NUM_USERS + 2; i++) {
  const numExp = randomInt(1, 2);
  for (let j = 0; j < numExp; j++) {
    const startYear = randomInt(2010, 2022);
    expValues.push(`(${i}, '${randomItem(universities)}', '${randomItem(jobTitles).replace(':', '')}', DATE '${startYear}-01-01', DATE '${startYear + 2}-12-31', 'Conducted extensive research in ${randomItem(fields).toLowerCase()}.')`);
  }
}
if (expValues.length > 0) sql += expValues.join(',\n') + ';\n\n';

// 12. USER_SKILLS
sql += 'INSERT INTO USER_SKILLS (user_id, skill_name) VALUES\n';
const skillValues = [];
const skillList = ['Python', 'R', 'Machine Learning', 'Data Analysis', 'MATLAB', 'Statistics', 'Project Management', 'Public Speaking', 'C++', 'Java', 'Genomics', 'Spectroscopy'];
for (let i = 1; i <= NUM_USERS + 2; i++) {
  const numSkills = randomInt(2, 5);
  const usedSkills = new Set();
  for (let j = 0; j < numSkills; j++) {
    let skill;
    do { skill = randomItem(skillList); } while (usedSkills.has(skill));
    usedSkills.add(skill);
    skillValues.push(`(${i}, '${skill}')`);
  }
}
if (skillValues.length > 0) sql += skillValues.join(',\n') + ';\n\n';

// 13. USER_LANGUAGES
sql += 'INSERT INTO USER_LANGUAGES (user_id, language_name, proficiency) VALUES\n';
const langValues = [];
const languageList = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Arabic'];
const proficiencies = ['Native', 'Fluent', 'Intermediate', 'Beginner'];
for (let i = 1; i <= NUM_USERS + 2; i++) {
  const numLangs = randomInt(1, 2);
  const usedLangs = new Set();
  for (let j = 0; j < numLangs; j++) {
    let lang;
    do { lang = randomItem(languageList); } while (usedLangs.has(lang));
    usedLangs.add(lang);
    langValues.push(`(${i}, '${lang}', '${j === 0 ? 'Native' : randomItem(proficiencies)}')`);
  }
}
if (langValues.length > 0) sql += langValues.join(',\n') + ';\n\n';

// 14. USER_DISCIPLINES
sql += 'INSERT INTO USER_DISCIPLINES (user_id, discipline_name) VALUES\n';
const discValues = [];
for (let i = 1; i <= NUM_USERS + 2; i++) {
  const numDisc = randomInt(1, 3);
  const usedDisc = new Set();
  for (let j = 0; j < numDisc; j++) {
    let disc;
    do { disc = randomItem(fields); } while (usedDisc.has(disc));
    usedDisc.add(disc);
    discValues.push(`(${i}, '${disc}')`);
  }
}
if (discValues.length > 0) sql += discValues.join(',\n') + ';\n\n';

const outPath = path.join(__dirname, '..', '..', 'database', 'seeds', 'seed-data.sql');
fs.writeFileSync(outPath, sql);
console.log('Seed data generated at ' + outPath);
