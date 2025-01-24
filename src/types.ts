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

export interface TrendResult {
  title: string;
  description: string;
  category: string;
  engagement?: number;
}

export interface SearchResponse {
  results: TrendResult[];
  error?: string;
}