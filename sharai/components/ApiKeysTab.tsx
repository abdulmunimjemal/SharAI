import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ApiKey } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const ApiKeysTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKeyService, setNewKeyService] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showKeyMap, setShowKeyMap] = useState<{[key: number]: boolean}>({});

  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ['/api/admin/api-keys'],
  });

  const addKeyMutation = useMutation({
    mutationFn: (newKey: {service: string, key: string}) => 
      apiRequest('POST', '/api/admin/api-keys', newKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      toast({
        title: 'Success',
        description: 'API key added successfully',
      });
      setIsAddDialogOpen(false);
      setNewKeyService('');
      setNewKeyValue('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add API key: ${error}`,
        variant: 'destructive',
      });
    }
  });

  const toggleKeyMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => 
      apiRequest('PATCH', `/api/admin/api-keys/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      toast({
        title: 'Success',
        description: 'API key status updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update API key: ${error}`,
        variant: 'destructive',
      });
    }
  });

  const toggleKeyVisibility = (id: number) => {
    setShowKeyMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddKey = () => {
    if (!newKeyService || !newKeyValue) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    addKeyMutation.mutate({ service: newKeyService, key: newKeyValue });
  };

  const toggleKeyStatus = (id: number, isActive: boolean) => {
    toggleKeyMutation.mutate({ id, isActive: !isActive });
  };

  const formatKeyForDisplay = (key: string, show: boolean) => {
    if (show) return key;
    const firstChars = key.substring(0, 4);
    const lastChars = key.substring(key.length - 4);
    return `${firstChars}${'•'.repeat(key.length - 8)}${lastChars}`;
  };

  const renderKeyCard = (apiKey: ApiKey) => {
    const isVisible = showKeyMap[apiKey.id] || false;
    
    return (
      <div key={apiKey.id} className="bg-muted rounded-lg p-5 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-foreground">
              {apiKey.service === 'openai' ? 'OpenAI API Key' : 
               apiKey.service === 'pinecone' ? 'Pinecone Vector DB Key' : 
               apiKey.service}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {apiKey.service === 'openai' ? 'Used for AI response generation' :
               apiKey.service === 'pinecone' ? 'Used for RAG document retrieval' :
               `Used for ${apiKey.service} integration`}
            </p>
          </div>
          <div className="flex items-center">
            <span className={`px-2 py-1 ${apiKey.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-xs rounded-md font-medium`}>
              {apiKey.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          <Input 
            type={isVisible ? "text" : "password"} 
            value={formatKeyForDisplay(apiKey.key, isVisible)}
            className="flex-grow bg-white px-4 py-2 text-sm"
            readOnly
          />
          <button 
            className="ml-2 p-2 text-gray-500 hover:text-primary transition-colors" 
            title="Show/Hide API Key"
            onClick={() => toggleKeyVisibility(apiKey.id)}
          >
            <i className={`ri-${isVisible ? 'eye-off' : 'eye'}-line`}></i>
          </button>
          <button 
            className="ml-1 p-2 text-gray-500 hover:text-primary transition-colors" 
            title={apiKey.isActive ? "Deactivate Key" : "Activate Key"}
            onClick={() => toggleKeyStatus(apiKey.id, apiKey.isActive)}
          >
            <i className={`ri-${apiKey.isActive ? 'close' : 'check'}-line`}></i>
          </button>
        </div>
        
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-md border border-gray-100">
            <p className="text-xs text-gray-500">Requests Today</p>
            <p className="text-lg font-semibold text-foreground">
              {Math.floor(Math.random() * 300)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-md border border-gray-100">
            <p className="text-xs text-gray-500">
              {apiKey.service === 'openai' ? 'Monthly Usage' : 
               apiKey.service === 'pinecone' ? 'Vectors Stored' : 
               'Usage Count'}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {apiKey.service === 'openai' ? `$${(Math.random() * 20).toFixed(2)}` : 
               apiKey.service === 'pinecone' ? `${Math.floor(Math.random() * 30000)}` : 
               apiKey.usageCount}
            </p>
          </div>
          <div className="bg-white p-3 rounded-md border border-gray-100">
            <p className="text-xs text-gray-500">
              {apiKey.service === 'openai' ? 'Rate Limit' : 
               apiKey.service === 'pinecone' ? 'Monthly Cost' : 
               'Last Used'}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {apiKey.service === 'openai' ? '3K/min' : 
               apiKey.service === 'pinecone' ? `$${(Math.random() * 10).toFixed(2)}` : 
               apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">API Configuration</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <i className="ri-add-line mr-1"></i> Add New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select value={newKeyService} onValueChange={setNewKeyService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="pinecone">Pinecone Vector DB</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="Enter API key"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddKey} disabled={addKeyMutation.isPending}>
                {addKeyMutation.isPending ? (
                  <span className="islamic-loader" style={{ width: '20px', height: '20px' }}></span>
                ) : (
                  'Add Key'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-muted rounded-lg p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="bg-white p-3 rounded-md border border-gray-100">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : apiKeys && apiKeys.length > 0 ? (
        <div>
          {apiKeys.map(renderKeyCard)}
        </div>
      ) : (
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-gray-500">No API keys found. Add your first key to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ApiKeysTab;
