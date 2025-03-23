import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Question } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Clock, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentQuestionsProps {
  onQuestionClick: (question: Question) => void;
}

const RecentQuestions: React.FC<RecentQuestionsProps> = ({ onQuestionClick }) => {
  const { data: questions, isLoading, isError, refetch } = useQuery<Question[]>({
    queryKey: ['/api/questions/recent'],
  });

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto mt-16 animate-slide-up">
        <div className="grok-card bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive dark:text-destructive/90 font-medium mb-3">Failed to load recent questions. Please try again.</p>
          <Button 
            onClick={() => refetch()}
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 animate-slide-up">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
        <span className="bg-primary/10 text-primary p-1.5 rounded-md mr-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 10H16M8 14H13M20 6.8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H15.2C16.8802 2 17.7202 2 18.362 2.32698C18.9265 2.6146 19.3854 3.07354 19.673 3.63803C20 4.27976 20 5.11984 20 6.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        Recently Asked Questions
      </h2>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grok-card p-5 dark:bg-card/80">
              <div className="shimmer">
                <Skeleton className="h-6 w-3/4 mb-3 bg-muted" />
                <Skeleton className="h-4 w-full mb-4 bg-muted" />
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-3 w-24 bg-muted" />
                  <Skeleton className="h-3 w-16 bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {questions && questions.length > 0 ? (
            <div>
              {questions.map((question) => (
                <div 
                  key={question.id}
                  className="grok-card dark:bg-card/80 p-5 mb-4 cursor-pointer border border-border"
                  onClick={() => onQuestionClick(question)}
                >
                  <h3 className="font-medium text-foreground mb-3">
                    {question.text.length > 100 ? `${question.text.substring(0, 100)}...` : question.text}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-primary/70" /> 
                      {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                    <span className="mx-2 text-border dark:text-muted">•</span>
                    <span className="flex items-center">
                      <Eye className="h-3.5 w-3.5 mr-1.5 text-primary/70" /> 
                      {question.views} views
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-8">
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                  className="grok-button-outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Questions
                </Button>
              </div>
            </div>
          ) : (
            <div className="grok-card dark:bg-card/80 p-8 text-center border border-border">
              <svg className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-muted-foreground">No questions have been asked yet. Be the first to ask!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecentQuestions;
