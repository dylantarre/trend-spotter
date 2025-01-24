import schedule from 'node-schedule';
import { searchTrends as perplexitySearch } from '../perplexity';
import { TrendCategory } from '../../../src/types';
import { addTrend } from '../db';

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

async function fetchTrendsForCategory(category: TrendCategory) {
  try {
    const { results, error } = await perplexitySearch(category);
    if (error) throw new Error(error);

    for (const trend of results) {
      addTrend({
        title: trend.title,
        description: trend.description,
        category: category,
        platform: trend.platform,
        engagement: trend.engagement || 0
      });
    }

    console.log(`Processed ${results.length} trends for category: ${category}`);
  } catch (error) {
    console.error(`Error fetching trends for ${category}:`, error);
  }
}

export async function fetchAllTrends() {
  console.log('Starting trend fetch...');

  for (const category of TREND_CATEGORIES) {
    await fetchTrendsForCategory(category);
    // Add a delay between API calls to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('Completed trend fetch');
}

export function startTrendFetcher() {
  // Schedule trend fetching every 6 hours
  const job = schedule.scheduleJob('0 */6 * * *', async () => {
    console.log('Running scheduled trend fetch...');
    await fetchAllTrends();
  });

  // Run initial fetch
  fetchAllTrends();

  return job;
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down trend fetcher...');
  schedule.gracefulShutdown()
    .then(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Shutting down trend fetcher...');
  schedule.gracefulShutdown()
    .then(() => process.exit(0));
}); 