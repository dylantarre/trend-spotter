import { Handler } from '@netlify/functions';
import { TrendResult, TrendCategory } from '../../src/types';

const TREND_CATEGORIES: TrendCategory[] = [
  'Most Viral',
  'Dance',
  'Memes',
  'Comedy',
  'Music',
  'Fashion',
  'Educational',
  'Food',
  'DIY',
  'Gaming',
  'Tech',
  'Business',
  'Challenges'
];

// Sample data generator
function generateSampleTrends(): TrendResult[] {
  const trends: TrendResult[] = [];
  
  TREND_CATEGORIES.forEach((category, categoryIndex) => {
    for (let i = 0; i < 5; i++) {
      trends.push({
        title: `${category} Trend ${i + 1}`,
        description: `This is a sample ${category.toLowerCase()} trend for testing purposes.`,
        category,
        platform: 'TikTok',
        engagement: Math.floor(Math.random() * 900000) + 100000,
        rank: i + 1,
        trendDirection: Math.random() > 0.5 ? 'upward' : 'downward'
      });
    }
  });

  return trends;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const sampleTrends = generateSampleTrends();
    
    // In a real implementation, you would store this data in a database or KV store
    // For now, we'll just return it
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Sample trends generated',
        count: sampleTrends.length,
        trends: sampleTrends
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate sample trends' })
    };
  }
}

export { handler }; 