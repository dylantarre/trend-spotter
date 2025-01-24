const API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

export async function searchTrendsByCategory(
  category?: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  if (!API_KEY) {
    return {
      results: [],
      error: 'API key not configured. Please check your environment variables.'
    };
  }

  try {
    let retries = 0;
    const maxRetries = 3;
    
    console.log(`Fetching ${category} trends...`);
    
    while (retries < maxRetries) {
      try {
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), 60000);

        // Combine timeout signal with passed signal
        const signals = [timeoutController.signal];
        if (signal) signals.push(signal);
        const combinedController = new AbortController();
        
        // If either signal aborts, abort the combined controller
        signals.forEach(s => {
          s.addEventListener('abort', () => combinedController.abort());
        });
        
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: combinedController.signal,
          body: JSON.stringify({
            model: 'sonar',
            messages: [{
              role: 'system', 
              content: `You are a TikTok trends analyzer. Return ONLY a raw JSON array of current ${category} trends, with NO markdown formatting or code blocks. Each trend must have: title (string), description (string), category (string), and engagement (number). Keep descriptions concise and engaging.`
            }, {
              role: 'user',
              content: `List current top TikTok ${category !== 'All' ? category + ' ' : ''}trends. Return ONLY a raw JSON array with NO markdown or code blocks. Example: [{"title": "...", "description": "...", "category": "...", "engagement": 1000000}]`
            }]
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit - wait and retry
            console.log('Rate limited, retrying...');
            await new Promise(resolve => setTimeout(resolve, 2000 * (retries + 1)));
            retries++;
            continue;
          }
          const errorText = await response.text();
          console.error('API Response:', errorText);
          throw new Error('Failed to fetch trends. Please try again.');
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
          console.error('API Response Data:', data);
          throw new Error('Received an invalid response. Please try refreshing.');
        }
        
        const content = data.choices[0].message.content.trim();
        let parsedContent;
        
        // Remove any markdown code block markers if present
        const cleanContent = content.replace(/^```json\n|\n```$/g, '');
        
        try {
          parsedContent = JSON.parse(cleanContent);
        } catch (e) {
          console.error('Invalid JSON:', cleanContent);
          throw new Error('Received malformed data. Please try again.');
        }
        
        if (!Array.isArray(parsedContent)) {
          console.error('Invalid response structure:', parsedContent);
          throw new Error('Received unexpected data format. Please try again.');
        }
        
        console.log(`Found ${parsedContent.length} ${category} trends`);
        
        return {
          results: parsedContent
        };
      } catch (innerError) {
        if (innerError.name === 'AbortError' || retries >= maxRetries - 1) {
          throw innerError;
        }
        retries++;
        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
      }
    }
    
    throw new Error('Failed to fetch after multiple attempts');
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        results: []
      };
    }
    
    if (error instanceof Error) {
      console.error(`API Error for ${category}:`, error.message);
    } else {
      console.error(`Unexpected API Error for ${category}:`, error);
    }
    return {
      results: [],
      error: error instanceof Error 
        ? error.message === 'Failed to fetch'
          ? 'Failed to connect to the API. Please try again.'
          : error.message
        : 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function searchTrends(
  category?: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  if (category && category !== 'All') {
    return searchTrendsByCategory(category, signal);
  }

  // For 'All', fetch a few key categories in parallel
  const keyCategories = ['Most Viral', 'Dance', 'Music', 'Comedy'];
  
  try {
    const results = await Promise.all(
      keyCategories.map(cat => 
        searchTrendsByCategory(cat, signal)
          .then(res => res.results)
          .catch(() => []) // Handle individual category failures gracefully
      )
    );
    
    // Combine and deduplicate results
    const allTrends = results.flat();
    const uniqueTrends = Array.from(
      new Map(allTrends.map(trend => [trend.title, trend])).values()
    );
    
    return {
      results: uniqueTrends.slice(0, 20) // Limit to top 20 trends
    };
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return {
      results: [],
      error: 'Failed to fetch trends across categories'
    };
  }
}