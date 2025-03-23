import { apiRequest } from './queryClient';
import { Source } from '@shared/types';

export interface QuestionAnswerResponse {
  answer: string;
  sources: Source[];
}

export async function generateAnswer(questionId: number): Promise<QuestionAnswerResponse> {
  try {
    const response = await apiRequest('GET', `/api/answers/generate/${questionId}`, undefined);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating answer:', error);
    throw new Error('Failed to generate answer. Please try again.');
  }
}

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
