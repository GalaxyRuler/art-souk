import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const translationKeys = new Set<string>();
  
  // Regex to match t('key') or t("key") calls
  const tFunctionRegex = /\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  
  function traverseDirectory(dir: string) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverseDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        let match;
        while ((match = tFunctionRegex.exec(content)) !== null) {
          translationKeys.add(match[1]);
        }
      }
    }
  }
  
  traverseDirectory(sourceDir);
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
      console.log('✅ English translations loaded');
    }
  } catch (error) {
    console.error(`❌ Error parsing ${enPath}:`, error);
    return false;
  }
  
  try {
    if (fs.existsSync(arPath)) {
      const arContent = fs.readFileSync(arPath, 'utf-8');
      arTranslations = JSON.parse(arContent);
      console.log('✅ Arabic translations loaded');
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
    unusedEnKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
    if (unusedEnKeys.length > 10) {
      console.log(`  ... and ${unusedEnKeys.length - 10} more`);
    }
    console.log();
  }
  
  if (unusedArKeys.length > 0) {
    console.log('⚠️  Unused Arabic translations:');
    unusedArKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
    if (unusedArKeys.length > 10) {
      console.log(`  ... and ${unusedArKeys.length - 10} more`);
    }
    console.log();
  }
  
  if (!hasErrors) {
    console.log('✅ All translation keys are properly defined!');
  }
  
  // Summary
  console.log('📊 Translation Summary:');
  console.log(`  - Used keys: ${usedKeys.length}`);
  console.log(`  - English keys: ${availableEnKeys.length}`);
  console.log(`  - Arabic keys: ${availableArKeys.length}`);
  console.log(`  - Missing English: ${missingEnKeys.length}`);
  console.log(`  - Missing Arabic: ${missingArKeys.length}`);
  console.log(`  - Unused English: ${unusedEnKeys.length}`);
  console.log(`  - Unused Arabic: ${unusedArKeys.length}`);
  
  return !hasErrors;
}

// ES module compatible execution check
if (process.argv[1] === __filename) {
  const success = validateTranslations();
  process.exit(success ? 0 : 1);
}

export { validateTranslations };