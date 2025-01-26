import { useState } from 'react';
import { TrendCategory } from './types';
import { TrendCard } from './components/TrendCard';
import { CategoryPills } from './components/CategoryPills';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useTrendsCache } from './hooks/useTrendsCache';

const TREND_CATEGORIES: TrendCategory[] = [
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
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory>('All');
  const { trends, loading, error, loadingCategory } = useTrendsCache(selectedCategory);

  const handleCategorySelect = (category: TrendCategory) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
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
        </div>

        <CategoryPills
          categories={TREND_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show cached results immediately while loading new ones */}
            {trends.map((trend) => (
              <TrendCard
                key={`${trend.title}-${trend.category}`}
                trend={trend}
                previousEngagement={trend.previousEngagement}
                loading={loading}
              />
            ))}
            
            {/* Show loading placeholders only when no cached data */}
            {loading && !trends.length && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
