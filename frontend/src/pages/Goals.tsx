import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Plus, Target, Calendar, TrendingUp, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await api.goals.getAll();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const handleSave = async (goal: any) => {
    try {
      if (editingGoal) {
        await api.goals.update(editingGoal.id, goal);
      } else {
        await api.goals.create(goal);
      }
      await loadGoals();
      setShowEditor(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await api.goals.delete(id);
      await loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const filteredGoals = goals.filter(g => {
    if (filter === 'all') return true;
    return g.status === filter;
  });

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
            <p className="text-gray-600 mt-1">Set targets and track your progress</p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setShowEditor(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['active', 'completed', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Editor */}
        <AnimatePresence>
          {showEditor && (
            <GoalEditor
              goal={editingGoal}
              onSave={handleSave}
              onCancel={() => {
                setShowEditor(false);
                setEditingGoal(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Goals List */}
        <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => {
                setEditingGoal(g);
                setShowEditor(true);
              }}
              onDelete={handleDelete}
              onUpdate={loadGoals}
            />
          ))}
        </div>

        {filteredGoals.length === 0 && (
          <div className="text-center py-12 card">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No {filter !== 'all' ? filter : ''} goals yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GoalEditor({ goal, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || 'personal',
    target_date: goal?.target_date || '',
    progress: goal?.progress || 0,
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
      className="card mb-8 bg-gradient-to-br from-success-50 to-primary-50"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Goal title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input"
          required
        />

        <textarea
          placeholder="Describe your goal and why it matters..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="textarea min-h-[100px]"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              <option value="personal">Personal</option>
              <option value="career">Career</option>
              <option value="health">Health</option>
              <option value="learning">Learning</option>
              <option value="financial">Financial</option>
              <option value="relationships">Relationships</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="input"
            />
          </div>
        </div>

        {goal && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress: {formData.progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {goal ? 'Update' : 'Create'} Goal
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function GoalCard({ goal, onEdit, onDelete, onUpdate }: any) {
  const updateProgress = async (newProgress: number) => {
    try {
      await api.goals.update(goal.id, { progress: newProgress });
      await onUpdate();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const toggleStatus = async () => {
    const newStatus = goal.status === 'active' ? 'completed' : 'active';
    try {
      await api.goals.update(goal.id, { status: newStatus, progress: newStatus === 'completed' ? 100 : goal.progress });
      await onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const isOverdue = goal.target_date && new Date(goal.target_date) < new Date() && goal.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card-hover ${goal.status === 'completed' ? 'bg-success-50 border-success-200' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleStatus}
              className={`transition-colors ${
                goal.status === 'completed' ? 'text-success-500' : 'text-gray-300 hover:text-success-500'
              }`}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
            <h3 className={`text-lg font-semibold ${goal.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {goal.title}
            </h3>
            <span className="badge-info text-xs">{goal.category}</span>
          </div>

          {goal.description && (
            <p className="text-gray-600 mt-2 ml-8">{goal.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mt-3 ml-8">
            {goal.target_date && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                <Calendar className="w-4 h-4" />
                {format(new Date(goal.target_date), 'MMM d, yyyy')}
                {isOverdue && ' (overdue)'}
              </span>
            )}
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {goal.progress}% complete
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {goal.status === 'active' && (
        <div className="ml-8">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-success-400 to-success-600 h-2 rounded-full transition-all"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={goal.progress}
            onChange={(e) => updateProgress(parseInt(e.target.value))}
            className="w-full h-1 opacity-0 cursor-pointer absolute"
          />
        </div>
      )}
    </motion.div>
  );
}
