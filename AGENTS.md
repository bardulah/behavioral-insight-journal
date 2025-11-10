# Agent Handoff Document: behavioral-insight-journal

**Last Updated**: 2025-11-10
**Current Agent**: Gemini

---

## 🎯 1. Current Status

### Project Overview
This is a full-stack web application designed as a personal growth and journaling tool. It allows users to write journal entries, track moods, set goals, monitor habits, and receive AI-driven insights about their behavior. A unique feature is its ability to analyze the user's Git commit history.

### Deployment Status
*   **Status**: ✅ **LIVE**
*   **Platform**: Vercel
*   **Live URL**: [https://behavioral-insight-journal-eilqdpttf-mtsalts-projects.vercel.app](https://behavioral-insight-journal-eilqdpttf-mtsalts-projects.vercel.app)
*   **Note**: The Vercel deployment hosts the frontend. The backend API is serverless and runs as part of the same Vercel project.

### Technology Stack
*   **Monorepo**: npm workspaces
*   **Backend**: Node.js, TypeScript, Express
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS
*   **Database**: SQLite (data is stored within the Vercel deployment's ephemeral filesystem).

### Key Files
*   `INSTRUCTIONS.md`: User-facing guide on how to use the application.
*   `AGENTS.md`: This file.
*   `backend/.env`: **Contains the environment configuration for the backend.**
*   `package.json`: (Root) Defines the monorepo workspaces (`frontend`, `backend`).

---

## 🚀 2. Recommended Improvements

This section outlines potential future enhancements for the project.

1.  **Cloud Sync / Persistent Backend**: The current Vercel deployment uses an ephemeral filesystem, meaning user data is not persistent. The most critical improvement is to connect the backend to a persistent database (like the available Neon PostgreSQL) and implement user accounts to allow for data persistence and multi-device sync.
2.  **Integrations with Other Data Sources**: Expand beyond Git commits to integrate with other data sources like calendar events (Google Calendar), fitness trackers (Fitbit, Strava), or screen time APIs to provide a more holistic view of a user's behavior.
3.  **Natural Language Queries**: Implement a feature where users can ask natural language questions about their data, such as "When was I most productive last month?" or "What habits correlate with my best moods?".
4.  **Guided Journaling & Templates**: Add a library of guided journaling templates for specific goals, such as "Practicing Gratitude," "Overcoming Procrastination," or "Weekly Review."
5.  **Export/Import Functionality**: Allow users to export their entire journal data in a standard format (like JSON or Markdown) and import it back. This empowers users with full ownership of their data, which is crucial for a personal tool like this.

---

## 🤝 3. Agent Handoff Notes

### How to Work on This Project

*   **Running Locally**: This is a monorepo. To run it for development, navigate to the project root and run `npm install`, followed by `npm run dev`. This will start both the backend and frontend development servers concurrently.
*   **Deployment**: The application is deployed automatically by Vercel when changes are pushed to the GitHub repository.
*   **Configuration**: The backend configuration is stored in `backend/.env`. This file has been created and is ready for use.
*   **Data Persistence**: Be aware of the data persistence issue on the live Vercel deployment. The SQLite database will be wiped periodically. This must be addressed before the app can be used for real, persistent journaling.
*   **Updating Documentation**: If you make any user-facing changes, update the `INSTRUCTIONS.md` file. If you make significant architectural changes, update this `AGENTS.md` file.

### What to Watch Out For

*   **Monorepo Structure**: When adding dependencies, be sure to add them to the correct workspace (`frontend` or `backend`).
*   **Ephemeral Filesystem on Vercel**: This is the biggest limitation of the current deployment. This must be addressed before the app can be used for real journaling.
*   **Privacy**: The app is designed to be privacy-first. If a cloud backend is implemented, it should be designed with end-to-end encryption to maintain this core principle.