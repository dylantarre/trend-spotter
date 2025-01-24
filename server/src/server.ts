import express from 'express';
import cors from 'cors';
import { TrendResult } from '../../src/types';
import { getTrends, addTrend, getAvailableDates } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
    const mappedTrends = trends.map(trend => ({
      title: trend.title,
      description: trend.description,
      category: trend.category,
      platform: trend.platform,
      engagement: trend.current_engagement || trend.engagement,
      previousEngagement: trend.engagement
    }));

    res.json({ results: mappedTrends });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

app.post('/api/trends', async (req, res) => {
  try {
    const { title, description, category, platform, engagement } = req.body;
    
    const id = addTrend({ 
      title, 
      description, 
      category, 
      platform, 
      engagement 
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