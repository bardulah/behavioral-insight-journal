import { db } from '../database/schema';
import { GitCommit } from '../types';
import simpleGit from 'simple-git';
import fs from 'fs';

export class GitService {
  static async importCommits(repoPath: string, days: number = 30): Promise<GitCommit[]> {
    if (!fs.existsSync(repoPath)) {
      throw new Error('Repository path does not exist');
    }

    const git = simpleGit(repoPath);

    // Check if it's a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a valid git repository');
    }

    // Get commits from the last N days
    const since = new Date();
    since.setDate(since.getDate() - days);

    const log = await git.log({
      '--since': since.toISOString(),
      '--all': true
    });

    const importedCommits: GitCommit[] = [];

    for (const commit of log.all) {
      // Check if commit already exists
      const existing = db.prepare(
        'SELECT id FROM git_commits WHERE commit_hash = ?'
      ).get(commit.hash);

      if (existing) continue;

      // Get commit details
      const diffSummary = await git.diffSummary([`${commit.hash}^!`]);

      const analysis = this.analyzeCommit(commit.message, diffSummary);

      const result = db.prepare(`
        INSERT INTO git_commits (
          commit_hash, message, author, date,
          files_changed, insertions, deletions, analysis
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        commit.hash,
        commit.message,
        commit.author_name,
        commit.date,
        diffSummary.files.length,
        diffSummary.insertions,
        diffSummary.deletions,
        JSON.stringify(analysis)
      );

      importedCommits.push({
        id: result.lastInsertRowid as number,
        commit_hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
        files_changed: diffSummary.files.length,
        insertions: diffSummary.insertions,
        deletions: diffSummary.deletions,
        analysis
      });
    }

    return importedCommits;
  }

  static getAll(): GitCommit[] {
    const commits = db.prepare(`
      SELECT * FROM git_commits
      ORDER BY date DESC
    `).all() as any[];

    return commits.map(c => ({
      ...c,
      analysis: c.analysis ? JSON.parse(c.analysis) : null
    }));
  }

  static getStats(): any {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_commits,
        SUM(files_changed) as total_files_changed,
        SUM(insertions) as total_insertions,
        SUM(deletions) as total_deletions,
        COUNT(DISTINCT author) as unique_authors
      FROM git_commits
    `).get();

    const recentActivity = db.prepare(`
      SELECT
        DATE(date) as date,
        COUNT(*) as commits,
        SUM(insertions + deletions) as changes
      FROM git_commits
      WHERE date >= datetime('now', '-30 days')
      GROUP BY DATE(date)
      ORDER BY date DESC
    `).all();

    return {
      ...stats,
      recent_activity: recentActivity
    };
  }

  private static analyzeCommit(message: string, diffSummary: any): any {
    const messageLower = message.toLowerCase();

    // Categorize commit
    let category = 'other';
    if (messageLower.includes('fix') || messageLower.includes('bug')) {
      category = 'bugfix';
    } else if (messageLower.includes('feat') || messageLower.includes('add')) {
      category = 'feature';
    } else if (messageLower.includes('refactor')) {
      category = 'refactor';
    } else if (messageLower.includes('test')) {
      category = 'test';
    } else if (messageLower.includes('doc')) {
      category = 'documentation';
    }

    // Calculate size
    const totalChanges = diffSummary.insertions + diffSummary.deletions;
    let size = 'small';
    if (totalChanges > 100) size = 'medium';
    if (totalChanges > 500) size = 'large';

    // Sentiment analysis (simple)
    const positiveWords = ['fix', 'improve', 'add', 'enhance', 'optimize'];
    const hasPositive = positiveWords.some(word => messageLower.includes(word));

    return {
      category,
      size,
      sentiment: hasPositive ? 'positive' : 'neutral',
      total_changes: totalChanges,
      file_types: this.extractFileTypes(diffSummary.files)
    };
  }

  private static extractFileTypes(files: any[]): string[] {
    const extensions = files
      .map(f => {
        const parts = f.file.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : 'no-ext';
      })
      .filter((ext, index, self) => self.indexOf(ext) === index);

    return extensions;
  }

  static getActivityInsights(): any {
    const stats = this.getStats();

    const insights = [];

    // Check commit frequency
    if (stats.recent_activity && stats.recent_activity.length > 0) {
      const avgCommitsPerDay = stats.total_commits / 30;

      if (avgCommitsPerDay >= 3) {
        insights.push({
          type: 'celebration',
          message: `You're coding consistently! ${avgCommitsPerDay.toFixed(1)} commits per day on average. 🚀`
        });
      } else if (avgCommitsPerDay < 1) {
        insights.push({
          type: 'encouragement',
          message: 'Small, regular commits can help build momentum. Even tiny progress counts!'
        });
      }
    }

    // Check recent productivity
    const last7Days = stats.recent_activity?.slice(0, 7) || [];
    if (last7Days.length >= 5) {
      insights.push({
        type: 'celebration',
        message: 'You\'ve been active in your codebase this week! Your consistency is impressive. 💪'
      });
    }

    return {
      stats,
      insights
    };
  }
}
