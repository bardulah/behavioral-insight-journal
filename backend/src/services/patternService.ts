import { db } from '../database/schema';
import type { Pattern } from '@growth-journal/types';
import { JournalService } from './journalService';
import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

export class PatternService {
  static getAll(): Pattern[] {
    const patterns = db.prepare(`
      SELECT * FROM patterns
      ORDER BY last_seen DESC
    `).all() as any[];

    return patterns.map(p => ({
      ...p,
      data: p.data ? JSON.parse(p.data) : null
    }));
  }

  static getById(id: number): Pattern | undefined {
    const pattern = db.prepare('SELECT * FROM patterns WHERE id = ?').get(id) as any;
    if (!pattern) return undefined;

    return {
      ...pattern,
      data: pattern.data ? JSON.parse(pattern.data) : null
    };
  }

  static create(pattern: Pattern): Pattern {
    const data = pattern.data ? JSON.stringify(pattern.data) : null;

    const result = db.prepare(`
      INSERT INTO patterns (
        pattern_type, title, description, confidence, frequency, data
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      pattern.pattern_type,
      pattern.title,
      pattern.description || null,
      pattern.confidence || 0,
      pattern.frequency || null,
      data
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static update(id: number, updates: Partial<Pattern>): Pattern | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const data = updates.data ? JSON.stringify(updates.data) : undefined;

    db.prepare(`
      UPDATE patterns
      SET confidence = COALESCE(?, confidence),
          frequency = COALESCE(?, frequency),
          data = COALESCE(?, data),
          last_seen = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      updates.confidence ?? null,
      updates.frequency || null,
      data || null,
      id
    );

    return this.getById(id);
  }

  static delete(id: number): boolean {
    const result = db.prepare('DELETE FROM patterns WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static analyzePatterns(): Pattern[] {
    const newPatterns: Pattern[] = [];

    // Analyze mood-time correlation
    const moodTimePattern = this.analyzeMoodTimePattern();
    if (moodTimePattern) {
      newPatterns.push(moodTimePattern);
    }

    // Analyze recurring themes
    const themePatterns = this.analyzeRecurringThemes();
    newPatterns.push(...themePatterns);

    // Analyze mood-energy correlation
    const moodEnergyPattern = this.analyzeMoodEnergyCorrelation();
    if (moodEnergyPattern) {
      newPatterns.push(moodEnergyPattern);
    }

    // Save or update patterns
    return newPatterns.map(pattern => {
      // Check if similar pattern already exists
      const existing = db.prepare(`
        SELECT id FROM patterns
        WHERE pattern_type = ? AND title = ?
      `).get(pattern.pattern_type, pattern.title) as any;

      if (existing) {
        return this.update(existing.id, pattern)!;
      } else {
        return this.create(pattern);
      }
    });
  }

  private static analyzeMoodTimePattern(): Pattern | null {
    const entries = db.prepare(`
      SELECT
        CAST(strftime('%H', created_at) AS INTEGER) as hour,
        AVG(mood) as avg_mood,
        COUNT(*) as count
      FROM journal_entries
      WHERE mood IS NOT NULL
      GROUP BY hour
      HAVING count >= 3
      ORDER BY avg_mood DESC
    `).all() as any[];

    if (entries.length < 3) return null;

    const bestTime = entries[0];
    const worstTime = entries[entries.length - 1];

    if (bestTime.avg_mood - worstTime.avg_mood < 1) return null;

    const period = bestTime.hour < 12 ? 'morning' : bestTime.hour < 17 ? 'afternoon' : 'evening';

    return {
      pattern_type: 'mood_time_correlation',
      title: `You shine in the ${period}`,
      description: `Your mood tends to be ${bestTime.avg_mood >= 4 ? 'great' : 'better'} around ${bestTime.hour}:00. Consider scheduling important tasks during this time!`,
      confidence: Math.min(0.9, entries.length / 20),
      frequency: 'recurring',
      data: {
        best_hour: bestTime.hour,
        avg_mood: bestTime.avg_mood,
        worst_hour: worstTime.hour
      }
    };
  }

  private static analyzeRecurringThemes(): Pattern[] {
    const entries = JournalService.getAll().slice(0, 50);
    if (entries.length < 5) return [];

    const patterns: Pattern[] = [];

    // Extract all text
    const texts = entries.map(e => e.content.toLowerCase());

    // Use TF-IDF to find important terms
    const tfidf = new TfIdf();
    texts.forEach(text => tfidf.addDocument(text));

    // Find common important terms across documents
    const termFrequency: { [key: string]: number } = {};

    tfidf.listTerms(0).slice(0, 20).forEach((item: any) => {
      termFrequency[item.term] = (termFrequency[item.term] || 0) + 1;
    });

    // Look for frequently mentioned topics
    const commonThemes = Object.entries(termFrequency)
      .filter(([term, freq]) => freq >= 3 && term.length > 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    commonThemes.forEach(([theme, frequency]) => {
      patterns.push({
        pattern_type: 'recurring_theme',
        title: `"${theme}" keeps coming up`,
        description: `You've mentioned "${theme}" in ${frequency} recent entries. This seems to be on your mind a lot. Want to explore this deeper?`,
        confidence: Math.min(0.8, frequency / 10),
        frequency: `${frequency} times in recent entries`,
        data: { theme, occurrences: frequency }
      });
    });

    return patterns;
  }

  private static analyzeMoodEnergyCorrelation(): Pattern | null {
    const entries = db.prepare(`
      SELECT mood, energy_level
      FROM journal_entries
      WHERE mood IS NOT NULL AND energy_level IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 30
    `).all() as any[];

    if (entries.length < 5) return null;

    // Calculate correlation
    const n = entries.length;
    let sumMood = 0, sumEnergy = 0, sumMoodEnergy = 0;
    let sumMoodSq = 0, sumEnergySq = 0;

    entries.forEach((e: any) => {
      sumMood += e.mood;
      sumEnergy += e.energy_level;
      sumMoodEnergy += e.mood * e.energy_level;
      sumMoodSq += e.mood * e.mood;
      sumEnergySq += e.energy_level * e.energy_level;
    });

    const correlation = (n * sumMoodEnergy - sumMood * sumEnergy) /
      Math.sqrt((n * sumMoodSq - sumMood * sumMood) * (n * sumEnergySq - sumEnergy * sumEnergy));

    if (Math.abs(correlation) < 0.5) return null;

    return {
      pattern_type: 'mood_energy_correlation',
      title: correlation > 0 ? 'Energy fuels your mood' : 'Mood independent of energy',
      description: correlation > 0
        ? 'Your mood tends to follow your energy levels. Taking care of your physical energy (sleep, exercise, nutrition) could boost your mood!'
        : 'Interesting! Your mood doesn\'t always match your energy. You might feel great even when tired, or vice versa.',
      confidence: Math.min(0.9, Math.abs(correlation)),
      frequency: 'consistent',
      data: { correlation: correlation.toFixed(2) }
    };
  }
}
