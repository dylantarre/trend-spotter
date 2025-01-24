export type TrendCategory = 
  | 'All'
  | 'Dance'
  | 'Business'
  | 'Memes'
  | 'Music'
  | 'Fashion'
  | 'Challenges'
  | 'Educational'
  | 'Most Viral'
  | 'Food'
  | 'Gaming'
  | 'DIY'
  | 'Beauty'
  | 'Tech'
  | 'Sports'
  | 'Comedy'
  | 'Travel';

export type Platform = 
  | 'TikTok'
  | 'Instagram'

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