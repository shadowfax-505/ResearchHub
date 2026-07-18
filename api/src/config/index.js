require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPort: Number(process.env.API_PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  db: {
    user: process.env.DB_USER || 'researchhub_user',
    password: process.env.DB_PASSWORD || 'researchhub_secure_password',
    connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREEPDB1',
    schema: process.env.DB_SCHEMA || 'RESEARCHHUB_USER'
  }
};
