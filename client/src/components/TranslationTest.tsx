import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function TranslationTest() {
  const { t, i18n, ready } = useTranslation();
  
  useEffect(() => {
    console.log('=== TRANSLATION DEBUG ===');
    console.log('Ready:', ready);
    console.log('Language:', i18n.language);
    console.log('Resources:', i18n.store.data);
    console.log('Has EN resources:', i18n.hasResourceBundle('en', 'translation'));
    console.log('EN translations:', i18n.getResourceBundle('en', 'translation'));
    console.log('Test key nav.home:', t('nav.home'));
    console.log('Direct access:', i18n.t('nav.home'));
    console.log('======================');
  }, [ready]);

  return (
    <div className="p-4 bg-yellow-100">
      <h3>Translation Test</h3>
      <p>Ready: {ready ? 'Yes' : 'No'}</p>
      <p>Language: {i18n.language}</p>
      <p>nav.home = {t('nav.home')}</p>
    </div>
  );
}
