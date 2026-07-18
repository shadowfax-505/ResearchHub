const fs = require('fs');
const path = require('path');
const config = require('../src/config');
require('dotenv').config();

let oracledb;
try {
  oracledb = require('oracledb');
} catch (_error) {
  console.error('Oracle database driver unavailable.');
  process.exit(1);
}

async function seedAdditional() {
  const connection = await oracledb.getConnection({
    user: config.db.user,
    password: config.db.password,
    connectString: config.db.connectString
  });

  try {
    // Check if RESEARCH_FIELDS already has data
    const rfCheck = await connection.execute('SELECT COUNT(*) AS cnt FROM RESEARCH_FIELDS');
    const rfCount = rfCheck.rows[0][0] || rfCheck.rows[0].CNT;
    
    if (rfCount > 0) {
      console.log(`RESEARCH_FIELDS already has ${rfCount} rows. Skipping field seeding.`);
    } else {
      console.log('Seeding RESEARCH_FIELDS...');
      const fields = [
        ['Computer Science', 'The study of computation, information, and automation', null],
        ['Physics', 'The natural science that studies matter, motion, energy, and force', null],
        ['Biology', 'The scientific study of life and living organisms', null],
        ['Chemistry', 'The scientific study of the properties of matter and their transformations', null],
        ['Mathematics', 'The science and study of quality, structure, space, and change', null],
        ['Medicine', 'The science and practice of caring for patients and managing disease', null],
        ['Engineering', 'The application of scientific and mathematical principles to design systems', null],
        ['Psychology', 'The scientific study of mind and behavior', null],
        ['Economics', 'The social science that studies the production and consumption of goods', null],
        ['Linguistics', 'The scientific study of language and its structure', null],
        ['Sociology', 'The study of social behavior, society, and patterns', null],
        ['Philosophy', 'The study of fundamental nature of knowledge, reality, and existence', null],
        ['Environmental Science', 'The study of the environment and solutions to environmental problems', null],
        ['Political Science', 'The study of politics, power, and government systems', null],
        ['Anthropology', 'The study of human societies and cultures and their development', null],
        ['Geology', 'The science that deals with the physical structure of the earth', null],
      ];
      for (const [name, desc, parent] of fields) {
        await connection.execute(
          'INSERT INTO RESEARCH_FIELDS (field_name, description, parent_field_id, created_at) VALUES (:1, :2, :3, SYSTIMESTAMP)',
          [name, desc, parent]
        );
      }
      // Sub-fields (need parent IDs)
      const csResult = await connection.execute("SELECT field_id FROM RESEARCH_FIELDS WHERE field_name = 'Computer Science'");
      const csId = csResult.rows[0][0] || csResult.rows[0].FIELD_ID;
      const physResult = await connection.execute("SELECT field_id FROM RESEARCH_FIELDS WHERE field_name = 'Physics'");
      const physId = physResult.rows[0][0] || physResult.rows[0].FIELD_ID;
      const bioResult = await connection.execute("SELECT field_id FROM RESEARCH_FIELDS WHERE field_name = 'Biology'");
      const bioId = bioResult.rows[0][0] || bioResult.rows[0].FIELD_ID;

      const subFields = [
        ['Artificial Intelligence', 'The simulation of human intelligence in machines', csId],
        ['Machine Learning', 'A subset of AI focusing on algorithms that learn from data', csId],
        ['Quantum Physics', 'The study of matter and energy at the most fundamental level', physId],
        ['Molecular Biology', 'The study of biology at a molecular level', bioId],
      ];
      for (const [name, desc, parent] of subFields) {
        await connection.execute(
          'INSERT INTO RESEARCH_FIELDS (field_name, description, parent_field_id, created_at) VALUES (:1, :2, :3, SYSTIMESTAMP)',
          [name, desc, parent]
        );
      }
      console.log('  Seeded 20 research fields.');
    }

    // Seed KEYWORDS
    const kwCheck = await connection.execute('SELECT COUNT(*) AS cnt FROM KEYWORDS');
    const kwCount = kwCheck.rows[0][0] || kwCheck.rows[0].CNT;
    if (kwCount > 0) {
      console.log(`KEYWORDS already has ${kwCount} rows. Skipping.`);
    } else {
      console.log('Seeding KEYWORDS...');
      const keywords = [
        ['deep learning', 85], ['neural networks', 72], ['machine learning', 95],
        ['natural language processing', 58], ['quantum computing', 42], ['climate change', 67],
        ['gene editing', 53], ['CRISPR', 61], ['sustainability', 49], ['blockchain', 38],
        ['protein folding', 44], ['dark matter', 31], ['renewable energy', 56],
        ['cognitive science', 27], ['data science', 78], ['bioinformatics', 36],
        ['nanotechnology', 33], ['robotics', 45], ['immunology', 39], ['epidemiology', 52],
      ];
      for (const [kw, freq] of keywords) {
        await connection.execute(
          'INSERT INTO KEYWORDS (keyword, frequency, created_at) VALUES (:1, :2, SYSTIMESTAMP)',
          [kw, freq]
        );
      }
      console.log('  Seeded 20 keywords.');
    }

    // Seed PAPER_FIELDS (link papers to fields)
    const pfCheck = await connection.execute('SELECT COUNT(*) AS cnt FROM PAPER_FIELDS');
    const pfCount = pfCheck.rows[0][0] || pfCheck.rows[0].CNT;
    if (pfCount > 0) {
      console.log(`PAPER_FIELDS already has ${pfCount} rows. Skipping.`);
    } else {
      console.log('Seeding PAPER_FIELDS...');
      // Get all field IDs
      const fieldsResult = await connection.execute('SELECT field_id FROM RESEARCH_FIELDS ORDER BY field_id');
      const fieldIds = fieldsResult.rows.map(r => r[0] || r.FIELD_ID);
      
      // Link each of the first 80 papers to 1-2 fields
      for (let paperId = 1; paperId <= Math.min(80, fieldIds.length > 0 ? 80 : 0); paperId++) {
        const fIdx = (paperId - 1) % fieldIds.length;
        try {
          await connection.execute(
            'INSERT INTO PAPER_FIELDS (paper_id, field_id, relevance_score) VALUES (:1, :2, :3)',
            [paperId, fieldIds[fIdx], 0.85 + Math.random() * 0.1]
          );
        } catch (e) {
          // Skip FK violations (paper might not exist)
          if (!e.message.includes('ORA-02291') && !e.message.includes('ORA-00001')) throw e;
        }
      }
      console.log('  Seeded paper-field associations.');
    }

    // Seed PAPER_KEYWORDS
    const pkCheck = await connection.execute('SELECT COUNT(*) AS cnt FROM PAPER_KEYWORDS');
    const pkCount = pkCheck.rows[0][0] || pkCheck.rows[0].CNT;
    if (pkCount > 0) {
      console.log(`PAPER_KEYWORDS already has ${pkCount} rows. Skipping.`);
    } else {
      console.log('Seeding PAPER_KEYWORDS...');
      const kwResult = await connection.execute('SELECT keyword_id FROM KEYWORDS ORDER BY keyword_id');
      const kwIds = kwResult.rows.map(r => r[0] || r.KEYWORD_ID);
      
      for (let paperId = 1; paperId <= Math.min(70, kwIds.length > 0 ? 70 : 0); paperId++) {
        const kwIdx1 = (paperId - 1) % kwIds.length;
        const kwIdx2 = (paperId + 3) % kwIds.length;
        try {
          await connection.execute(
            'INSERT INTO PAPER_KEYWORDS (paper_id, keyword_id) VALUES (:1, :2)',
            [paperId, kwIds[kwIdx1]]
          );
          if (kwIdx1 !== kwIdx2) {
            await connection.execute(
              'INSERT INTO PAPER_KEYWORDS (paper_id, keyword_id) VALUES (:1, :2)',
              [paperId, kwIds[kwIdx2]]
            );
          }
        } catch (e) {
          if (!e.message.includes('ORA-02291') && !e.message.includes('ORA-00001')) throw e;
        }
      }
      console.log('  Seeded paper-keyword associations.');
    }

    // Seed RESEARCHER_STATS
    const rsCheck = await connection.execute('SELECT COUNT(*) AS cnt FROM RESEARCHER_STATS');
    const rsCount = rsCheck.rows[0][0] || rsCheck.rows[0].CNT;
    if (rsCount > 0) {
      console.log(`RESEARCHER_STATS already has ${rsCount} rows. Skipping.`);
    } else {
      console.log('Seeding RESEARCHER_STATS...');
      const statsData = [
        [1, 15, 42, 8, 23, 12, 23, 67, 5100, 28.5],
        [2, 8, 35, 12, 18, 8, 12, 34, 2800, 15.2],
        [3, 22, 67, 45, 34, 22, 45, 112, 9200, 42.1],
        [4, 11, 28, 15, 12, 9, 18, 45, 4100, 21.7],
        [5, 19, 53, 32, 28, 15, 34, 89, 7800, 36.4],
        [6, 7, 18, 5, 8, 5, 8, 19, 1500, 9.8],
        [7, 25, 78, 56, 42, 25, 56, 134, 10800, 48.3],
        [8, 13, 34, 18, 15, 11, 21, 56, 5400, 26.9],
        [9, 16, 45, 22, 18, 13, 28, 72, 6300, 31.5],
        [10, 9, 22, 10, 12, 8, 15, 38, 3100, 17.4],
        [11, 14, 38, 19, 15, 10, 22, 59, 5000, 25.6],
        [12, 20, 62, 42, 32, 16, 38, 95, 8200, 38.7],
        [13, 6, 14, 4, 5, 4, 6, 15, 1100, 7.2],
        [14, 18, 48, 28, 22, 14, 32, 82, 7100, 34.1],
        [15, 10, 25, 12, 10, 8, 16, 42, 3400, 18.9],
        [16, 23, 72, 48, 38, 19, 48, 118, 10000, 44.5],
        [17, 12, 32, 15, 12, 10, 20, 51, 4600, 23.8],
        [18, 17, 42, 25, 18, 13, 30, 78, 6700, 32.6],
        [19, 8, 18, 8, 8, 6, 10, 28, 2300, 12.1],
        [20, 21, 58, 38, 28, 17, 42, 102, 8600, 40.2],
      ];
      for (const [uid, savedPapers, following, followers, reviews, questions, answers, ftr, totalReads, rgScore] of statsData) {
        try {
          await connection.execute(
            `INSERT INTO RESEARCHER_STATS (user_id, saved_papers, following, followers, reviews, questions, answers, full_text_requests, total_reads, rg_score) 
             VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)`,
            [uid, savedPapers, following, followers, reviews, questions, answers, ftr, totalReads, rgScore]
          );
        } catch (e) {
          if (!e.message.includes('ORA-00001')) throw e;
        }
      }
      console.log('  Seeded 20 researcher stats entries.');
    }

    await connection.commit();
    console.log('Additional seeding complete!');
  } finally {
    await connection.close();
  }
}

seedAdditional().catch(err => {
  console.error('Additional seeding failed:', err.message);
  process.exit(1);
});
