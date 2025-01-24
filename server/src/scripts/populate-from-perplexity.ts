import { searchTrends } from '../perplexity';
import { addTrend } from '../db';
import { TrendCategory } from '../../../src/types';

const TREND_CATEGORIES: TrendCategory[] = [
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

async function populateFromPerplexity() {
  console.log('Starting database population from Perplexity...');

  for (const category of TREND_CATEGORIES) {
    console.log(`Fetching ${category} trends...`);
    const { results, error } = await searchTrends(category);
    
    if (error) {
      console.error(`Error fetching ${category}:`, error);
      continue;
    }

    for (const trend of results) {
      addTrend({
        title: trend.title,
        description: trend.description,
        category: trend.category,
        platform: trend.platform,
        engagement: trend.engagement || 0,
        rank: results.indexOf(trend) + 1,
        trend_direction: Math.random() < 0.5 ? 'upward' : 'downward' // Randomly assign trend direction for demo data
      });
    }

    console.log(`Added ${results.length} trends for ${category}`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limiting
  }

  console.log('Database population completed');
}

// Run if called directly
if (require.main === module) {
  populateFromPerplexity()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Population failed:', error);
      process.exit(1);
    });
} 