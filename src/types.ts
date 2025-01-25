export const TREND_CATEGORIES = [
  'Dance',
  'Business',
  'Memes',
  'Music',
  'Fashion',
  'Challenges',
  'Educational',
  'Most Viral',
  'Food',
  'Gaming',
  'DIY',
  'Beauty',
  'Tech',
  'Sports',
  'Comedy',
  'Travel'
] as const;

export type TrendCategory = typeof TREND_CATEGORIES[number];

export type Platform = 'TikTok';

export interface TrendResult {
  title: string;
  description: string;
  category: TrendCategory;
  platform: Platform;
  engagement: number;
  previousEngagement?: number;
  rank: number;
  trendDirection: 'upward' | 'downward';
}

export interface SearchResponse {
  results: TrendResult[];
  error?: string;
}