import { db } from '../database/schema';
import type { Goal } from '@growth-journal/types';

export class GoalService {
  static getAll(): Goal[] {
    return db.prepare(`
      SELECT * FROM goals
      ORDER BY
        CASE status
          WHEN 'active' THEN 1
          WHEN 'completed' THEN 2
          WHEN 'abandoned' THEN 3
        END,
        created_at DESC
    `).all() as Goal[];
  }

  static getById(id: number): Goal | undefined {
    return db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as Goal | undefined;
  }

  static getByStatus(status: string): Goal[] {
    return db.prepare('SELECT * FROM goals WHERE status = ? ORDER BY created_at DESC')
      .all(status) as Goal[];
  }

  static create(goal: Goal): Goal {
    const result = db.prepare(`
      INSERT INTO goals (title, description, category, target_date, status, progress)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      goal.title,
      goal.description || null,
      goal.category || null,
      goal.target_date || null,
      goal.status || 'active',
      goal.progress || 0
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static update(id: number, goal: Partial<Goal>): Goal | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    db.prepare(`
      UPDATE goals
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          target_date = COALESCE(?, target_date),
          status = COALESCE(?, status),
          progress = COALESCE(?, progress),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      goal.title || null,
      goal.description !== undefined ? goal.description : null,
      goal.category !== undefined ? goal.category : null,
      goal.target_date !== undefined ? goal.target_date : null,
      goal.status || null,
      goal.progress ?? null,
      id
    );

    return this.getById(id);
  }

  static delete(id: number): boolean {
    const result = db.prepare('DELETE FROM goals WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static getStats(): any {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_goals,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_goals,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_goals,
        AVG(CASE WHEN status = 'active' THEN progress ELSE NULL END) as avg_progress
      FROM goals
    `).get();

    return stats;
  }

  static getOverdueGoals(): Goal[] {
    const today = new Date().toISOString().split('T')[0];
    return db.prepare(`
      SELECT * FROM goals
      WHERE status = 'active'
        AND target_date < ?
        AND progress < 100
      ORDER BY target_date ASC
    `).all(today) as Goal[];
  }
}
