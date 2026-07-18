const config = require('./src/config');
require('dotenv').config();
const oracledb = require('oracledb');

async function run() {
  const connection = await oracledb.getConnection({
    user: config.db.user,
    password: config.db.password,
    connectString: config.db.connectString
  });
  try {
    const res = await connection.execute('SELECT table_name FROM user_tables');
    for (const row of res.rows) {
      const tableName = row[0] || row.TABLE_NAME;
      try {
        await connection.execute(`DROP TABLE "${tableName}" CASCADE CONSTRAINTS PURGE`);
        console.log(`Dropped table: ${tableName}`);
      } catch (e) {
        console.warn(`Error dropping table ${tableName}:`, e.message);
      }
    }
  } finally {
    await connection.close();
  }
}
run();
