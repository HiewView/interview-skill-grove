
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import VideoFeed from './ui/VideoFeed';

const InterviewInterface: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(0);
  
  // Mock interview questions
  const questions = [
    "Tell me about yourself and your experience.",
    "What do you consider to be your greatest professional achievement?",
    "Describe a challenging situation you faced and how you handled it.",
    "Where do you see yourself in five years?",
    "Why do you want to work for our company?",
  ];
  
  // Mock interview progression
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer < 600) { // 10 minutes in seconds
        setTimer(prev => prev + 1);
        
        // Update progress based on timer
        setProgress(Math.min((timer / 600) * 100, 100));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer]);
  
  // Simulate question progression
  useEffect(() => {
    const questionIndex = Math.min(Math.floor(progress / 20), questions.length - 1);
    setCurrentQuestion(questions[questionIndex]);
    
    // Simulate conversation
    if (progress > 0 && progress % 20 === 0) {
      setTranscription(prev => [
        ...prev, 
        `AI: ${questions[questionIndex]}`
      ]);
    }
  }, [progress, questions]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with progress and timer */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Interview Progress</span>
          <span className="text-sm font-medium">{formatTime(timer)}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Main interview interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Video feeds */}
        <div className="flex flex-col space-y-6">
          <VideoFeed className="h-72 md:h-96" />
          
          <div className="glass-card h-72 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-lg font-medium">AI Interviewer</h3>
              <p className="text-sm text-muted-foreground mt-1">Actively listening</p>
            </div>
          </div>
        </div>
        
        {/* Transcription and controls */}
        <div className="flex flex-col space-y-6">
          <div className="flex-1 glass-card overflow-hidden flex flex-col">
            <h3 className="text-lg font-medium mb-4">Current Question</h3>
            <div className="bg-muted/50 rounded-lg p-4 mb-4 animate-pulse-subtle">
              <p className="text-lg">{currentQuestion}</p>
            </div>
            
            <h3 className="text-lg font-medium mb-2">Conversation</h3>
            <div className="flex-1 overflow-y-auto rounded-lg bg-muted/30 p-4 space-y-3">
              {transcription.map((text, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    text.startsWith('AI:') 
                      ? 'bg-primary/10 text-foreground mr-12' 
                      : 'bg-secondary text-foreground ml-12'
                  } animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <p>{text}</p>
                </div>
              ))}
              
              {transcription.length === 0 && (
                <div className="text-center p-6 text-muted-foreground">
                  <p>Your conversation will appear here</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button 
              className={`p-4 rounded-full ${
                isMuted 
                  ? 'bg-destructive text-destructive-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              } transition-all duration-300`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button className="btn-primary">
              End Interview
            </button>
            
            <button className="p-4 rounded-full bg-muted hover:bg-muted/80">
              <AlertCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewInterface;
