require('dotenv').config();
const crypto = require('node:crypto');
const nodeEnv=process.env.NODE_ENV||'development';
const configuredSecret=process.env.JWT_SECRET;
const insecureSecret=!configuredSecret||configuredSecret.length<32||configuredSecret==='your-super-secret-key-change-in-production';
if(nodeEnv==='production'&&insecureSecret) throw new Error('Set a unique JWT_SECRET of at least 32 characters before starting ResearchHub in production.');
// A random local secret avoids accepting tokens signed with a public example value.
const jwtSecret=insecureSecret?crypto.randomBytes(48).toString('hex'):configuredSecret;
module.exports={
  nodeEnv,
  apiPort:Number(process.env.API_PORT)||3000,
  jwtSecret,
  allowedOrigins:(process.env.CORS_ORIGINS||process.env.APP_URL||'http://localhost:3001,http://127.0.0.1:3001').split(',').map(value=>value.trim()).filter(Boolean),
  db:{
    user:process.env.DB_USER||'researchhub_user',
    password:process.env.DB_PASSWORD||'researchhub_secure_password',
    connectString:process.env.DB_CONNECT_STRING||'127.0.0.1:1521/FREEPDB1',
    schema:process.env.DB_SCHEMA||'RESEARCHHUB_USER'
  }
};
