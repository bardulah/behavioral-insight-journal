import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, Smile, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function Analytics() {
  const [moodTrend, setMoodTrend] = useState<any[]>([]);
  const [journalStats, setJournalStats] = useState<any>({});
  const [goalStats, setGoalStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const [moodData, jStats, gStats] = await Promise.all([
        api.journals.getMoodTrend(timeRange),
        api.journals.getStats(),
        api.goals.getStats()
      ]);

      // Format mood data for charts
      const formattedMoodData = moodData.map((d: any) => ({
        date: format(new Date(d.date), 'MMM d'),
        mood: parseFloat(d.avg_mood?.toFixed(1)) || 0,
        energy: parseFloat(d.avg_energy?.toFixed(1)) || 0,
        entries: d.entry_count
      }));

      setMoodTrend(formattedMoodData);
      setJournalStats(jStats);
      setGoalStats(gStats);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Visualize your growth journey</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === days
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            icon={<Calendar className="w-6 h-6" />}
            title="Total Entries"
            value={journalStats.total_entries || 0}
            color="primary"
          />
          <SummaryCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Days Journaled"
            value={journalStats.days_journaled || 0}
            color="success"
          />
          <SummaryCard
            icon={<Smile className="w-6 h-6" />}
            title="Avg Mood"
            value={journalStats.avg_mood ? journalStats.avg_mood.toFixed(1) : 'N/A'}
            color="warm"
          />
          <SummaryCard
            icon={<Zap className="w-6 h-6" />}
            title="Avg Energy"
            value={journalStats.avg_energy ? journalStats.avg_energy.toFixed(1) : 'N/A'}
            color="orange"
          />
        </div>

        {/* Mood & Energy Trend */}
        {moodTrend.length > 0 ? (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mood & Energy Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis domain={[0, 5]} stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#f0701f"
                  strokeWidth={3}
                  dot={{ fill: '#f0701f', r: 4 }}
                  name="Mood"
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#eab308"
                  strokeWidth={3}
                  dot={{ fill: '#eab308', r: 4 }}
                  name="Energy"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card mb-8 text-center py-12">
            <p className="text-gray-500">Not enough data to show trends. Keep journaling!</p>
          </div>
        )}

        {/* Entry Frequency */}
        {moodTrend.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Journaling Frequency</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={moodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="entries" fill="#f0701f" radius={[8, 8, 0, 0]} name="Entries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Goal Progress */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Goal Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">{goalStats.total_goals || 0}</div>
              <div className="text-sm text-gray-600">Total Goals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success-600">{goalStats.completed_goals || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">
                {goalStats.avg_progress ? `${Math.round(goalStats.avg_progress)}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Average Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, color }: any) {
  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success-400 to-success-600',
    warm: 'from-warm-400 to-warm-600',
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
