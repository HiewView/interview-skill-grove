
import React, { useRef, useEffect } from 'react';

interface ConversationDisplayProps {
  transcription: string[];
  interimTranscript: string;
  isListening: boolean;
  currentQuestion: string;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  transcription,
  interimTranscript,
  isListening,
  currentQuestion
}) => {
  const conversationRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [transcription, interimTranscript]);
  
  return (
    <div className="flex-1 glass-card overflow-hidden flex flex-col">
      <h3 className="text-lg font-medium mb-4">Current Question</h3>
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <p className="text-lg">{currentQuestion || "Loading..."}</p>
      </div>
      
      <h3 className="text-lg font-medium mb-2">Conversation</h3>
      <div 
        ref={conversationRef}
        className="flex-1 overflow-y-auto rounded-lg bg-muted/30 p-4 space-y-3"
      >
        {transcription.map((text, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg ${
              text.startsWith('AI:') 
                ? 'bg-primary/10 text-foreground mr-12' 
                : 'bg-secondary text-foreground ml-12 flex'
            } animate-in slide-in-from-bottom-2 duration-300`}
          >
            {text.startsWith('AI:') ? (
              <p>{text}</p>
            ) : (
              <p className="w-full">{text}</p>
            )}
          </div>
        ))}
        
        {isListening && interimTranscript && (
          <div className="p-3 rounded-lg bg-secondary/50 text-foreground ml-12 animate-pulse">
            <p className="w-full">You: {interimTranscript}</p>
          </div>
        )}
        
        {transcription.length === 0 && !isListening && !interimTranscript && (
          <div className="text-center p-6 text-muted-foreground">
            <p>Your conversation will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationDisplay;
