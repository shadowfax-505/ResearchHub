/** Connection failures are different from invalid SQL or an empty result. */
function isDatabaseUnavailable(error) {
  const code = String(error?.code || '');
  const message = String(error?.message || error || '');
  return /^(ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|ORACLE_DRIVER_UNAVAILABLE|NJS-(500|501|503|511|040|076)|ORA-(01033|01034|01089|03113|03114|12514|12541|12545))$/.test(code)
    || /ECONNREFUSED|no listener|connection to host .*could not be established|connection (?:was )?(?:closed|lost)|database driver unavailable/i.test(message);
}
function sendDatabaseUnavailable(res) {
  return res.status(503).json({
    success: false,
    code: 'DATABASE_UNAVAILABLE',
    error: 'The research database is temporarily unavailable. Please try again shortly.'
  });
}
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
module.exports = { isDatabaseUnavailable, sendDatabaseUnavailable, HttpError };
