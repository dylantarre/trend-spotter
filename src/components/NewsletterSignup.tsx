import { Bell } from 'lucide-react';

export function NewsletterSignup() {
  return (
    <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-pink-100">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl font-semibold text-gray-900">Stay Ahead of TikTok Trends</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Get weekly insights on emerging trends, viral content strategies, and growth opportunities.
            Join {'>'}2,000 creators and marketers!
          </p>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="ml-embedded" data-form="WRVpg5"></div>
        </div>
      </div>
    </div>
  );
} 