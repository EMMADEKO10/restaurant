const fs = require('fs');
const path = require('path');

// Création d'icônes PNG basiques avec Canvas API (si disponible) ou fallback
function createBasicIcon(size, filename) {
  // Pour l'instant, on va créer un fallback SVG qu'on peut convertir manuellement
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#f97316"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.3}" fill="white"/>
  <text x="${size/2}" y="${size/2 + size * 0.05}" font-family="Arial, sans-serif" font-size="${size * 0.2}" fill="#f97316" text-anchor="middle" dominant-baseline="middle">🍽️</text>
</svg>`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'public', filename), svgContent);
  console.log(`Icône ${filename} créée avec succès`);
}

// Générer les icônes
createBasicIcon(192, 'icon-192x192-backup.svg');
createBasicIcon(512, 'icon-512x512-backup.svg');

console.log('Script terminé. Convertissez les SVG en PNG avec un outil en ligne comme:');
console.log('- https://cloudconvert.com/svg-to-png');
console.log('- https://convertio.co/svg-png/');
console.log('- Ou utilisez Photoshop/GIMP'); 