
import React from 'react';
import { Switch } from '../ui/switch';

interface AIInterviewerProps {
  isLoading: boolean;
  isListening: boolean;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  useWhisper: boolean;
  toggleWhisper: () => void;
}

const AIInterviewer: React.FC<AIInterviewerProps> = ({
  isLoading,
  isListening,
  ttsEnabled,
  setTtsEnabled,
  useWhisper,
  toggleWhisper
}) => {
  return (
    <div className="glass-card h-72 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">🤖</span>
        </div>
        <h3 className="text-lg font-medium">AI Interviewer</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? "Processing..." : (isListening ? "Listening..." : "Ready")}
        </p>
        
        <div className="mt-4 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Text-to-Speech</span>
            <Switch 
              checked={ttsEnabled} 
              onCheckedChange={setTtsEnabled} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewer;
