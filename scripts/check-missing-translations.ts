
#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface TranslationKeys {
  [key: string]: string | TranslationKeys;
}

function flattenKeys(obj: TranslationKeys, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      keys.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...flattenKeys(value, fullKey));
    }
  }
  
  return keys;
}

function extractTranslationKeysFromFiles(sourceDir: string): string[] {
  const files = glob.sync('**/*.{ts,tsx}', { cwd: sourceDir });
  const translationKeys = new Set<string>();
  
  // Regex to match t('key') or t("key") calls
  const tFunctionRegex = /\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  
  files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    let match;
    while ((match = tFunctionRegex.exec(content)) !== null) {
      translationKeys.add(match[1]);
    }
  });
  
  return Array.from(translationKeys);
}

function validateTranslations() {
  console.log('🔍 Checking translation keys...\n');
  
  const sourceDir = path.join(process.cwd(), 'client/src');
  const localesDir = path.join(sourceDir, 'locales');
  
  // Extract keys from source files
  const usedKeys = extractTranslationKeysFromFiles(sourceDir);
  console.log(`Found ${usedKeys.length} translation keys in source files`);
  
  // Load translation files
  const enPath = path.join(localesDir, 'en.json');
  const arPath = path.join(localesDir, 'ar.json');
  
  let enTranslations: TranslationKeys = {};
  let arTranslations: TranslationKeys = {};
  
  try {
    if (fs.existsSync(enPath)) {
      const enContent = fs.readFileSync(enPath, 'utf-8');
      enTranslations = JSON.parse(enContent);
    }
  } catch (error) {
    console.error(`❌ Error parsing ${enPath}:`, error);
    return false;
  }
  
  try {
    if (fs.existsSync(arPath)) {
      const arContent = fs.readFileSync(arPath, 'utf-8');
      arTranslations = JSON.parse(arContent);
    }
  } catch (error) {
    console.error(`❌ Error parsing ${arPath}:`, error);
    return false;
  }
  
  // Flatten available keys
  const availableEnKeys = flattenKeys(enTranslations);
  const availableArKeys = flattenKeys(arTranslations);
  
  console.log(`English translations: ${availableEnKeys.length} keys`);
  console.log(`Arabic translations: ${availableArKeys.length} keys\n`);
  
  // Check for missing keys
  const missingEnKeys = usedKeys.filter(key => !availableEnKeys.includes(key));
  const missingArKeys = usedKeys.filter(key => !availableArKeys.includes(key));
  
  let hasErrors = false;
  
  if (missingEnKeys.length > 0) {
    console.log('❌ Missing English translations:');
    missingEnKeys.forEach(key => console.log(`  - ${key}`));
    console.log();
    hasErrors = true;
  }
  
  if (missingArKeys.length > 0) {
    console.log('❌ Missing Arabic translations:');
    missingArKeys.forEach(key => console.log(`  - ${key}`));
    console.log();
    hasErrors = true;
  }
  
  // Check for unused keys
  const unusedEnKeys = availableEnKeys.filter(key => !usedKeys.includes(key));
  const unusedArKeys = availableArKeys.filter(key => !usedKeys.includes(key));
  
  if (unusedEnKeys.length > 0) {
    console.log('⚠️  Unused English translations:');
    unusedEnKeys.forEach(key => console.log(`  - ${key}`));
    console.log();
  }
  
  if (unusedArKeys.length > 0) {
    console.log('⚠️  Unused Arabic translations:');
    unusedArKeys.forEach(key => console.log(`  - ${key}`));
    console.log();
  }
  
  if (!hasErrors) {
    console.log('✅ All translation keys are properly defined!');
  }
  
  return !hasErrors;
}

if (require.main === module) {
  const success = validateTranslations();
  process.exit(success ? 0 : 1);
}

export { validateTranslations };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract translation keys from source files
function extractTranslationKeys(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /t\(['"`]([^'"`]+)['"`]\)/g;
  const keys: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }
  
  return keys;
}

// Function to recursively find TypeScript/React files
function findSourceFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main validation function
function validateTranslations() {
  console.log('🔍 Checking translation keys...\n');
  
  // Load locale files
  const enPath = path.join(__dirname, '../client/src/locales/en.json');
  const arPath = path.join(__dirname, '../client/src/locales/ar.json');
  
  let enTranslations: any = {};
  let arTranslations: any = {};
  
  try {
    enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    console.log('✅ English translations loaded');
  } catch (error) {
    console.error('❌ Failed to load English translations:', error.message);
    return;
  }
  
  try {
    arTranslations = JSON.parse(fs.readFileSync(arPath, 'utf8'));
    console.log('✅ Arabic translations loaded');
  } catch (error) {
    console.error('❌ Failed to load Arabic translations:', error.message);
    return;
  }
  
  // Find all source files
  const clientDir = path.join(__dirname, '../client/src');
  const sourceFiles = findSourceFiles(clientDir);
  
  // Extract all translation keys
  const allKeys = new Set<string>();
  
  for (const file of sourceFiles) {
    const keys = extractTranslationKeys(file);
    keys.forEach(key => allKeys.add(key));
  }
  
  console.log(`\n📊 Found ${allKeys.size} unique translation keys in source code`);
  
  // Check for missing keys
  const missingEnKeys: string[] = [];
  const missingArKeys: string[] = [];
  
  for (const key of allKeys) {
    if (!getNestedValue(enTranslations, key)) {
      missingEnKeys.push(key);
    }
    if (!getNestedValue(arTranslations, key)) {
      missingArKeys.push(key);
    }
  }
  
  // Report results
  if (missingEnKeys.length === 0 && missingArKeys.length === 0) {
    console.log('🎉 All translation keys are present!');
  } else {
    if (missingEnKeys.length > 0) {
      console.log(`\n❌ Missing English translations (${missingEnKeys.length}):`);
      missingEnKeys.forEach(key => console.log(`  - ${key}`));
    }
    
    if (missingArKeys.length > 0) {
      console.log(`\n❌ Missing Arabic translations (${missingArKeys.length}):`);
      missingArKeys.forEach(key => console.log(`  - ${key}`));
    }
    
    process.exit(1);
  }
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

validateTranslations();
