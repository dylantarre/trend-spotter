import { searchTrends } from '../perplexity.js';
import { addTrend } from '../db.js';
import { TrendCategory } from '../../../src/types.js';

const TREND_CATEGORIES: TrendCategory[] = [
  'Most Viral',
  'Memes',
  'Challenges',
  'Dance',
  'Music',
  'Fashion',
  'Beauty',
  'Food',
  'Sports',
  'DIY',
  'Comedy',
  'Lifestyle'
];

export async function populateFromPerplexity(): Promise<void> {
  console.log('Starting database population from Perplexity...');

  for (const category of TREND_CATEGORIES) {
    try {
      console.log(`Fetching ${category} trends...`);
      const { results, error } = await searchTrends(category);
      
      if (error) {
        console.error(`Error fetching ${category}:`, error);
        continue;
      }

      if (!results || results.length === 0) {
        console.log(`No results found for ${category}`);
        continue;
      }

      console.log(`Got ${results.length} results for ${category}`);

      for (const trend of results) {
        try {
          addTrend({
            title: trend.title,
            description: trend.description,
            category: category,
            platform: trend.platform,
            engagement: trend.engagement || 0,
            rank: results.indexOf(trend) + 1,
            trend_direction: trend.trendDirection || (Math.random() < 0.5 ? 'upward' : 'downward')
          });
        } catch (e) {
          console.error(`Error adding trend: ${trend.title}`, e);
        }
      }

      console.log(`Added ${results.length} trends for ${category}`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limiting
    } catch (e) {
      console.error(`Error processing category ${category}:`, e);
    }
  }

  console.log('Database population completed');
}

// Run if called directly
if (import.meta.url === new URL(import.meta.url).href) {
  console.log('Script starting...');
  populateFromPerplexity()
    .then(() => {
      console.log('Population completed successfully');
      process.exit(0);
    })
    .catch((error: Error) => {
      console.error('Population failed:', error);
      process.exit(1);
    });
} 