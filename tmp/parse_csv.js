const fs = require('fs');

// Read the CSV file
const csv = fs.readFileSync('attached_assets/art-souk-translations (1)_1752124209958.csv', 'utf8');
const lines = csv.split('\n').filter(line => line.trim());

const translations = {};

// Parse each line
lines.forEach((line, index) => {
  if (line.trim() && !line.startsWith('Translation Key')) {
    // Simple CSV parser for our specific format
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last part
    parts.push(current.trim());
    
    if (parts.length >= 3) {
      const key = parts[0].trim();
      const arabic = parts[2].trim();
      
      // Remove quotes if present
      const cleanKey = key.replace(/^["']|["']$/g, '');
      const cleanArabic = arabic.replace(/^["']|["']$/g, '');
      
      if (cleanKey && cleanArabic) {
        // Convert dot notation to nested object
        const keys = cleanKey.split('.');
        let current = translations;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = cleanArabic;
      }
    }
  }
});

// Write the result
fs.writeFileSync('client/src/locales/ar.json', JSON.stringify(translations, null, 2));
console.log('Arabic translations updated successfully!');
console.log(`Processed ${Object.keys(translations).length} top-level categories`);