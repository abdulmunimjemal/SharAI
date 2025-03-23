import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feedback } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const FeedbackTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'report'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: feedbackList, isLoading } = useQuery<Feedback[]>({
    queryKey: ['/api/admin/feedback', { page, filter }],
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/admin/feedback/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feedback'] });
      toast({
        title: 'Success',
        description: 'Feedback deleted successfully',
      });
      setIsViewDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete feedback: ${error}`,
        variant: 'destructive',
      });
    }
  });

  const handleDeleteFeedback = (id: number) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      deleteFeedbackMutation.mutate(id);
    }
  };

  const viewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsViewDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    const typeStyles: {[key: string]: string} = {
      'positive': 'bg-green-100 text-green-700',
      'negative': 'bg-orange-100 text-orange-700',
      'report': 'bg-red-100 text-red-700'
    };

    const typeIcons: {[key: string]: string} = {
      'positive': 'ri-thumb-up-line',
      'negative': 'ri-thumb-down-line',
      'report': 'ri-flag-line'
    };

    return (
      <span className={`px-2 py-1 ${typeStyles[type] || 'bg-gray-100 text-gray-700'} text-xs rounded-md font-medium flex items-center w-fit`}>
        <i className={`${typeIcons[type] || 'ri-question-mark'} mr-1`}></i>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-foreground">User Feedback</h3>
        
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'positive' ? 'default' : 'outline'} 
            size="sm"
            className={filter === 'positive' ? 'bg-green-600 hover:bg-green-700' : ''}
            onClick={() => setFilter('positive')}
          >
            <i className="ri-thumb-up-line mr-1"></i> Positive
          </Button>
          <Button 
            variant={filter === 'negative' ? 'default' : 'outline'} 
            size="sm"
            className={filter === 'negative' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            onClick={() => setFilter('negative')}
          >
            <i className="ri-thumb-down-line mr-1"></i> Negative
          </Button>
          <Button 
            variant={filter === 'report' ? 'default' : 'outline'} 
            size="sm"
            className={filter === 'report' ? 'bg-red-600 hover:bg-red-700' : ''}
            onClick={() => setFilter('report')}
          >
            <i className="ri-flag-line mr-1"></i> Reports
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="mt-3">
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : feedbackList && feedbackList.length > 0 ? (
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <div 
              key={feedback.id} 
              className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 cursor-pointer hover:shadow-md transition-all"
              onClick={() => viewFeedback(feedback)}
            >
              <div className="flex justify-between items-start">
                <div>
                  {getTypeLabel(feedback.type)}
                  <p className="text-sm text-gray-500 mt-2">
                    <i className="ri-time-line mr-1"></i>
                    {new Date(feedback.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-gray-400">ID: {feedback.id}</p>
              </div>
              
              {feedback.comment && (
                <div className="mt-3 bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">{feedback.comment}</p>
                </div>
              )}
            </div>
          ))}
          
          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center space-x-2">
              <button 
                className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span className="text-xs font-medium">Page {page}</span>
              <button 
                className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                disabled={feedbackList.length < 10}
                onClick={() => setPage(p => p + 1)}
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
          <p className="text-gray-500">No feedback found for the selected filter.</p>
        </div>
      )}
      
      {/* View Feedback Dialog */}
      {selectedFeedback && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <div>{getTypeLabel(selectedFeedback.type)}</div>
                  <p className="text-xs text-gray-400">ID: {selectedFeedback.id}</p>
                </div>
              </div>
              
              <div className="grid gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Date & Time</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Answer ID</h4>
                  <p className="text-sm text-gray-600">
                    {selectedFeedback.answerId || 'N/A'}
                  </p>
                </div>
                
                {selectedFeedback.comment && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Comment</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">{selectedFeedback.comment}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                disabled={deleteFeedbackMutation.isPending}
              >
                {deleteFeedbackMutation.isPending ? (
                  <span className="islamic-loader" style={{ width: '20px', height: '20px' }}></span>
                ) : (
                  <>Delete</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FeedbackTab;
