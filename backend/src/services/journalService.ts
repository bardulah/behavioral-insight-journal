import { db } from '../database/schema';
import type { JournalEntry } from '@growth-journal/types';

export class JournalService {
  static getAll(): JournalEntry[] {
    const entries = db.prepare(`
      SELECT * FROM journal_entries
      ORDER BY created_at DESC
    `).all() as any[];

    return entries.map(entry => ({
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : []
    }));
  }

  static getById(id: number): JournalEntry | undefined {
    const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(id) as any;

    if (!entry) return undefined;

    return {
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : []
    };
  }

  static getByDateRange(startDate: string, endDate: string): JournalEntry[] {
    const entries = db.prepare(`
      SELECT * FROM journal_entries
      WHERE created_at BETWEEN ? AND ?
      ORDER BY created_at DESC
    `).all(startDate, endDate) as any[];

    return entries.map(entry => ({
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : []
    }));
  }

  static create(entry: JournalEntry): JournalEntry {
    const tags = entry.tags ? JSON.stringify(entry.tags) : null;

    const result = db.prepare(`
      INSERT INTO journal_entries (title, content, mood, energy_level, tags)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      entry.title || null,
      entry.content,
      entry.mood || null,
      entry.energy_level || null,
      tags
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static update(id: number, entry: Partial<JournalEntry>): JournalEntry | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const tags = entry.tags ? JSON.stringify(entry.tags) : undefined;

    db.prepare(`
      UPDATE journal_entries
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          mood = COALESCE(?, mood),
          energy_level = COALESCE(?, energy_level),
          tags = COALESCE(?, tags),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      entry.title || null,
      entry.content || null,
      entry.mood ?? null,
      entry.energy_level ?? null,
      tags || null,
      id
    );

    return this.getById(id);
  }

  static delete(id: number): boolean {
    const result = db.prepare('DELETE FROM journal_entries WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static getMoodTrend(days: number = 30): any[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db.prepare(`
      SELECT
        DATE(created_at) as date,
        AVG(mood) as avg_mood,
        AVG(energy_level) as avg_energy,
        COUNT(*) as entry_count
      FROM journal_entries
      WHERE created_at >= ? AND mood IS NOT NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(startDate.toISOString()) as any[];
  }

  static getStats(): any {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_entries,
        COUNT(DISTINCT DATE(created_at)) as days_journaled,
        AVG(mood) as avg_mood,
        AVG(energy_level) as avg_energy
      FROM journal_entries
    `).get();

    const recentStreak = this.getJournalingStreak();

    return {
      ...(stats || {}),
      current_streak: recentStreak
    };
  }

  static getJournalingStreak(): number {
    const entries = db.prepare(`
      SELECT DISTINCT DATE(created_at) as date
      FROM journal_entries
      ORDER BY date DESC
    `).all() as any[];

    if (entries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
