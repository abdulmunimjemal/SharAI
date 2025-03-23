import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Loader2, Info } from 'lucide-react';

const questionSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters").max(500, "Question cannot exceed 500 characters"),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  onQuestionSubmit: (question: string) => Promise<void>;
  isLoading: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onQuestionSubmit, isLoading }) => {
  const { toast } = useToast();
  
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
    },
  });

  const handleSubmit = async (values: QuestionFormValues) => {
    try {
      await onQuestionSubmit(values.text);
      // Clear the form after successful submission
      form.reset();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit question. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto mb-12 animate-slide-up">
      <div className="grok-card dark:bg-card/90 p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center">
          <span className="text-primary mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Ask Your Islamic Question
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Type your Islamic question here..."
                        className="grok-input dark:bg-muted/50 focus:animate-glow"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive mt-1" />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-muted-foreground text-sm flex items-center">
                <Info className="h-4 w-4 mr-1 text-primary" />
                <span>We'll respond in the same language you use</span>
              </div>
              <Button 
                type="submit" 
                className="grok-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default QuestionForm;
