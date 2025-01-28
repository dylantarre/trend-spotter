// Initial sample data
const trendsData = [
    {
        title: "AI Dance Choreography",
        description: "Creators using AI to generate unique dance moves",
        category: "Dance",
        platform: "TikTok",
        engagement: 850000,
        rank: 1,
        trendDirection: "upward"
    },
    {
        title: "Viral Recipe Hacks",
        description: "Quick and easy cooking hacks going viral",
        category: "Food",
        platform: "TikTok",
        engagement: 750000,
        rank: 2,
        trendDirection: "upward"
    },
    {
        title: "Tech Life Hacks",
        description: "Simple tech tips making everyday life easier",
        category: "Tech",
        platform: "TikTok",
        engagement: 650000,
        rank: 3,
        trendDirection: "upward"
    }
];
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const handler = async (event) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: corsHeaders,
            body: ''
        };
    }
    // Add CORS headers to all responses
    const headers = {
        'Content-Type': 'application/json',
        ...corsHeaders
    };
    try {
        if (event.httpMethod === 'GET') {
            const category = event.queryStringParameters?.category;
            let filteredTrends = trendsData;
            if (category && category !== 'All') {
                filteredTrends = trendsData.filter(trend => trend.category.toLowerCase() === category.toLowerCase() ||
                    category === 'Most Viral');
            }
            // Sort by engagement
            filteredTrends.sort((a, b) => (b.engagement || 0) - (a.engagement || 0));
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ results: filteredTrends })
            };
        }
        if (event.httpMethod === 'POST' && event.body) {
            const trend = JSON.parse(event.body);
            trendsData.push(trend);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ id: trendsData.length })
            };
        }
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
export { handler };
