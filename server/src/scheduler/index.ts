import { startTrendFetcher } from './trend-fetcher';

console.log('Starting trend fetcher service...');
startTrendFetcher();

// Keep the process alive
process.stdin.resume(); 