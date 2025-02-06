import { TrendResult, TrendCategory } from '../../src/types.js';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.PERPLEXITY_API_KEY;

console.log('API Key loaded:', API_KEY ? 'Present' : 'Missing');

export async function searchTrends(
  category: TrendCategory
): Promise<{ results: TrendResult[]; error?: string }> {
  console.log(`Fetching ${category} trends...`);
  
  try {
    console.log('Making API request...');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are a trend analysis expert. You must return a JSON array with EXACTLY this structure for each trend:
[
  {
    "title": "string",
    "description": "string",
    "category": "string",
    "platform": "TikTok",
    "engagement": number,
    "rank": number,
    "trendDirection": "upward" or "downward"
  }
]
Return EXACTLY 10 trends. No explanations, no markdown, no code blocks - just the raw JSON array.`
          },
          {
            role: 'user',
            content: `Return exactly 10 current TikTok ${category} trends as a raw JSON array. Each trend must have all required fields: title, description, category, platform (always "TikTok"), engagement (number between 10000-1000000), rank (1-10), and trendDirection ("upward" or "downward"). Return ONLY the JSON array - no other text, no markdown, no formatting.`
          }
        ],
        max_tokens: 1024
      })
    });

    console.log('API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    console.log('API Response Data:', JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }
    
    let content = data.choices[0].message.content.trim();
    console.log('Raw Content:', content);
    
    // More robust cleaning of the content
    content = content
      // Remove any markdown code block markers
      .replace(/```(?:json)?\s*/g, '')
      // Remove any text before the first [
      .replace(/^[^[]*(\[)/s, '$1')
      // Remove any text after the last ]
      .replace(/]([\s\S]*?)$/s, ']')
      // Remove any line breaks or extra whitespace
      .replace(/\n\s*/g, ' ')
      // Clean up any remaining whitespace
      .trim();
    
    console.log('Cleaned Content:', content);
    
    try {
      // First try to parse as is
      let parsedResults;
      try {
        parsedResults = JSON.parse(content);
      } catch (initialError) {
        console.log('Initial parse failed:', initialError);
        console.log('Attempting additional cleaning...');
        // If that fails, try additional cleaning
        content = content
          // Remove any trailing commas before closing brackets
          .replace(/,(\s*[\]}])/g, '$1')
          // Ensure property names are properly quoted
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
        console.log('Additional cleaning result:', content);
        parsedResults = JSON.parse(content);
      }
      
      // Validate the results
      if (!Array.isArray(parsedResults)) {
        throw new Error('Response is not an array');
      }

      // Strict validation of each trend object
      const requiredFields = ['title', 'description', 'platform', 'engagement', 'rank', 'trendDirection'];
      parsedResults.forEach((trend, index) => {
        requiredFields.forEach(field => {
          if (!(field in trend)) {
            throw new Error(`Missing required field "${field}" in trend at index ${index}`);
          }
        });
        
        if (typeof trend.engagement !== 'number') {
          throw new Error(`Invalid engagement value in trend at index ${index}: must be a number`);
        }
        
        if (typeof trend.rank !== 'number' || trend.rank < 1 || trend.rank > 10) {
          throw new Error(`Invalid rank value in trend at index ${index}: must be a number between 1 and 10`);
        }
        
        if (!['upward', 'downward'].includes(trend.trendDirection)) {
          throw new Error(`Invalid trendDirection in trend at index ${index}: must be "upward" or "downward"`);
        }
      });
      
      // Ensure each trend has the required fields and proper types
      const validatedResults: TrendResult[] = parsedResults.map(trend => ({
        title: String(trend.title || ''),
        description: String(trend.description || ''),
        category: category,
        platform: 'TikTok' as const,
        engagement: Number(trend.engagement) || 10000,
        rank: Number(trend.rank) || 1,
        trendDirection: trend.trendDirection === 'downward' ? 'downward' : 'upward'
      }));

      console.log('Successfully parsed results:', validatedResults.length, 'items');
      return { results: validatedResults };
    } catch (parseError) {
      console.error('Failed to parse response:', content, '\nError:', parseError);
      throw new Error('Invalid JSON response from API');
    }
  } catch (error) {
    console.error('Error fetching trends:', error);
    return { 
      results: [],
      error: error instanceof Error ? error.message : 'Failed to fetch trends'
    };
  }
} 