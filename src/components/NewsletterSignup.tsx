import { useState } from 'react';
import { Bell } from 'lucide-react';
import { TrendCategory } from '../types';

interface NewsletterSignupProps {
  trendCategory?: TrendCategory;
}

export function NewsletterSignup({ trendCategory }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/newsletter/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source: 'trend_card',
          trendCategory
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSuccess(true);
      setEmail('');
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-pink-100">
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-900">Discover More Trends Like This</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Get weekly insights on emerging trends and viral content strategies.
            Join our community of trend-spotting creators!
          </p>
        </div>
        
        <div className="w-full md:w-auto min-w-[300px]">
          {success ? (
            <div className="text-green-600 font-medium">
              Thanks for subscribing! 🎉
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe for Updates'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 