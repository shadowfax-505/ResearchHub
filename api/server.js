

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./src/config/index');
const { testConnection } = require('./src/config/database');

const app = express();

const userRoutes = require('./src/routes/users');
const paperRoutes = require('./src/routes/papers');
const authorRoutes = require('./src/routes/authors');
const journalRoutes = require('./src/routes/journals');
const fieldRoutes = require('./src/routes/fields');
const keywordRoutes = require('./src/routes/keywords');
const savedPaperRoutes = require('./src/routes/savedPapers');
const collectionRoutes = require('./src/routes/collections');
const notificationRoutes = require('./src/routes/notifications');
const researchRequestRoutes = require('./src/routes/researchRequests');
const settingRoutes = require('./src/routes/settings');
const citationRoutes = require('./src/routes/citations');
const reviewRoutes = require('./src/routes/reviews');
const questionRoutes = require('./src/routes/questions');
const adminRoutes = require('./src/routes/admin');
const researcherRoutes = require('./src/routes/researchers');
const jobsRoutes = require('./src/routes/jobs');
const messagesRoutes = require('./src/routes/messages');
const projectsRoutes = require('./src/routes/projects');
const networkRoutes = require('./src/routes/network');
const analyticsRoutes = require('./src/routes/analytics');
const feedRoutes = require('./src/routes/feed');
const reportRoutes = require('./src/routes/reports');
const searchRoutes = require('./src/routes/search');
const interestRoutes = require('./src/routes/interests');
const uploadRoutes = require('./src/routes/uploads');
const updateRoutes = require('./src/routes/updates');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com'],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']
      }
    }
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.get('/api', (req, res) => {
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
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'available',
      database: 'connected'
    }
  };

  try {
    await testConnection();
    res.status(200).json(health);
  } catch (err) {
    const message = err.message || 'unknown';
    console.warn('Health check degraded:', message);
    res.status(200).json({
      ...health,
      status: 'DEGRADED',
      services: {
        ...health.services,
        database: 'unavailable'
      },
      warnings: [
        {
          service: 'database',
          message
        }
      ]
    });
  }
});

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
      keywords: '/api/v1/keywords',
      savedPapers: '/api/v1/saved-papers',
      collections: '/api/v1/collections',
      notifications: '/api/v1/notifications',
      researchRequests: '/api/v1/research-requests',
      settings: '/api/v1/settings',
      citations: '/api/v1/citations',
      questions: '/api/v1/questions',
      researchers: '/api/v1/researchers',
      admin: '/api/v1/admin',
      search: '/api/v1/search',
      uploads: '/api/v1/uploads'
    }
  });
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/papers', paperRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/journals', journalRoutes);
app.use('/api/v1/fields', fieldRoutes);
app.use('/api/v1/keywords', keywordRoutes);
app.use('/api/v1/saved-papers', savedPaperRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/research-requests', researchRequestRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/citations', citationRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/researchers', researcherRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/network', networkRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/interests', interestRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/updates', updateRoutes);
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, _next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

const PORT = config.apiPort;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║        ResearchHub API Server Started                              ║
╠════════════════════════════════════════════════════════════════════╣
║ Server: http://localhost:${PORT}
║ Environment: ${config.nodeEnv}
║ Database: ${config.db.connectString}
║ Status: Ready for requests
╚════════════════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
