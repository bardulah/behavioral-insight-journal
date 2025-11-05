import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Plus, Smile, Zap, Calendar, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];
const energyLevels = ['⚡', '⚡⚡', '⚡⚡⚡', '⚡⚡⚡⚡', '⚡⚡⚡⚡⚡'];

export default function Journal() {
  const [entries, setEntries] = useState<any[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await api.journals.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (entry: any) => {
    try {
      if (editingEntry) {
        await api.journals.update(editingEntry.id, entry);
      } else {
        await api.journals.create(entry);
      }
      await loadEntries();
      setShowEditor(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setShowEditor(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await api.journals.delete(id);
      await loadEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
            <p className="text-gray-600 mt-1">Capture your thoughts and track your journey</p>
          </div>
          <button
            onClick={() => {
              setEditingEntry(null);
              setShowEditor(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>

        {/* Editor */}
        <AnimatePresence>
          {showEditor && (
            <JournalEditor
              entry={editingEntry}
              onSave={handleSave}
              onCancel={() => {
                setShowEditor(false);
                setEditingEntry(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Entries List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-gray-500">No entries yet. Start your journey by writing your first entry!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JournalEditor({ entry, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    content: entry?.content || '',
    mood: entry?.mood || 3,
    energy_level: entry?.energy_level || 3,
    tags: entry?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t: string) => t !== tag) });
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
          placeholder="Entry title (optional)"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input"
        />

        <textarea
          placeholder="What's on your mind? Write freely..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="textarea min-h-[200px]"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mood Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Smile className="w-4 h-4" />
              How are you feeling?
            </label>
            <div className="flex gap-2">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: index + 1 })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all text-2xl ${
                    formData.mood === index + 1
                      ? 'border-primary-500 bg-primary-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Energy Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Energy level?
            </label>
            <div className="flex gap-2">
              {energyLevels.map((level, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, energy_level: index + 1 })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all text-xs ${
                    formData.energy_level === index + 1
                      ? 'border-warm-500 bg-warm-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={addTag}
              className="btn-secondary"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag: string) => (
              <span
                key={tag}
                className="badge-info flex items-center gap-1 cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag} ✕
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {entry ? 'Update' : 'Save'} Entry
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function EntryCard({ entry, onEdit, onDelete }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {entry.title && <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(entry.created_at), 'MMM d, yyyy')}
            </span>
            {entry.mood && <span className="text-xl">{moodEmojis[entry.mood - 1]}</span>}
            {entry.energy_level && <span className="text-sm">{energyLevels[entry.energy_level - 1]}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {entry.tags.map((tag: string) => (
            <span key={tag} className="badge-info text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
