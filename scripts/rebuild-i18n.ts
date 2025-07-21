#!/usr/bin/env npx tsx

import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(process.cwd(), 'client/src/locales');
const I18N_FILE = path.join(process.cwd(), 'client/src/lib/i18n.ts');

async function rebuildI18n() {
  try {
    console.log('🔧 Rebuilding i18n.ts file...');
    
    // Load current translations
    const enPath = path.join(LOCALES_DIR, 'en.json');
    const arPath = path.join(LOCALES_DIR, 'ar.json');
    
    const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const arTranslations = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
    
    // Create clean i18n.ts content
    const i18nContent = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const enResources = ${JSON.stringify(enTranslations, null, 2)};

// Arabic translations  
const arResources = ${JSON.stringify(arTranslations, null, 2)};

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en', // default language
    
    resources: {
      en: {
        translation: enResources
      },
      ar: {
        translation: arResources
      }
    },
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
`;

    // Write the clean file
    fs.writeFileSync(I18N_FILE, i18nContent);
    
    console.log('✅ i18n.ts file rebuilt successfully!');
    console.log('🗑️  Removed all duplicate properties');
    console.log('🚀 Clean translation system ready');
    
  } catch (error) {
    console.error('❌ Error rebuilding i18n.ts:', error);
    process.exit(1);
  }
}

rebuildI18n();