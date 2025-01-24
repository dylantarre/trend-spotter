import { TrendResult } from '../types';
import { TrendingUp, Hash, BarChart3, ExternalLink } from 'lucide-react';

interface TrendCardProps {
  trend: TrendResult;
  previousEngagement?: number;
}

function getTikTokSearchUrl(title: string): string {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(title)}`;
}

export function TrendCard({ trend, previousEngagement }: TrendCardProps) {
  const isUpTrending = previousEngagement 
    ? trend.engagement && trend.engagement > previousEngagement
    : false;

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
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
          </div>
        </div>
      </div>
    </div>
  );
}