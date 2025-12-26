/**
 * Build script to copy non-TypeScript assets to dist folder
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Files to copy from root to dist
const filesToCopy = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'content-styles.css',
];

// Copy each file
filesToCopy.forEach((file) => {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Copy icons directory
const iconsDir = path.join(rootDir, 'icons');
const distIconsDir = path.join(distDir, 'icons');

if (fs.existsSync(iconsDir)) {
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir, { recursive: true });
  }
  
  fs.readdirSync(iconsDir).forEach((file) => {
    const src = path.join(iconsDir, file);
    const dest = path.join(distIconsDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copied: icons/${file}`);
  });
} else {
  console.warn('Warning: icons directory not found');
}

// Rename TypeScript outputs to match manifest expectations
const renames = [
  { from: 'background.js', to: 'background.js' },
  { from: 'content-script.js', to: 'content-script.js' },
  { from: 'popup.js', to: 'popup.js' },
  { from: 'options.js', to: 'options.js' },
];

renames.forEach(({ from, to }) => {
  const src = path.join(distDir, from);
  const dest = path.join(distDir, to);
  
  if (fs.existsSync(src) && from !== to) {
    fs.renameSync(src, dest);
    console.log(`Renamed: ${from} -> ${to}`);
  }
});

console.log('\nBuild complete! Load the extension from the "dist" folder.');

