export const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '简体中文 · Mandarin' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'es', label: 'Español' },
] as const;
export type Language = typeof languages[number]['code'];
export function isLanguage(value: unknown): value is Language {
  return languages.some(language => language.code === value);
}
export function validTranslation(value: unknown): value is { target: Language; texts: string[] } {
  if (!value || typeof value !== 'object') return false;
  const { target, texts } = value as Record<string, unknown>;
  return isLanguage(target) && Array.isArray(texts) && texts.length > 0 && texts.length <= 80 && texts.every(text => typeof text === 'string' && text.length > 0 && text.length <= 5000) && texts.join('').length <= 12000;
}
