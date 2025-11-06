// Journal Types
export interface JournalEntry {
  id?: number;
  title?: string;
  content: string;
  mood?: number;
  energy_level?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface JournalStats {
  total_entries: number;
  days_journaled: number;
  avg_mood: number | null;
  avg_energy: number | null;
  current_streak: number;
}

export interface MoodTrendData {
  date: string;
  avg_mood: number;
  avg_energy: number;
  entry_count: number;
}

// Goal Types
export interface Goal {
  id?: number;
  title: string;
  description?: string;
  category?: GoalCategory;
  target_date?: string;
  status?: GoalStatus;
  progress?: number;
  created_at?: string;
  updated_at?: string;
}

export type GoalCategory = 'personal' | 'career' | 'health' | 'learning' | 'financial' | 'relationships';
export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface GoalStats {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  avg_progress: number | null;
}

// Habit Types
export interface Habit {
  id?: number;
  name: string;
  description?: string;
  frequency?: HabitFrequency;
  target_count?: number;
  icon?: string;
  color?: string;
  streak_count?: number;
  best_streak?: number;
  total_completions?: number;
  created_at?: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface HabitLog {
  id?: number;
  habit_id: number;
  completed_at?: string;
  note?: string;
}

export interface HabitStats {
  total_habits: number;
  completed_today: number;
  completion_rate: number;
}

// Pattern Types
export interface Pattern {
  id?: number;
  pattern_type: PatternType;
  title: string;
  description?: string;
  confidence?: number;
  frequency?: string;
  data?: Record<string, any>;
  first_detected?: string;
  last_seen?: string;
}

export type PatternType = 'mood_time_correlation' | 'mood_energy_correlation' | 'recurring_theme' | 'habit_consistency' | 'productivity_pattern';

// Insight Types
export interface Insight {
  id?: number;
  insight_type: InsightType;
  title: string;
  message: string;
  related_goal_id?: number;
  related_pattern_id?: number;
  priority?: number;
  is_read?: boolean;
  effectiveness_score?: number;
  created_at?: string;
}

export type InsightType = 'tip' | 'encouragement' | 'warning' | 'celebration';

// Achievement Types
export interface Achievement {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  points?: number;
  unlocked_at?: string;
  achievement_type?: AchievementType;
  requirement_data?: Record<string, any>;
  progress?: number;
  target?: number;
}

export type AchievementType = 'streak' | 'milestone' | 'consistency' | 'completion' | 'exploration';

// Git Types
export interface GitCommit {
  id?: number;
  commit_hash: string;
  message?: string;
  author?: string;
  date?: string;
  files_changed?: number;
  insertions?: number;
  deletions?: number;
  analysis?: CommitAnalysis;
  imported_at?: string;
}

export interface CommitAnalysis {
  category: CommitCategory;
  size: CommitSize;
  sentiment: 'positive' | 'neutral' | 'negative';
  total_changes: number;
  file_types: string[];
}

export type CommitCategory = 'feature' | 'bugfix' | 'refactor' | 'test' | 'documentation' | 'other';
export type CommitSize = 'small' | 'medium' | 'large';

// User Settings Types
export interface UserSettings {
  id: number;
  timezone?: string;
  daily_reminder_time?: string;
  git_repo_path?: string;
  points?: number;
  level?: number;
  theme?: 'light' | 'dark' | 'auto';
  created_at?: string;
  updated_at?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Filter and Search Types
export interface JournalFilter {
  tags?: string[];
  mood_min?: number;
  mood_max?: number;
  energy_min?: number;
  energy_max?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
}

// Export Types
export type ExportFormat = 'json' | 'markdown' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  date_from?: string;
  date_to?: string;
  include_goals?: boolean;
  include_habits?: boolean;
  include_insights?: boolean;
}

// Notification Types
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Onboarding Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

export interface UserProgress {
  onboarding_completed: boolean;
  first_journal_entry: boolean;
  first_goal_created: boolean;
  first_habit_created: boolean;
  insights_generated: boolean;
}
