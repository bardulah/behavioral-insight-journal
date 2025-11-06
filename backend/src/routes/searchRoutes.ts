import { Router, Request, Response } from 'express';
import { SearchService } from '../services/searchService';
import { asyncHandler } from '../middleware/errorHandler';
import type { JournalFilter } from '@growth-journal/types';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const limit = parseInt(req.query.limit as string) || 20;

  const results = SearchService.searchJournals(query, limit);
  res.json(results);
}));

router.post('/filter', asyncHandler(async (req: Request, res: Response) => {
  const filter: JournalFilter = req.body;
  const results = SearchService.filterJournals(filter);
  res.json(results);
}));

router.get('/tags', asyncHandler(async (req: Request, res: Response) => {
  const tags = SearchService.getAllTags();
  res.json(tags);
}));

export default router;
