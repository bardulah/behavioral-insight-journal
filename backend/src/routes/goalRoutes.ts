import { Router, Request, Response } from 'express';
import { GoalService } from '../services/goalService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const goals = GoalService.getAll();
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = GoalService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/overdue', (req: Request, res: Response) => {
  try {
    const goals = GoalService.getOverdueGoals();
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const goal = GoalService.getById(parseInt(req.params.id));
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const goal = GoalService.create(req.body);
    res.status(201).json(goal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const goal = GoalService.update(parseInt(req.params.id), req.body);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = GoalService.delete(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
