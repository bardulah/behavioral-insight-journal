import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  BookOpen, Target, TrendingUp, Sparkles, ArrowRight, Flame, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [journalStats, goalStats, habitStats, unreadInsights] = await Promise.all([
        api.journals.getStats(),
        api.goals.getStats(),
        api.habits.getTodayStats(),
        api.insights.getUnread(),
      ]);

      setStats({ journalStats, goalStats, habitStats });
      setInsights(unreadInsights.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back! Ready to grow today?
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          title="Journaling Streak"
          value={`${stats.journalStats?.current_streak || 0} days`}
          color="from-orange-400 to-red-500"
          link="/journal"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Journal Entries"
          value={stats.journalStats?.total_entries || 0}
          color="from-primary-400 to-primary-600"
          link="/journal"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          title="Active Goals"
          value={stats.goalStats?.active_goals || 0}
          color="from-success-400 to-success-600"
          link="/goals"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Habits Today"
          value={`${stats.habitStats?.completed_today || 0}/${stats.habitStats?.total_habits || 0}`}
          color="from-warm-400 to-warm-600"
          link="/habits"
        />
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8 bg-gradient-to-br from-primary-50 to-warm-50 border-primary-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Fresh Insights for You</h2>
          </div>

          <div className="space-y-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          <Link
            to="/insights"
            className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            View all insights <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAction
          title="Write in Journal"
          description="Reflect on your day, capture thoughts, track your mood"
          icon={<BookOpen className="w-8 h-8" />}
          link="/journal"
          color="primary"
        />
        <QuickAction
          title="Check Your Habits"
          description="Mark today's habits complete and build your streak"
          icon={<TrendingUp className="w-8 h-8" />}
          link="/habits"
          color="warm"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, link }: any) {
  return (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="card-hover"
      >
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}>
          {icon}
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </motion.div>
    </Link>
  );
}

function InsightCard({ insight }: any) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'celebration': return '🎉';
      case 'encouragement': return '💙';
      case 'tip': return '💡';
      case 'warning': return '⚠️';
      default: return '✨';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getIcon(insight.insight_type)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{insight.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ title, description, icon, link, color }: any) {
  return (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="card-hover flex items-start gap-4"
      >
        <div className={`w-16 h-16 rounded-xl bg-${color}-100 text-${color}-600 flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}
