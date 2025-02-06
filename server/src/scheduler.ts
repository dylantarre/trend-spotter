import schedule from 'node-schedule';
import { populateFromPerplexity } from './scripts/populate-from-perplexity.js';

console.log('Starting trend population scheduler...');

// Run once on startup
console.log('Running initial population...');
populateFromPerplexity()
  .then(() => console.log('Initial population completed'))
  .catch(error => console.error('Initial population failed:', error));

// Schedule daily run at 3 AM EST
// Note: EST is UTC-5, so 3 AM EST is 8 AM UTC
const rule = new schedule.RecurrenceRule();
rule.hour = 8; // 3 AM EST = 8 AM UTC
rule.minute = 0;
rule.tz = 'UTC';

schedule.scheduleJob(rule, async () => {
  console.log('Starting scheduled trend population...');
  try {
    await populateFromPerplexity();
    console.log('Scheduled population completed successfully');
  } catch (error) {
    console.error('Scheduled population failed:', error);
  }
}); 