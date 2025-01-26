import { useState, useEffect } from 'react';
import { TrendResult, TrendCategory } from '../types';
import { searchTrends } from '../api/trends';

interface CacheEntry {
  data: TrendResult[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const trendsCache = new Map<string, CacheEntry>();

export function useTrendsCache(selectedCategory: TrendCategory) {
  const [trends, setTrends] = useState<TrendResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategory, setLoadingCategory] = useState<string>('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      // Cancel any ongoing requests
      if (abortController) {
        abortController.abort();
      }

      const newController = new AbortController();
      setAbortController(newController);

      // Check cache first
      const cacheKey = selectedCategory;
      const cached = trendsCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        setTrends(cached.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setLoadingCategory(selectedCategory);

      try {
        const { results, error } = await searchTrends(selectedCategory, newController.signal);

        // Check if this request was aborted
        if (newController.signal.aborted) {
          return;
        }

        if (error) {
          setError(error);
        } else {
          // Update cache
          trendsCache.set(cacheKey, {
            data: results,
            timestamp: now
          });
          setTrends(results);
        }
      } catch (error) {
        // Only set error if request wasn't aborted
        if (!newController.signal.aborted) {
          setError(error instanceof Error ? error.message : 'Failed to fetch trends');
        }
      } finally {
        // Only update loading states if this request wasn't aborted
        if (!newController.signal.aborted) {
          setLoading(false);
          setLoadingCategory('');
          setAbortController(null);
        }
      }
    }

    fetchTrends();

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [selectedCategory]);

  return { trends, loading, error, loadingCategory };
} 