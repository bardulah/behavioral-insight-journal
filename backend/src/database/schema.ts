import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/journal.db';
const dataDir = path.dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  // Journal Entries Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT NOT NULL,
      mood INTEGER CHECK(mood >= 1 AND mood <= 5),
      energy_level INTEGER CHECK(energy_level >= 1 AND energy_level <= 5),
      tags TEXT, -- JSON array of tags
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Goals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT, -- personal, career, health, learning, etc.
      target_date DATE,
      status TEXT DEFAULT 'active', -- active, completed, abandoned
      progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Habits Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      frequency TEXT, -- daily, weekly, custom
      target_count INTEGER DEFAULT 1,
      icon TEXT,
      color TEXT,
      streak_count INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      total_completions INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Habit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      note TEXT,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    )
  `);

  // Patterns Table (detected patterns in behavior)
  db.exec(`
    CREATE TABLE IF NOT EXISTS patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_type TEXT NOT NULL, -- mood_correlation, time_pattern, action_pattern, etc.
      title TEXT NOT NULL,
      description TEXT,
      confidence REAL CHECK(confidence >= 0 AND confidence <= 1),
      frequency TEXT, -- how often this pattern appears
      data TEXT, -- JSON with pattern-specific data
      first_detected DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insights Table (AI-generated insights and suggestions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      insight_type TEXT NOT NULL, -- tip, encouragement, warning, celebration
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      related_goal_id INTEGER,
      related_pattern_id INTEGER,
      priority INTEGER DEFAULT 0,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (related_goal_id) REFERENCES goals(id) ON DELETE SET NULL,
      FOREIGN KEY (related_pattern_id) REFERENCES patterns(id) ON DELETE SET NULL
    )
  `);

  // Achievements Table (gamification)
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      points INTEGER DEFAULT 0,
      unlocked_at DATETIME,
      achievement_type TEXT, -- streak, milestone, consistency, etc.
      requirement_data TEXT -- JSON with achievement requirements
    )
  `);

  // Git Commits Table (optional integration)
  db.exec(`
    CREATE TABLE IF NOT EXISTS git_commits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commit_hash TEXT UNIQUE NOT NULL,
      message TEXT,
      author TEXT,
      date DATETIME,
      files_changed INTEGER,
      insertions INTEGER,
      deletions INTEGER,
      analysis TEXT, -- JSON with commit analysis
      imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1), -- Only one row
      timezone TEXT DEFAULT 'UTC',
      daily_reminder_time TEXT,
      git_repo_path TEXT,
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Initialize default settings if not exists
  const settings = db.prepare('SELECT id FROM user_settings WHERE id = 1').get();
  if (!settings) {
    db.prepare('INSERT INTO user_settings (id) VALUES (1)').run();
  }

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal_entries(created_at);
    CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
    CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
    CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_at ON habit_logs(completed_at);
    CREATE INDEX IF NOT EXISTS idx_patterns_type ON patterns(pattern_type);
    CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(insight_type);
    CREATE INDEX IF NOT EXISTS idx_insights_read ON insights(is_read);
  `);

  console.log('Database initialized successfully');
}

// Initialize on import
initializeDatabase();
