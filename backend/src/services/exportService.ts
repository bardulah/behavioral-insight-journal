import type { ExportFormat, ExportOptions } from '@growth-journal/types';
import { JournalService } from './journalService';
import { GoalService } from './goalService';
import { HabitService } from './habitService';
import { InsightService } from './insightService';
import { format } from 'date-fns';

export class ExportService {
  static async exportData(options: ExportOptions): Promise<string> {
    const data = await this.gatherData(options);

    switch (options.format) {
      case 'json':
        return this.exportJSON(data);
      case 'markdown':
        return this.exportMarkdown(data);
      case 'pdf':
        // PDF generation would need a library like pdfkit
        // For now, return formatted text that can be converted
        return this.exportMarkdown(data);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static async gatherData(options: ExportOptions) {
    const data: any = {
      exported_at: new Date().toISOString(),
      date_range: {
        from: options.date_from || 'all time',
        to: options.date_to || 'present',
      },
    };

    // Get journal entries
    let journals = JournalService.getAll();

    if (options.date_from || options.date_to) {
      const from = options.date_from || '1970-01-01';
      const to = options.date_to || new Date().toISOString();
      journals = JournalService.getByDateRange(from, to);
    }

    data.journals = journals;
    data.journal_stats = JournalService.getStats();

    // Optionally include goals
    if (options.include_goals) {
      data.goals = GoalService.getAll();
      data.goal_stats = GoalService.getStats();
    }

    // Optionally include habits
    if (options.include_habits) {
      data.habits = HabitService.getAll();
    }

    // Optionally include insights
    if (options.include_insights) {
      data.insights = InsightService.getAll();
    }

    return data;
  }

  private static exportJSON(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  private static exportMarkdown(data: any): string {
    let md = `# Growth Journal Export\n\n`;
    md += `Exported: ${format(new Date(data.exported_at), 'PPP')}\n\n`;

    md += `## Summary\n\n`;
    md += `- Total Entries: ${data.journal_stats.total_entries}\n`;
    md += `- Days Journaled: ${data.journal_stats.days_journaled}\n`;
    md += `- Current Streak: ${data.journal_stats.current_streak} days\n`;

    if (data.journal_stats.avg_mood) {
      md += `- Average Mood: ${data.journal_stats.avg_mood.toFixed(1)}/5\n`;
    }

    if (data.journal_stats.avg_energy) {
      md += `- Average Energy: ${data.journal_stats.avg_energy.toFixed(1)}/5\n`;
    }

    md += `\n---\n\n`;

    // Journal entries
    md += `## Journal Entries\n\n`;

    for (const entry of data.journals) {
      const date = format(new Date(entry.created_at), 'PPP');
      md += `### ${entry.title || 'Entry'} - ${date}\n\n`;

      if (entry.mood || entry.energy_level) {
        md += `**Mood:** ${entry.mood || 'N/A'}/5 | **Energy:** ${entry.energy_level || 'N/A'}/5\n\n`;
      }

      md += `${entry.content}\n\n`;

      if (entry.tags && entry.tags.length > 0) {
        md += `*Tags: ${entry.tags.join(', ')}*\n\n`;
      }

      md += `---\n\n`;
    }

    // Goals
    if (data.goals) {
      md += `## Goals\n\n`;

      for (const goal of data.goals) {
        md += `### ${goal.title} (${goal.status})\n\n`;

        if (goal.description) {
          md += `${goal.description}\n\n`;
        }

        md += `- Category: ${goal.category}\n`;
        md += `- Progress: ${goal.progress}%\n`;

        if (goal.target_date) {
          md += `- Target Date: ${format(new Date(goal.target_date), 'PPP')}\n`;
        }

        md += `\n`;
      }

      md += `---\n\n`;
    }

    // Habits
    if (data.habits) {
      md += `## Habits\n\n`;

      for (const habit of data.habits) {
        md += `### ${habit.icon} ${habit.name}\n\n`;

        if (habit.description) {
          md += `${habit.description}\n\n`;
        }

        md += `- Frequency: ${habit.frequency}\n`;
        md += `- Current Streak: ${habit.streak_count} days\n`;
        md += `- Best Streak: ${habit.best_streak} days\n`;
        md += `- Total Completions: ${habit.total_completions}\n\n`;
      }

      md += `---\n\n`;
    }

    // Insights
    if (data.insights) {
      md += `## Insights\n\n`;

      for (const insight of data.insights) {
        md += `### ${insight.title}\n\n`;
        md += `${insight.message}\n\n`;
        md += `*Type: ${insight.insight_type}*\n\n`;
      }
    }

    return md;
  }
}
