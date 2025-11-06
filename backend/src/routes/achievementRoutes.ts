import { Router, Request, Response } from 'express';
import { AchievementService } from '../services/achievementService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const achievements = AchievementService.getAll();
  res.json(achievements);
}));

router.get('/unlocked', asyncHandler(async (req: Request, res: Response) => {
  const achievements = AchievementService.getUnlocked();
  res.json(achievements);
}));

router.get('/locked', asyncHandler(async (req: Request, res: Response) => {
  const achievements = AchievementService.getLocked();
  res.json(achievements);
}));

router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = AchievementService.getStats();
  res.json(stats);
}));

router.post('/check', asyncHandler(async (req: Request, res: Response) => {
  const unlocked = await AchievementService.checkAndUnlock();
  res.json({ unlocked, count: unlocked.length });
}));

export default router;
