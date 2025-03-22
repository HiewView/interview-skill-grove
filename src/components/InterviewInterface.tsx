
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import VideoFeed from './ui/VideoFeed';
import { Textarea } from './ui/textarea';
import { interviewService, generateSessionId } from '../services/interviewService';

const InterviewInterface: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(0);
  const conversationRef = useRef<HTMLDivElement>(null);
  
  // Initialize interview session
  useEffect(() => {
    const initInterview = async () => {
      try {
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        
        setIsLoading(true);
        const response = await interviewService.startInterview({
          session_id: newSessionId,
          name: "Candidate", // These could come from a form
          role: "Software Developer",
          experience: "3"
        });
        
        if (response.first_question) {
          setCurrentQuestion(response.first_question);
          setTranscription([`AI: ${response.first_question}`]);
        }
      } catch (error) {
        console.error("Failed to initialize interview:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the interview service",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initInterview();
  }, []);
  
  // Interview timer
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
  
  // Scroll to bottom of conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [transcription]);
  
  // Submit answer to backend
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Add user's answer to transcription
      const userAnswer = `You: ${currentAnswer}`;
      setTranscription(prev => [...prev, userAnswer]);
      
      // Submit to backend
      const response = await interviewService.submitAnswer({
        session_id: sessionId,
        answer: currentAnswer
      });
      
      // Update with new question
      if (response.next_question) {
        setCurrentQuestion(response.next_question);
        setTranscription(prev => [...prev, `AI: ${response.next_question}`]);
      }
      
      // Clear answer field
      setCurrentAnswer('');
      
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your answer",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading ? "Processing..." : "Actively listening"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Transcription and controls */}
        <div className="flex flex-col space-y-6">
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
          
          {/* Input area */}
          <div className="flex flex-col space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
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
                onClick={handleSubmitAnswer}
                disabled={isLoading || !currentAnswer.trim()}
              >
                <Send size={20} />
              </button>
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
    </div>
  );
};

export default InterviewInterface;
