const config = require('./index');

let oracledb;

try {
  oracledb = require('oracledb');
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  oracledb.fetchAsString = [ oracledb.CLOB ];
} catch (_error) {
  oracledb = null;
}

let poolPromise = null;

function normalizeRows(rows) {
  return rows.map(row => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.toLowerCase(), value])
  ));
}

function normalizeResult(result, options = {}) {
  if (result.rows) return [normalizeRows(result.rows)];
  // For INSERT with RETURNING, read the actual identity column from outBinds
  let insertId = null;
  if (options.returnColumn && result.outBinds && result.outBinds.returningId) {
    insertId = result.outBinds.returningId[0];
  }
  return [{ affectedRows: result.rowsAffected || 0, insertId }];
}

function convertPlaceholders(sql, params, options = {}) {
  const binds = {};
  let index = 0;
  let converted = sql.replace(/\?/g, () => {
    const key = `b${index}`;
    binds[key] = params[index];
    index += 1;
    return `:${key}`;
  });
  // Append RETURNING clause for INSERTs that need the generated identity value
  if (options.returnColumn) {
    const dir = oracledb.BIND_OUT;
    const type = oracledb.NUMBER;
    converted += ` RETURNING ${options.returnColumn} INTO :returningId`;
    binds.returningId = { dir, type };
  }
  return { sql: converted, binds };
}

async function getPool() {
  if (!poolPromise) {
    poolPromise = oracledb.createPool({
      user: config.db.user,
      password: config.db.password,
      connectString: config.db.connectString,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1
    });
  }
  return poolPromise;
}

async function execute(sql, params = [], options = {}) {
  if (!oracledb) {
    const error = new Error('Oracle database driver unavailable. Install the oracledb package.');
    error.code = 'ORACLE_DRIVER_UNAVAILABLE';
    throw error;
  }

  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const statement = convertPlaceholders(sql, params, options);
    const result = await connection.execute(statement.sql, statement.binds, { autoCommit: true });
    return normalizeResult(result, options);
  } finally {
    try { await connection.close(); } catch (_) { /* ignore close errors */ }
  }
}

async function executeProcedure(block, binds = {}) {
  if (!oracledb) {
    const error = new Error('Oracle database driver unavailable. Install the oracledb package.');
    error.code = 'ORACLE_DRIVER_UNAVAILABLE';
    throw error;
  }

  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(block, binds, { autoCommit: true });
    const outBinds = result.outBinds || {};
    for (const [key, value] of Object.entries(outBinds)) {
      if (value && typeof value.getRows === 'function') {
        try {
          // Drain the entire cursor — getRows() may return fewer rows than requested
          // even when more rows exist, so we must loop until exhausted.
          const allRows = [];
          const BATCH = 200;
          let batch;
          do {
            batch = await value.getRows(BATCH);
            for (const row of batch) allRows.push(row);
          } while (batch.length > 0);
          outBinds[key] = normalizeRows(allRows);
        } finally {
          await value.close();
        }
      }
    }
    return outBinds;
  } finally {
    try { await connection.close(); } catch (_) { /* ignore close errors */ }
  }
}

const pool = {
  query: execute,
  call: executeProcedure,
  async end() {
    if (poolPromise) {
      const p = await poolPromise;
      await p.close(0);
      poolPromise = null;
    }
  }
};

async function testConnection() {
  await execute('SELECT 1 AS ok FROM dual');
}

module.exports = { pool, testConnection };
