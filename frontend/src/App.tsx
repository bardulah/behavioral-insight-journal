import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import {
  BookOpen, Target, TrendingUp, Sparkles,
  BarChart3, GitBranch, Home, Moon, Sun, Trophy
} from 'lucide-react';
import { queryClient } from './lib/queryClient';
import { useThemeStore } from './stores/themeStore';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Journal = lazy(() => import('./pages/Journal'));
const Goals = lazy(() => import('./pages/Goals'));
const Habits = lazy(() => import('./pages/Habits'));
const Insights = lazy(() => import('./pages/Insights'));
const Analytics = lazy(() => import('./pages/Analytics'));
const GitIntegration = lazy(() => import('./pages/GitIntegration'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function AppContent() {
  const { theme, setTheme, resolvedTheme } = useThemeStore();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-warm-500 bg-clip-text text-transparent">
            Growth Journal
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your personal coach</p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem to="/" icon={<Home />} label="Dashboard" />
          <NavItem to="/journal" icon={<BookOpen />} label="Journal" />
          <NavItem to="/goals" icon={<Target />} label="Goals" />
          <NavItem to="/habits" icon={<TrendingUp />} label="Habits" />
          <NavItem to="/insights" icon={<Sparkles />} label="Insights" />
          <NavItem to="/analytics" icon={<BarChart3 />} label="Analytics" />
          <NavItem to="/git" icon={<GitBranch />} label="Git Stats" />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Built with care for your growth
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-warm-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/git" element={<GitIntegration />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive
            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`
      }
    >
      <span className="w-5 h-5">{icon}</span>
      {label}
    </NavLink>
  );
}

export default App;
