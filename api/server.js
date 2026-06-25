/**
 * ResearchHub API Server
 * Main Express application configuration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./src/config/index');
const { testConnection } = require('./src/config/database');

const app = express();

// Import routes
const userRoutes = require('./src/routes/users');
const paperRoutes = require('./src/routes/papers');
const authorRoutes = require('./src/routes/authors');
const journalRoutes = require('./src/routes/journals');
const fieldRoutes = require('./src/routes/fields');
const keywordRoutes = require('./src/routes/keywords');

// ============= Middleware =============
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============= Root & Health Checks =============
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'ResearchHub API',
    version: '1.0.0',
    description: 'Academic research paper repository API',
    routes: {
      health: '/health',
      status: '/api/v1'
    }
  });
});

app.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (err) {
    console.error('Health check failed:', err.message || err);
    res.status(500).json({
      status: 'ERROR',
      error: 'Database connection failed',
      details: err.message || 'unknown'
    });
  }
});

// ============= API Routes =============
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'ResearchHub API v1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/v1/users',
      papers: '/api/v1/papers',
      authors: '/api/v1/authors',
      journals: '/api/v1/journals',
      fields: '/api/v1/fields',
      keywords: '/api/v1/keywords'
    }
  });
});

// Mount route handlers
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/papers', paperRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/journals', journalRoutes);
app.use('/api/v1/fields', fieldRoutes);
app.use('/api/v1/keywords', keywordRoutes);

// ============= Error Handling =============
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// ============= Server Startup =============
const PORT = config.apiPort;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║        ResearchHub API Server Started                              ║
╠════════════════════════════════════════════════════════════════════╣
║ Server: http://localhost:${PORT}
║ Environment: ${config.nodeEnv}
║ Database: ${config.db.host}:${config.db.port}/${config.db.name}
║ Status: Ready for requests
╚════════════════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
