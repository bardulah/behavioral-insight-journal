import { db } from './schema';

export interface Migration {
  version: number;
  name: string;
  up: () => void;
  down: () => void;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: () => {
      // Already handled by schema.ts
      console.log('Migration 1: Initial schema - already applied');
    },
    down: () => {
      // Drop all tables
      db.exec('DROP TABLE IF EXISTS git_commits');
      db.exec('DROP TABLE IF EXISTS insights');
      db.exec('DROP TABLE IF EXISTS patterns');
      db.exec('DROP TABLE IF EXISTS habit_logs');
      db.exec('DROP TABLE IF EXISTS habits');
      db.exec('DROP TABLE IF EXISTS goals');
      db.exec('DROP TABLE IF EXISTS journal_entries');
      db.exec('DROP TABLE IF EXISTS user_settings');
      db.exec('DROP TABLE IF EXISTS achievements');
    },
  },
  {
    version: 2,
    name: 'add_achievements_progress',
    up: () => {
      // Add progress tracking to achievements
      const columns = db.prepare("PRAGMA table_info(achievements)").all() as any[];
      const hasProgress = columns.some((col: any) => col.name === 'progress');

      if (!hasProgress) {
        db.exec(`
          ALTER TABLE achievements ADD COLUMN progress INTEGER DEFAULT 0;
          ALTER TABLE achievements ADD COLUMN target INTEGER DEFAULT 100;
        `);
      }
    },
    down: () => {
      // SQLite doesn't support DROP COLUMN easily, would need table recreation
      console.log('Downgrade not implemented for achievement progress');
    },
  },
  {
    version: 3,
    name: 'add_insight_effectiveness',
    up: () => {
      const columns = db.prepare("PRAGMA table_info(insights)").all() as any[];
      const hasEffectiveness = columns.some((col: any) => col.name === 'effectiveness_score');

      if (!hasEffectiveness) {
        db.exec(`
          ALTER TABLE insights ADD COLUMN effectiveness_score REAL DEFAULT NULL;
          ALTER TABLE insights ADD COLUMN acted_upon BOOLEAN DEFAULT 0;
        `);
      }
    },
    down: () => {
      console.log('Downgrade not implemented for insight effectiveness');
    },
  },
  {
    version: 4,
    name: 'add_user_progress',
    up: () => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS user_progress (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          onboarding_completed BOOLEAN DEFAULT 0,
          first_journal_entry BOOLEAN DEFAULT 0,
          first_goal_created BOOLEAN DEFAULT 0,
          first_habit_created BOOLEAN DEFAULT 0,
          insights_generated BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Initialize if not exists
      const exists = db.prepare('SELECT id FROM user_progress WHERE id = 1').get();
      if (!exists) {
        db.prepare('INSERT INTO user_progress (id) VALUES (1)').run();
      }
    },
    down: () => {
      db.exec('DROP TABLE IF EXISTS user_progress');
    },
  },
  {
    version: 5,
    name: 'add_theme_to_settings',
    up: () => {
      const columns = db.prepare("PRAGMA table_info(user_settings)").all() as any[];
      const hasTheme = columns.some((col: any) => col.name === 'theme');

      if (!hasTheme) {
        db.exec(`
          ALTER TABLE user_settings ADD COLUMN theme TEXT DEFAULT 'light';
        `);
      }
    },
    down: () => {
      console.log('Downgrade not implemented for theme setting');
    },
  },
];

// Migration tracking table
function initMigrationTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function getCurrentVersion(): number {
  initMigrationTable();
  const result = db.prepare('SELECT MAX(version) as version FROM migrations').get() as any;
  return result?.version || 0;
}

export function runMigrations() {
  const currentVersion = getCurrentVersion();
  const pending = migrations.filter((m) => m.version > currentVersion);

  if (pending.length === 0) {
    console.log('✓ Database is up to date');
    return;
  }

  console.log(`Running ${pending.length} pending migration(s)...`);

  for (const migration of pending) {
    try {
      console.log(`  Applying migration ${migration.version}: ${migration.name}`);
      migration.up();
      db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(
        migration.version,
        migration.name
      );
      console.log(`  ✓ Migration ${migration.version} applied successfully`);
    } catch (error) {
      console.error(`  ✗ Migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  console.log('✓ All migrations completed');
}

export function rollbackMigration() {
  const currentVersion = getCurrentVersion();
  if (currentVersion === 0) {
    console.log('No migrations to rollback');
    return;
  }

  const migration = migrations.find((m) => m.version === currentVersion);
  if (!migration) {
    console.error(`Migration ${currentVersion} not found`);
    return;
  }

  try {
    console.log(`Rolling back migration ${currentVersion}: ${migration.name}`);
    migration.down();
    db.prepare('DELETE FROM migrations WHERE version = ?').run(currentVersion);
    console.log(`✓ Migration ${currentVersion} rolled back successfully`);
  } catch (error) {
    console.error(`✗ Rollback failed:`, error);
    throw error;
  }
}
