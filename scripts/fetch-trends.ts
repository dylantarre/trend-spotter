import chalk from 'chalk';
import ora from 'ora';
import { searchTrends } from '../src/api/perplexity';

async function fetchTrends() {
  console.log(chalk.blue('\n🔄 Starting TikTok trends fetch...\n'));

  const spinner = ora({
    text: 'Fetching trends from Perplexity API...',
    color: 'cyan'
  }).start();

  try {
    const startTime = Date.now();
    const { results, error } = await searchTrends('All');

    if (error) throw new Error(error);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    spinner.succeed(chalk.green('Successfully fetched trends'));
    
    console.log(chalk.gray('\nExecution Summary:'));
    console.log(chalk.gray('─────────────────'));
    console.log(`${chalk.cyan('Duration')}: ${duration}s`);
    console.log(`${chalk.cyan('Total Trends')}: ${results.length}`);
    
    console.log(chalk.green('\n✨ Trends fetch completed successfully!\n'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch trends'));
    console.error(chalk.red('\nError Details:'));
    console.error(chalk.red('─────────────'));
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

fetchTrends();