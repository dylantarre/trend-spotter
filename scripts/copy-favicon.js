import { copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copyFavicon() {
  const sourcePath = join(__dirname, '../public/trend-spotter.svg');
  const prodPath = join(__dirname, '../dist/trend-spotter.svg');

  try {
    copyFileSync(sourcePath, prodPath);
    console.log('Successfully copied favicon for production');
  } catch (error) {
    console.error('Error copying favicon:', error);
    process.exit(1);
  }
}

copyFavicon(); 