import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import type { Database } from '../src/types/supabase';
import ora from 'ora';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function fetchTrends() {
  console.log(chalk.blue('\n🔄 Starting TikTok trends fetch...\n'));

  const spinner = ora({
    text: 'Fetching trends from Perplexity API via Edge Function...',
    color: 'cyan'
  }).start();

  try {
    const startTime = Date.now();
    const { data, error } = await supabase.functions.invoke('fetch-trends', {
      method: 'POST'
    });

    if (error) throw error;

              console.log(`${chalk.cyan('Duration')}: ${duration}s`);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    spinner.succeed(chalk.green('Successfully fetched trends'));
    
    console.log(chalk.gray('\nExecution Summary:'));
    console.log(chalk.gray('─────────────────'));
    console.log(`${chalk.cyan('Duration')}: ${duration}s`);
    
    if (data?.categories) {
      console.log(`${chalk.cyan('Categories Processed')}: ${data.categories.join(', ')}`);
    }
    if (data?.trendsCount) {
      console.log(`${chalk.cyan('Total Trends Processed')}: ${data.trendsCount}`);
    }
    
    console.log(chalk.green('\n✨ Trends fetch completed successfully!\n'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch trends'));
    console.error(chalk.red('\nError Details:'));
    console.error(chalk.red('─────────────'));
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
      if (error.cause) {
        console.error(chalk.red(`Cause: ${JSON.stringify(error.cause)}`));
      }
    } else {
      console.error(chalk.red('Unknown error occurred:'), error);
    }
    process.exit(1);
  }
}

fetchTrends();