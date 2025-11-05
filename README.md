# Growth Journal - Your Personal Coach

A behavioral insights journal that tracks habits and actions, analyzes gaps, and recommends improvements. Built with a warm, encouraging design to feel like a caring coach, not a judge.

## Features

### Core Features

- **Journal Entry Input** - Write freely with mood and energy tracking
- **Git Commit Integration** (Optional) - Analyze your coding activity
- **Pattern Recognition** - Discover behavioral patterns in your entries
- **Goal vs. Action Gap Analysis** - Track progress and identify gaps
- **Personalized Insights** - AI-driven suggestions and encouragement
- **Habit Tracking** - Build consistency with streak tracking
- **Gamification** - Earn achievements and level up
- **Progress Visualization** - Beautiful charts showing your growth
- **Weekly/Monthly Summaries** - See your journey at a glance

### What Makes It Special

- **Warm, Encouraging Design** - Uses warm colors (oranges, yellows) and positive language
- **Coaching Tone** - Celebrates wins, offers gentle encouragement, uses humor
- **Personal & Relevant** - Insights based on YOUR patterns and data
- **Non-Judgmental** - Focuses on growth, not perfection

## Tech Stack

### Backend
- **Node.js + Express** - RESTful API
- **TypeScript** - Type-safe code
- **SQLite** - Lightweight, file-based database
- **better-sqlite3** - Fast synchronous SQLite access
- **natural** - NLP for pattern recognition
- **simple-git** - Git repository analysis

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Beautiful data visualizations
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icon library
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git (for commit integration feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd behavioral-insight-journal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` if needed (defaults work fine for development)

4. **Start the application**
   ```bash
   npm run dev
   ```

   This starts both:
   - Backend API at http://localhost:5000
   - Frontend at http://localhost:3000

5. **Open your browser**
   Navigate to http://localhost:3000

See [SETUP.md](SETUP.md) for detailed setup instructions and troubleshooting.

### Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

## Project Structure

```
behavioral-insight-journal/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── database/       # Database schema and initialization
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Express server
│   ├── data/               # SQLite database (created automatically)
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json
│
└── package.json           # Root workspace config
```

## Usage Guide

### Dashboard
- View your current streak, stats, and recent insights
- Quick actions to write in journal or check habits
- See unread insights and patterns

### Journal
- Write freely about your day
- Track mood (1-5) and energy level (1-5)
- Add tags to categorize entries
- Edit or delete past entries

### Goals
- Create goals with categories (personal, career, health, etc.)
- Set target dates and track progress
- Mark goals as complete
- View overdue goals

### Habits
- Create daily/weekly habits
- Choose fun icons and colors
- Track streaks and completions
- See today's completion rate
- Celebrate 100% days!

### Insights
- AI-generated personalized insights
- Pattern detection in your behavior
- Celebrations for wins
- Encouragement when needed
- Tips and suggestions

### Analytics
- Mood and energy trends over time
- Journaling frequency charts
- Goal progress statistics
- Customizable time ranges (7, 14, 30, 90 days)

### Git Integration
- Import commits from local repositories
- Analyze coding activity
- Track productivity patterns
- See commit categorization

## Design Philosophy

### Warm & Encouraging
- Color palette uses warm oranges, yellows, and greens
- Positive, uplifting language throughout
- Celebrates every win, no matter how small
- Gentle encouragement instead of criticism

### Gamification
- Streak tracking for habits and journaling
- Achievement system (planned)
- Progress bars and percentages
- Visual celebrations for milestones

### Pattern Recognition
- Mood-time correlations
- Recurring themes in journal entries
- Mood-energy relationships
- Habit consistency patterns

### Privacy First
- All data stored locally in SQLite
- No external APIs or data sharing
- You own your data completely

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for personal or commercial projects!

---

Built with ❤️ to help you grow and thrive!
