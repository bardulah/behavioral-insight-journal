import { db } from '../database/schema';
import type { Achievement } from '@growth-journal/types';
import { JournalService } from './journalService';
import { HabitService } from './habitService';
import { GoalService } from './goalService';

export class AchievementService {
  private static achievements: Omit<Achievement, 'id' | 'unlocked_at' | 'progress'>[] = [
    {
      name: 'First Steps',
      description: 'Write your first journal entry',
      icon: '✍️',
      points: 10,
      achievement_type: 'milestone',
      requirement_data: { action: 'first_journal', target: 1 },
      target: 1,
    },
    {
      name: 'Getting Started',
      description: 'Write 5 journal entries',
      icon: '📝',
      points: 25,
      achievement_type: 'milestone',
      requirement_data: { action: 'journal_count', target: 5 },
      target: 5,
    },
    {
      name: 'Journal Enthusiast',
      description: 'Write 25 journal entries',
      icon: '📚',
      points: 100,
      achievement_type: 'milestone',
      requirement_data: { action: 'journal_count', target: 25 },
      target: 25,
    },
    {
      name: 'Prolific Writer',
      description: 'Write 100 journal entries',
      icon: '🏆',
      points: 500,
      achievement_type: 'milestone',
      requirement_data: { action: 'journal_count', target: 100 },
      target: 100,
    },
    {
      name: 'Week Warrior',
      description: 'Journal for 7 days in a row',
      icon: '🔥',
      points: 50,
      achievement_type: 'streak',
      requirement_data: { action: 'journal_streak', target: 7 },
      target: 7,
    },
    {
      name: 'Monthly Maestro',
      description: 'Journal for 30 days in a row',
      icon: '⭐',
      points: 200,
      achievement_type: 'streak',
      requirement_data: { action: 'journal_streak', target: 30 },
      target: 30,
    },
    {
      name: 'Centurion',
      description: 'Journal for 100 days in a row',
      icon: '👑',
      points: 1000,
      achievement_type: 'streak',
      requirement_data: { action: 'journal_streak', target: 100 },
      target: 100,
    },
    {
      name: 'Goal Getter',
      description: 'Create your first goal',
      icon: '🎯',
      points: 10,
      achievement_type: 'milestone',
      requirement_data: { action: 'first_goal', target: 1 },
      target: 1,
    },
    {
      name: 'Goal Crusher',
      description: 'Complete your first goal',
      icon: '💪',
      points: 50,
      achievement_type: 'completion',
      requirement_data: { action: 'complete_goal', target: 1 },
      target: 1,
    },
    {
      name: 'Overachiever',
      description: 'Complete 10 goals',
      icon: '🌟',
      points: 300,
      achievement_type: 'completion',
      requirement_data: { action: 'complete_goal', target: 10 },
      target: 10,
    },
    {
      name: 'Habit Builder',
      description: 'Create your first habit',
      icon: '🌱',
      points: 10,
      achievement_type: 'milestone',
      requirement_data: { action: 'first_habit', target: 1 },
      target: 1,
    },
    {
      name: 'Perfect Day',
      description: 'Complete all habits in one day',
      icon: '✨',
      points: 50,
      achievement_type: 'completion',
      requirement_data: { action: 'perfect_day', target: 1 },
      target: 1,
    },
    {
      name: 'Perfect Week',
      description: 'Complete all habits for 7 days straight',
      icon: '🎊',
      points: 200,
      achievement_type: 'streak',
      requirement_data: { action: 'perfect_week', target: 7 },
      target: 7,
    },
    {
      name: 'Self-Aware',
      description: 'Generate your first insights',
      icon: '🧠',
      points: 25,
      achievement_type: 'exploration',
      requirement_data: { action: 'first_insights', target: 1 },
      target: 1,
    },
    {
      name: 'Pattern Seeker',
      description: 'Discover 5 behavioral patterns',
      icon: '🔍',
      points: 100,
      achievement_type: 'exploration',
      requirement_data: { action: 'patterns_found', target: 5 },
      target: 5,
    },
    {
      name: 'Mood Master',
      description: 'Track your mood for 30 entries',
      icon: '😊',
      points: 75,
      achievement_type: 'consistency',
      requirement_data: { action: 'mood_tracking', target: 30 },
      target: 30,
    },
    {
      name: 'Early Bird',
      description: 'Journal before 8 AM five times',
      icon: '🌅',
      points: 50,
      achievement_type: 'consistency',
      requirement_data: { action: 'early_journal', target: 5 },
      target: 5,
    },
  ];

