import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import journalRoutes from './routes/journalRoutes';
import goalRoutes from './routes/goalRoutes';
import habitRoutes from './routes/habitRoutes';
import insightRoutes from './routes/insightRoutes';
import patternRoutes from './routes/patternRoutes';
import gitRoutes from './routes/gitRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/journals', journalRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/git', gitRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Growth Journal API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
