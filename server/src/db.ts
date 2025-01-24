import Database from 'better-sqlite3';
import { Platform } from '../../src/types';

// Drop existing database and create new one
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
}

// Drop existing tables if they exist
db.exec(`
  DROP TABLE IF EXISTS trend_history;
  DROP TABLE IF EXISTS trends;
`);

// Initialize database with tables
db.exec(`
  CREATE TABLE trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    platform TEXT NOT NULL,
    engagement INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    date TEXT DEFAULT (date('now', 'localtime')) NOT NULL
  );

  CREATE TABLE trend_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trend_id INTEGER NOT NULL,
    engagement INTEGER NOT NULL,
    captured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trend_id) REFERENCES trends(id)
  );
`);

// Create indexes for better performance
db.exec(`
  CREATE INDEX idx_trends_platform ON trends(platform);
  CREATE INDEX idx_trends_category ON trends(category);
  CREATE INDEX idx_trends_created_at ON trends(created_at);
  CREATE INDEX idx_trends_date ON trends(date);
  CREATE INDEX idx_trend_history_trend_id ON trend_history(trend_id);
  CREATE INDEX idx_trend_history_captured_at ON trend_history(captured_at);
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
    query += ` AND LOWER(t.category) = LOWER(?)`;
    params.push(category);
  }
  
  query += ` ORDER BY t.created_at DESC`;
  
  return db.prepare(query).all(...params) as DBTrend[];
}

export function addTrend(trend: Omit<DBTrend, 'id' | 'created_at' | 'date'>): number {
  const result = db.prepare(`
    INSERT INTO trends (title, description, category, platform, engagement, date)
    VALUES (?, ?, ?, ?, ?, date('now', 'localtime'))
  `).run(trend.title, trend.description, trend.category, trend.platform, trend.engagement);

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

export default db; 