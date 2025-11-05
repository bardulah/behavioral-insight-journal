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

export interface Goal {
  id?: number;
  title: string;
  description?: string;
  category?: string;
  target_date?: string;
  status?: 'active' | 'completed' | 'abandoned';
  progress?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Habit {
  id?: number;
  name: string;
  description?: string;
  frequency?: string;
  target_count?: number;
  icon?: string;
  color?: string;
  streak_count?: number;
  best_streak?: number;
  total_completions?: number;
  created_at?: string;
}

export interface HabitLog {
  id?: number;
  habit_id: number;
  completed_at?: string;
  note?: string;
}

export interface Pattern {
  id?: number;
  pattern_type: string;
  title: string;
  description?: string;
  confidence?: number;
  frequency?: string;
  data?: any;
  first_detected?: string;
  last_seen?: string;
}

export interface Insight {
  id?: number;
  insight_type: 'tip' | 'encouragement' | 'warning' | 'celebration';
  title: string;
  message: string;
  related_goal_id?: number;
  related_pattern_id?: number;
  priority?: number;
  is_read?: boolean;
  created_at?: string;
}

export interface Achievement {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  points?: number;
  unlocked_at?: string;
  achievement_type?: string;
  requirement_data?: any;
}

export interface GitCommit {
  id?: number;
  commit_hash: string;
  message?: string;
  author?: string;
  date?: string;
  files_changed?: number;
  insertions?: number;
  deletions?: number;
  analysis?: any;
  imported_at?: string;
}

export interface UserSettings {
  id: number;
  timezone?: string;
  daily_reminder_time?: string;
  git_repo_path?: string;
  points?: number;
  level?: number;
  created_at?: string;
  updated_at?: string;
}
