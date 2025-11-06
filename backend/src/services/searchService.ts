import { db } from '../database/schema';
import type { JournalEntry, JournalFilter, SearchResult } from '@growth-journal/types';

export class SearchService {
  static searchJournals(query: string, limit: number = 20): SearchResult<JournalEntry> {
    if (!query.trim()) {
      return { items: [], total: 0, query };
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    const entries = db.prepare(`
      SELECT * FROM journal_entries
      WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(tags) LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(searchTerm, searchTerm, searchTerm, limit) as any[];

    const total = (db.prepare(`
      SELECT COUNT(*) as count FROM journal_entries
      WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(tags) LIKE ?
    `).get(searchTerm, searchTerm, searchTerm) as any).count;

    return {
      items: entries.map(e => ({
        ...e,
        tags: e.tags ? JSON.parse(e.tags) : []
      })),
      total,
      query,
    };
  }

  static filterJournals(filter: JournalFilter): JournalEntry[] {
    let query = 'SELECT * FROM journal_entries WHERE 1=1';
    const params: any[] = [];

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      const tagConditions = filter.tags.map(() => 'tags LIKE ?').join(' OR ');
      query += ` AND (${tagConditions})`;
      filter.tags.forEach(tag => params.push(`%"${tag}"%`));
    }

    // Filter by mood range
    if (filter.mood_min !== undefined) {
      query += ' AND mood >= ?';
      params.push(filter.mood_min);
    }
    if (filter.mood_max !== undefined) {
      query += ' AND mood <= ?';
      params.push(filter.mood_max);
    }

    // Filter by energy range
    if (filter.energy_min !== undefined) {
      query += ' AND energy_level >= ?';
      params.push(filter.energy_min);
    }
    if (filter.energy_max !== undefined) {
      query += ' AND energy_level <= ?';
      params.push(filter.energy_max);
    }

    // Filter by date range
    if (filter.date_from) {
      query += ' AND created_at >= ?';
      params.push(filter.date_from);
    }
    if (filter.date_to) {
      query += ' AND created_at <= ?';
      params.push(filter.date_to);
    }

    // Search in content
    if (filter.search) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(content) LIKE ?)';
      const searchTerm = `%${filter.search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const results = db.prepare(query).all(...params) as any[];

    return results.map(e => ({
      ...e,
      tags: e.tags ? JSON.parse(e.tags) : []
    }));
  }

  static getAllTags(): string[] {
    const entries = db.prepare('SELECT tags FROM journal_entries WHERE tags IS NOT NULL').all() as any[];

    const tagSet = new Set<string>();
    entries.forEach(entry => {
      if (entry.tags) {
        const tags = JSON.parse(entry.tags);
        tags.forEach((tag: string) => tagSet.add(tag));
      }
    });

    return Array.from(tagSet).sort();
  }
}
