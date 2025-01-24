import { TrendResult } from '../types';

const API_URL = 'http://localhost:3001/api';

export async function searchTrends(
  category?: string,
  signal?: AbortSignal
): Promise<{ results: TrendResult[]; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') {
      params.append('category', category);
    }

    const response = await fetch(`${API_URL}/trends?${params}`, {
      signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trends');
    }

    const data = await response.json();
    
    // Sort trends by engagement
    if (data.results) {
      data.results.sort((a: TrendResult, b: TrendResult) => 
        (b.engagement || 0) - (a.engagement || 0)
      );
    }

    return data;
  } catch (error) {
    console.error('Error fetching trends:', error);
    return {
      results: [],
      error: error instanceof Error ? error.message : 'Failed to fetch trends'
    };
  }
}