import { Router, Request, Response } from 'express';
import { JournalService } from '../services/journalService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const entries = JournalService.getAll();
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = JournalService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mood-trend', (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trend = JournalService.getMoodTrend(days);
    res.json(trend);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const entry = JournalService.getById(parseInt(req.params.id));
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    console.log('POST /journals - Request body:', req.body);
    const entry = JournalService.create(req.body);
    console.log('POST /journals - Entry created:', entry);
    res.status(201).json(entry);
  } catch (error: any) {
    console.error('POST /journals - Error:', error);
    res.status(400).json({ error: error.message || 'Failed to create journal entry' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const entry = JournalService.update(parseInt(req.params.id), req.body);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = JournalService.delete(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
