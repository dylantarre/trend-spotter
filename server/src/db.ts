import Database from 'better-sqlite3';
import { Platform } from '../../src/types.js';

// Initialize database
const db = new Database('trends.db');

export interface DBTrend {
  id: number;
  title: string;
  description: string;
  category: string;
  platform: Platform;
  engagement: number;
  created_at: string;
  date: string;
  current_engagement?: number;
  rank: number;
  trend_direction: 'upward' | 'downward';
}

// Initialize database with tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    platform TEXT NOT NULL,
    engagement INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    date TEXT DEFAULT (date('now', 'localtime')) NOT NULL,
    rank INTEGER NOT NULL,
    trend_direction TEXT NOT NULL CHECK (trend_direction IN ('upward', 'downward')),
    UNIQUE(title, category)
  );

  CREATE TABLE IF NOT EXISTS trend_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trend_id INTEGER NOT NULL,
    engagement INTEGER NOT NULL,
    captured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trend_id) REFERENCES trends(id)
  );

  CREATE TABLE IF NOT EXISTS newsletter_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT,
    trend_category TEXT
  );
`);

// Create indexes if they don't exist
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_trends_platform ON trends(platform);
  CREATE INDEX IF NOT EXISTS idx_trends_category ON trends(category);
  CREATE INDEX IF NOT EXISTS idx_trends_created_at ON trends(created_at);
  CREATE INDEX IF NOT EXISTS idx_trends_date ON trends(date);
  CREATE INDEX IF NOT EXISTS idx_trend_history_trend_id ON trend_history(trend_id);
  CREATE INDEX IF NOT EXISTS idx_trend_history_captured_at ON trend_history(captured_at);
  CREATE INDEX IF NOT EXISTS idx_newsletter_signups_email ON newsletter_signups(email);
  CREATE INDEX IF NOT EXISTS idx_newsletter_signups_created_at ON newsletter_signups(created_at);
`);

// Get available dates for trends
export function getAvailableDates(): string[] {
  interface DateRow {
    date: string;
  }
  
  const rows = db.prepare(`
    SELECT DISTINCT date 
    FROM trends 
    ORDER BY date DESC
  `).all() as DateRow[];
  
  return rows.map(row => row.date);
}

// Get trends for a specific date (defaults to today)
export function getTrends(category?: string, date?: string): DBTrend[] {
  let query = `
    SELECT t.*,
           th.engagement as current_engagement
    FROM trends t
    LEFT JOIN (
      SELECT trend_id, engagement, captured_at,
             ROW_NUMBER() OVER (PARTITION BY trend_id ORDER BY captured_at DESC) as rn
      FROM trend_history
    ) th ON t.id = th.trend_id AND th.rn = 1
    WHERE t.date = COALESCE(?, date('now', 'localtime'))
  `;
  
  const params: (string | undefined)[] = [date];
  if (category && category !== 'All') {
    query += ` AND (LOWER(t.category) = LOWER(?) OR ? = 'Most Viral')`;
    params.push(category, category);
  }
  
  query += ` ORDER BY t.rank ASC`;
  
  const results = db.prepare(query).all(...params) as DBTrend[];
  console.log(`Found ${results.length} trends for category: ${category || 'All'}, date: ${date || 'today'}`);
  return results;
}

export function addTrend(trend: Omit<DBTrend, 'id' | 'created_at' | 'date'>): number {
  // First try to find if the trend already exists
  const existing = db.prepare(`
    SELECT id FROM trends 
    WHERE title = ? AND category = ? AND date = date('now', 'localtime')
  `).get(trend.title, trend.category) as { id: number } | undefined;

  if (existing) {
    // Update the existing trend
    db.prepare(`
      UPDATE trends 
      SET description = ?, platform = ?, engagement = ?, rank = ?, trend_direction = ?
      WHERE id = ?
    `).run(
      trend.description,
      trend.platform,
      trend.engagement,
      trend.rank,
      trend.trend_direction,
      existing.id
    );

    // Add trend history entry
    if (trend.engagement) {
      addTrendHistory(existing.id, trend.engagement);
    }

    return existing.id;
  }

  // Insert new trend if it doesn't exist
  const result = db.prepare(`
    INSERT INTO trends (title, description, category, platform, engagement, date, rank, trend_direction)
    VALUES (?, ?, ?, ?, ?, date('now', 'localtime'), ?, ?)
  `).run(
    trend.title,
    trend.description,
    trend.category,
    trend.platform,
    trend.engagement,
    trend.rank,
    trend.trend_direction
  );

  const trendId = result.lastInsertRowid as number;

  // Add initial trend history entry
  if (trend.engagement) {
    addTrendHistory(trendId, trend.engagement);
  }

  return trendId;
}

export function addTrendHistory(trendId: number, engagement: number): void {
  db.prepare(`
    INSERT INTO trend_history (trend_id, engagement)
    VALUES (?, ?)
  `).run(trendId, engagement);
}

export interface NewsletterSignup {
  email: string;
  name?: string;
  source?: string;
  trendCategory?: string;
}

export function addNewsletterSignup(signup: NewsletterSignup): number {
  try {
    const result = db.prepare(`
      INSERT INTO newsletter_signups (email, name, source, trend_category)
      VALUES (?, ?, ?, ?)
    `).run(
      signup.email,
      signup.name || null,
      signup.source || null,
      signup.trendCategory || null
    );

    return result.lastInsertRowid as number;
  } catch (error) {
    if ((error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Email already subscribed');
    }
    throw error;
  }
}

export function getNewsletterSignups(): NewsletterSignup[] {
  return db.prepare(`
    SELECT email, name, source, trend_category as trendCategory
    FROM newsletter_signups
    ORDER BY created_at DESC
  `).all() as NewsletterSignup[];
}

export default db; 