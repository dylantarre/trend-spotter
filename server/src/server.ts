import express from 'express';
import cors from 'cors';
import { getTrends, addTrend, getAvailableDates } from './db.js';
import type { DBTrend } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Get available dates
app.get('/api/trends/dates', async (req, res) => {
  try {
    const dates = getAvailableDates();
    res.json({ dates });
  } catch (error) {
    console.error('Error fetching dates:', error);
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

// Get trends with optional date and category filters
app.get('/api/trends', async (req, res) => {
  try {
    const { category, date } = req.query;
    const trends = getTrends(category as string, date as string);
    
    // Map DB trends to TrendResult format
    const mappedTrends = trends.map((trend: DBTrend) => ({
      title: trend.title,
      description: trend.description,
      category: trend.category,
      platform: trend.platform,
      engagement: trend.current_engagement || trend.engagement,
      previousEngagement: trend.engagement,
      rank: trend.rank,
      trendDirection: trend.trend_direction
    }));

    res.json({ results: mappedTrends });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

app.post('/api/trends', async (req, res) => {
  try {
    const { title, description, category, platform, engagement, rank, trendDirection } = req.body;
    
    const id = addTrend({ 
      title, 
      description, 
      category, 
      platform, 
      engagement,
      rank,
      trend_direction: trendDirection
    });

    res.json({ id });
  } catch (error) {
    console.error('Error adding trend:', error);
    res.status(500).json({ error: 'Failed to add trend' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 