import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QuestionForm from '@/components/QuestionForm';
import AnswerDisplay from '@/components/AnswerDisplay';
import RecentQuestions from '@/components/RecentQuestions';
import PatternBackground from '@/components/ui/pattern-background';
import { apiRequest } from '@/lib/queryClient';
import { Question, Answer } from '@/shared/schema';
import { Source } from '@/shared/types';
import { useToast } from '@/hooks/use-toast';
import { detectLanguage } from '@/lib/openai';
import { Sparkles, BookOpen, LightbulbIcon } from 'lucide-react';

const Home: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  const { data: answer, isLoading: answerLoading } = useQuery<Answer>({
    queryKey: [`/api/answers/question/${currentQuestion?.id}`],
    enabled: !!currentQuestion?.id,
  });

  const askQuestionMutation = useMutation({
    mutationFn: async (questionText: string) => {
      // Detect language before submitting
      const detectedLang = await detectLanguage(questionText);
      return apiRequest('POST', '/api/questions', { 
        text: questionText,
        language: detectedLang || 'en' // Default to English if detection fails
      });
    },
    onSuccess: async (response) => {
      const question = await response.json() as Question;
      setCurrentQuestion(question);
      // Invalidate the recent questions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/questions/recent'] });
      
      toast({
        title: 'Question submitted',
        description: 'We\'re processing your question...',
      });
    },
    onError: (error) => {
      console.error('Error submitting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit question. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ answerId, type, comment }: { answerId: number, type: string, comment?: string }) => 
      apiRequest('POST', '/api/feedback', { answerId, type, comment }),
    onSuccess: () => {
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted',
      });
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleQuestionSubmit = async (questionText: string) => {
    await askQuestionMutation.mutateAsync(questionText);
  };

  const handleQuestionClick = (question: Question) => {
    setCurrentQuestion(question);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProvideFeedback = async (type: 'positive' | 'negative' | 'report', comment?: string) => {
    if (!answer) return;
    
    await feedbackMutation.mutateAsync({ 
      answerId: answer.id, 
      type, 
      comment
    });
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-background dark:to-background/95">
      <PatternBackground className="opacity-30" />
      
      <div id="mainContent" className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <section id="userInterface" className="animate-fade-in">
          {/* Hero Section */}
          <div className="text-center mb-14">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Powered by OpenAI's GPT-4o</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Islamic Knowledge <span className="text-primary animate-glow">Assistant</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Ask questions about Islamic teachings and receive verified answers with authentic sources from the Quran and Sunnah.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto mb-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Authentic Sources</span>
              </div>
              <div className="flex items-center">
                <svg 
                  className="h-5 w-5 text-primary mr-2" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 10.75L10.2554 12.6783C10.6928 12.9442 11.2512 12.9673 11.7091 12.7385L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-sm text-muted-foreground">Multi-Language Support</span>
              </div>
              <div className="flex items-center">
                <LightbulbIcon className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-muted-foreground">AI-Powered Insights</span>
              </div>
            </div>
          </div>
          
          <QuestionForm 
            onQuestionSubmit={handleQuestionSubmit}
            isLoading={askQuestionMutation.isPending}
          />
          
          {currentQuestion && (
            <AnswerDisplay 
              questionId={currentQuestion?.id || 0}
              text={answer?.text || ""}
              sources={answer?.sources as Source[] || []}
              onProvideFeedback={handleProvideFeedback}
              isLoading={answerLoading}
            />
          )}
          
          <RecentQuestions onQuestionClick={handleQuestionClick} />
        </section>
      </div>
    </div>
  );
};

export default Home;
