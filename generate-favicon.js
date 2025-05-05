const svgToIco = require('svg-to-ico');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'src', 'assets', 'police-badge.svg');
const icoOutputPath = path.join(__dirname, 'src', 'favicon.ico');

console.log('Generating favicon.ico from SVG...');
console.log(`SVG source: ${svgPath}`);
console.log(`ICO destination: ${icoOutputPath}`);

// Ensure the SVG file exists
if (!fs.existsSync(svgPath)) {
  console.error('Error: SVG file not found!');
  process.exit(1);
}

// Convert SVG to ICO with multiple sizes
svgToIco(svgPath, icoOutputPath, {
  sizes: [16, 24, 32, 48, 64],
  resize: true
})
  .then(() => {
    console.log('Favicon generated successfully!');
  })
  .catch(err => {
    console.error('Error generating favicon:', err);
    process.exit(1);
  }); 