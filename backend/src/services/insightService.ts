import { db } from '../database/schema';
import { Insight } from '../types';
import { JournalService } from './journalService';
import { GoalService } from './goalService';
import { HabitService } from './habitService';

export class InsightService {
  static getAll(): Insight[] {
    return db.prepare(`
      SELECT * FROM insights
      ORDER BY priority DESC, created_at DESC
    `).all() as Insight[];
  }

  static getUnread(): Insight[] {
    return db.prepare(`
      SELECT * FROM insights
      WHERE is_read = 0
      ORDER BY priority DESC, created_at DESC
    `).all() as Insight[];
  }

  static getById(id: number): Insight | undefined {
    return db.prepare('SELECT * FROM insights WHERE id = ?').get(id) as Insight | undefined;
  }

  static create(insight: Insight): Insight {
    const result = db.prepare(`
      INSERT INTO insights (
        insight_type, title, message, related_goal_id,
        related_pattern_id, priority
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      insight.insight_type,
      insight.title,
      insight.message,
      insight.related_goal_id || null,
      insight.related_pattern_id || null,
      insight.priority || 0
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static markAsRead(id: number): boolean {
    const result = db.prepare('UPDATE insights SET is_read = 1 WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const result = db.prepare('DELETE FROM insights WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static generateInsights(): Insight[] {
    const newInsights: Insight[] = [];

    // Check journaling streak
    const journalStreak = JournalService.getJournalingStreak();
    if (journalStreak >= 7 && journalStreak % 7 === 0) {
      newInsights.push({
        insight_type: 'celebration',
        title: `${journalStreak}-Day Streak! 🎉`,
        message: `Amazing! You've journaled for ${journalStreak} days straight. This consistency is building powerful self-awareness habits!`,
        priority: 10
      });
    } else if (journalStreak === 0) {
      const journalStats = JournalService.getStats();
      if (journalStats.total_entries > 5) {
        newInsights.push({
          insight_type: 'encouragement',
          title: 'Ready to restart your streak?',
          message: "You've journaled before and it was great! How about sharing what's on your mind today?",
          priority: 5
        });
      }
    }

    // Check mood trends
    const moodTrend = JournalService.getMoodTrend(7);
    if (moodTrend.length >= 3) {
      const recentMoods = moodTrend.slice(-3).map((t: any) => t.avg_mood);
      const avgMood = recentMoods.reduce((a: number, b: number) => a + b, 0) / recentMoods.length;

      if (avgMood >= 4) {
        newInsights.push({
          insight_type: 'celebration',
          title: 'You\'re on a positive roll! ✨',
          message: 'Your mood has been consistently high lately. What\'s been working well for you? Consider writing about it to remember this winning formula!',
          priority: 8
        });
      } else if (avgMood <= 2.5) {
        newInsights.push({
          insight_type: 'encouragement',
          title: 'Tough week? We\'ve got your back 💙',
          message: 'I notice things have been challenging lately. Remember: writing about struggles often helps lighten the load. Want to explore what might help?',
          priority: 9
        });
      }
    }

    // Check goals
    const overdueGoals = GoalService.getOverdueGoals();
    if (overdueGoals.length > 0) {
      const goal = overdueGoals[0];
      newInsights.push({
        insight_type: 'tip',
        title: 'Goal needs attention 🎯',
        message: `"${goal.title}" has passed its target date. No worries! Want to break it into smaller steps or adjust the timeline?`,
        related_goal_id: goal.id,
        priority: 7
      });
    }

    // Check active goals without recent journal mentions
    const activeGoals = GoalService.getByStatus('active');
    if (activeGoals.length > 0 && activeGoals.some(g => (g.progress || 0) < 30)) {
      newInsights.push({
        insight_type: 'tip',
        title: 'Let\'s talk about your goals 📝',
        message: 'You have active goals that could use some attention. Writing about them in your journal often reveals the next small step forward!',
        priority: 6
      });
    }

    // Check habits
    const habitStats = HabitService.getTodayStats();
    if (habitStats.total_habits > 0 && habitStats.completion_rate === 100) {
      newInsights.push({
        insight_type: 'celebration',
        title: 'Habit superstar! ⭐',
        message: 'You completed all your habits today! This is exactly how lasting change happens - one day at a time.',
        priority: 9
      });
    }

    // Save new insights
    return newInsights.map(insight => this.create(insight));
  }
}
