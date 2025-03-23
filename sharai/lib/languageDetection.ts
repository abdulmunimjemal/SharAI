import { apiRequest } from './queryClient';

/**
 * Detects the language of the provided text
 * 
 * @param text The text to detect the language for
 * @returns A language code (e.g., 'en', 'ar', 'ur', 'fr')
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/language/detect', { text });
    const data = await response.json();
    return data.language;
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en'; // Default to English on error
  }
}

/**
 * Determines if the text is in a right-to-left language
 * 
 * @param languageCode The language code to check
 * @returns true if the language is RTL, false otherwise
 */
export function isRTL(languageCode: string): boolean {
  const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
  return rtlLanguages.includes(languageCode);
}

/**
 * Gets the appropriate font family based on the language
 * 
 * @param languageCode The language code
 * @param isHeading Whether the text is a heading
 * @returns The font family name
 */
export function getFontFamily(languageCode: string, isHeading = false): string {
  if (isRTL(languageCode)) {
    return isHeading ? 'Amiri, serif' : 'Noto Sans Arabic, sans-serif';
  }
  return isHeading ? 'Raleway, sans-serif' : 'Inter, sans-serif';
}
