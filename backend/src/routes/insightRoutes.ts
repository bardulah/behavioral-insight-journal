import { Router, Request, Response } from 'express';
import { InsightService } from '../services/insightService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const insights = InsightService.getAll();
    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/unread', (req: Request, res: Response) => {
  try {
    const insights = InsightService.getUnread();
    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', (req: Request, res: Response) => {
  try {
    const insights = InsightService.generateInsights();
    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/read', (req: Request, res: Response) => {
  try {
    const success = InsightService.markAsRead(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Insight not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = InsightService.delete(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Insight not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
