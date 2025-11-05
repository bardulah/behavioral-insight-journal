import { db } from '../database/schema';
import { Habit, HabitLog } from '../types';

export class HabitService {
  static getAll(): Habit[] {
    return db.prepare(`
      SELECT * FROM habits
      ORDER BY created_at DESC
    `).all() as Habit[];
  }

  static getById(id: number): Habit | undefined {
    return db.prepare('SELECT * FROM habits WHERE id = ?').get(id) as Habit | undefined;
  }

  static create(habit: Habit): Habit {
    const result = db.prepare(`
      INSERT INTO habits (name, description, frequency, target_count, icon, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      habit.name,
      habit.description || null,
      habit.frequency || 'daily',
      habit.target_count || 1,
      habit.icon || null,
      habit.color || null
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static update(id: number, habit: Partial<Habit>): Habit | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    db.prepare(`
      UPDATE habits
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          frequency = COALESCE(?, frequency),
          target_count = COALESCE(?, target_count),
          icon = COALESCE(?, icon),
          color = COALESCE(?, color)
      WHERE id = ?
    `).run(
      habit.name || null,
      habit.description !== undefined ? habit.description : null,
      habit.frequency || null,
      habit.target_count ?? null,
      habit.icon !== undefined ? habit.icon : null,
      habit.color !== undefined ? habit.color : null,
      id
    );

    return this.getById(id);
  }

  static delete(id: number): boolean {
    const result = db.prepare('DELETE FROM habits WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static logCompletion(habitId: number, note?: string): HabitLog {
    const habit = this.getById(habitId);
    if (!habit) throw new Error('Habit not found');

    const result = db.prepare(`
      INSERT INTO habit_logs (habit_id, note)
      VALUES (?, ?)
    `).run(habitId, note || null);

    // Update habit statistics
    this.updateHabitStats(habitId);

    return {
      id: result.lastInsertRowid as number,
      habit_id: habitId,
      note
    };
  }

  static getLogs(habitId: number, limit: number = 30): HabitLog[] {
    return db.prepare(`
      SELECT * FROM habit_logs
      WHERE habit_id = ?
      ORDER BY completed_at DESC
      LIMIT ?
    `).all(habitId, limit) as HabitLog[];
  }

  static getLogsByDateRange(habitId: number, startDate: string, endDate: string): HabitLog[] {
    return db.prepare(`
      SELECT * FROM habit_logs
      WHERE habit_id = ?
        AND completed_at BETWEEN ? AND ?
      ORDER BY completed_at DESC
    `).all(habitId, startDate, endDate) as HabitLog[];
  }

  private static updateHabitStats(habitId: number): void {
    const habit = this.getById(habitId);
    if (!habit) return;

    // Calculate total completions
    const { total } = db.prepare(`
      SELECT COUNT(*) as total FROM habit_logs WHERE habit_id = ?
    `).get(habitId) as any;

    // Calculate current streak
    const streak = this.calculateStreak(habitId);

    // Update habit
    db.prepare(`
      UPDATE habits
      SET total_completions = ?,
          streak_count = ?,
          best_streak = MAX(best_streak, ?)
      WHERE id = ?
    `).run(total, streak, streak, habitId);
  }

  private static calculateStreak(habitId: number): number {
    const logs = db.prepare(`
      SELECT DISTINCT DATE(completed_at) as date
      FROM habit_logs
      WHERE habit_id = ?
      ORDER BY date DESC
    `).all(habitId) as any[];

    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date);
      logDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  static getTodayStats(): any {
    const today = new Date().toISOString().split('T')[0];

    const habits = this.getAll();
    const completedToday = db.prepare(`
      SELECT DISTINCT habit_id
      FROM habit_logs
      WHERE DATE(completed_at) = ?
    `).all(today) as any[];

    return {
      total_habits: habits.length,
      completed_today: completedToday.length,
      completion_rate: habits.length > 0 ? (completedToday.length / habits.length) * 100 : 0
    };
  }
}
