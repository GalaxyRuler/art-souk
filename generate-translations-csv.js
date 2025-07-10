import fs from 'fs';
import path from 'path';

// Read the JSON files
const enTranslations = JSON.parse(fs.readFileSync('./client/src/locales/en.json', 'utf8'));
const arTranslations = JSON.parse(fs.readFileSync('./client/src/locales/ar.json', 'utf8'));

// Function to flatten nested JSON objects
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        // Store the value
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

// Function to escape CSV values
function escapeCSV(value) {
  if (typeof value !== 'string') {
    value = String(value);
  }
  
  // If value contains comma, newline, or quote, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    value = '"' + value.replace(/"/g, '""') + '"';
  }
  
  return value;
}

// Flatten both translation objects
const flatEnTranslations = flattenObject(enTranslations);
const flatArTranslations = flattenObject(arTranslations);

// Create CSV content
let csvContent = 'Translation Key,English Text,Arabic Text\n';

// Get all unique keys from both translations
const allKeys = new Set([...Object.keys(flatEnTranslations), ...Object.keys(flatArTranslations)]);

// Sort keys alphabetically for better organization
const sortedKeys = Array.from(allKeys).sort();

// Generate CSV rows
for (const key of sortedKeys) {
  const englishText = flatEnTranslations[key] || '';
  const arabicText = flatArTranslations[key] || '';
  
  // Only include rows that have at least one translation
  if (englishText || arabicText) {
    csvContent += `${escapeCSV(key)},${escapeCSV(englishText)},${escapeCSV(arabicText)}\n`;
  }
}

// Write the CSV file
fs.writeFileSync('translations.csv', csvContent, 'utf8');

console.log('CSV file created successfully!');
console.log(`Total translations: ${sortedKeys.length}`);
console.log('File saved as: translations.csv');