export const TREND_CATEGORIES = [
  'All',
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