import { Router, Request, Response } from 'express';
import { PatternService } from '../services/patternService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const patterns = PatternService.getAll();
    res.json(patterns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze', (req: Request, res: Response) => {
  try {
    const patterns = PatternService.analyzePatterns();
    res.json(patterns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const pattern = PatternService.getById(parseInt(req.params.id));
    if (!pattern) {
      return res.status(404).json({ error: 'Pattern not found' });
    }
    res.json(pattern);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = PatternService.delete(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Pattern not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
