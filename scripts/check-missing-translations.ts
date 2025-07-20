
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
