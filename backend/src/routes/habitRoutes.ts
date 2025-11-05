import { Router, Request, Response } from 'express';
import { HabitService } from '../services/habitService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const habits = HabitService.getAll();
    res.json(habits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/today-stats', (req: Request, res: Response) => {
  try {
    const stats = HabitService.getTodayStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const habit = HabitService.getById(parseInt(req.params.id));
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/logs', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const logs = HabitService.getLogs(parseInt(req.params.id), limit);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const habit = HabitService.create(req.body);
    res.status(201).json(habit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/complete', (req: Request, res: Response) => {
  try {
    const log = HabitService.logCompletion(
      parseInt(req.params.id),
      req.body.note
    );
    res.status(201).json(log);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const habit = HabitService.update(parseInt(req.params.id), req.body);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = HabitService.delete(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
