import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedResponseProps {
  text: string;
  className?: string;
  isTyping?: boolean;
  typingSpeed?: number;
  highlighted?: boolean;
  waveColor?: string;
}

export function AnimatedResponse({
  text,
  className,
  isTyping = true,
  typingSpeed = 20,
  highlighted = false,
  waveColor = '#8a6eff'
}: AnimatedResponseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Typing animation effect
  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
        setTimeout(typeNextChar, Math.random() * typingSpeed + typingSpeed / 2);
      } else {
        setIsComplete(true);
      }
    };

    typeNextChar();
  }, [text, isTyping, typingSpeed]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative rounded-lg p-4",
        highlighted ? "bg-primary/10 border border-primary/20" : "",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {!isComplete && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" 
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: [0, 1, 0],
            x: ["-100%", "0%", "100%"]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      )}
      
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {displayedText}
        {!isComplete && (
          <motion.span
            className="inline-block w-2 h-4 ml-1 bg-primary/70 rounded-sm"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {isComplete && (
        <motion.div
          className="absolute bottom-1 right-1 w-8 h-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
        >
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M5 13L9 17L19 7"
              stroke={waveColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

interface AnimatedWaveProps {
  className?: string;
  color?: string;
  size?: number;
  speed?: number;
  isActive?: boolean;
}

export function AnimatedWave({
  className,
  color = "#8a6eff",
  size = 32,
  speed = 1.5,
  isActive = true
}: AnimatedWaveProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {isActive && (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.circle 
            cx="16" 
            cy="16" 
            r="14" 
            stroke={color} 
            strokeWidth="1.5" 
            strokeOpacity="0.3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ 
              duration: speed * 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.circle 
            cx="16" 
            cy="16" 
            r="10" 
            stroke={color} 
            strokeWidth="1.5" 
            strokeOpacity="0.5"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ 
              duration: speed * 1.5,
              repeat: Infinity,
              ease: "easeOut", 
              delay: speed * 0.3
            }}
          />
          <motion.circle 
            cx="16" 
            cy="16" 
            r="6" 
            fill={color} 
            fillOpacity="0.2"
            animate={{ 
              scale: [0.9, 1.1, 0.9], 
              opacity: [0.5, 0.8, 0.5] 
            }}
            transition={{ 
              duration: speed,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        </svg>
      )}
    </div>
  );
}

interface ThinkingAnimationProps {
  className?: string;
  color?: string;
  isActive?: boolean;
}

export function ThinkingAnimation({ 
  className,
  color = "#8a6eff",
  isActive = true 
}: ThinkingAnimationProps) {
  if (!isActive) return null;

  return (
    <motion.div 
      className={cn("flex items-center space-x-2 py-2", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedWave color={color} size={24} speed={1.2} isActive={isActive} />
      <motion.p 
        className="text-sm font-medium text-gray-500 dark:text-gray-400"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Thinking...
      </motion.p>
    </motion.div>
  );
}