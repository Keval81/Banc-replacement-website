/**
 * PWA Icons Generator
 * 
 * This script creates placeholder SVG icons for development.
 * For production, replace these with actual PNG icons.
 * 
 * To generate PNGs from these SVGs, use:
 * - Online: https://convertio.co/svg-png/
 * - CLI: npx svg-to-png-cli
 * 
 * Or use a tool like:
 * - https://pwa-asset-generator.nicepkg.cn/
 * - https://www.pwabuilder.com/imageGenerator
 */

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgTemplate = (size: number) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1DBFDD;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0E8CAB;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#grad)"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="280" font-weight="bold" text-anchor="middle" fill="white">B</text>
</svg>`;

// Instructions for creating icons
console.log(`
PWA Icons Setup Instructions
=============================

1. Create the icons directory:
   mkdir -p public/icons

2. Generate SVG placeholders (optional - for development):
`);

iconSizes.forEach(size => {
  console.log(`   echo '${svgTemplate(size)}' > public/icons/icon-${size}x${size}.svg`);
});

console.log(`
3. Convert to PNG (recommended for production):
   
   Option A - Use a PWA asset generator:
   npx pwa-asset-generator public/banc-logo-blue.png public/icons
   
   Option B - Use online converter for each SVG
   
   Option C - Use Figma/Sketch to export at all sizes

4. Create additional icons:
   - public/icons/badge-72x72.png (for notifications)
   - public/icons/search-96x96.png (for shortcuts)
   - public/icons/valuation-96x96.png (for shortcuts)
   - public/icons/contact-96x96.png (for shortcuts)

5. Create screenshots for manifest:
   - public/screenshots/mobile-home.png (390x844)
   - public/screenshots/desktop-home.png (1280x720)

Recommended Tools:
- PWA Asset Generator: https://github.com/onderceylan/pwa-asset-generator
- Icon Converter: https://convertio.co/svg-png/
- Figma Plugin: "App Icon Generator"
`);
