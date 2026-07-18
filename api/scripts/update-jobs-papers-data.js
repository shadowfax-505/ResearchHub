require('dotenv').config();
const { pool } = require('../src/config/database');

async function updateData() {
  const countries = ['Germany', 'USA', 'United Kingdom', 'Canada', 'Australia', 'France', 'Japan', 'Switzerland'];
  const remoteModes = ['On-site', 'Hybrid', 'Remote'];
  const careerLevels = ['Student / Intern', 'Entry Level', 'Associate', 'Mid-Senior', 'Director', 'Executive'];
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
  const languages = ['English', 'German', 'French', 'Spanish', 'Chinese'];
  const pubTypes = ['article', 'preprint', 'conference', 'book', 'chapter'];
  const disciplines = ['Computer Science', 'Physics', 'Biology', 'Chemistry', 'Mathematics', 'Engineering', 'Medicine', 'Economics'];

  const [jobs] = await pool.query('SELECT job_id FROM JOBS');
  console.log(`Updating ${jobs.length} jobs...`);
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const country = countries[i % countries.length];
    const remote = remoteModes[i % remoteModes.length];
    const career = careerLevels[i % careerLevels.length];
    const empType = employmentTypes[i % employmentTypes.length];
    const disc = disciplines[i % disciplines.length];
    await pool.query(
      "UPDATE JOBS SET country = ?, location = ?, remote_mode = ?, career_level = ?, employment_type = ?, discipline = ?, status = 'ACTIVE' WHERE job_id = ?",
      [country, `${country} Research Campus`, remote, career, empType, disc, job.job_id]
    );
  }

  const [papers] = await pool.query('SELECT paper_id FROM RESEARCH_PAPERS');
  console.log(`Updating ${papers.length} papers...`);
  for (let i = 0; i < papers.length; i++) {
    const paper = papers[i];
    const lang = languages[i % languages.length];
    const pubType = pubTypes[i % pubTypes.length];
    const isPeer = i % 4 !== 0 ? 1 : 0;
    const isOpen = i % 3 !== 0 ? 1 : 0;
    await pool.query(
      'UPDATE RESEARCH_PAPERS SET language = ?, publication_type = ?, is_peer_reviewed = ?, is_open_access = ? WHERE paper_id = ?',
      [lang, pubType, isPeer, isOpen, paper.paper_id]
    );
  }

  console.log('Successfully updated jobs and papers with diverse seed data!');
  process.exit(0);
}

updateData().catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
