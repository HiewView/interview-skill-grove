
import React from 'react';
import { Textarea } from '../ui/textarea';
import { Mic, MicOff, AlertCircle, Send } from 'lucide-react';

interface AnswerInputProps {
  currentAnswer: string;
  setCurrentAnswer: (value: string) => void;
  handleSubmitAnswer: () => void;
  isLoading: boolean;
  isMuted: boolean;
  isListening: boolean;
  interimTranscript: string;
  toggleMicrophone: () => void;
  handleEndInterview: () => void;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  currentAnswer,
  setCurrentAnswer,
  handleSubmitAnswer,
  isLoading,
  isMuted,
  isListening,
  interimTranscript,
  toggleMicrophone,
  handleEndInterview
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex gap-2">
        <Textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder={isListening ? "Listening to your voice..." : "Type your answer here..."}
          className="flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmitAnswer();
            }
          }}
        />
        <button 
          className="p-3 bg-primary text-primary-foreground rounded-md self-end hover:bg-primary/90 transition-colors"
          onClick={() => handleSubmitAnswer()}
          disabled={isLoading || (!currentAnswer.trim() && !interimTranscript.trim())}
        >
          <Send size={20} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button 
          className={`p-4 rounded-full ${
            isMuted 
              ? 'bg-destructive text-destructive-foreground' 
              : isListening 
                ? 'bg-green-500 text-white animate-pulse' 
                : 'bg-muted hover:bg-muted/80'
          } transition-all duration-300`}
          onClick={toggleMicrophone}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <button 
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          onClick={handleEndInterview}
        >
          End Interview
        </button>
        
        <button className="p-4 rounded-full bg-muted hover:bg-muted/80">
          <AlertCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default AnswerInput;
