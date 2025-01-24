import { useEffect, useState } from 'react';
import { TrendResult, TrendCategory } from './types';
import { searchTrends } from './api/perplexity';
import { TrendCard } from './components/TrendCard';
import { CategoryPills } from './components/CategoryPills';
import { TrendingUp, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

const TREND_CATEGORIES: TrendCategory[] = [
  'All',
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

function App() {
  const [trends, setTrends] = useState<TrendResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory>('All');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  async function fetchTrends() {
    // Cancel any ongoing requests
    abortController?.abort();
    const newController = new AbortController();
    setAbortController(newController);
    
    setLoading(true);
    setError(null);
    setLoadingCategory(selectedCategory);
    
    try {
      const { results, error } = await searchTrends(selectedCategory, newController.signal);
      if (error) {
        setError(error);
      } else {
        setTrends(results);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch trends');
    }
    
    setLoading(false);
    setLoadingCategory('');
    setAbortController(null);
  }

  useEffect(() => {
    fetchTrends();
    return () => {
      abortController?.abort();
    };
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-pink-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                TikTok Trends
                {loadingCategory && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    Loading {loadingCategory}...
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time trending topics on TikTok
              </p>
            </div>
          </div>
          <button
            onClick={fetchTrends}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 border border-gray-100"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>

        <CategoryPills
          categories={TREND_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {trends.map((trend, index) => (
              <TrendCard key={index} trend={trend} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
