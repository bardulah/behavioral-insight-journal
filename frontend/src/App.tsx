import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import {
  BookOpen, Target, TrendingUp, Sparkles,
  BarChart3, GitBranch, Home
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Goals from './pages/Goals';
import Habits from './pages/Habits';
import Insights from './pages/Insights';
import Analytics from './pages/Analytics';
import GitIntegration from './pages/GitIntegration';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-warm-500 bg-clip-text text-transparent">
              Growth Journal
            </h1>
            <p className="text-sm text-gray-500 mt-1">Your personal coach</p>
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

          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Built with care for your growth
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/git" element={<GitIntegration />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50'
        }`
      }
    >
      <span className="w-5 h-5">{icon}</span>
      {label}
    </NavLink>
  );
}

export default App;