  static initializeAchievements() {
    for (const achievement of this.achievements) {
      const existing = db.prepare(
        'SELECT id FROM achievements WHERE name = ?'
      ).get(achievement.name);

      if (!existing) {
        db.prepare(`
          INSERT INTO achievements (name, description, icon, points, achievement_type, requirement_data, target)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          achievement.name,
          achievement.description,
          achievement.icon,
          achievement.points,
          achievement.achievement_type,
          JSON.stringify(achievement.requirement_data),
          achievement.target || 100
        );
      }
    }
  }

  static getAll(): Achievement[] {
    const achievements = db.prepare(`
      SELECT * FROM achievements ORDER BY unlocked_at DESC, points ASC
    `).all() as any[];

    return achievements.map(a => ({
      ...a,
      requirement_data: a.requirement_data ? JSON.parse(a.requirement_data) : null
    }));
  }

  static getUnlocked(): Achievement[] {
    return this.getAll().filter(a => a.unlocked_at !== null);
  }

  static getLocked(): Achievement[] {
    return this.getAll().filter(a => a.unlocked_at === null);
  }

  static async checkAndUnlock(): Promise<Achievement[]> {
    const unlocked: Achievement[] = [];

    // Get current stats
    const journalStats = JournalService.getStats();
    const goalStats = GoalService.getStats();
    const habitStats = HabitService.getTodayStats();

    // Get all locked achievements
    const locked = this.getLocked();

    for (const achievement of locked) {
      let shouldUnlock = false;
      let progress = 0;

      const req = achievement.requirement_data;
      const target = achievement.target || 100;

      switch (req.action) {
        case 'first_journal':
        case 'journal_count':
          progress = journalStats.total_entries;
          shouldUnlock = progress >= req.target;
          break;

        case 'journal_streak':
          progress = journalStats.current_streak;
          shouldUnlock = progress >= req.target;
          break;

        case 'first_goal':
          progress = goalStats.total_goals;
          shouldUnlock = progress >= 1;
          break;

        case 'complete_goal':
          progress = goalStats.completed_goals;
          shouldUnlock = progress >= req.target;
          break;

        case 'first_habit':
          progress = habitStats.total_habits;
          shouldUnlock = progress >= 1;
          break;

        case 'perfect_day':
          progress = habitStats.completion_rate === 100 && habitStats.total_habits > 0 ? 1 : 0;
          shouldUnlock = progress >= 1;
          break;

        case 'mood_tracking':
          const moodEntries = db.prepare(
            'SELECT COUNT(*) as count FROM journal_entries WHERE mood IS NOT NULL'
          ).get() as any;
          progress = moodEntries.count;
          shouldUnlock = progress >= req.target;
          break;

        case 'early_journal':
          const earlyEntries = db.prepare(`
            SELECT COUNT(*) as count FROM journal_entries
            WHERE CAST(strftime('%H', created_at) AS INTEGER) < 8
          `).get() as any;
          progress = earlyEntries.count;
          shouldUnlock = progress >= req.target;
          break;
      }

      // Update progress
      db.prepare('UPDATE achievements SET progress = ? WHERE id = ?').run(
        progress,
        achievement.id
      );

      // Unlock if criteria met
      if (shouldUnlock && !achievement.unlocked_at) {
        db.prepare('UPDATE achievements SET unlocked_at = CURRENT_TIMESTAMP WHERE id = ?').run(
          achievement.id
        );

        // Update user points
        db.prepare(`
          UPDATE user_settings
          SET points = points + ?,
              level = (points + ?) / 1000 + 1
          WHERE id = 1
        `).run(achievement.points, achievement.points);

        unlocked.push({ ...achievement, unlocked_at: new Date().toISOString() });
      }
    }

    return unlocked;
  }

  static getStats() {
    const all = this.getAll();
    const unlocked = all.filter(a => a.unlocked_at !== null);

    const totalPoints = unlocked.reduce((sum, a) => sum + (a.points || 0), 0);

    return {
      total_achievements: all.length,
      unlocked_count: unlocked.length,
      locked_count: all.length - unlocked.length,
      total_points: totalPoints,
      completion_rate: (unlocked.length / all.length) * 100,
    };
  }
}
