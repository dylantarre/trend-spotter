import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const categories = [
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

    let totalTrends = 0;
    const processedCategories = [];

    for (const category of categories) {
      console.log(`Processing category: ${category}`);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{
            role: 'system',
            content: 'You are a TikTok trends analyzer. Return a JSON array of trends.'
          }, {
            role: 'user',
            content: `List current top TikTok ${category !== 'All' ? category + ' ' : ''}trends. Return ONLY a JSON array.`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const trends = JSON.parse(data.choices[0].message.content);

      totalTrends += trends.length;
      processedCategories.push(category);
      console.log(`Found ${trends.length} trends for ${category}`);

      for (const trend of trends) {
        // Check if trend exists
        const { data: existingTrend } = await supabaseClient
          .from('trends')
          .select('id')
          .eq('title', trend.title)
          .single();

        if (existingTrend) {
          // Update trend history
          await supabaseClient
            .from('trend_history')
            .insert({
              trend_id: existingTrend.id,
              engagement: trend.engagement
            });
        } else {
          // Insert new trend
          const { data: newTrend } = await supabaseClient
            .from('trends')
            .insert({
              title: trend.title,
              description: trend.description,
              category: trend.category,
              engagement: trend.engagement
            })
            .select('id')
            .single();

          // Create initial history record
          if (newTrend) {
            await supabaseClient
              .from('trend_history')
              .insert({
                trend_id: newTrend.id,
                engagement: trend.engagement
              });
          }
        }
      }
    }

    const summary = {
      success: true,
      categories: processedCategories,
      trendsCount: totalTrends,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});