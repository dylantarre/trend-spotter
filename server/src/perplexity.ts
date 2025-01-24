import { TrendResult, TrendCategory } from '../../src/types';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.PERPLEXITY_API_KEY;

export async function searchTrends(
  category: TrendCategory
): Promise<{ results: TrendResult[]; error?: string }> {
  console.log(`Fetching ${category} trends...`);
  
  try {
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
            content: 'You are a trend analysis expert. Return EXACTLY 10 of today\'s most current trending topics as a JSON array. Each trend should have: title, description, category, platform (always "TikTok"), and engagement (a number between 10000 and 1000000). Focus on trends that are actively viral today.'
          },
          {
            role: 'user',
            content: `List exactly 10 of today's hottest TikTok ${category} trends that are currently viral. Return ONLY a JSON array with NO markdown or code blocks.`
          }
        ],
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response:', errorText);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }
    
    const content = data.choices[0].message.content.trim();
    // Remove any markdown code block markers if present
    const cleanContent = content.replace(/^```json\n|\n```$/g, '');
    
    try {
      return { results: JSON.parse(cleanContent) };
    } catch (_) {
      console.error('Failed to parse response:', cleanContent);
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