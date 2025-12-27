/**
 * Simple icon generator for the FocusTube extension
 * Creates PNG icons from an SVG template
 * 
 * Run with: node scripts/generate-icons.js
 * 
 * Note: This creates placeholder icons. For production, 
 * replace with properly designed icons.
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG icon template (play button with FocusTube styling)
const createSvgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff4444;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff6666;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#1a1a1a"/>
  <polygon 
    points="${size * 0.35} ${size * 0.2} ${size * 0.8} ${size * 0.5} ${size * 0.35} ${size * 0.8}" 
    fill="url(#grad)"
  />
</svg>`;

// Create SVG icons for different sizes
const sizes = [16, 32, 48, 128];

sizes.forEach((size) => {
  const svg = createSvgIcon(size);
  const filename = `icon${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Created: ${filename}`);
});

console.log('\nSVG icons created! For production, convert to PNG format.');
console.log('You can use tools like Inkscape, ImageMagick, or online converters.');
console.log('\nFor quick PNG conversion, run:');
console.log('  brew install librsvg');
console.log('  for size in 16 32 48 128; do');
console.log('    rsvg-convert -w $size -h $size icons/icon$size.svg > icons/icon$size.png');
console.log('  done');


