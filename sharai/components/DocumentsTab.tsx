import React, { useState, useRef, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, File, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Source } from '@shared/types';

const DocumentsTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importTab, setImportTab] = useState('paste');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New document state
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docType, setDocType] = useState('');
  const [docSources, setDocSources] = useState<Source[]>([]);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceText, setNewSourceText] = useState('');
  
  // No need to declare again as it's already defined above

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/admin/documents', { page }],
  });

  const addDocumentMutation = useMutation({
    mutationFn: (newDoc: { title: string, content: string, type: string, sources: Source[] }) => 
      apiRequest('POST', '/api/admin/documents', newDoc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      toast({
        title: 'Success',
        description: 'Document added successfully',
      });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add document: ${error}`,
        variant: 'destructive',
      });
    }
  });

  const importDocumentsMutation = useMutation({
    mutationFn: (documents: any[]) => {
      console.log(`Sending ${documents.length} documents to server, payload size:`, 
        JSON.stringify({ documents }).length);
      return apiRequest('POST', '/api/admin/documents/import', { documents });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      
      // Extract count if available in response
      let count = 0;
      try {
        if (data && typeof data === 'object' && 'count' in data) {
          count = (data as any).count;
        }
      } catch (e) {
        console.error('Error parsing response count:', e);
      }
      
      toast({
        title: 'Success',
        description: count 
          ? `${count} documents imported successfully` 
          : 'Documents imported successfully',
      });
      
      setImportJson('');
      setIsImportDialogOpen(false);
    },
    onError: (error) => {
      console.error('Import error:', error);
      
      let errorMessage = String(error);
      // Try to extract more details if available
      if (typeof error === 'object' && error !== null) {
        if ('message' in error) {
          errorMessage = String((error as any).message);
        } else if ('data' in error && typeof (error as any).data === 'object') {
          errorMessage = JSON.stringify((error as any).data);
        }
      }
      
      toast({
        title: 'Error',
        description: `Failed to import documents: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/admin/documents/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete document: ${error}`,
        variant: 'destructive',
      });
    }
  });

  const toggleDocumentStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => 
      apiRequest('PATCH', `/api/admin/documents/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      toast({
        title: 'Success',
        description: 'Document status updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update document status: ${error}`,
        variant: 'destructive',
      });
    }
  });

  const resetForm = () => {
    setDocTitle('');
    setDocContent('');
    setDocType('');
    setDocSources([]);
    setNewSourceTitle('');
    setNewSourceText('');
  };

  const handleAddSource = () => {
    if (!newSourceTitle.trim() || !newSourceText.trim()) {
      toast({
        title: 'Error',
        description: 'Source title and text are required',
        variant: 'destructive',
      });
      return;
    }
    
    setDocSources([...docSources, { title: newSourceTitle, text: newSourceText }]);
    setNewSourceTitle('');
    setNewSourceText('');
  };

  const removeSource = (index: number) => {
    setDocSources(docSources.filter((_, i) => i !== index));
  };

  const handleAddDocument = () => {
    if (!docTitle.trim() || !docContent.trim() || !docType || docSources.length === 0) {
      toast({
        title: 'Error',
        description: 'All fields are required and at least one source must be added',
        variant: 'destructive',
      });
      return;
    }
    
    addDocumentMutation.mutate({
      title: docTitle,
      content: docContent,
      type: docType,
      sources: docSources
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFileName(file.name);
    
    try {
      const fileContent = await file.text();
      setImportJson(fileContent);
      
      // Validate JSON format
      JSON.parse(fileContent);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Invalid JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      setUploadedFileName('');
    }
  };
  
  const handleImportDocuments = () => {
    if (importJson.trim() === '') {
      toast({
        title: 'Error',
        description: 'Please provide JSON data to import',
        variant: 'destructive',
      });
      return;
    }
    
    // Show processing toast
    toast({
      title: 'Processing',
      description: 'Parsing JSON data...',
    });
    
    try {
      console.log(`JSON data size: ${importJson.length} characters`);
      const parsed = JSON.parse(importJson);
      let documentsToImport: Array<any> = [];
      
      // Check if it's an array (first format)
      if (Array.isArray(parsed)) {
        console.log(`Importing array with ${parsed.length} documents`);
        documentsToImport = parsed;
        
        // Validate each document has required fields
        documentsToImport = parsed.filter(doc => {
          const isValid = doc && doc.title && doc.content && doc.type && Array.isArray(doc.sources);
          if (!isValid) {
            console.log('Skipping invalid document:', doc);
          }
          return isValid;
        });
        console.log(`${documentsToImport.length} valid documents found after filtering`);
      } 
      // Check if it's Islamic Q&A format (second format)
      else if (typeof parsed === 'object' && parsed !== null) {
        console.log(`Importing Islamic Q&A format with ${Object.keys(parsed).length} topics`);
        documentsToImport = processIslamicQAFormat(parsed);
      } else {
        throw new Error('Unsupported JSON format');
      }
      
      if (documentsToImport.length === 0) {
        throw new Error('No valid documents found to import');
      }
      
      // If there are too many documents, import in batches
      if (documentsToImport.length > 50) {
        console.log(`Large document set detected (${documentsToImport.length} items). Processing in batches.`);
        
        // Inform user about batch processing
        toast({
          title: 'Processing',
          description: `Processing ${documentsToImport.length} documents in smaller batches...`,
        });
        
        // Process first 50 documents to start
        const firstBatch = documentsToImport.slice(0, 50);
        console.log(`Importing first batch of ${firstBatch.length} documents`);
        importDocumentsMutation.mutate(firstBatch);
        
        // Show info for remaining documents
        toast({
          title: 'Note',
          description: `${documentsToImport.length - 50} additional documents can be imported in a separate operation`,
        });
      } else {
        console.log(`Importing ${documentsToImport.length} documents`);
        importDocumentsMutation.mutate(documentsToImport);
      }
      
      setUploadedFileName('');
    } catch (error) {
      console.error('Error during document import:', error);
      toast({
        title: 'Error',
        description: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };
  
  // Process Islamic Q&A format into standard document format
  const processIslamicQAFormat = (data: Record<string, any>): Array<any> => {
    const documents: Array<any> = [];
    console.log('Processing Islamic Q&A format data:', Object.keys(data).length, 'topics');
    
    // Iterate through each topic
    for (const topicId in data) {
      const topic = data[topicId];
      if (!topic.title || !topic.description || !Array.isArray(topic.questions)) {
        console.log(`Skipping invalid topic ${topicId}:`, topic);
        continue; // Skip invalid topics
      }
      
      console.log(`Processing topic ${topicId}: ${topic.title} with ${topic.questions.length} questions`);
      
      // Derive type from topic title or ID if possible
      let docType = 'fiqh'; // Default
      const typeKeywords: Record<string, string> = {
        'aqidah': 'aqidah',
        'belief': 'aqidah',
        'tawhid': 'aqidah',
        'fiqh': 'fiqh',
        'jurisprudence': 'fiqh',
        'family': 'family',
        'marriage': 'family',
        'worship': 'worship',
        'salah': 'worship',
        'prayer': 'worship',
        'quran': 'quran',
        'hadith': 'hadith',
        'sunnah': 'hadith',
        'ethics': 'ethics',
        'manners': 'ethics',
        'history': 'history'
      };
      
      // Try to determine a better type based on topic title
      const lowerTitle = topic.title.toLowerCase();
      for (const [keyword, type] of Object.entries(typeKeywords)) {
        if (lowerTitle.includes(keyword)) {
          docType = type;
          break;
        }
      }
      
      // Process each question in the topic
      topic.questions.forEach((question: any, index: number) => {
        if (!question.title || !question.question || !question.answer) {
          console.log(`Skipping invalid question in topic ${topicId} at index ${index}`);
          return; // Skip invalid questions
        }
        
        try {
          // Create a document for each question
          const document = {
            title: question.title.trim().substring(0, 200), // Limit title length
            content: question.question.trim() + "\n\n" + question.answer.trim(),
            type: docType,
            sources: [
              {
                title: topic.title,
                text: question.url || 'Source not provided'
              },
              {
                title: 'Description',
                text: topic.description
              }
            ]
          };
          
          // Add optional summary as a source if available
          if (question.summary) {
            document.sources.push({
              title: 'Summary',
              text: question.summary
            });
          }
          
          documents.push(document);
          console.log(`Added document: ${document.title.substring(0, 30)}...`);
        } catch (err) {
          console.error(`Error processing question in topic ${topicId} at index ${index}:`, err);
        }
      });
    }
    
    console.log(`Processed ${documents.length} documents from Islamic Q&A format`);
    return documents;
  };

  const handleExportDocuments = async () => {
    try {
      const response = await fetch('/api/admin/documents/export');
      if (!response.ok) throw new Error('Failed to export documents');
      
      const data = await response.json();
      const jsonStr = JSON.stringify(data, null, 2);
      
      // Create download link
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'islamic_qa_documents.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Documents exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to export documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const renderTypeLabel = (type: string) => {
    const typeColors: {[key: string]: string} = {
      'fiqh': 'bg-blue-100 text-blue-700',
      'aqidah': 'bg-purple-100 text-purple-700',
      'family': 'bg-purple-100 text-purple-700',
      'worship': 'bg-green-100 text-green-700',
      'quran': 'bg-amber-100 text-amber-700',
      'hadith': 'bg-teal-100 text-teal-700',
      'ethics': 'bg-cyan-100 text-cyan-700',
      'history': 'bg-orange-100 text-orange-700'
    };
    
    return (
      <span className={`px-2 py-1 ${typeColors[type] || 'bg-gray-100 text-gray-700'} text-xs rounded-md font-medium`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">Document Management</h3>
        <div className="flex space-x-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <i className="ri-upload-2-line mr-1"></i> Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Import Documents</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Tabs defaultValue="paste" value={importTab} onValueChange={setImportTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">Paste JSON</TabsTrigger>
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="paste" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Paste JSON</Label>
                      <Textarea 
                        value={importJson}
                        onChange={(e) => setImportJson(e.target.value)}
                        placeholder='[{"title": "Example", "content": "Content", "type": "fiqh", "sources": [{"title": "Source", "text": "Text"}]}]'
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload JSON File</Label>
                      <div 
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent/10 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadedFileName ? (
                          <div className="flex flex-col items-center">
                            <File className="h-10 w-10 text-primary mb-2" />
                            <p className="text-sm font-medium">{uploadedFileName}</p>
                            <p className="text-xs text-muted-foreground mt-1">Click to change file</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to upload JSON file</p>
                            <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept=".json" 
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="rounded-md bg-muted p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Supported Format
                  </h4>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      We support two JSON formats:
                    </p>
                    <p className="text-xs text-muted-foreground">
                      1. <span className="font-mono">Array of documents</span>: <span className="font-mono text-xs">[{"{title, content, type, sources}"}, ...]</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2. <span className="font-mono">Islamic Q&A format</span>:
                    </p>
                    <pre className="text-xs bg-background/80 p-2 rounded overflow-x-auto font-mono">
{`{
  "topic_id": {
    "title": "Topic Title",
    "description": "Topic Description",
    "questions": [
      {
        "url": "https://example.com/12345",
        "title": "Question Title",
        "question": "Question text",
        "answer": "Answer text",
        "summary": "Optional summary"
      },
      ...
    ]
  },
  ...
}`}
                    </pre>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleImportDocuments} disabled={importDocumentsMutation.isPending}>
                  {importDocumentsMutation.isPending ? (
                    <span className="islamic-loader" style={{ width: '20px', height: '20px' }}></span>
                  ) : (
                    'Import'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handleExportDocuments}>
            <i className="ri-download-line mr-1"></i> Export
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <i className="ri-add-line mr-1"></i> Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiqh">Fiqh</SelectItem>
                      <SelectItem value="aqidah">Aqidah</SelectItem>
                      <SelectItem value="quran">Quran</SelectItem>
                      <SelectItem value="hadith">Hadith</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="worship">Worship</SelectItem>
                      <SelectItem value="ethics">Ethics</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Document content"
                    className="min-h-[150px]"
                  />
                </div>
                
                <div className="space-y-2 border-t pt-4">
                  <Label>Sources</Label>
                  
                  {docSources.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {docSources.map((source, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-muted p-2 rounded-md">
                          <div className="flex-grow">
                            <p className="text-sm font-medium">{source.title}</p>
                            <p className="text-xs text-gray-500">{source.text}</p>
                          </div>
                          <button 
                            onClick={() => removeSource(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <Input
                          placeholder="Source title"
                          value={newSourceTitle}
                          onChange={(e) => setNewSourceTitle(e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Source text"
                            value={newSourceText}
                            onChange={(e) => setNewSourceText(e.target.value)}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            onClick={handleAddSource}
                          >
                            <i className="ri-add-line"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Add at least one source reference for this document.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddDocument} disabled={addDocumentMutation.isPending}>
                  {addDocumentMutation.isPending ? (
                    <span className="islamic-loader" style={{ width: '20px', height: '20px' }}></span>
                  ) : (
                    'Add Document'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sources</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-20 mt-1" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{doc.title}</div>
                      <div className="text-xs text-muted-foreground">ID: doc_{doc.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderTypeLabel(doc.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {Array.isArray(doc.sources) ? doc.sources.length : 0} references
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 ${doc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-xs rounded-md font-medium`}>
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 
                       doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        className="text-primary hover:text-primary/80 mr-2"
                        onClick={() => toggleDocumentStatusMutation.mutate({ id: doc.id, isActive: !doc.isActive })}
                        disabled={toggleDocumentStatusMutation.isPending}
                      >
                        <i className={`ri-${doc.isActive ? 'pause' : 'play'}-line`}></i>
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this document?')) {
                            deleteDocumentMutation.mutate(doc.id);
                          }
                        }}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No documents found. Add some documents to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-muted px-6 py-3 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {documents?.length || 0} of {documents?.length || 0} documents
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 rounded hover:bg-accent text-foreground disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <span className="text-xs font-medium">Page {page}</span>
            <button 
              className="p-1 rounded hover:bg-accent text-foreground disabled:opacity-50"
              disabled={documents && documents.length < 10}
              onClick={() => setPage(p => p + 1)}
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
