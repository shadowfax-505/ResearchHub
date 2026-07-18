const oracledb = require('oracledb');
const config = require('../src/config');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
  const connection = await oracledb.getConnection({
    user: config.db.user,
    password: config.db.password,
    connectString: config.db.connectString
  });

  try {
    await connection.execute(`DELETE FROM JOBS`);
    console.log('Deleted existing jobs.');
    
    const file = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'seeds', 'seed-data.sql'), 'utf8');
    const match = file.match(/INSERT INTO JOBS \([\s\S]*?;\n/);
    if (match) {
      let insertSql = match[0].trim();
      if (insertSql.endsWith(';')) {
         insertSql = insertSql.slice(0, -1);
      }
      await connection.execute(insertSql);
      await connection.commit();
      console.log('Reseeded jobs.');
    } else {
      console.log('Could not find JOBS insert in seed-data.sql');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.close();
  }
}

run();
