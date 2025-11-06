import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Sparkles, RefreshCw, Eye, Trash2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Insights() {
  const [insights, setInsights] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [insightsData, patternsData] = await Promise.all([
        api.insights.getAll(),
        api.patterns.getAll()
      ]);
      setInsights(insightsData);
      setPatterns(patternsData);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setGenerating(true);
    try {
      await Promise.all([
        api.insights.generate(),
        api.patterns.analyze()
      ]);
      await loadData();
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.insights.markAsRead(id);
      await loadData();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteInsight = async (id: number) => {
    try {
      await api.insights.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete insight:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'celebration': return '🎉';
      case 'encouragement': return '💙';
      case 'tip': return '💡';
      case 'warning': return '⚠️';
      default: return '✨';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'celebration': return 'from-success-50 to-warm-50 border-success-200';
      case 'encouragement': return 'from-primary-50 to-blue-50 border-primary-200';
      case 'tip': return 'from-warm-50 to-yellow-50 border-warm-200';
      case 'warning': return 'from-orange-50 to-red-50 border-orange-200';
      default: return 'from-gray-50 to-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insights & Patterns</h1>
            <p className="text-gray-600 mt-1">Personalized guidance from your journey</p>
          </div>
          <button
            onClick={generateInsights}
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Analyzing...' : 'Generate New'}
          </button>
        </div>

        {/* Insights */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            Your Personalized Insights
          </h2>

          {insights.length === 0 ? (
            <div className="card text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No insights yet. Click "Generate New" to analyze your data!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card bg-gradient-to-br ${getInsightColor(insight.insight_type)} ${
                    insight.is_read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-3xl">{getInsightIcon(insight.insight_type)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <p className="text-gray-700 mt-1">{insight.message}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!insight.is_read && (
                        <button
                          onClick={() => markAsRead(insight.id)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteInsight(insight.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Patterns */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Behavioral Patterns
          </h2>

          {patterns.length === 0 ? (
            <div className="card text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No patterns detected yet. Keep journaling to discover patterns!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patterns.map((pattern) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{pattern.title}</h3>
                        <span className="badge-info text-xs">
                          {Math.round((pattern.confidence || 0) * 100)}% confident
                        </span>
                      </div>
                      <p className="text-gray-700">{pattern.description}</p>
                      {pattern.frequency && (
                        <p className="text-sm text-gray-500 mt-2">Frequency: {pattern.frequency}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
