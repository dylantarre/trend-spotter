import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateFavicon() {
  const svgPath = join(__dirname, '../public/trend-spotter.svg');
  const pngPath = join(__dirname, '../public/trend-spotter.png');

  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Convert SVG to PNG with dimensions suitable for favicons
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(pngPath);

    console.log('Successfully generated PNG favicon');
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon(); 