import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Source } from '@shared/types';
import { AnimatedResponse, ThinkingAnimation } from '@/components/ui/AnimatedResponse';
import { motion } from 'framer-motion';

interface AnswerDisplayProps {
  questionId: number;
  text: string;
  sources: Source[];
  onProvideFeedback: (type: 'positive' | 'negative' | 'report', comment?: string) => Promise<void>;
  isLoading?: boolean;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ 
  questionId, 
  text, 
  sources, 
  onProvideFeedback,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = () => {
    const content = `${text}\n\nSources:\n${sources.map(source => `- ${source.title}: ${source.text}`).join('\n')}`;
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      toast({
        title: 'Copied!',
        description: 'Answer copied to clipboard',
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Islamic Q&A Answer',
        text: `${text.substring(0, 100)}...`,
        url: `${window.location.origin}?q=${questionId}`,
      }).catch(error => console.log('Error sharing', error));
    } else {
      handleCopy();
    }
  };

  const handleFeedback = async (type: 'positive' | 'negative') => {
    try {
      await onProvideFeedback(type);
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    }
  };

  const handleReportSubmit = async () => {
    if (!reportText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onProvideFeedback('report', reportText);
      setShowReport(false);
      setReportText('');
      toast({
        title: 'Report submitted',
        description: 'Thank you for helping us improve',
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const paragraphs = text.split('\n\n');

  return (
    <motion.div 
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Generating Answer</h2>
          </div>
          <ThinkingAnimation 
            color="#8a6eff" 
            isActive={true}
            className="my-8 flex justify-center"
          />
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Searching through Islamic sources to provide an accurate answer...
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Answer</h2>
            <div className="flex space-x-2">
              <button 
                className="text-gray-500 hover:text-primary transition-colors" 
                title="Copy to clipboard"
                onClick={handleCopy}
              >
                <i className={`${isCopied ? 'ri-check-line' : 'ri-file-copy-line'} text-lg`}></i>
              </button>
              <button 
                className="text-gray-500 hover:text-primary transition-colors" 
                title="Share answer"
                onClick={handleShare}
              >
                <i className="ri-share-line text-lg"></i>
              </button>
            </div>
          </div>
          
          <AnimatedResponse
            text={text}
            typingSpeed={15}
            highlighted={true}
            waveColor="#8a6eff"
          />
          
          {sources && sources.length > 0 && (
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-2">Sources:</h3>
              <div className="bg-muted p-4 rounded-md space-y-3 dark:bg-gray-700">
                {sources.map((source, index) => (
                  <motion.div 
                    key={index} 
                    className="citation"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1), duration: 0.3 }}
                  >
                    <p className="text-sm font-medium">{source.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{source.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Was this answer helpful?</p>
                <button 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary flex items-center transition-colors" 
                  onClick={() => handleFeedback('positive')}
                >
                  <i className="ri-thumb-up-line mr-1"></i> Yes
                </button>
                <button 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary flex items-center transition-colors"
                  onClick={() => handleFeedback('negative')}
                >
                  <i className="ri-thumb-down-line mr-1"></i> No
                </button>
              </div>
              <button 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 flex items-center transition-colors"
                onClick={() => setShowReport(!showReport)}
              >
                <i className="ri-flag-line mr-1"></i> Report issue
              </button>
            </div>
            
            {showReport && (
              <motion.div 
                className="mt-4"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                  placeholder="Please describe the issue with this answer..."
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowReport(false);
                      setReportText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleReportSubmit}
                    disabled={isSubmitting || !reportText.trim()}
                  >
                    Submit Report
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AnswerDisplay;
