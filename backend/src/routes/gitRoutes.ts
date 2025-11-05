import { Router, Request, Response } from 'express';
import { GitService } from '../services/gitService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const commits = GitService.getAll();
    res.json(commits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = GitService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/insights', (req: Request, res: Response) => {
  try {
    const insights = GitService.getActivityInsights();
    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/import', async (req: Request, res: Response) => {
  try {
    const { repoPath, days } = req.body;
    if (!repoPath) {
      return res.status(400).json({ error: 'repoPath is required' });
    }
    const commits = await GitService.importCommits(repoPath, days || 30);
    res.json({
      imported: commits.length,
      commits
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
