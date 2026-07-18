const nodemailer = require('nodemailer');

function getSetting(names, fallback) {
  return names.map(name => process.env[name]).find(Boolean) || fallback;
}

function createTransporter() {
  const user = getSetting(['SMTP_USER', 'GOOGLE_SMTP_USER', 'GMAIL_USER']);
  const pass = getSetting(['SMTP_PASSWORD', 'SMTP_PASS', 'GOOGLE_SMTP_PASSWORD', 'GMAIL_APP_PASSWORD']);
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: getSetting(['SMTP_HOST', 'GOOGLE_SMTP_HOST'], 'smtp.gmail.com'),
    port: Number(getSetting(['SMTP_PORT', 'GOOGLE_SMTP_PORT'], '465')),
    secure: getSetting(['SMTP_SECURE'], 'true') !== 'false',
    auth: { user, pass }
  });
}

async function sendTransactionalEmail({ to, subject, text, html }) {
  const transporter = createTransporter();
  if (!transporter) {
    const error = new Error('SMTP is not configured');
    error.code = 'SMTP_NOT_CONFIGURED';
    throw error;
  }
  const from = getSetting(['SMTP_FROM', 'GOOGLE_SMTP_USER', 'SMTP_USER']);
  return transporter.sendMail({ from, to, subject, text, html });
}

module.exports = { sendTransactionalEmail };
