import express from 'express';
import cors from 'cors';
import { config } from './config';
import { runMigrations } from './database/migrations';
import { AchievementService } from './services/achievementService';

// Middleware
import { securityHeaders, rateLimiter } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';

// V1 Routes
import journalRoutes from './routes/journalRoutes';
import goalRoutes from './routes/goalRoutes';
import habitRoutes from './routes/habitRoutes';
import insightRoutes from './routes/insightRoutes';
import patternRoutes from './routes/patternRoutes';
import gitRoutes from './routes/gitRoutes';
import achievementRoutes from './routes/achievementRoutes';
import exportRoutes from './routes/exportRoutes';
import searchRoutes from './routes/searchRoutes';

const app = express();

// Initialize database
console.log('🗄️  Initializing database...');
runMigrations();
AchievementService.initializeAchievements();
console.log('✓ Database ready');

// Security middleware
app.use(securityHeaders);
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(rateLimiter);

// API Version 1 Routes
const apiV1 = express.Router();

apiV1.use('/journals', journalRoutes);
apiV1.use('/goals', goalRoutes);
apiV1.use('/habits', habitRoutes);
apiV1.use('/insights', insightRoutes);
apiV1.use('/patterns', patternRoutes);
apiV1.use('/git', gitRoutes);
apiV1.use('/achievements', achievementRoutes);
apiV1.use('/export', exportRoutes);
apiV1.use('/search', searchRoutes);

// Mount API v1
app.use('/api/v1', apiV1);

// Backward compatibility - redirect /api/* to /api/v1/*
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/v1') || req.path === '/health') {
    next();
  } else {
    req.url = '/v1' + req.url;
    apiV1(req, res, next);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Growth Journal API is running',
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📊 API v1 available at http://localhost:${config.port}/api/v1`);
  console.log(`🔒 Environment: ${config.nodeEnv}`);
});
