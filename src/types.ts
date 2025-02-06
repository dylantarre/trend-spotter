export const TREND_CATEGORIES = [
  'All',
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
  imageUrl?: string;
}

export interface SearchResponse {
  results: TrendResult[];
  error?: string;
}