require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPort: Number(process.env.API_PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'researchhub_user',
    password: process.env.DB_PASSWORD || 'researchhub_secure_password',
    name: process.env.DB_NAME || 'researchhub',
    charset: process.env.DB_CHARSET || 'utf8mb4',
    collation: process.env.DB_COLLATION || 'utf8mb4_unicode_ci'
  }
};
