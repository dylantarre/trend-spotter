import { fetchAllTrends } from '../src/scheduler/trend-fetcher';

console.log('Starting initial database population...');

fetchAllTrends()
  .then(() => {
    console.log('Successfully populated database with initial trends');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error populating database:', error);
    process.exit(1);
  }); 