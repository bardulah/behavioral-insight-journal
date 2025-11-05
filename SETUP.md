# Setup Guide

This guide will help you set up and run the Growth Journal application.

## Quick Start

### 1. Install Dependencies

From the project root:

```bash
npm install
```

This will install dependencies for both the frontend and backend thanks to npm workspaces.

### 2. Start Development Servers

```bash
npm run dev
```

This starts both:
- **Backend** at http://localhost:5000
- **Frontend** at http://localhost:3000

### 3. Access the Application

Open your browser to http://localhost:3000

That's it! The database will be created automatically on first run.

## Manual Setup

If you prefer to set things up manually:

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend will start at http://localhost:5000

### Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at http://localhost:3000

## Environment Variables

The backend uses these environment variables (in `backend/.env`):

```env
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/journal.db
```

Defaults work fine for development - no need to change anything!

## Database

The SQLite database is created automatically at `backend/data/journal.db` on first run.

### Reset Database

To start fresh, simply delete the database file:

```bash
rm backend/data/journal.db
```

It will be recreated on next server start.

## Production Deployment

### 1. Build Everything

```bash
npm run build
```

This builds both frontend and backend.

### 2. Set Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set:
```env
NODE_ENV=production
PORT=5000
DATABASE_PATH=/path/to/production/journal.db
```

### 3. Serve Frontend

The built frontend is in `frontend/dist`. You can:

- Serve it with nginx, Apache, or any static file server
- Use the backend to serve it (add static middleware)
- Deploy to Netlify, Vercel, etc.

### 4. Run Backend

```bash
cd backend
npm start
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start npm --name "growth-journal" -- start
```

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

**Backend:**
Edit `backend/.env` and change `PORT`

**Frontend:**
Edit `frontend/vite.config.ts` and change the port in `server.port`

### Database Errors

If you see database errors:

1. Make sure the `backend/data` directory exists
2. Check file permissions
3. Try deleting and recreating the database

### Git Integration Not Working

For the Git integration feature:

1. Make sure Git is installed: `git --version`
2. Provide the full absolute path to your repository
3. The repository must be a valid git repository
4. You need read access to the repository

### Build Errors

If you encounter build errors:

1. Delete node_modules: `rm -rf node_modules backend/node_modules frontend/node_modules`
2. Delete package-lock: `rm package-lock.json backend/package-lock.json frontend/package-lock.json`
3. Reinstall: `npm install`

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite provides instant HMR
- Backend: `tsx watch` restarts on file changes

### API Testing

You can test the API directly:

```bash
# Get all journals
curl http://localhost:5000/api/journals

# Create a journal entry
curl -X POST http://localhost:5000/api/journals \
  -H "Content-Type: application/json" \
  -d '{"content":"Test entry","mood":4,"energy_level":3}'
```

### Database Inspection

To inspect the SQLite database:

```bash
# Install sqlite3 if needed
sudo apt-get install sqlite3  # Linux
brew install sqlite3          # Mac

# Open database
sqlite3 backend/data/journal.db

# List tables
.tables

# Query data
SELECT * FROM journal_entries;

# Exit
.exit
```

## System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: 2.0.0 or higher (optional, for Git integration)
- **OS**: Linux, macOS, or Windows
- **RAM**: 512MB minimum
- **Disk**: 100MB minimum

## Browser Support

The frontend works on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Next Steps

Once you have the app running:

1. **Create your first journal entry** - Click "Journal" and write something
2. **Set a goal** - Click "Goals" and create your first goal
3. **Add a habit** - Click "Habits" and set up a daily habit
4. **Generate insights** - After a few entries, click "Insights" and generate
5. **Explore analytics** - Check out the charts in "Analytics"

Enjoy your growth journey! 🚀
