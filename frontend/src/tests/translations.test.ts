import { describe, test, expect } from 'vitest';

const translationsMock: Record<string, Record<string, string>> = {
  en: {
    overview: 'Overview',
    operations: 'Operations Center',
    crowd: 'Crowd Intelligence',
    navigation: 'Navigation Center',
  },
  es: {
    overview: 'Resumen',
    operations: 'Centro de Operaciones',
    crowd: 'Inteligencia de Multitudes',
    navigation: 'Centro de Navegación',
  }
};

const translateHelper = (key: string, lang: 'en' | 'es'): string => {
  const dict = translationsMock[lang] || translationsMock['en'];
  return dict[key] || key;
};

describe('Translations Helper Verification', () => {
  test('should return correct english values for standard keys', () => {
    expect(translateHelper('overview', 'en')).toBe('Overview');
    expect(translateHelper('operations', 'en')).toBe('Operations Center');
  });

  test('should return correct spanish values for standard keys', () => {
    expect(translateHelper('overview', 'es')).toBe('Resumen');
    expect(translateHelper('operations', 'es')).toBe('Centro de Operaciones');
  });

  test('should fallback to input key if translation is not found', () => {
    expect(translateHelper('non_existent_key', 'en')).toBe('non_existent_key');
  });
});
