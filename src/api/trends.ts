import { supabase } from './supabase';
import type { TrendResult } from '../types';

export async function getTrendHistory(
  category?: string,
  days: number = 7
): Promise<TrendResult[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query = supabase
    .from('trends')
    .select(`
      *,
      trend_history (
        engagement,
        captured_at
      )
    `)
    .gte('created_at', startDate.toISOString());

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching trend history:', error);
    throw new Error('Failed to fetch trend history');
  }

  return data.map(trend => ({
    title: trend.title,
    description: trend.description,
    category: trend.category,
    engagement: trend.trend_history?.[0]?.engagement || trend.engagement
  }));
}