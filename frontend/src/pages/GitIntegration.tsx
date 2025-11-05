import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { GitBranch, Upload, TrendingUp, Code, FileCode } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GitIntegration() {
  const [commits, setCommits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [repoPath, setRepoPath] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [commitsData, statsData, insightsData] = await Promise.all([
        api.git.getAll(),
        api.git.getStats(),
        api.git.getInsights()
      ]);
      setCommits(commitsData);
      setStats(statsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load git data:', error);
    }
  };

  const handleImport = async () => {
    if (!repoPath.trim()) {
      setError('Please enter a repository path');
      return;
    }

    setImporting(true);
    setError('');

    try {
      await api.git.import(repoPath, 30);
      await loadData();
      setRepoPath('');
    } catch (error: any) {
      setError(error.message || 'Failed to import commits');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Git Integration</h1>
          <p className="text-gray-600 mt-1">Track your coding activity and productivity</p>
        </div>

        {/* Import Section */}
        <div className="card mb-8 bg-gradient-to-br from-indigo-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Git Commits
          </h2>
          <p className="text-gray-600 mb-4">
            Enter the path to your Git repository to analyze your commit history
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="/path/to/your/repo"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              className="input flex-1"
            />
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn-primary"
            >
              {importing ? 'Importing...' : 'Import Last 30 Days'}
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<GitBranch className="w-6 h-6" />}
              title="Total Commits"
              value={stats.total_commits || 0}
              color="indigo"
            />
            <StatCard
              icon={<FileCode className="w-6 h-6" />}
              title="Files Changed"
              value={stats.total_files_changed || 0}
              color="purple"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Lines Added"
              value={stats.total_insertions || 0}
              color="success"
            />
            <StatCard
              icon={<Code className="w-6 h-6" />}
              title="Lines Removed"
              value={stats.total_deletions || 0}
              color="orange"
            />
          </div>
        )}

        {/* Insights */}
        {insights && insights.insights && insights.insights.length > 0 && (
          <div className="card mb-8 bg-gradient-to-br from-primary-50 to-warm-50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Coding Insights</h2>
            <div className="space-y-3">
              {insights.insights.map((insight: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    insight.type === 'celebration' ? 'bg-success-100' : 'bg-primary-100'
                  }`}
                >
                  <p className="text-gray-800">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Commits */}
        {commits.length > 0 ? (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Commits</h2>
            <div className="space-y-3">
              {commits.slice(0, 20).map((commit) => (
                <CommitCard key={commit.id} commit={commit} />
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No commits imported yet. Import a repository to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: any) {
  const colorClasses = {
    indigo: 'from-indigo-400 to-indigo-600',
    purple: 'from-purple-400 to-purple-600',
    success: 'from-success-400 to-success-600',
    orange: 'from-orange-400 to-orange-600'
  };

  return (
    <div className="card">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

function CommitCard({ commit }: any) {
  const analysis = commit.analysis || {};

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return 'bg-primary-100 text-primary-700';
      case 'bugfix': return 'bg-red-100 text-red-700';
      case 'refactor': return 'bg-purple-100 text-purple-700';
      case 'test': return 'bg-success-100 text-success-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge text-xs ${getCategoryColor(analysis.category)}`}>
              {analysis.category || 'other'}
            </span>
            <span className="badge text-xs bg-gray-200 text-gray-700">
              {analysis.size || 'small'}
            </span>
          </div>
          <p className="text-gray-900 font-medium">{commit.message}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <span>{commit.author}</span>
            <span>{new Date(commit.date).toLocaleDateString()}</span>
            <span>{commit.files_changed} files</span>
            <span className="text-success-600">+{commit.insertions}</span>
            <span className="text-red-600">-{commit.deletions}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
