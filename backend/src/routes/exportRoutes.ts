import { Router, Request, Response } from 'express';
import { ExportService } from '../services/exportService';
import { asyncHandler } from '../middleware/errorHandler';
import { strictRateLimiter } from '../middleware/security';
import type { ExportOptions } from '@growth-journal/types';

const router = Router();

router.post('/', strictRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const options: ExportOptions = {
    format: req.body.format || 'json',
    date_from: req.body.date_from,
    date_to: req.body.date_to,
    include_goals: req.body.include_goals !== false,
    include_habits: req.body.include_habits !== false,
    include_insights: req.body.include_insights !== false,
  };

  const data = await ExportService.exportData(options);

  // Set appropriate content type
  const contentType = options.format === 'json'
    ? 'application/json'
    : 'text/markdown';

  const filename = `growth-journal-export-${Date.now()}.${options.format === 'json' ? 'json' : 'md'}`;

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(data);
}));

export default router;
