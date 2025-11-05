import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Plus, Flame, Award, CheckCircle, Circle, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultIcons = ['💪', '📚', '🏃', '🧘', '💤', '💧', '🥗', '🎨', '🎯', '✨'];
const defaultColors = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
];

export default function Habits() {
  const [habits, setHabits] = useState<any[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsData, statsData] = await Promise.all([
        api.habits.getAll(),
        api.habits.getTodayStats()
      ]);

      setHabits(habitsData);
      setStats(statsData);

      // Check which habits are completed today
      const today = new Date().toISOString().split('T')[0];
      const completed = new Set<number>();

      for (const habit of habitsData) {
        const logs = await api.habits.getLogs(habit.id, 1);
        if (logs.length > 0) {
          const logDate = new Date(logs[0].completed_at).toISOString().split('T')[0];
          if (logDate === today) {
            completed.add(habit.id);
          }
        }
      }

      setCompletedToday(completed);
    } catch (error) {
      console.error('Failed to load habits:', error);
    }
  };

  const handleSave = async (habit: any) => {
    try {
      if (editingHabit) {
        await api.habits.update(editingHabit.id, habit);
      } else {
        await api.habits.create(habit);
      }
      await loadData();
      setShowEditor(false);
      setEditingHabit(null);
    } catch (error) {
      console.error('Failed to save habit:', error);
    }
  };

  const handleComplete = async (habitId: number) => {
    try {
      await api.habits.complete(habitId);
      await loadData();
    } catch (error) {
      console.error('Failed to complete habit:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      await api.habits.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const completionRate = stats.completion_rate || 0;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Habits</h1>
            <p className="text-gray-600 mt-1">Build consistency, one day at a time</p>
          </div>
          <button
            onClick={() => {
              setEditingHabit(null);
              setShowEditor(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Habit
          </button>
        </div>

        {/* Today's Progress */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card mb-8 bg-gradient-to-br from-warm-50 to-primary-50"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Progress</h2>
              <p className="text-gray-600">
                {stats.completed_today || 0} of {stats.total_habits || 0} completed
              </p>
            </div>
            <div className="text-4xl font-bold text-primary-600">
              {Math.round(completionRate)}%
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-primary-400 to-warm-500 h-4 rounded-full"
            />
          </div>

          {completionRate === 100 && stats.total_habits > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-success-100 text-success-700 rounded-lg text-center font-medium"
            >
              🎉 Amazing! You've completed all your habits today!
            </motion.div>
          )}
        </motion.div>

        {/* Editor */}
        <AnimatePresence>
          {showEditor && (
            <HabitEditor
              habit={editingHabit}
              onSave={handleSave}
              onCancel={() => {
                setShowEditor(false);
                setEditingHabit(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompletedToday={completedToday.has(habit.id)}
              onComplete={handleComplete}
              onEdit={(h) => {
                setEditingHabit(h);
                setShowEditor(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {habits.length === 0 && (
          <div className="text-center py-12 card">
            <p className="text-gray-500">No habits yet. Create one to start building consistency!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HabitEditor({ habit, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    frequency: habit?.frequency || 'daily',
    target_count: habit?.target_count || 1,
    icon: habit?.icon || '✨',
    color: habit?.color || 'bg-primary-500',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card mb-8 bg-gradient-to-br from-primary-50 to-warm-50"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Habit name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
          required
        />

        <textarea
          placeholder="Why is this habit important to you?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="textarea min-h-[80px]"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="input"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target per day</label>
            <input
              type="number"
              min="1"
              value={formData.target_count}
              onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) })}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose an icon</label>
          <div className="flex flex-wrap gap-2">
            {defaultIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={`text-2xl p-3 rounded-lg border-2 transition-all ${
                  formData.icon === icon ? 'border-primary-500 bg-primary-50 scale-110' : 'border-gray-200'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose a color</label>
          <div className="flex flex-wrap gap-2">
            {defaultColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-lg ${color} ${
                  formData.color === color ? 'ring-4 ring-offset-2 ring-gray-300' : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {habit ? 'Update' : 'Create'} Habit
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function HabitCard({ habit, isCompletedToday, onComplete, onEdit, onDelete }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`card flex items-center gap-4 ${isCompletedToday ? 'bg-success-50 border-success-200' : ''}`}
    >
      <div className={`w-16 h-16 rounded-xl ${habit.color} flex items-center justify-center text-3xl flex-shrink-0`}>
        {habit.icon}
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
        {habit.description && (
          <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            {habit.streak_count} day streak
          </span>
          {habit.best_streak > 0 && (
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-warm-500" />
              Best: {habit.best_streak}
            </span>
          )}
          <span className="text-gray-400">
            {habit.total_completions} total
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(habit)}
          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => !isCompletedToday && onComplete(habit.id)}
          disabled={isCompletedToday}
          className={`p-3 rounded-lg transition-all ${
            isCompletedToday
              ? 'bg-success-500 text-white cursor-not-allowed'
              : 'bg-gray-100 text-gray-400 hover:bg-success-500 hover:text-white'
          }`}
        >
          {isCompletedToday ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
      </div>
    </motion.div>
  );
}
