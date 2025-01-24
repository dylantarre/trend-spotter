import Database from 'better-sqlite3';
import { TrendCategory } from '../../src/types';

const db = new Database('trends.db');

const categories: TrendCategory[] = [
  'All',
  'Most Viral',
  'Dance',
  'Memes',
  'Comedy',
  'Music',
  'Fashion',
  'Beauty',
  'Challenges',
  'Gaming',
  'Tech',
  'Business',
  'Educational',
  'Food',
  'DIY',
  'Sports',
  'Travel'
];

export async function populateDatabase() {
  try {
    // Insert categories
    const stmt = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
    
    for (const category of categories) {
      stmt.run(category);
    }
    
    console.log('Database populated with categories');
  } catch (error) {
    console.error('Error populating database:', error);
    throw error;
  }
}

// Run the population script if this file is executed directly
if (require.main === module) {
  populateDatabase();
} 