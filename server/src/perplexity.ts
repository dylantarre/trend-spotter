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
            content: 'You are a trend analysis expert. Return EXACTLY 10 of today\'s most current trending topics as a JSON array. Each trend should have: title, description, category, platform (always "TikTok"), engagement (a number between 10000 and 1000000), rank (1-10), and trendDirection ("upward" or "downward"). Focus on trends that are actively viral today.'
          },
          {
            role: 'user',
            content: `List exactly 10 of today's hottest TikTok ${category} trends that are currently viral. Include their rank and whether they are on an upward or downward trend. Return ONLY a JSON array with NO markdown or code blocks.`
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
    
    const content = data.choices[0].message.content.trim();
    console.log('Raw Content:', content);
    
    // Remove any markdown code block markers if present
    const cleanContent = content.replace(/^```json\n|\n```$/g, '');
    console.log('Cleaned Content:', cleanContent);
    
    try {
      const parsedResults = JSON.parse(cleanContent);
      console.log('Successfully parsed results:', parsedResults.length, 'items');
      return { results: parsedResults };
    } catch (error) {
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