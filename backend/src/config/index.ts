import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Configuration schema with validation
const configSchema = z.object({
  // Server configuration
  port: z.number().int().positive().default(5000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),

  // Database configuration
  databasePath: z.string().default('./data/journal.db'),

  // Security configuration
  corsOrigin: z.string().default('http://localhost:3000'),
  rateLimitWindowMs: z.number().int().positive().default(15 * 60 * 1000), // 15 minutes
  rateLimitMax: z.number().int().positive().default(100), // requests per window

  // Feature flags
  features: z.object({
    gitIntegration: z.boolean().default(true),
    achievements: z.boolean().default(true),
    advancedAnalytics: z.boolean().default(true),
    export: z.boolean().default(true),
  }).default({}),

  // AI/NLP configuration
  nlp: z.object({
    enableSentiment: z.boolean().default(true),
    enablePatternDetection: z.boolean().default(true),
    minConfidence: z.number().min(0).max(1).default(0.6),
  }).default({}),
});

// Parse and validate configuration
function loadConfig() {
  const rawConfig = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databasePath: process.env.DATABASE_PATH || './data/journal.db',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    features: {
      gitIntegration: process.env.FEATURE_GIT_INTEGRATION !== 'false',
      achievements: process.env.FEATURE_ACHIEVEMENTS !== 'false',
      advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS !== 'false',
      export: process.env.FEATURE_EXPORT !== 'false',
    },
    nlp: {
      enableSentiment: process.env.NLP_SENTIMENT !== 'false',
      enablePatternDetection: process.env.NLP_PATTERN_DETECTION !== 'false',
      minConfidence: parseFloat(process.env.NLP_MIN_CONFIDENCE || '0.6'),
    },
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid configuration');
    }
    throw error;
  }
}

export const config = loadConfig();

export type Config = z.infer<typeof configSchema>;
