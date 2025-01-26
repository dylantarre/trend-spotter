import { useState } from 'react';
import { TrendResult, TrendCategory } from '../types';
import { TrendingUp, Hash, BarChart3, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface TrendCardProps {
  trend: TrendResult;
  previousEngagement?: number;
  loading?: boolean;
}

function getTikTokSearchUrl(title: string): string {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(title)}`;
}

// Default image based on category
function getDefaultImage(category: TrendCategory): string {
  const images: Record<TrendCategory, string> = {
    'All': 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop',
    'Most Viral': 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop',
    'Dance': 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&auto=format&fit=crop',
    'Memes': 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&auto=format&fit=crop',
    'Comedy': 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&auto=format&fit=crop',
    'Music': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop',
    'Fashion': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
    'Educational': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop',
    'Food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
    'DIY': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&auto=format&fit=crop',
    'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop',
    'Tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    'Business': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
    'Challenges': 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop'
  };
  return images[category];
}

export function TrendCard({ trend, previousEngagement, loading }: TrendCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUpTrending = previousEngagement 
    ? trend.engagement && trend.engagement > previousEngagement
    : false;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-lg font-semibold text-gray-900">{trend.title}</h3>
              <div className="flex items-center space-x-2">
                {isUpTrending && (
                  <span className="inline-flex items-center text-green-500">
                    <TrendingUp className="w-5 h-5" />
                  </span>
                )}
                <a
                  href={getTikTokSearchUrl(trend.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-600 transition-colors"
                  title="Search on TikTok"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3 leading-relaxed">{trend.description}</p>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{trend.category}</span>
              {trend.engagement && (
                <div className="flex items-center ml-3 border-l border-gray-200 pl-3">
                  <BarChart3 className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-xs font-medium text-gray-500">
                    {trend.engagement.toLocaleString()} engagements
                  </span>
                </div>
              )}
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="relative w-full h-64 overflow-hidden">
            <img
              src={trend.imageUrl || getDefaultImage(trend.category)}
              alt={trend.title}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h4 className="text-white text-xl font-semibold mb-2">{trend.title}</h4>
              <p className="text-white/90 text-sm">{trend.description}</p>
            </div>
          </div>
          <div className="p-5 bg-gray-50">
            <h5 className="text-sm font-semibold text-gray-900 mb-2">Trend Details</h5>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Category:</span> {trend.category}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Platform:</span> {trend.platform}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Engagement:</span> {trend.engagement.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Trend Direction:</span>{' '}
                <span className={trend.trendDirection === 'upward' ? 'text-green-600' : 'text-red-600'}>
                  {trend.trendDirection === 'upward' ? '↑ Rising' : '↓ Falling'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}