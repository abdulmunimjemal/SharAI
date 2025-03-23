import { apiRequest } from './queryClient';
import { VectorDocument } from '@/shared/types';

export async function searchVectorDb(query: string, limit: number = 5): Promise<VectorDocument[]> {
  try {
    const response = await apiRequest('POST', '/api/vector/search', { query, limit });
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching vector database:', error);
    throw new Error('Failed to search vector database');
  }
}

export async function addDocument(document: VectorDocument): Promise<{ id: string }> {
  try {
    const response = await apiRequest('POST', '/api/vector/documents', document);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding document to vector database:', error);
    throw new Error('Failed to add document to vector database');
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    await apiRequest('DELETE', `/api/vector/documents/${id}`, undefined);
  } catch (error) {
    console.error('Error deleting document from vector database:', error);
    throw new Error('Failed to delete document from vector database');
  }
}

export async function clearAllDocuments(): Promise<void> {
  try {
    await apiRequest('DELETE', '/api/vector/documents', undefined);
  } catch (error) {
    console.error('Error clearing vector database:', error);
    throw new Error('Failed to clear vector database');
  }
}
