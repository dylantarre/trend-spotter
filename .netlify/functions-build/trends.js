// This would normally come from a database, but for now we'll store it in memory
// In production, you'd want to use Netlify KV Store or similar
let trendsData = [];
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const handler = async (event, context) => {
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
            const params = new URLSearchParams(event.queryStringParameters);
            const category = params.get('category');
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
